import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import Avatar from './Avatar.jsx';
import useIsMobile from '../hooks/useIsMobile.js';
import useBackOrHome from '../hooks/useBackOrHome.js';
import { colors, spacing, typography, logoGradient, secondaryButtonStyle } from '../styles/tokens.js';

// Rutas "raíz" de una pestaña de BottomNav.jsx — ahí no hay botón
// volver (no hay "atrás" conceptual, son destinos de primer nivel).
const TAB_ROOT_PATHS = ['/', '/notifications', '/profile'];

const ROUTE_TITLES = [
  { test: (p) => p === '/', title: 'Hilos' },
  { test: (p) => p === '/new-thread', title: 'Nuevo hilo' },
  { test: (p) => p === '/profile', title: 'Perfil' },
  { test: (p) => p === '/notifications', title: 'Notificaciones' },
  { test: (p) => p === '/admin/docs', title: 'Documentación interna' },
  { test: (p) => p === '/como-funciona', title: 'Cómo funciona' },
  { test: (p) => p.includes('/branch/'), title: 'Rama' },
  { test: (p) => p.startsWith('/threads/'), title: 'Hilo' }
];

function getScreenTitle(pathname) {
  return (ROUTE_TITLES.find((r) => r.test(pathname)) || { title: 'Veritas' }).title;
}

function getBackFallback(pathname) {
  // "Continuar rama" (PostNode.jsx) vuelve al hilo del que salió, no a
  // Hilos — si no, se pierde el contexto de en qué hilo estabas.
  const branchMatch = pathname.match(/^\/threads\/([^/]+)\/branch\//);
  if (branchMatch) return `/threads/${branchMatch[1]}`;
  if (pathname.startsWith('/threads/')) return '/';
  if (pathname === '/new-thread') return '/';
  if (pathname === '/admin/docs' || pathname === '/como-funciona') return '/profile';
  return '/';
}

function Logo({ size = 22, dot = 8 }) {
  return (
    <span style={{ width: size, height: size, borderRadius: '50%', background: logoGradient, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <span style={{ width: dot, height: dot, borderRadius: '50%', background: colors.surface.base }} />
    </span>
  );
}

// Barra persistente en todas las páginas salvo Login/Register (ver
// App.jsx). En desktop: logo + navegación + usuario en una fila. En
// móvil (useIsMobile) se sustituye por una cabecera compacta — logo +
// título de la pantalla + botón volver si aplica — porque no cabe la
// fila completa y, además, username/avatar/Salir se mudan a Perfil
// (ver BottomNav.jsx), no tiene sentido repetirlos aquí.
export default function Nav() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();
  const goBack = useBackOrHome();

  if (isMobile) {
    const showBack = user && !TAB_ROOT_PATHS.includes(location.pathname);
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing.sm,
          minWidth: 0,
          padding: `${spacing.sm}px ${spacing.md}px`,
          borderBottom: `1px solid ${colors.border.default}`,
          background: colors.surface.panel
        }}
      >
        {showBack ? (
          <button
            onClick={() => goBack(getBackFallback(location.pathname))}
            aria-label="Volver"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 44,
              height: 44,
              marginLeft: -spacing.sm,
              flexShrink: 0,
              background: 'transparent',
              border: 'none',
              color: colors.text.primary,
              cursor: 'pointer'
            }}
          >
            <ChevronLeft size={22} />
          </button>
        ) : (
          <Link to="/" style={{ display: 'flex', alignItems: 'center', flexShrink: 0, textDecoration: 'none' }}>
            <Logo />
          </Link>
        )}
        <span
          style={{
            minWidth: 0,
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontSize: typography.size.lg,
            fontWeight: typography.weight.semibold,
            color: colors.text.primary
          }}
        >
          {getScreenTitle(location.pathname)}
        </span>
        {!user && (
          <Link to="/login" style={{ flexShrink: 0, color: colors.accent.link, fontSize: typography.size.body }}>
            Entrar
          </Link>
        )}
      </div>
    );
  }

  const navLinkStyle = (active) => ({
    flexShrink: 0,
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
        minWidth: 0,
        padding: `${spacing.sm}px ${spacing.lg}px`,
        borderBottom: `1px solid ${colors.border.default}`,
        background: colors.surface.panel
      }}
    >
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, textDecoration: 'none' }}>
        <Logo />
        <span style={{ fontSize: typography.size.lg, fontWeight: typography.weight.semibold, color: colors.text.primary }}>Veritas</span>
      </Link>

      {user && (
        <nav style={{ display: 'flex', alignItems: 'center', gap: spacing.md, flexShrink: 0 }}>
          <Link to="/" style={navLinkStyle(location.pathname === '/')}>
            Hilos
          </Link>
          <Link to="/profile" style={navLinkStyle(location.pathname === '/profile')}>
            Perfil
          </Link>
        </nav>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, minWidth: 0, marginLeft: 'auto' }}>
        {user ? (
          <>
            <Avatar username={user.username} />
            <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160, fontSize: typography.size.sm, color: colors.text.body }}>
              {user.username}
            </span>
            <button onClick={logout} style={{ ...secondaryButtonStyle, flexShrink: 0 }}>
              Salir
            </button>
          </>
        ) : (
          <Link to="/login" style={{ flexShrink: 0, color: colors.accent.link, fontSize: typography.size.body }}>
            Entrar
          </Link>
        )}
      </div>
    </div>
  );
}
