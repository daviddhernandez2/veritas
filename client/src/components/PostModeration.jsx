import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const REPORT_REASONS = [
  { value: 'fuente_falsa', label: 'Fuente falsa o engañosa' },
  { value: 'spam', label: 'Spam' },
  { value: 'insulto', label: 'Insulto o falta de respeto' },
  { value: 'irrelevante', label: 'Contenido irrelevante' },
  { value: 'otro', label: 'Otro' }
];

// Controles de moderación compartidos entre la vista clásica y el
// árbol/camino (mismo motivo que ReplyForm/ReliabilityBadge son
// compartidos: una sola implementación, no dos que puedan divergir).
// `children` es el contenido real del post — se oculta tras el velo
// mientras el post esté oculto y no se haya revelado localmente.
export default function PostModeration({ post, onReport, onAppeal, children }) {
  const { user } = useAuth();
  const [revealed, setRevealed] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [appealing, setAppealing] = useState(false);

  const isHidden = post.status === 'hidden';
  const isOwnPost = !!user && post.authorId?._id === user.id;

  if (isHidden && !revealed) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          padding: '10px 12px',
          border: '1px solid #5c2b28',
          borderRadius: 6,
          background: '#1a1011'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#ffb4ad' }}>
          <span>⚠</span>
          <span>
            Oculto automáticamente por reportes ({post.reportCount} {post.reportCount === 1 ? 'reporte' : 'reportes'})
          </span>
        </div>
        <div>
          <button onClick={() => setRevealed(true)} style={ghostButtonStyle('#5c2b28', '#ffb4ad')}>
            Ver de todos modos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {children}

      {isHidden && (
        <div style={{ marginTop: 8 }}>
          {post.appealed ? (
            <span style={{ fontSize: 12, color: '#8b949e' }}>Apelación enviada — pendiente de revisión.</span>
          ) : isOwnPost ? (
            appealing ? (
              <AppealForm
                onSubmit={async (text) => {
                  await onAppeal(post._id, text);
                  setAppealing(false);
                }}
                onCancel={() => setAppealing(false)}
              />
            ) : (
              <button onClick={() => setAppealing(true)} style={ghostButtonStyle('#30363d', '#e6edf3')}>
                Apelar
              </button>
            )
          ) : null}
        </div>
      )}

      {!isHidden && user && !isOwnPost && (
        <div style={{ marginTop: 8 }}>
          {reporting ? (
            <ReportForm
              onSubmit={async (data) => {
                await onReport(post._id, data);
                setReporting(false);
              }}
              onCancel={() => setReporting(false)}
            />
          ) : (
            <button onClick={() => setReporting(true)} style={ghostButtonStyle('#30363d', '#8b949e')}>
              Reportar
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function ReportForm({ onSubmit, onCancel }) {
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!reason) return;
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({ reason, note });
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 6, maxWidth: 320 }}>
      <select value={reason} onChange={(e) => setReason(e.target.value)} required>
        <option value="" disabled>
          Motivo del reporte
        </option>
        {REPORT_REASONS.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </select>
      <input placeholder="Comentario (opcional)" value={note} onChange={(e) => setNote(e.target.value)} />
      {error && <p style={{ color: '#f85149', fontSize: 12, margin: 0 }}>{error}</p>}
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="submit" disabled={submitting || !reason}>
          {submitting ? 'Enviando...' : 'Enviar reporte'}
        </button>
        <button type="button" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

function AppealForm({ onSubmit, onCancel }) {
  const [text, setText] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!text) return;
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(text);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 6, maxWidth: 320 }}>
      <textarea
        placeholder="Por qué crees que el reporte es incorrecto"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        required
      />
      {error && <p style={{ color: '#f85149', fontSize: 12, margin: 0 }}>{error}</p>}
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="submit" disabled={submitting || !text}>
          {submitting ? 'Enviando...' : 'Enviar apelación'}
        </button>
        <button type="button" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

function ghostButtonStyle(borderColor, color) {
  return {
    background: 'transparent',
    border: `1px solid ${borderColor}`,
    borderRadius: 6,
    padding: '4px 11px',
    fontSize: 12,
    fontWeight: 600,
    color,
    cursor: 'pointer'
  };
}
