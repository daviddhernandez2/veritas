import { reliabilityColor } from '../utils/reliability.js';

export default function ReliabilityBadge({ value }) {
  const color = reliabilityColor(value);
  const label = value === null || value === undefined ? '—' : value.toFixed(2);

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: 12,
        fontSize: 12,
        fontFamily: 'monospace',
        color: '#0d1117',
        background: color,
        fontWeight: 600
      }}
    >
      {label}
    </span>
  );
}