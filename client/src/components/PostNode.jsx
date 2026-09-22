import { useState } from 'react';
import ReplyForm from './ReplyForm.jsx';
import ReliabilityBadge from './ReliabilityBadge.jsx';
import PostModeration from './PostModeration.jsx';
import Avatar from './Avatar.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { colors, radii, spacing, typography, secondaryButtonStyle } from '../styles/tokens.js';

// `childrenByParent` es un Map: parentId -> array de posts hijos.
// Cada PostNode se dibuja a sí mismo y luego se llama a sí mismo para
// cada hijo — así se renderiza el árbol entero sin importar cuántos
// niveles de profundidad tenga.
export default function PostNode({ post, childrenByParent, sourceWeights, onReply, onReport, onAppeal, depth = 0 }) {
  const { user } = useAuth();
  const [replying, setReplying] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const children = childrenByParent.get(post._id) || [];

  async function handleReply(data) {
    await onReply(post._id, data);
    setReplying(false);
  }

  return (
    <div style={{ marginLeft: depth === 0 ? 0 : 20, borderLeft: depth === 0 ? 'none' : `1px solid ${colors.border.default}`, paddingLeft: depth === 0 ? 0 : spacing.md, marginTop: spacing.md }}>
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
          <p style={{ margin: 0, color: colors.text.body }}>{post.content}</p>
          <div style={{ fontSize: typography.size.sm, opacity: 0.7, marginTop: spacing.xs + 2, display: 'flex', alignItems: 'center', gap: spacing.sm }}>
            <span>Fuente: {post.sourceType} (peso {post.sourceWeight})</span>
            <ReliabilityBadge value={post.reliabilityAgg} />
          </div>
          {user && post.status !== 'hidden' && (
            <div style={{ marginTop: spacing.xs + 2 }}>
              <button onClick={() => setReplying((r) => !r)} style={secondaryButtonStyle}>
                {replying ? 'Cancelar' : 'Responder'}
              </button>
            </div>
          )}
          {replying && (
            <ReplyForm sourceWeights={sourceWeights} onSubmit={handleReply} onCancel={() => setReplying(false)} />
          )}
        </PostModeration>

        {children.length > 0 && (
          <div style={{ marginTop: spacing.xs + 2 }}>
            <button onClick={() => setCollapsed((c) => !c)} style={secondaryButtonStyle}>
              {collapsed ? `Mostrar ${children.length} respuestas` : 'Colapsar'}
            </button>
          </div>
        )}
      </div>

      {!collapsed && children.map((child) => (
        <PostNode
          key={child._id}
          post={child}
          childrenByParent={childrenByParent}
          sourceWeights={sourceWeights}
          onReply={onReply}
          onReport={onReport}
          onAppeal={onAppeal}
          depth={depth + 1}
        />
      ))}
    </div>
  );
}
