import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getThreadPathRequest } from '../api/threads.js';
import PostNode from '../components/PostNode.jsx';
import Sunburst from '../components/Sunburst.jsx';
import TreeView from '../components/TreeView.jsx';
import LoadingScreen from '../components/LoadingScreen.jsx';
import useThreadData from '../hooks/useThreadData.js';
import useIsMobile from '../hooks/useIsMobile.js';
import { colors, spacing, typography } from '../styles/tokens.js';

export default function ThreadPage() {
  const { id } = useParams();
  const isMobile = useIsMobile();
  const thread = useThreadData(id);
  const { posts, sourceWeights, loading, error, childrenByParent } = thread;
  // Las vistas (clásica, Sunburst, y árbol/camino) se alimentan todas
  // del mismo `posts` — solo cambia la proyección, no el fetch.
  const [view, setView] = useState('classic');
  // La vista árbol/camino pide /path una sola vez, de forma perezosa,
  // al activarse por primera vez — no en el fetch inicial de la página.
  const [treeData, setTreeData] = useState(null);
  const [treeLoading, setTreeLoading] = useState(false);

  useEffect(() => {
    if (view !== 'tree' || treeData || posts.length === 0) return;
    const rootPost = posts.find((p) => p.parentId === null);
    if (!rootPost) return;
    setTreeLoading(true);
    getThreadPathRequest(id, rootPost._id)
      .then(setTreeData)
      .catch(() => {})
      .finally(() => setTreeLoading(false));
  }, [view, posts, id, treeData]);

  async function handleReply(parentId, data) {
    await thread.handleReply(parentId, data);
    setTreeData(null);
  }

  async function handleReport(postId, data) {
    await thread.handleReport(postId, data);
    setTreeData(null);
  }

  async function handleAppeal(postId, text) {
    await thread.handleAppeal(postId, text);
    setTreeData(null);
  }

  if (loading) return <LoadingScreen message="Cargando hilo…" fullScreen={false} />;
  if (error) return <p style={{ maxWidth: 720, margin: '40px auto', color: colors.reliability.low }}>{error}</p>;

  const root = posts.find((p) => p.parentId === null);
  if (!root) return <p style={{ color: colors.text.muted }}>Hilo no encontrado.</p>;

  const tabStyle = (tab) => ({
    flex: isMobile ? 1 : undefined,
    padding: '9px 14px',
    border: 'none',
    borderBottom: `2px solid ${view === tab ? colors.accent.tabActive : 'transparent'}`,
    background: 'transparent',
    color: view === tab ? colors.text.primary : colors.text.muted,
    fontSize: typography.size.body,
    fontWeight: view === tab ? typography.weight.semibold : typography.weight.regular,
    cursor: 'pointer'
  });

  // Ancho fijo del contenedor (el de la vista más grande, árbol/Sunburst)
  // para que no salte de tamaño al cambiar de pestaña — la vista
  // clásica limita su propio contenido a una anchura de lectura cómoda
  // por dentro, sin afectar al contenedor exterior.
  return (
    <div style={{ maxWidth: 1100, margin: isMobile ? '0 auto' : '40px auto', padding: isMobile ? 0 : `0 ${spacing.lg}px` }}>
      {!isMobile && (
        <Link to="/" style={{ color: colors.text.muted, fontSize: typography.size.sm }}>← Volver a hilos</Link>
      )}

      <div
        style={{
          display: 'flex',
          gap: 2,
          margin: isMobile ? 0 : `${spacing.lg}px 0`,
          borderBottom: `1px solid ${colors.border.default}`,
          background: isMobile ? colors.surface.panel : 'transparent',
          position: isMobile ? 'sticky' : 'static',
          top: 0,
          zIndex: 10
        }}
      >
        <button style={tabStyle('classic')} onClick={() => setView('classic')}>
          Clásica
        </button>
        <button style={tabStyle('sunburst')} onClick={() => setView('sunburst')}>
          Sunburst
        </button>
        <button style={tabStyle('tree')} onClick={() => setView('tree')}>
          Árbol / camino
        </button>
      </div>

      <div style={{ padding: isMobile ? spacing.md : 0 }}>
        {view === 'classic' && (
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <PostNode
              post={root}
              childrenByParent={childrenByParent}
              sourceWeights={sourceWeights}
              threadId={id}
              onReply={handleReply}
              onReport={handleReport}
              onAppeal={handleAppeal}
            />
          </div>
        )}
        {view === 'sunburst' && <Sunburst posts={posts} />}
        {view === 'tree' &&
          (treeLoading || !treeData ? (
            <LoadingScreen message="Cargando árbol…" fullScreen={false} />
          ) : (
            <TreeView
              posts={treeData.posts}
              initialPath={treeData.path}
              sourceWeights={sourceWeights}
              onReply={handleReply}
              onReport={handleReport}
              onAppeal={handleAppeal}
              onViewClassic={() => setView('classic')}
            />
          ))}
      </div>
    </div>
  );
}
