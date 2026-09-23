import { apiFetch } from './client.js';

export async function getAdminDocsRequest() {
  const data = await apiFetch('/admin/docs');
  return data.sections;
}

export async function getPublicDocsRequest() {
  const data = await apiFetch('/docs');
  return data.sections;
}
