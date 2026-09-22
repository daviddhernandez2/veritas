import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listThreadsRequest } from '../api/threads.js';
import { useAuth } from '../context/AuthContext.jsx';
import ReliabilityBadge from '../components/ReliabilityBadge.jsx';
import LoadingScreen from '../components/LoadingScreen.jsx';
import { colors, spacing, typography, primaryButtonStyle } from '../styles/tokens.js';

export default function HomePage() {
  const { user } = useAuth();
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
      <h1 style={{ fontSize: typography.size.xxl, fontWeight: typography.weight.semibold, color: colors.text.primary }}>Hilos activos</h1>

      {user && (
        <Link to="/new-thread" style={{ display: 'inline-block', margin: `${spacing.lg}px 0` }}>
          <button style={primaryButtonStyle}>+ Nuevo hilo</button>
        </Link>
      )}

      {error && <p style={{ color: colors.reliability.low }}>{error}</p>}
      {loading && <LoadingScreen message="Cargando hilos…" fullScreen={false} />}

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
