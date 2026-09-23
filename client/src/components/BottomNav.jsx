import { Link, useLocation } from 'react-router-dom';
import { Home, Plus, Bell, User } from 'lucide-react';
import { colors, spacing, typography } from '../styles/tokens.js';

// Barra fija de 4 pestañas para móvil (ver Nav.jsx para la cabecera
// compacta que la acompaña). No existe ruta "Explorar" en la app, así
// que se queda en 4 en vez de 5 — el propio encargo contempla omitirla
// si no existe.
const TABS = [
  { to: '/', label: 'Hilos', icon: Home, match: (p) => p === '/' },
  { to: '/new-thread', label: 'Crear', icon: Plus, match: (p) => p === '/new-thread', accent: true },
  { to: '/notifications', label: 'Avisos', icon: Bell, match: (p) => p === '/notifications', badgeKey: 'notifications' },
  { to: '/profile', label: 'Perfil', icon: User, match: (p) => p === '/profile' }
];

export default function BottomNav({ notificationsCount = 0 }) {
  const location = useLocation();

  return (
    <nav
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 900,
        display: 'flex',
        background: colors.surface.panel,
        borderTop: `1px solid ${colors.border.default}`,
        paddingBottom: 'env(safe-area-inset-bottom)'
      }}
    >
      {TABS.map(({ to, label, icon: Icon, match, accent, badgeKey }) => {
        const active = match(location.pathname);
        const count = badgeKey === 'notifications' ? notificationsCount : 0;
        return (
          <Link
            key={to}
            to={to}
            aria-label={label}
            style={{
              flex: 1,
              minHeight: 56,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              padding: `${spacing.xs}px 0`,
              textDecoration: 'none',
              color: active ? colors.text.primary : colors.text.muted
            }}
          >
            <span
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 28,
                height: 28,
                borderRadius: accent ? '50%' : 0,
                background: accent ? colors.button.primaryBg : 'transparent',
                color: accent ? '#ffffff' : 'inherit'
              }}
            >
              <Icon size={accent ? 18 : 20} strokeWidth={active ? 2.4 : 2} />
              {count > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: -4,
                    right: -6,
                    minWidth: 15,
                    height: 15,
                    padding: '0 3px',
                    borderRadius: 999,
                    background: colors.button.dangerBg,
                    color: '#ffffff',
                    fontSize: 9,
                    fontWeight: typography.weight.semibold,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    lineHeight: 1
                  }}
                >
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </span>
            <span style={{ fontSize: 10, fontWeight: active ? typography.weight.semibold : typography.weight.regular }}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
