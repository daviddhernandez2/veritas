import { Badge } from '@/components/ui/badge.jsx';
import { colors, reliabilityGradient } from '../styles/tokens.js';

// Piloto de migración a Tailwind + shadcn/ui: padding/radio/tipografía
// son clases del tema (derivado de tokens.js, ver tailwind.config.js).
// El color de fondo sigue siendo inline a propósito — reliabilityGradient()
// interpola en tiempo de ejecución, Tailwind no puede generar una clase
// para un valor que no existe de forma estática en el código fuente.
export default function ReliabilityBadge({ value }) {
  const color = value === null || value === undefined ? colors.text.muted : reliabilityGradient(value);
  const label = value === null || value === undefined ? '—' : value.toFixed(2);

  return (
    <Badge
      className="h-auto rounded-sm px-1.5 py-0.5 text-sm font-mono font-semibold"
      style={{ background: color, color: colors.surface.base }}
    >
      {label}
    </Badge>
  );
}
