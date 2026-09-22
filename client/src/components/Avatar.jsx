import { colors, avatar } from '../styles/tokens.js';

// Círculo con la inicial del username — mismo tratamiento que ya usa
// el propio mockup en nav/perfil (design-reference/Veritas v2.dc.html).
// Sin campo de avatar en el modelo User: se genera siempre a partir
// del username, no hay subida de imagen.
export default function Avatar({ username, size = 'sm' }) {
  const { size: px, fontSize } = avatar[size];
  const initial = username ? username.charAt(0).toUpperCase() : '?';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        width: px,
        height: px,
        borderRadius: '50%',
        background: colors.surface.raised,
        border: `1px solid ${colors.border.default}`,
        color: colors.text.primary,
        fontSize,
        fontWeight: 600
      }}
    >
      {initial}
    </span>
  );
}
