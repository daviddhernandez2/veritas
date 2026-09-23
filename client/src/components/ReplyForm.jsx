import { useState } from 'react';
import { X } from 'lucide-react';
import { colors, radii, spacing, typography, primaryButtonStyle, ghostButtonStyle, inputStyle } from '../styles/tokens.js';
import SourceTypeChips from './SourceTypeChips.jsx';
import useIsMobile from '../hooks/useIsMobile.js';
import useKeyboardInset from '../hooks/useKeyboardInset.js';

// 16px evita que iOS haga zoom automático al enfocar un input con
// fuente menor — el token inputStyle compartido es 14px (bien para el
// resto de la app), así que aquí se sobreescribe localmente en vez de
// tocar el token global, que afectaría a pantallas fuera de esta tarea.
const mobileInputStyle = { ...inputStyle, fontSize: 16 };

function segmentBtnStyle(active) {
  return {
    flex: 1,
    padding: '9px 0',
    minHeight: 44,
    border: `1px solid ${active ? colors.accent.link : colors.border.default}`,
    borderRadius: radii.md,
    background: active ? colors.surface.base : colors.surface.panel,
    color: active ? colors.text.primary : colors.text.muted,
    fontWeight: active ? typography.weight.semibold : typography.weight.regular,
    fontSize: typography.size.sm,
    cursor: 'pointer'
  };
}

// Componente controlado: no sabe nada de la API, solo recoge los datos
// y llama a onSubmit. En móvil se presenta a pantalla completa (el
// formulario inline no da sitio cómodo para chips + validación) — en
// desktop sigue inline, sin cambios de comportamiento.
export default function ReplyForm({ sourceWeights, onSubmit, onCancel }) {
  const isMobile = useIsMobile();
  const keyboardInset = useKeyboardInset();
  const [postType, setPostType] = useState('reply');
  const [content, setContent] = useState('');
  const [sourceType, setSourceType] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [forkLabel, setForkLabel] = useState('');
  const [forkRationale, setForkRationale] = useState('');
  const [error, setError] = useState(null);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isFork = postType === 'fork';
  const forkLabelMissing = isFork && submitAttempted && !forkLabel.trim();
  const forkRationaleMissing = isFork && submitAttempted && !forkRationale.trim();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitAttempted(true);

    if (isFork && (!forkLabel.trim() || !forkRationale.trim())) {
      setError('Completa el título y la razón de la bifurcación.');
      return;
    }
    if (!sourceType) {
      setError('Elige un tipo de fuente.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        content,
        sourceType,
        sourceUrl,
        postType,
        forkLabel: isFork ? forkLabel : undefined,
        forkRationale: isFork ? forkRationale : undefined
      });
      setContent('');
      setSourceType('');
      setSourceUrl('');
      setForkLabel('');
      setForkRationale('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const fields = (
    <>
      <div style={{ display: 'flex', gap: spacing.sm }}>
        <button type="button" onClick={() => setPostType('reply')} style={segmentBtnStyle(postType === 'reply')}>
          Respuesta directa
        </button>
        <button type="button" onClick={() => setPostType('fork')} style={segmentBtnStyle(isFork)}>
          ↳ Bifurcar
        </button>
      </div>

      {isFork && (
        <>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <input
              placeholder="Título corto del nuevo subtema"
              value={forkLabel}
              onChange={(e) => setForkLabel(e.target.value)}
              style={{ ...mobileInputStyle, borderColor: forkLabelMissing ? colors.reliability.low : mobileInputStyle.border }}
            />
            {forkLabelMissing && <span style={{ fontSize: typography.size.xs, color: colors.reliability.low }}>Obligatorio para una bifurcación.</span>}
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <textarea
              placeholder="¿Por qué se conecta con el post anterior?"
              value={forkRationale}
              onChange={(e) => setForkRationale(e.target.value)}
              rows={2}
              style={{ ...mobileInputStyle, borderColor: forkRationaleMissing ? colors.reliability.low : mobileInputStyle.border }}
            />
            {forkRationaleMissing && <span style={{ fontSize: typography.size.xs, color: colors.reliability.low }}>Obligatorio para una bifurcación.</span>}
          </label>
        </>
      )}

      <textarea placeholder="Tu respuesta" value={content} onChange={(e) => setContent(e.target.value)} rows={isMobile ? 5 : 3} required style={mobileInputStyle} />

      <div>
        <div style={{ fontSize: typography.size.sm, fontWeight: typography.weight.semibold, color: colors.text.primary, marginBottom: spacing.xs }}>Tipo de fuente</div>
        <SourceTypeChips sourceWeights={sourceWeights} value={sourceType} onChange={setSourceType} />
      </div>

      <input placeholder="URL de la fuente (opcional)" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} style={mobileInputStyle} />

      {error && <p style={{ color: colors.reliability.low, fontSize: typography.size.sm, margin: 0 }}>{error}</p>}
    </>
  );

  if (isMobile) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 1300, background: colors.surface.base, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, padding: `${spacing.sm}px ${spacing.md}px`, borderBottom: `1px solid ${colors.border.default}`, paddingTop: 'env(safe-area-inset-top)' }}>
          <span style={{ flex: 1, fontSize: typography.size.lg, fontWeight: typography.weight.semibold, color: colors.text.primary }}>
            {isFork ? 'Bifurcar' : 'Responder'}
          </span>
          <button type="button" onClick={onCancel} aria-label="Cerrar" style={{ display: 'flex', width: 44, height: 44, alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', color: colors.text.muted, cursor: 'pointer' }}>
            <X size={22} />
          </button>
        </div>
        <form id="reply-form-mobile" onSubmit={handleSubmit} style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: spacing.sm, padding: spacing.md, paddingBottom: 90 }}>
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
          {/* El botón vive fuera del <form> en el DOM (para poder anclarlo
              como barra fija independiente del scroll), pero el atributo
              form= lo sigue enlazando a él — la validación nativa HTML5
              (required) de los campos del formulario se sigue aplicando. */}
          <button form="reply-form-mobile" type="submit" disabled={submitting} style={{ ...primaryButtonStyle, width: '100%', minHeight: 44 }}>
            {submitting ? 'Enviando…' : isFork ? 'Bifurcar' : 'Responder'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm, marginTop: spacing.sm }}>
      {fields}
      <div style={{ display: 'flex', gap: spacing.sm }}>
        <button type="submit" disabled={submitting} style={primaryButtonStyle}>
          {submitting ? 'Enviando...' : isFork ? 'Bifurcar' : 'Responder'}
        </button>
        <button type="button" onClick={onCancel} style={ghostButtonStyle}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
