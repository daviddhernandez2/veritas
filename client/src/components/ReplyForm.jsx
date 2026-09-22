import { useState } from 'react';

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
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
      <select value={postType} onChange={(e) => setPostType(e.target.value)}>
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
          />
          <textarea
            placeholder="¿Por qué se conecta con el post anterior?"
            value={forkRationale}
            onChange={(e) => setForkRationale(e.target.value)}
            rows={2}
            required
          />
        </>
      )}

      <textarea placeholder="Tu respuesta" value={content} onChange={(e) => setContent(e.target.value)} rows={3} required />
      <select value={sourceType} onChange={(e) => setSourceType(e.target.value)} required>
        <option value="" disabled>Tipo de fuente</option>
        {sourceWeights.map((sw) => (
          <option key={sw.sourceType} value={sw.sourceType}>
            {sw.sourceType} (peso {sw.weight})
          </option>
        ))}
      </select>
      <input placeholder="URL de la fuente (opcional)" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} />
      {error && <p style={{ color: '#f85149' }}>{error}</p>}
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="submit" disabled={submitting}>{submitting ? 'Enviando...' : isFork ? 'Bifurcar' : 'Responder'}</button>
        <button type="button" onClick={onCancel}>Cancelar</button>
      </div>
    </form>
  );
}