import { useState } from 'react';
import { colors, spacing, typography, primaryButtonStyle, ghostButtonStyle, inputStyle } from '../styles/tokens.js';

// Componente controlado: no sabe nada de la API, solo recoge los datos
// y llama a onSubmit. Ahora incluye el selector reply/fork — cuando es
// fork, forkLabel y forkRationale pasan a ser obligatorios en el propio
// formulario (además de que el backend los vuelve a exigir).
export default function ReplyForm({ sourceWeights, onSubmit, onCancel }) {
  const [postType, setPostType] = useState('reply');
  const [content, setContent] = useState('');
  const [sourceType, setSourceType] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [forkLabel, setForkLabel] = useState('');
  const [forkRationale, setForkRationale] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const isFork = postType === 'fork';

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
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

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm, marginTop: spacing.sm }}>
      <select value={postType} onChange={(e) => setPostType(e.target.value)} style={inputStyle}>
        <option value="reply">Respuesta directa</option>
        <option value="fork">↳ Bifurcar: nuevo subtema</option>
      </select>

      {isFork && (
        <>
          <input
            placeholder="Título corto del nuevo subtema"
            value={forkLabel}
            onChange={(e) => setForkLabel(e.target.value)}
            required
            style={inputStyle}
          />
          <textarea
            placeholder="¿Por qué se conecta con el post anterior?"
            value={forkRationale}
            onChange={(e) => setForkRationale(e.target.value)}
            rows={2}
            required
            style={inputStyle}
          />
        </>
      )}

      <textarea placeholder="Tu respuesta" value={content} onChange={(e) => setContent(e.target.value)} rows={3} required style={inputStyle} />
      <select value={sourceType} onChange={(e) => setSourceType(e.target.value)} required style={inputStyle}>
        <option value="" disabled>Tipo de fuente</option>
        {sourceWeights.map((sw) => (
          <option key={sw.sourceType} value={sw.sourceType}>
            {sw.sourceType} (peso {sw.weight})
          </option>
        ))}
      </select>
      <input placeholder="URL de la fuente (opcional)" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} style={inputStyle} />
      {error && <p style={{ color: colors.reliability.low, fontSize: typography.size.sm, margin: 0 }}>{error}</p>}
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
