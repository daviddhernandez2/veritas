import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Envuelve páginas que exigen sesión (ej. crear hilo, responder).
// Redirige a /login si no hay usuario — importante: esto protege el
// acceso DIRECTO por URL, no solo oculta el enlace. La misma pieza se
// reutilizará en la Fase 8 para /admin/docs con una comprobación de rol.
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <p>Cargando...</p>;
  if (!user) return <Navigate to="/login" replace />;

  return children;
}