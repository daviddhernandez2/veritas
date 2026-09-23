import { apiFetch, setToken } from './client.js';

export async function registerRequest({ username, email, password }) {
  const data = await apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password })
  });
  setToken(data.token);
  return data.user;
}

export async function loginRequest({ email, password }) {
  const data = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  setToken(data.token);
  return data.user;
}

export async function meRequest() {
  const data = await apiFetch('/auth/me');
  return data.user;
}

export async function logout() {
  // Borra la caché de respaldo offline de la API al salir — sin esto,
  // si otra persona entra después en el mismo dispositivo vería datos
  // cacheados de la sesión anterior hasta que expiren (24h).
  if ('caches' in window) {
    await caches.delete('api-cache').catch(() => {});
  }
  setToken(null);
}