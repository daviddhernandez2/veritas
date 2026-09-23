import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Nav from './components/Nav.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import NewThreadPage from './pages/NewThreadPage.jsx';
import ThreadPage from './pages/ThreadPage.jsx';
import AdminDocsPage from './pages/AdminDocsPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import { colors, typography } from './styles/tokens.js';

// Login/Register son la única pantalla sin Nav (tarjeta centrada, sin
// cabecera) — el resto de rutas pasan por aquí para no repetir <Nav />
// en cada página.
function AppLayout({ children }) {
  return (
    <>
      <Nav />
      {children}
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
        </Routes>
      </div>
    </AuthProvider>
  );
}
