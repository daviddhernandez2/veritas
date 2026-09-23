import { useEffect, useState } from 'react';
import { colors, radii, spacing, typography, ghostButtonStyle } from '../../styles/tokens.js';

const DISMISS_KEY = 'veritas_install_hint_dismissed';

function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
}

function wasDismissed() {
  try {
    return localStorage.getItem(DISMISS_KEY) === '1';
  } catch {
    return false;
  }
}

// Solo iOS: Chrome/Android tienen su propio prompt nativo de
// instalación (beforeinstallprompt), Safari no ofrece nada — sin este
// aviso, "Compartir → Añadir a pantalla de inicio" es un gesto que
// nadie va a descubrir solo.
export default function InstallHint() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isIOS() && !isStandalone() && !wasDismissed()) {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  function dismiss() {
    setVisible(false);
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      // Safari en modo privado puede lanzar en localStorage.setItem — no pasa nada, solo no persiste.
    }
  }

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
        borderLeft: `3px solid ${colors.accent.fork}`,
        borderRadius: radii.md,
        background: colors.surface.panel,
        padding: spacing.md + 2,
        boxShadow: '0 16px 48px rgba(1,4,9,0.8)'
      }}
    >
      <p style={{ margin: 0, flex: 1, fontSize: typography.size.sm, color: colors.text.body }}>
        Instala Veritas: pulsa <strong>Compartir</strong> y luego <strong>Añadir a pantalla de inicio</strong>.
      </p>
      <button style={ghostButtonStyle} onClick={dismiss} aria-label="Cerrar aviso de instalación">
        Cerrar
      </button>
    </div>
  );
}
