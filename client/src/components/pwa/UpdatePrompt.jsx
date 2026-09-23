import { useRegisterSW } from 'virtual:pwa-register/react';
import { colors, radii, spacing, typography, primaryButtonStyle, ghostButtonStyle } from '../../styles/tokens.js';

// registerType: 'prompt' en vite.config.js — el service worker nuevo
// se queda esperando hasta que el usuario confirma aquí. Recargar solo
// porque hay build nueva podría cortar a alguien a mitad de redactar
// un post.
export default function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker
  } = useRegisterSW();

  if (!needRefresh) return null;

  return (
    <div
      style={{
        position: 'fixed',
        left: spacing.lg,
        right: spacing.lg,
        bottom: `calc(${spacing.lg}px + env(safe-area-inset-bottom))`,
        maxWidth: 420,
        margin: '0 auto',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: spacing.md,
        border: `1px solid ${colors.border.default}`,
        borderLeft: `3px solid ${colors.accent.link}`,
        borderRadius: radii.md,
        background: colors.surface.panel,
        padding: spacing.md + 2,
        boxShadow: '0 16px 48px rgba(1,4,9,0.8)'
      }}
    >
      <p style={{ margin: 0, flex: 1, fontSize: typography.size.sm, color: colors.text.body }}>
        Hay una nueva versión disponible.
      </p>
      <button style={ghostButtonStyle} onClick={() => setNeedRefresh(false)}>
        Más tarde
      </button>
      <button style={primaryButtonStyle} onClick={() => updateServiceWorker(true)}>
        Actualizar
      </button>
    </div>
  );
}
