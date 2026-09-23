import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createThreadRequest } from '../api/threads.js';
import { listSourceWeightsRequest } from '../api/sourceWeights.js';
import { colors, radii, spacing, typography, primaryButtonStyle, inputStyle, reliabilityGradient } from '../styles/tokens.js';
import { getSourceTypeLabel } from '../utils/sourceTypeLabels.js';

export default function NewThreadPage() {
  const navigate = useNavigate();
  const [sourceWeights, setSourceWeights] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [sourceType, setSourceType] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    listSourceWeightsRequest().then(setSourceWeights).catch((err) => setError(err.message));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (!sourceType) {
      setError('Elige un tipo de fuente');
      return;
    }
    setSubmitting(true);
    try {
      const post = await createThreadRequest({ title, content, sourceType, sourceUrl });
      navigate(`/threads/${post._id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: 560, margin: '40px auto', padding: `0 ${spacing.lg}px` }}>
      <h1 style={{ fontSize: typography.size.xxl, fontWeight: typography.weight.semibold, color: colors.text.primary, marginBottom: spacing.lg }}>Nuevo hilo</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: typography.size.sm, fontWeight: typography.weight.semibold, color: colors.text.primary }}>Título del hilo</span>
          <input placeholder="Una pregunta concreta y falsable" value={title} onChange={(e) => setTitle(e.target.value)} required style={inputStyle} />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: typography.size.sm, fontWeight: typography.weight.semibold, color: colors.text.primary }}>Contenido</span>
          <textarea placeholder="Qué se discute y qué afirma tu fuente de partida." value={content} onChange={(e) => setContent(e.target.value)} rows={5} required style={inputStyle} />
        </label>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm }}>
            <span style={{ fontSize: typography.size.sm, fontWeight: typography.weight.semibold, color: colors.text.primary }}>Tipo de fuente</span>
            <span style={{ fontSize: typography.size.xs, fontWeight: typography.weight.semibold, color: colors.reliability.low, border: `1px solid ${colors.reliability.low}`, borderRadius: radii.pill, padding: '0 7px' }}>
              obligatorio
            </span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {sourceWeights.map((sw) => {
              const color = reliabilityGradient(sw.weight);
              const selected = sourceType === sw.sourceType;
              return (
                <button
                  key={sw.sourceType}
                  type="button"
                  onClick={() => setSourceType(sw.sourceType)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 7,
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
        </div>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: typography.size.sm, fontWeight: typography.weight.semibold, color: colors.text.primary }}>URL de la fuente (opcional)</span>
          <input placeholder="https://doi.org/10.1038/…" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} style={{ ...inputStyle, fontFamily: typography.monoFontFamily }} />
        </label>

        {error && <p style={{ color: colors.reliability.low, fontSize: typography.size.sm, margin: 0 }}>{error}</p>}
        <button type="submit" disabled={submitting} style={primaryButtonStyle}>
          {submitting ? 'Publicando...' : 'Publicar hilo'}
        </button>
      </form>
    </div>
  );
}
