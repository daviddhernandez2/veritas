import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listThreadsRequest } from '../api/threads.js';
import { useAuth } from '../context/AuthContext.jsx';
import ReliabilityBadge from '../components/ReliabilityBadge.jsx';

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
    <div style={{ maxWidth: 720, margin: '40px auto', padding: '0 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Hilos activos</h1>
        {user ? (
          <div>
            <span style={{ marginRight: 12 }}>{user.username}</span>
            {user.role === 'admin' && (
              <Link to="/admin/docs" style={{ marginRight: 12 }}>
                Docs
              </Link>
            )}
            <button onClick={logout}>Salir</button>
          </div>
        ) : (
          <Link to="/login">Entrar</Link>
        )}
      </div>

      {user && (
        <Link to="/new-thread">
          <button style={{ margin: '16px 0' }}>+ Nuevo hilo</button>
        </Link>
      )}

      {loading && <p>Cargando hilos...</p>}
      {error && <p style={{ color: '#f85149' }}>{error}</p>}

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {threads.map((thread) => (
          <li key={thread._id} style={{ padding: '12px 0', borderBottom: '1px solid #30363d' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Link to={`/threads/${thread._id}`} style={{ fontSize: 18, fontWeight: 600 }}>
                {thread.title}
              </Link>
              <ReliabilityBadge value={thread.reliabilityAgg} />
            </div>
            <div style={{ fontSize: 13, opacity: 0.7 }}>
              {thread.childCount} respuestas · {new Date(thread.createdAt).toLocaleDateString()}
            </div>
          </li>
        ))}
      </ul>

      {!loading && threads.length === 0 && <p>Todavía no hay hilos. ¡Crea el primero!</p>}
    </div>
  );
}