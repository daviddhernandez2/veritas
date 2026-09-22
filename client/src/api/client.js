const API_URL = import.meta.env.VITE_API_URL;
const TOKEN_KEY = 'veritas_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

// Wrapper sobre fetch que añade automáticamente el token guardado
// (si existe) en la cabecera Authorization. Así ningún componente
// tiene que preocuparse de adjuntarlo a mano en cada llamada.
export async function apiFetch(path, options = {}) {
  const token = getToken();

  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    },
    ...options
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Error ${res.status}`);
  }

  return res.json();
}