import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Envuelve páginas que exigen sesión (ej. crear hilo, responder).
// Redirige a /login si no hay usuario — importante: esto protege el
// acceso DIRECTO por URL, no solo oculta el enlace. Con `role` (Fase 8,
// /admin/docs) exige además que el usuario tenga ese rol exacto; si no,
// redirige a Home en vez de a login (ya está logueado, solo no tiene
// permiso). El contenido real sigue protegido en el backend — esto es
// solo para no mostrar la página a quien no puede pedir sus datos.
export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) return <p>Cargando...</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;

  return children;
}