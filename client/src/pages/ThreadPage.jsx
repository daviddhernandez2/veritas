import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getThreadClassicRequest, getThreadPathRequest } from '../api/threads.js';
import { replyRequest, reportPostRequest, appealPostRequest } from '../api/posts.js';
import { listSourceWeightsRequest } from '../api/sourceWeights.js';
import PostNode from '../components/PostNode.jsx';
import Sunburst from '../components/Sunburst.jsx';
import TreeView from '../components/TreeView.jsx';
import LoadingScreen from '../components/LoadingScreen.jsx';
import { colors, spacing, typography } from '../styles/tokens.js';

export default function ThreadPage() {
  const { id } = useParams();
  const [posts, setPosts] = useState([]);
  const [sourceWeights, setSourceWeights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Las vistas (clásica, Sunburst, y más adelante árbol/camino) se
  // alimentan todas del mismo `posts` — solo cambia la proyección, no el
  // fetch.
  const [view, setView] = useState('classic');
  // La vista árbol/camino pide /path una sola vez, de forma perezosa,
  // al activarse por primera vez — no en el fetch inicial de la página.
  const [treeData, setTreeData] = useState(null);
  const [treeLoading, setTreeLoading] = useState(false);

  async function loadThread() {
    const data = await getThreadClassicRequest(id);
    setPosts(data);
  }

  useEffect(() => {
    setLoading(true);
    Promise.all([loadThread(), listSourceWeightsRequest().then(setSourceWeights)])
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (view !== 'tree' || treeData || posts.length === 0) return;
    const rootPost = posts.find((p) => p.parentId === null);
    if (!rootPost) return;
    setTreeLoading(true);
    getThreadPathRequest(id, rootPost._id)
      .then(setTreeData)
      .catch((err) => setError(err.message))
      .finally(() => setTreeLoading(false));
  }, [view, posts, id, treeData]);

  async function handleReply(parentId, data) {
    await replyRequest(parentId, data);
    // No intentamos actualizar el árbol en memoria a mano —
    // simplemente volvemos a pedirlo entero. Es la opción más simple
    // y, para el volumen de un debate normal, suficientemente rápida.
    await loadThread();
    // Si la vista árbol/camino ya se había cargado, la forzamos a
    // refrescarse también para que el post nuevo aparezca ahí.
    setTreeData(null);
  }

  async function handleReport(postId, data) {
    await reportPostRequest(postId, data);
    await loadThread();
    setTreeData(null);
  }

  async function handleAppeal(postId, text) {
    await appealPostRequest(postId, { text });
    await loadThread();
    setTreeData(null);
  }

  if (loading) return <LoadingScreen message="Cargando hilo…" fullScreen={false} />;
  if (error) return <p style={{ maxWidth: 720, margin: '40px auto', color: colors.reliability.low }}>{error}</p>;

  const root = posts.find((p) => p.parentId === null);
  if (!root) return <p style={{ color: colors.text.muted }}>Hilo no encontrado.</p>;

  // Construimos el índice parentId -> hijos UNA vez por render, no
  // dentro de cada PostNode — evita recorrer el array entero por nodo.
  const childrenByParent = new Map();
  for (const post of posts) {
    if (post.parentId === null) continue;
    const list = childrenByParent.get(post.parentId) || [];
    list.push(post);
    childrenByParent.set(post.parentId, list);
  }

  const tabStyle = (tab) => ({
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
    <div style={{ maxWidth: 1100, margin: '40px auto', padding: `0 ${spacing.lg}px` }}>
      <Link to="/" style={{ color: colors.text.muted, fontSize: typography.size.sm }}>← Volver a hilos</Link>

      <div style={{ display: 'flex', gap: 2, margin: `${spacing.lg}px 0`, borderBottom: `1px solid ${colors.border.default}` }}>
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

      {view === 'classic' && (
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <PostNode
            post={root}
            childrenByParent={childrenByParent}
            sourceWeights={sourceWeights}
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
  );
}
