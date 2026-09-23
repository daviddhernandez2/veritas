import { useState } from 'react';
import { Link } from 'react-router-dom';
import ReplyForm from './ReplyForm.jsx';
import ReliabilityBadge from './ReliabilityBadge.jsx';
import PostModeration from './PostModeration.jsx';
import Avatar from './Avatar.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import useIsMobile from '../hooks/useIsMobile.js';
import { getSourceTypeLabel } from '../utils/sourceTypeLabels.js';
import { colors, radii, spacing, typography, secondaryButtonStyle } from '../styles/tokens.js';

// A partir de este nivel de anidación, en móvil, se deja de indentar
// más y se ofrece "Continuar rama →" en vez de seguir aplastando el
// contenido contra el borde derecho — ver ThreadBranchPage.jsx.
const MOBILE_DEPTH_CAP = 3;
// Umbral aproximado para decidir si un post es "largo" y merece
// plegarse — no medimos el DOM (scrollHeight) para no complicar esto
// con un efecto/ref por nodo; un heurístico de longitud es suficiente.
const FOLD_CHAR_THRESHOLD = 480;

function getDomain(url) {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

// `childrenByParent` es un Map: parentId -> array de posts hijos.
// Cada PostNode se dibuja a sí mismo y luego se llama a sí mismo para
// cada hijo — así se renderiza el árbol entero sin importar cuántos
// niveles de profundidad tenga. `threadId` se pasa sin tocar a través
// de la recursión, solo hace falta para construir el link de
// "Continuar rama".
export default function PostNode({ post, childrenByParent, sourceWeights, threadId, onReply, onReport, onAppeal, depth = 0 }) {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [replying, setReplying] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const children = childrenByParent.get(post._id) || [];
  const atMobileDepthCap = isMobile && depth >= MOBILE_DEPTH_CAP;
  const isLongContent = (post.content || '').length > FOLD_CHAR_THRESHOLD;
  const domain = getDomain(post.sourceUrl);

  async function handleReply(data) {
    await onReply(post._id, data);
    setReplying(false);
  }

  return (
    <div style={{ marginLeft: depth === 0 || atMobileDepthCap ? 0 : 20, borderLeft: depth === 0 ? 'none' : `1px solid ${colors.border.default}`, paddingLeft: depth === 0 ? 0 : spacing.md, marginTop: spacing.md }}>
      <div
        style={{
          border: `1px solid ${colors.border.default}`,
          borderRadius: radii.md,
          padding: 10,
          borderLeft: post.postType === 'fork' ? `3px solid ${colors.accent.fork}` : `1px solid ${colors.border.default}`
        }}
      >
        <PostModeration post={post} onReport={onReport} onAppeal={onAppeal}>
          {post.postType === 'fork' && (
            <div style={{ fontSize: typography.size.sm, color: colors.accent.fork, marginBottom: spacing.xs + 2 }}>
              ↳ Bifurcación: {post.forkLabel}
              <div style={{ opacity: 0.7, fontWeight: typography.weight.regular }}>{post.forkRationale}</div>
            </div>
          )}
          {post.title && <h3 style={{ margin: '0 0 6px' }}>{post.title}</h3>}
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.xs }}>
            <Avatar username={post.authorId?.username} />
            <span style={{ fontSize: typography.size.body, fontWeight: typography.weight.semibold }}>{post.authorId?.username || '—'}</span>
          </div>
          <div style={{ position: 'relative' }}>
            <p
              style={{
                margin: 0,
                color: colors.text.body,
                whiteSpace: 'pre-wrap',
                ...(isLongContent && !expanded
                  ? { maxHeight: '9em', overflow: 'hidden' }
                  : {})
              }}
            >
              {post.content}
            </p>
            {isLongContent && !expanded && (
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 32, background: `linear-gradient(transparent, ${colors.surface.base})` }} />
            )}
          </div>
          {isLongContent && (
            <button
              onClick={() => setExpanded((e) => !e)}
              style={{ background: 'none', border: 'none', padding: 0, marginTop: spacing.xs, color: colors.accent.link, fontSize: typography.size.sm, cursor: 'pointer' }}
            >
              {expanded ? 'Leer menos' : 'Leer más'}
            </button>
          )}
          <div style={{ fontSize: typography.size.sm, opacity: 0.7, marginTop: spacing.xs + 2, display: 'flex', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' }}>
            <span>
              Fuente: {getSourceTypeLabel(post.sourceType)}
              {domain && ` · ${domain}`}
            </span>
            <ReliabilityBadge value={post.reliabilityAgg} />
          </div>
          {user && post.status !== 'hidden' && (
            <div style={{ marginTop: spacing.xs + 2 }}>
              <button onClick={() => setReplying((r) => !r)} style={{ ...secondaryButtonStyle, minHeight: 44, minWidth: 44 }}>
                {replying ? 'Cancelar' : 'Responder'}
              </button>
            </div>
          )}
          {replying && (
            <ReplyForm sourceWeights={sourceWeights} onSubmit={handleReply} onCancel={() => setReplying(false)} />
          )}
        </PostModeration>

        {children.length > 0 && !atMobileDepthCap && (
          <div style={{ marginTop: spacing.xs + 2 }}>
            <button onClick={() => setCollapsed((c) => !c)} style={secondaryButtonStyle}>
              {collapsed ? `Mostrar ${children.length} respuestas` : 'Colapsar'}
            </button>
          </div>
        )}

        {children.length > 0 && atMobileDepthCap && (
          <div style={{ marginTop: spacing.xs + 2 }}>
            <Link
              to={`/threads/${threadId}/branch/${post._id}`}
              style={{ display: 'inline-flex', alignItems: 'center', minHeight: 44, color: colors.accent.link, fontSize: typography.size.sm, fontWeight: typography.weight.semibold, textDecoration: 'none' }}
            >
              Continuar rama ({children.length}) →
            </Link>
          </div>
        )}
      </div>

      {!collapsed && !atMobileDepthCap && children.map((child) => (
        <PostNode
          key={child._id}
          post={child}
          childrenByParent={childrenByParent}
          sourceWeights={sourceWeights}
          threadId={threadId}
          onReply={onReply}
          onReport={onReport}
          onAppeal={onAppeal}
          depth={depth + 1}
        />
      ))}
    </div>
  );
}
