import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listThreadsRequest } from '../api/threads.js';
import { useAuth } from '../context/AuthContext.jsx';
import ReliabilityBadge from '../components/ReliabilityBadge.jsx';
import { colors, spacing, typography, primaryButtonStyle, secondaryButtonStyle } from '../styles/tokens.js';

export default function HomePage() {
  const { user, logout } = useAuth();
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    listThreadsRequest()
      .then(setThreads)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ maxWidth: 720, margin: '40px auto', padding: `0 ${spacing.lg}px` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: typography.size.xxl, fontWeight: typography.weight.semibold, color: colors.text.primary }}>Hilos activos</h1>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
            <span style={{ color: colors.text.body }}>{user.username}</span>
            {user.role === 'admin' && (
              <Link to="/admin/docs" style={{ color: colors.accent.link, fontSize: typography.size.sm }}>
                Docs
              </Link>
            )}
            <button onClick={logout} style={secondaryButtonStyle}>Salir</button>
          </div>
        ) : (
          <Link to="/login" style={{ color: colors.accent.link }}>Entrar</Link>
        )}
      </div>

      {user && (
        <Link to="/new-thread" style={{ display: 'inline-block', margin: `${spacing.lg}px 0` }}>
          <button style={primaryButtonStyle}>+ Nuevo hilo</button>
        </Link>
      )}

      {loading && <p style={{ color: colors.text.muted }}>Cargando hilos...</p>}
      {error && <p style={{ color: colors.reliability.low }}>{error}</p>}

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {threads.map((thread) => (
          <li key={thread._id} style={{ padding: '12px 0', borderBottom: `1px solid ${colors.border.default}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
              <Link to={`/threads/${thread._id}`} style={{ fontSize: typography.size.lg + 3, fontWeight: typography.weight.semibold, color: colors.text.primary }}>
                {thread.title}
              </Link>
              <ReliabilityBadge value={thread.reliabilityAgg} />
            </div>
            <div style={{ fontSize: typography.size.body, color: colors.text.muted }}>
              {thread.childCount} respuestas · {new Date(thread.createdAt).toLocaleDateString()}
            </div>
          </li>
        ))}
      </ul>

      {!loading && threads.length === 0 && <p style={{ color: colors.text.muted }}>Todavía no hay hilos. ¡Crea el primero!</p>}
    </div>
  );
}
