import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import NewThreadPage from './pages/NewThreadPage.jsx';
import ThreadPage from './pages/ThreadPage.jsx';

export default function App() {
  return (
    <AuthProvider>
      <div style={{ fontFamily: 'system-ui', background: '#0d1117', color: '#e6edf3', minHeight: '100vh' }}>
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
        </Routes>
      </div>
    </AuthProvider>
  );
}