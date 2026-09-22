import { colors, radii, spacing, typography } from './src/styles/tokens.js';

// El tema de Tailwind se DERIVA de client/src/styles/tokens.js, no se
// copia a mano — sigue habiendo una sola fuente de verdad para los
// valores. Aquí solo se remodelan claves a kebab-case (Tailwind espera
// eso en las clases: `bg-accent-tab-active`, no `bg-accent-tabActive`)
// y se añade la unidad `px` donde tokens.js guarda números sueltos.
//
// reliabilityGradient() (en tokens.js) NO tiene equivalente aquí a
// propósito: es un color interpolado en tiempo de ejecución, Tailwind
// solo puede generar clases para valores que existen de forma estática
// en el código fuente al compilar. Sigue siendo `style={{ background }}`
// allá donde se use.
//
// shadcn/ui (CLI v4.21, preset "Nova") da por hecho Tailwind v4 y
// config por CSS (@theme) — con Tailwind v3 (lo que se pidió
// explícitamente, tailwind.config.js con extend.*) el CLI NO añade los
// nombres de color que sus propios componentes generados esperan
// (bg-primary, text-foreground, border-border, bg-destructive...),
// así que se añaden aquí a mano, apuntando a las custom properties CSS
// que ya viven en src/index.css `:root` (derivadas de tokens.js).
// `accent` es justo el nombre que shadcn usa para su propio color
// semántico (fondo de hover genérico) — como nuestro tokens.js YA usa
// `colors.accent` para otra cosa (link/tab-active/fork/reputation), esa
// rama se expone aquí como `brand` para no chocar con el `accent` de
// shadcn.
// Las variables en :root guardan "r g b" (canales sueltos, no hex) para
// que Tailwind pueda inyectar el alpha en modificadores de opacidad
// (bg-primary/80, outline-ring/50 — los usan los propios componentes
// generados de shadcn/ui).
const cssVar = (name) => `rgb(var(--${name}) / <alpha-value>)`;

const px = (n) => `${n}px`;

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Requeridos por los componentes generados de shadcn/ui.
        background: cssVar('background'),
        foreground: cssVar('foreground'),
        card: { DEFAULT: cssVar('card'), foreground: cssVar('card-foreground') },
        popover: { DEFAULT: cssVar('popover'), foreground: cssVar('popover-foreground') },
        primary: { DEFAULT: cssVar('primary'), foreground: cssVar('primary-foreground') },
        secondary: { DEFAULT: cssVar('secondary'), foreground: cssVar('secondary-foreground') },
        muted: { DEFAULT: cssVar('muted'), foreground: cssVar('muted-foreground') },
        accent: { DEFAULT: cssVar('accent'), foreground: cssVar('accent-foreground') },
        destructive: cssVar('destructive'),
        input: cssVar('input'),
        ring: cssVar('ring'),

        // Nuestro propio sistema de tokens (client/src/styles/tokens.js).
        surface: colors.surface,
        border: { DEFAULT: colors.border.default, subtle: colors.border.subtle },
        text: colors.text,
        brand: {
          link: colors.accent.link,
          'link-hover': colors.accent.linkHover,
          'tab-active': colors.accent.tabActive,
          fork: colors.accent.fork,
          reputation: colors.accent.reputation
        },
        button: {
          primary: colors.button.primaryBg,
          'primary-hover': colors.button.primaryBgHover,
          danger: colors.button.dangerBg
        },
        danger: {
          border: colors.danger.border,
          bg: colors.danger.bg,
          text: colors.danger.text,
          'text-bright': colors.danger.textBright,
          'icon-bg': colors.danger.iconBg
        },
        reliability: colors.reliability
      },
      borderRadius: {
        sm: px(radii.sm),
        md: px(radii.md),
        pill: px(radii.pill)
      },
      spacing: {
        xs: px(spacing.xs),
        sm: px(spacing.sm),
        md: px(spacing.md),
        lg: px(spacing.lg),
        xl: px(spacing.xl),
        xxl: px(spacing.xxl)
      },
      fontSize: {
        xs: px(typography.size.xs),
        sm: px(typography.size.sm),
        body: px(typography.size.body),
        md: px(typography.size.md),
        lg: px(typography.size.lg),
        xl: px(typography.size.xl),
        xxl: px(typography.size.xxl),
        stat: px(typography.size.stat)
      },
      fontFamily: {
        sans: typography.fontFamily.split(', '),
        mono: typography.monoFontFamily.split(', ')
      },
      fontWeight: {
        regular: String(typography.weight.regular),
        semibold: String(typography.weight.semibold)
      }
    }
  },
  plugins: []
};
