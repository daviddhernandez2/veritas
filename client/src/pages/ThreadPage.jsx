import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getThreadClassicRequest } from '../api/threads.js';
import { replyRequest } from '../api/posts.js';
import { listSourceWeightsRequest } from '../api/sourceWeights.js';
import PostNode from '../components/PostNode.jsx';

export default function ThreadPage() {
  const { id } = useParams();
  const [posts, setPosts] = useState([]);
  const [sourceWeights, setSourceWeights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  async function handleReply(parentId, data) {
    await replyRequest(parentId, data);
    // No intentamos actualizar el árbol en memoria a mano —
    // simplemente volvemos a pedirlo entero. Es la opción más simple
    // y, para el volumen de un debate normal, suficientemente rápida.
    await loadThread();
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

  return (
    <div style={{ maxWidth: 720, margin: '40px auto', padding: '0 16px' }}>
      <Link to="/">← Volver a hilos</Link>
      <PostNode post={root} childrenByParent={childrenByParent} sourceWeights={sourceWeights} onReply={handleReply} />
    </div>
  );
}