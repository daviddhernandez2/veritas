import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createThreadRequest } from '../api/threads.js';
import { listSourceWeightsRequest } from '../api/sourceWeights.js';
import SourceTypeChips from '../components/SourceTypeChips.jsx';
import useIsMobile from '../hooks/useIsMobile.js';
import useKeyboardInset from '../hooks/useKeyboardInset.js';
import { colors, spacing, typography, primaryButtonStyle, inputStyle } from '../styles/tokens.js';

// 16px evita el zoom automático de iOS al enfocar un input — el token
// compartido inputStyle es 14px (bien para el resto de la app), se
// sobreescribe localmente en vez de tocar el token global.
const mobileInputStyle = { ...inputStyle, fontSize: 16 };

export default function NewThreadPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const keyboardInset = useKeyboardInset();
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

  const fields = (
    <>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={{ fontSize: typography.size.sm, fontWeight: typography.weight.semibold, color: colors.text.primary }}>Título del hilo</span>
        <input placeholder="Una pregunta concreta y falsable" value={title} onChange={(e) => setTitle(e.target.value)} required style={isMobile ? mobileInputStyle : inputStyle} />
      </label>

      <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={{ fontSize: typography.size.sm, fontWeight: typography.weight.semibold, color: colors.text.primary }}>Contenido</span>
        <textarea
          placeholder="Qué se discute y qué afirma tu fuente de partida."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={isMobile ? 6 : 5}
          required
          style={isMobile ? mobileInputStyle : inputStyle}
        />
      </label>

      <div>
        <div style={{ fontSize: typography.size.sm, fontWeight: typography.weight.semibold, color: colors.text.primary, marginBottom: spacing.sm }}>Tipo de fuente</div>
        <SourceTypeChips sourceWeights={sourceWeights} value={sourceType} onChange={setSourceType} />
      </div>

      <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={{ fontSize: typography.size.sm, fontWeight: typography.weight.semibold, color: colors.text.primary }}>URL de la fuente (opcional)</span>
        <input
          placeholder="https://doi.org/10.1038/…"
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.target.value)}
          style={{ ...(isMobile ? mobileInputStyle : inputStyle), fontFamily: typography.monoFontFamily }}
        />
      </label>

      {error && <p style={{ color: colors.reliability.low, fontSize: typography.size.sm, margin: 0 }}>{error}</p>}
    </>
  );

  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100dvh - 56px)' }}>
        <form id="new-thread-form" onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: spacing.lg, padding: spacing.lg, paddingBottom: 90 }}>
          {fields}
        </form>
        <div
          style={{
            position: 'sticky',
            bottom: keyboardInset,
            padding: spacing.md,
            paddingBottom: `calc(${spacing.md}px + env(safe-area-inset-bottom))`,
            background: colors.surface.panel,
            borderTop: `1px solid ${colors.border.default}`
          }}
        >
          <button form="new-thread-form" type="submit" disabled={submitting} style={{ ...primaryButtonStyle, width: '100%', minHeight: 44 }}>
            {submitting ? 'Publicando...' : 'Publicar hilo'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 560, margin: '40px auto', padding: `0 ${spacing.lg}px` }}>
      <h1 style={{ fontSize: typography.size.xxl, fontWeight: typography.weight.semibold, color: colors.text.primary, marginBottom: spacing.lg }}>Nuevo hilo</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
        {fields}
        <button type="submit" disabled={submitting} style={primaryButtonStyle}>
          {submitting ? 'Publicando...' : 'Publicar hilo'}
        </button>
      </form>
    </div>
  );
}
