import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getThreadClassicRequest, getThreadPathRequest } from '../api/threads.js';
import { replyRequest } from '../api/posts.js';
import { listSourceWeightsRequest } from '../api/sourceWeights.js';
import PostNode from '../components/PostNode.jsx';
import Sunburst from '../components/Sunburst.jsx';
import TreeView from '../components/TreeView.jsx';

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

  if (loading) return <p style={{ maxWidth: 720, margin: '40px auto' }}>Cargando hilo...</p>;
  if (error) return <p style={{ maxWidth: 720, margin: '40px auto', color: '#f85149' }}>{error}</p>;

  const root = posts.find((p) => p.parentId === null);
  if (!root) return <p>Hilo no encontrado.</p>;

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
    padding: '6px 14px',
    borderRadius: 6,
    border: '1px solid #30363d',
    background: view === tab ? '#238636' : 'transparent',
    color: '#e6edf3',
    cursor: 'pointer'
  });

  return (
    <div style={{ maxWidth: view === 'tree' ? 1100 : 720, margin: '40px auto', padding: '0 16px' }}>
      <Link to="/">← Volver a hilos</Link>

      <div style={{ display: 'flex', gap: 8, margin: '16px 0' }}>
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
        <PostNode post={root} childrenByParent={childrenByParent} sourceWeights={sourceWeights} onReply={handleReply} />
      )}
      {view === 'sunburst' && <Sunburst posts={posts} />}
      {view === 'tree' &&
        (treeLoading || !treeData ? (
          <p style={{ opacity: 0.7 }}>Cargando árbol...</p>
        ) : (
          <TreeView posts={treeData.posts} initialPath={treeData.path} sourceWeights={sourceWeights} onReply={handleReply} />
        ))}
    </div>
  );
}