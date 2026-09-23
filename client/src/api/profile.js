import { apiFetch } from './client.js';

export async function getProfileRequest() {
  return apiFetch('/auth/profile');
}

export async function getMyPostsRequest({ tab, page = 1 }) {
  return apiFetch(`/auth/my-posts?tab=${tab}&page=${page}`);
}
