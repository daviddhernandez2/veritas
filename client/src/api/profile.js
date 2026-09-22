import { apiFetch } from './client.js';

export async function getProfileRequest() {
  return apiFetch('/auth/profile');
}
