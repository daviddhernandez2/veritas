import { apiFetch } from './client.js';

export async function getAdminDocsRequest() {
  const data = await apiFetch('/admin/docs');
  return data.sections;
}
