import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createThreadRequest } from '../api/threads.js';
import { listSourceWeightsRequest } from '../api/sourceWeights.js';

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
    <div style={{ maxWidth: 560, margin: '40px auto', padding: '0 16px' }}>
      <h1>Nuevo hilo</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input placeholder="Título del hilo" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <textarea placeholder="Contenido" value={content} onChange={(e) => setContent(e.target.value)} rows={5} required />

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
        <button type="submit" disabled={submitting}>{submitting ? 'Publicando...' : 'Publicar hilo'}</button>
      </form>
    </div>
  );
}