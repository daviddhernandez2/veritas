import { useEffect, useMemo, useState } from 'react';
import { getThreadClassicRequest } from '../api/threads.js';
import { replyRequest, reportPostRequest, appealPostRequest } from '../api/posts.js';
import { listSourceWeightsRequest } from '../api/sourceWeights.js';

// Carga y mutaciones de un hilo (posts aplanados + pesos de fuente),
// compartido entre ThreadPage.jsx (hilo completo) y
// ThreadBranchPage.jsx ("Continuar rama" — misma query de subárbol,
// solo cambia qué post se trata como raíz visual al renderizar).
export default function useThreadData(threadId) {
  const [posts, setPosts] = useState([]);
  const [sourceWeights, setSourceWeights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function loadThread() {
    const data = await getThreadClassicRequest(threadId);
    setPosts(data);
  }

  useEffect(() => {
    setLoading(true);
    Promise.all([loadThread(), listSourceWeightsRequest().then(setSourceWeights)])
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId]);

  const childrenByParent = useMemo(() => {
    const map = new Map();
    for (const post of posts) {
      if (post.parentId === null) continue;
      const list = map.get(post.parentId) || [];
      list.push(post);
      map.set(post.parentId, list);
    }
    return map;
  }, [posts]);

  async function handleReply(parentId, data) {
    await replyRequest(parentId, data);
    await loadThread();
  }

  async function handleReport(postId, data) {
    await reportPostRequest(postId, data);
    await loadThread();
  }

  async function handleAppeal(postId, text) {
    await appealPostRequest(postId, { text });
    await loadThread();
  }

  return { posts, sourceWeights, loading, error, childrenByParent, handleReply, handleReport, handleAppeal, reload: loadThread };
}
