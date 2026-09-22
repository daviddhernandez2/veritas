import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Avatar from './Avatar.jsx';
import { colors, spacing, typography, logoGradient, secondaryButtonStyle } from '../styles/tokens.js';

// Barra persistente en todas las páginas salvo Login/Register (ver
// App.jsx) — logo + navegación + usuario, un solo sitio en vez de
// repetir el header suelto que tenía cada página.
export default function Nav() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navLinkStyle = (active) => ({
    fontSize: typography.size.body,
    fontWeight: active ? typography.weight.semibold : typography.weight.regular,
    color: active ? colors.text.primary : colors.text.muted,
    textDecoration: 'none'
  });

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: spacing.lg,
        padding: `${spacing.sm}px ${spacing.lg}px`,
        borderBottom: `1px solid ${colors.border.default}`,
        background: colors.surface.panel
      }}
    >
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
        <span style={{ width: 22, height: 22, borderRadius: '50%', background: logoGradient, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: colors.surface.base }} />
        </span>
        <span style={{ fontSize: typography.size.lg, fontWeight: typography.weight.semibold, color: colors.text.primary }}>Veritas</span>
      </Link>

      {user && (
        <nav style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
          <Link to="/" style={navLinkStyle(location.pathname === '/')}>
            Hilos
          </Link>
          <Link to="/profile" style={navLinkStyle(location.pathname === '/profile')}>
            Perfil
          </Link>
          {user.role === 'admin' && (
            <Link to="/admin/docs" style={navLinkStyle(location.pathname === '/admin/docs')}>
              Docs
            </Link>
          )}
        </nav>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, marginLeft: 'auto' }}>
        {user ? (
          <>
            <Avatar username={user.username} />
            <span style={{ fontSize: typography.size.sm, color: colors.text.body }}>{user.username}</span>
            <button onClick={logout} style={secondaryButtonStyle}>
              Salir
            </button>
          </>
        ) : (
          <Link to="/login" style={{ color: colors.accent.link, fontSize: typography.size.body }}>
            Entrar
          </Link>
        )}
      </div>
    </div>
  );
}
