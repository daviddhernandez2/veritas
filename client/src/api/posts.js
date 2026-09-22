import { apiFetch } from './client.js';

export async function replyRequest(parentId, { content, sourceType, sourceUrl, postType, forkLabel, forkRationale }) {
  const data = await apiFetch(`/posts/${parentId}/reply`, {
    method: 'POST',
    body: JSON.stringify({ content, sourceType, sourceUrl, postType, forkLabel, forkRationale })
  });
  return data.post;
}

export async function reportPostRequest(postId, { reason, note }) {
  const data = await apiFetch(`/posts/${postId}/report`, {
    method: 'POST',
    body: JSON.stringify({ reason, note })
  });
  return data.post;
}

export async function appealPostRequest(postId, { text }) {
  const data = await apiFetch(`/posts/${postId}/appeal`, {
    method: 'POST',
    body: JSON.stringify({ text })
  });
  return data.appeal;
}