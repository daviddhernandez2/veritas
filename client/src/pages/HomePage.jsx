import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listThreadsRequest } from '../api/threads.js';
import { useAuth } from '../context/AuthContext.jsx';
import ReliabilityBadge from '../components/ReliabilityBadge.jsx';
import ThreadCardSkeleton from '../components/ThreadCardSkeleton.jsx';
import useIsMobile from '../hooks/useIsMobile.js';
import { relativeDate } from '../utils/relativeDate.js';
import { colors, spacing, typography, primaryButtonStyle } from '../styles/tokens.js';

export default function HomePage() {
  const { user } = useAuth();
  const isMobile = useIsMobile();
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

      {/* En móvil "Crear" de BottomNav.jsx ya cubre esta acción — el
          botón aquí encima solo duplicaría la entrada. */}
      {user && !isMobile && (
        <Link to="/new-thread" style={{ display: 'inline-block', margin: `${spacing.lg}px 0` }}>
          <button style={primaryButtonStyle}>+ Nuevo hilo</button>
        </Link>
      )}

      {error && <p style={{ color: colors.reliability.low }}>{error}</p>}
      {loading && <ThreadCardSkeleton />}

      <ul style={{ listStyle: 'none', padding: 0, marginTop: isMobile ? spacing.lg : 0 }}>
        {threads.map((thread) => (
          <li key={thread._id} style={{ padding: '14px 0', borderBottom: `1px solid ${colors.border.default}` }}>
            <Link
              to={`/threads/${thread._id}`}
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                fontSize: typography.size.lg + 3,
                fontWeight: typography.weight.semibold,
                color: colors.text.primary,
                textDecoration: 'none',
                marginBottom: spacing.xs + 2
              }}
            >
              {thread.title}
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs + 2, fontSize: typography.size.body, color: colors.text.muted }}>
              <ReliabilityBadge value={thread.reliabilityAgg} />
              <span>
                {thread.childCount} {thread.childCount === 1 ? 'respuesta' : 'respuestas'}
              </span>
              <span>·</span>
              <span>{relativeDate(thread.createdAt)}</span>
            </div>
          </li>
        ))}
      </ul>

      {!loading && threads.length === 0 && <p style={{ color: colors.text.muted }}>Todavía no hay hilos. ¡Crea el primero!</p>}
    </div>
  );
}
