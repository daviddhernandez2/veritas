import { useState } from 'react';
import ReplyForm from './ReplyForm.jsx';
import ReliabilityBadge from './ReliabilityBadge.jsx';
import PostModeration from './PostModeration.jsx';
import { useAuth } from '../context/AuthContext.jsx';

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
    <div style={{ marginLeft: depth === 0 ? 0 : 20, borderLeft: depth === 0 ? 'none' : '1px solid #30363d', paddingLeft: depth === 0 ? 0 : 12, marginTop: 12 }}>
      <div
        style={{
          border: '1px solid #30363d',
          borderRadius: 6,
          padding: 10,
          borderLeft: post.postType === 'fork' ? '3px solid #d29922' : '1px solid #30363d'
        }}
      >
        <PostModeration post={post} onReport={onReport} onAppeal={onAppeal}>
          {post.postType === 'fork' && (
            <div style={{ fontSize: 12, color: '#d29922', marginBottom: 6 }}>
              ↳ Bifurcación: {post.forkLabel}
              <div style={{ opacity: 0.7, fontWeight: 400 }}>{post.forkRationale}</div>
            </div>
          )}
          {post.title && <h3 style={{ margin: '0 0 6px' }}>{post.title}</h3>}
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{post.authorId?.username || '—'}</div>
          <p style={{ margin: 0 }}>{post.content}</p>
          <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>Fuente: {post.sourceType} (peso {post.sourceWeight})</span>
            <ReliabilityBadge value={post.reliabilityAgg} />
          </div>
          {user && post.status !== 'hidden' && (
            <div style={{ marginTop: 6 }}>
              <button onClick={() => setReplying((r) => !r)}>
                {replying ? 'Cancelar' : 'Responder'}
              </button>
            </div>
          )}
          {replying && (
            <ReplyForm sourceWeights={sourceWeights} onSubmit={handleReply} onCancel={() => setReplying(false)} />
          )}
        </PostModeration>

        {children.length > 0 && (
          <div style={{ marginTop: 6 }}>
            <button onClick={() => setCollapsed((c) => !c)}>
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