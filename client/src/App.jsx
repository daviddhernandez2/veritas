import { Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Nav from './components/Nav.jsx';
import BottomNav from './components/BottomNav.jsx';
import useIsMobile from './hooks/useIsMobile.js';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import NewThreadPage from './pages/NewThreadPage.jsx';
import ThreadPage from './pages/ThreadPage.jsx';
import ThreadBranchPage from './pages/ThreadBranchPage.jsx';
import AdminDocsPage from './pages/AdminDocsPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import NotificationsPage from './pages/NotificationsPage.jsx';
import { colors, typography } from './styles/tokens.js';

// Login/Register son la única pantalla sin Nav (tarjeta centrada, sin
// cabecera) — el resto de rutas pasan por aquí para no repetir <Nav />
// en cada página. BottomNav solo se monta en móvil y solo con sesión
// (sin usuario no hay pestañas que mostrar); el padding-bottom evita
// que el contenido quede tapado por la barra fija.
function AppLayout({ children }) {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const showBottomNav = isMobile && user;

  return (
    <>
      <Nav />
      <div style={{ paddingBottom: showBottomNav ? 'calc(56px + env(safe-area-inset-bottom))' : 0 }}>{children}</div>
      {showBottomNav && <BottomNav />}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <div style={{ fontFamily: typography.fontFamily, background: colors.surface.base, color: colors.text.primary, minHeight: '100dvh' }}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <HomePage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/threads/:id"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ThreadPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/threads/:id/branch/:postId"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ThreadBranchPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/new-thread"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <NewThreadPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ProfilePage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/docs"
            element={
              <ProtectedRoute role="admin">
                <AppLayout>
                  <AdminDocsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <NotificationsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </AuthProvider>
  );
}
