import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register({ username, email, password });
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: 360, margin: '80px auto' }}>
      <h1>Crear cuenta</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input placeholder="Nombre de usuario" value={username} onChange={(e) => setUsername(e.target.value)} required minLength={3} />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Contraseña (mín. 8 caracteres)" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
        {error && <p style={{ color: '#f85149' }}>{error}</p>}
        <button type="submit" disabled={submitting}>{submitting ? 'Creando...' : 'Crear cuenta'}</button>
      </form>
      <p style={{ marginTop: 16 }}>
        ¿Ya tienes cuenta? <Link to="/login">Entra</Link>
      </p>
    </div>
  );
}