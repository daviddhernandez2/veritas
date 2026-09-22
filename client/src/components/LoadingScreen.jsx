import { useEffect, useState } from 'react';
import { colors, spacing, typography, logoGradient } from '../styles/tokens.js';

// El backend vive en el plan gratuito de Render — si nadie lo pide
// durante un rato, el contenedor se duerme y la primera petición puede
// tardar bastante en responder mientras se despierta. Esta pantalla
// cubre esa espera (en vez de un "Cargando..." suelto) y, pasados unos
// segundos, añade un aviso para que no parezca que la app se ha
// colgado.
export default function LoadingScreen({ message = 'Cargando…', fullScreen = true }) {
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowHint(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      style={{
        minHeight: fullScreen ? '100vh' : 200,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.md,
        padding: spacing.lg
      }}
    >
      <div
        className="veritas-spin"
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: logoGradient,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div style={{ width: 13, height: 13, borderRadius: '50%', background: colors.surface.base }} />
      </div>

      <p style={{ margin: 0, color: colors.text.muted, fontSize: typography.size.body }}>{message}</p>

      {showHint && (
        <p style={{ margin: 0, maxWidth: 300, textAlign: 'center', color: colors.text.dim, fontSize: typography.size.sm }}>
          El servidor puede tardar hasta un minuto en despertar (plan gratuito) — no cierres la pestaña.
        </p>
      )}
    </div>
  );
}
