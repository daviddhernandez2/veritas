import { apiFetch } from './client.js';

export async function listThreadsRequest() {
  const data = await apiFetch('/threads');
  return data.threads;
}

export async function createThreadRequest({ title, content, sourceType, sourceUrl }) {
  const data = await apiFetch('/threads', {
    method: 'POST',
    body: JSON.stringify({ title, content, sourceType, sourceUrl })
  });
  return data.post;
}

// Vista clásica: árbol completo aplanado de un hilo.
export async function getThreadClassicRequest(threadId) {
  const data = await apiFetch(`/threads/${threadId}/classic`);
  return data.posts;
}

// Vista árbol/camino: mismos posts que la clásica (con autor resuelto)
// más el camino de ancestros hasta postId, calculado en el servidor.
export async function getThreadPathRequest(threadId, postId) {
  return apiFetch(`/threads/${threadId}/path/${postId}`);
}