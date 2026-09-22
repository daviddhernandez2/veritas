import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { colors, radii, spacing, typography, primaryButtonStyle, inputStyle, logoGradient } from '../styles/tokens.js';

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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: `${spacing.xxl}px ${spacing.lg}px` }}>
      <div style={{ width: '100%', maxWidth: 360 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xxl }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: logoGradient, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <div style={{ width: 9, height: 9, borderRadius: '50%', background: colors.surface.base }} />
            </div>
            <div style={{ fontSize: typography.size.xxl, fontWeight: typography.weight.semibold, color: colors.text.primary }}>Veritas</div>
          </div>
        </div>

        <div style={{ border: `1px solid ${colors.border.default}`, borderRadius: radii.md, background: colors.surface.panel, padding: spacing.lg + 2 }}>
          <div style={{ display: 'flex', borderBottom: `1px solid ${colors.border.default}`, margin: `-${spacing.lg + 2}px -${spacing.lg + 2}px ${spacing.lg + 2}px`, padding: '0 6px' }}>
            <Link
              to="/login"
              style={{ padding: '9px 12px', fontSize: typography.size.body, fontWeight: typography.weight.regular, color: colors.text.muted, textDecoration: 'none' }}
            >
              Entrar
            </Link>
            <span style={{ padding: '9px 12px', fontSize: typography.size.body, fontWeight: typography.weight.semibold, color: colors.text.primary, borderBottom: `2px solid ${colors.accent.tabActive}` }}>
              Crear cuenta
            </span>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: typography.size.sm, fontWeight: typography.weight.semibold, color: colors.text.primary }}>Nombre público</span>
              <input placeholder="tu_nombre" value={username} onChange={(e) => setUsername(e.target.value)} required minLength={3} style={inputStyle} />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: typography.size.sm, fontWeight: typography.weight.semibold, color: colors.text.primary }}>Correo</span>
              <input type="email" placeholder="tu@correo.org" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: typography.size.sm, fontWeight: typography.weight.semibold, color: colors.text.primary }}>Contraseña</span>
              <input
                type="password"
                placeholder="mín. 8 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                style={inputStyle}
              />
            </label>

            {error && <p style={{ color: colors.reliability.low, fontSize: typography.size.sm, margin: 0 }}>{error}</p>}

            <button type="submit" disabled={submitting} style={{ ...primaryButtonStyle, marginTop: 2, padding: 9, width: '100%' }}>
              {submitting ? 'Creando...' : 'Crear cuenta'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
