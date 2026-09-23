import { colors, radii, typography, reliabilityGradient } from '../styles/tokens.js';
import { getSourceTypeLabel } from '../utils/sourceTypeLabels.js';

// Selector de sourceType como chips — usado por NewThreadPage.jsx
// (desktop ya lo tenía) y ahora también por ReplyForm.jsx, en vez de
// un <select> con el enum crudo. Un único sitio para no duplicar el
// render de cada chip entre los dos formularios.
export default function SourceTypeChips({ sourceWeights, value, onChange }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {sourceWeights.map((sw) => {
        const color = reliabilityGradient(sw.weight);
        const selected = value === sw.sourceType;
        return (
          <button
            key={sw.sourceType}
            type="button"
            onClick={() => onChange(sw.sourceType)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              minHeight: 36,
              padding: '5px 10px',
              borderRadius: radii.md,
              cursor: 'pointer',
              fontSize: typography.size.sm,
              fontWeight: 500,
              fontFamily: typography.fontFamily,
              background: selected ? colors.surface.base : colors.surface.panel,
              border: `1px solid ${selected ? color : colors.border.default}`,
              color: colors.text.primary
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: 2, background: color, flexShrink: 0 }} />
            <span>{getSourceTypeLabel(sw.sourceType)}</span>
            <span style={{ fontFamily: typography.monoFontFamily, fontSize: typography.size.xs, color: colors.text.muted }}>{sw.weight.toFixed(2)}</span>
          </button>
        );
      })}
    </div>
  );
}
