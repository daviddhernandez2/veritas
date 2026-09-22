import { colors, radii, typography, reliabilityGradient } from '../styles/tokens.js';

export default function ReliabilityBadge({ value }) {
  const color = value === null || value === undefined ? colors.text.muted : reliabilityGradient(value);
  const label = value === null || value === undefined ? '—' : value.toFixed(2);

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2px 6px',
        borderRadius: radii.sm,
        fontSize: typography.size.sm,
        fontFamily: typography.monoFontFamily,
        color: colors.surface.base,
        background: color,
        fontWeight: typography.weight.semibold
      }}
    >
      {label}
    </span>
  );
}
