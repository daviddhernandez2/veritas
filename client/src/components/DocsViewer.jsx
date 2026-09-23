import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import BottomSheet from './BottomSheet.jsx';
import useIsMobile from '../hooks/useIsMobile.js';
import { colors, radii, spacing, typography } from '../styles/tokens.js';

// Compartido por AdminDocsPage.jsx y ComoFuncionaPage.jsx — mismo
// render de bloques y misma adaptación móvil (el índice lateral pasa a
// un selector de sección vía BottomSheet), solo cambia qué `sections`
// y `eyebrow` les pasa cada página.
export default function DocsViewer({ sections, eyebrow, backTo = '/' }) {
  const isMobile = useIsMobile();
  const [sheetOpen, setSheetOpen] = useState(false);

  function jumpTo(id) {
    setSheetOpen(false);
    // Pequeño delay: el sheet tarda en cerrarse (transición) y si el
    // scroll ocurre a la vez el layout salta.
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
  }

  if (isMobile) {
    return (
      <div style={{ padding: spacing.md }}>
        <button
          onClick={() => setSheetOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing.sm,
            width: '100%',
            minHeight: 44,
            padding: '9px 12px',
            border: `1px solid ${colors.border.default}`,
            borderRadius: radii.md,
            background: colors.surface.panel,
            color: colors.text.primary,
            cursor: 'pointer',
            fontSize: typography.size.sm,
            fontWeight: typography.weight.semibold,
            font: 'inherit'
          }}
        >
          <span style={{ flex: 1, textAlign: 'left' }}>{eyebrow}</span>
          <ChevronDown size={18} color={colors.text.muted} />
        </button>

        <BottomSheet isOpen={sheetOpen} onClose={() => setSheetOpen(false)} title="Secciones">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => jumpTo(s.id)}
                style={{
                  minHeight: 44,
                  padding: '9px 4px',
                  textAlign: 'left',
                  background: 'none',
                  border: 'none',
                  borderBottom: `1px solid ${colors.border.subtle}`,
                  color: colors.text.body,
                  fontSize: typography.size.body,
                  font: 'inherit',
                  cursor: 'pointer'
                }}
              >
                {s.title}
              </button>
            ))}
          </div>
        </BottomSheet>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 32, marginTop: spacing.lg }}>
          {sections.map((s) => (
            <section key={s.id} id={s.id} style={{ scrollMarginTop: 70 }}>
              <h2 style={{ fontSize: typography.size.xl, fontWeight: typography.weight.semibold, color: colors.text.primary, margin: '0 0 12px', borderBottom: `1px solid ${colors.border.default}`, paddingBottom: spacing.sm }}>
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

  return (
    <div style={{ maxWidth: 1000, margin: '40px auto', padding: `0 ${spacing.lg}px`, display: 'grid', gridTemplateColumns: '220px minmax(0,1fr)', gap: 32, alignItems: 'start' }}>
      <nav style={{ position: 'sticky', top: 40, display: 'flex', flexDirection: 'column', gap: spacing.xs }}>
        <Link to={backTo} style={{ fontSize: typography.size.sm, color: colors.text.muted, marginBottom: spacing.md }}>
          ← Volver
        </Link>
        <div style={{ fontSize: typography.size.xs, fontWeight: typography.weight.semibold, letterSpacing: '0.08em', textTransform: 'uppercase', color: colors.text.dim, marginBottom: spacing.xs }}>
          {eyebrow}
        </div>
        {sections.map((s) => (
          <a key={s.id} href={`#${s.id}`} style={{ fontSize: typography.size.body, color: colors.text.body, padding: '4px 0', textDecoration: 'none' }}>
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
