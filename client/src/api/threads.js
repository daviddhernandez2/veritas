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