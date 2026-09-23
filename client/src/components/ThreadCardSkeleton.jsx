import { colors, radii, spacing } from '../styles/tokens.js';

function Block({ width, height = 14 }) {
  return (
    <div className="veritas-pulse" style={{ width, height, borderRadius: radii.sm, background: colors.surface.raised }} />
  );
}

function Row() {
  return (
    <li style={{ padding: '14px 0', borderBottom: `1px solid ${colors.border.default}` }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.xs + 2, marginBottom: spacing.sm }}>
        <Block width="90%" height={16} />
        <Block width="60%" height={16} />
      </div>
      <div style={{ display: 'flex', gap: spacing.sm }}>
        <Block width={40} height={18} />
        <Block width={90} height={14} />
      </div>
    </li>
  );
}

// Sustituye al LoadingScreen genérico en el feed — da una idea real de
// la forma del contenido que va a aparecer, en vez de un spinner suelto.
export default function ThreadCardSkeleton({ count = 4 }) {
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {Array.from({ length: count }).map((_, i) => (
        <Row key={i} />
      ))}
    </ul>
  );
}
