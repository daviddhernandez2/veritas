import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminDocsRequest } from '../api/docs.js';
import { colors, radii, spacing, typography } from '../styles/tokens.js';

export default function AdminDocsPage() {
  const [sections, setSections] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getAdminDocsRequest()
      .then(setSections)
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p style={{ maxWidth: 720, margin: '40px auto', color: colors.reliability.low }}>{error}</p>;
  if (!sections) return <p style={{ maxWidth: 720, margin: '40px auto', color: colors.text.muted }}>Cargando documentación...</p>;

  return (
    <div style={{ maxWidth: 1000, margin: '40px auto', padding: `0 ${spacing.lg}px`, display: 'grid', gridTemplateColumns: '220px minmax(0,1fr)', gap: 32, alignItems: 'start' }}>
      <nav style={{ position: 'sticky', top: 40, display: 'flex', flexDirection: 'column', gap: spacing.xs }}>
        <Link to="/" style={{ fontSize: typography.size.sm, color: colors.text.muted, marginBottom: spacing.md }}>
          ← Volver a hilos
        </Link>
        <div style={{ fontSize: typography.size.xs, fontWeight: typography.weight.semibold, letterSpacing: '0.08em', textTransform: 'uppercase', color: colors.text.dim, marginBottom: spacing.xs }}>
          Documentación interna
        </div>
        {sections.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            style={{ fontSize: typography.size.body, color: colors.text.body, padding: '4px 0', textDecoration: 'none' }}
          >
            {s.title}
          </a>
        ))}
      </nav>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 40, minWidth: 0 }}>
        {sections.map((s) => (
          <section key={s.id} id={s.id} style={{ scrollMarginTop: 20 }}>
            <h2 style={{ fontSize: typography.size.xxl, fontWeight: typography.weight.semibold, color: colors.text.primary, margin: '0 0 14px', borderBottom: `1px solid ${colors.border.default}`, paddingBottom: spacing.sm }}>
              {s.title}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
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
      return <h3 style={{ fontSize: typography.size.lg, fontWeight: typography.weight.semibold, color: colors.text.primary, margin: '8px 0 0' }}>{block.text}</h3>;
    case 'ul':
      return (
        <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: spacing.xs }}>
          {block.items.map((item, i) => (
            <li key={i} style={{ fontSize: typography.size.body, lineHeight: 1.6, color: colors.text.body }}>
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
            padding: spacing.md,
            background: colors.surface.panel,
            border: `1px solid ${colors.border.default}`,
            borderRadius: radii.md,
            fontFamily: typography.monoFontFamily,
            fontSize: typography.size.sm + 0.5,
            lineHeight: 1.6,
            color: colors.text.body,
            overflowX: 'auto',
            whiteSpace: 'pre-wrap'
          }}
        >
          {block.text}
        </pre>
      );
    case 'p':
    default:
      return <p style={{ margin: 0, fontSize: typography.size.body, lineHeight: 1.65, color: colors.text.body }}>{block.text}</p>;
  }
}
