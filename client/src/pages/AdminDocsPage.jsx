import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminDocsRequest } from '../api/docs.js';

export default function AdminDocsPage() {
  const [sections, setSections] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getAdminDocsRequest()
      .then(setSections)
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p style={{ maxWidth: 720, margin: '40px auto', color: '#f85149' }}>{error}</p>;
  if (!sections) return <p style={{ maxWidth: 720, margin: '40px auto' }}>Cargando documentación...</p>;

  return (
    <div style={{ maxWidth: 1000, margin: '40px auto', padding: '0 16px', display: 'grid', gridTemplateColumns: '220px minmax(0,1fr)', gap: 32, alignItems: 'start' }}>
      <nav style={{ position: 'sticky', top: 40, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Link to="/" style={{ fontSize: 12, color: '#8b949e', marginBottom: 12 }}>
          ← Volver a hilos
        </Link>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6e7681', marginBottom: 4 }}>
          Documentación interna
        </div>
        {sections.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            style={{ fontSize: 13, color: '#c9d1d9', padding: '4px 0', textDecoration: 'none' }}
          >
            {s.title}
          </a>
        ))}
      </nav>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 40, minWidth: 0 }}>
        {sections.map((s) => (
          <section key={s.id} id={s.id} style={{ scrollMarginTop: 20 }}>
            <h2 style={{ fontSize: 20, fontWeight: 600, margin: '0 0 14px', borderBottom: '1px solid #30363d', paddingBottom: 8 }}>
              {s.title}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {s.blocks.map((b, i) => (
                <DocBlock key={i} block={b} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function DocBlock({ block }) {
  switch (block.type) {
    case 'h3':
      return <h3 style={{ fontSize: 15, fontWeight: 600, color: '#e6edf3', margin: '8px 0 0' }}>{block.text}</h3>;
    case 'ul':
      return (
        <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {block.items.map((item, i) => (
            <li key={i} style={{ fontSize: 13.5, lineHeight: 1.6, color: '#c9d1d9' }}>
              {item}
            </li>
          ))}
        </ul>
      );
    case 'code':
      return (
        <pre
          style={{
            margin: 0,
            padding: 12,
            background: '#161b22',
            border: '1px solid #30363d',
            borderRadius: 6,
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            fontSize: 12.5,
            lineHeight: 1.6,
            color: '#c9d1d9',
            overflowX: 'auto',
            whiteSpace: 'pre-wrap'
          }}
        >
          {block.text}
        </pre>
      );
    case 'p':
    default:
      return <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.65, color: '#c9d1d9' }}>{block.text}</p>;
  }
}
