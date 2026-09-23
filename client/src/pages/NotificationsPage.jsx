import { Bell } from 'lucide-react';
import { colors, spacing, typography } from '../styles/tokens.js';

// Placeholder — la fuente de datos real (qué genera una notificación,
// cómo se marca como leída, etc.) es una tarea aparte. Esta pantalla
// solo asegura que la pestaña "Avisos" de BottomNav.jsx tiene un
// destino real en vez de una ruta rota, con el contador ya cableado
// vía prop para cuando exista.
export default function NotificationsPage() {
  return (
    <div
      style={{
        minHeight: '60dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        padding: spacing.xl,
        textAlign: 'center',
        color: colors.text.muted
      }}
    >
      <Bell size={32} color={colors.text.dim} />
      <p style={{ margin: 0, fontSize: typography.size.md, color: colors.text.body }}>Todavía no hay notificaciones.</p>
      <p style={{ margin: 0, fontSize: typography.size.sm, color: colors.text.dim, maxWidth: 280 }}>
        Aquí aparecerán respuestas a tus hilos y menciones cuando esté disponible.
      </p>
    </div>
  );
}
