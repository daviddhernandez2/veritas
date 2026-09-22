import { apiFetch } from './client.js';

export async function replyRequest(parentId, { content, sourceType, sourceUrl, postType, forkLabel, forkRationale }) {
  const data = await apiFetch(`/posts/${parentId}/reply`, {
    method: 'POST',
    body: JSON.stringify({ content, sourceType, sourceUrl, postType, forkLabel, forkRationale })
  });
  return data.post;
}