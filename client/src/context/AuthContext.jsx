import { createContext, useContext, useEffect, useState } from 'react';
import { getToken } from '../api/client.js';
import { meRequest, loginRequest, registerRequest, logout as logoutRequest } from '../api/auth.js';

const AuthContext = createContext(null);

// Envuelve toda la app (ver main.jsx). Cualquier componente puede
// llamar a useAuth() para saber si hay usuario logueado, sin tener
// que pasar props manualmente por cada nivel del árbol de componentes.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Al cargar la app, si hay un token guardado de una sesión
    // anterior, comprobamos que siga siendo válido pidiendo /auth/me.
    if (!getToken()) {
      setLoading(false);
      return;
    }

    meRequest()
      .then(setUser)
      .catch(() => setUser(null)) // token caducado o inválido
      .finally(() => setLoading(false));
  }, []);

  async function login(credentials) {
    const loggedUser = await loginRequest(credentials);
    setUser(loggedUser);
  }

  async function register(credentials) {
    const newUser = await registerRequest(credentials);
    setUser(newUser);
  }

  async function logout() {
    await logoutRequest();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}