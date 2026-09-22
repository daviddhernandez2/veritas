import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import NewThreadPage from './pages/NewThreadPage.jsx';
import ThreadPage from './pages/ThreadPage.jsx';
import AdminDocsPage from './pages/AdminDocsPage.jsx';
import { colors, typography } from './styles/tokens.js';

export default function App() {
  return (
    <AuthProvider>
      <div style={{ fontFamily: typography.fontFamily, background: colors.surface.base, color: colors.text.primary, minHeight: '100vh' }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/threads/:id" element={<ThreadPage />} />
          <Route
            path="/new-thread"
            element={
              <ProtectedRoute>
                <NewThreadPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/docs"
            element={
              <ProtectedRoute role="admin">
                <AdminDocsPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </AuthProvider>
  );
}