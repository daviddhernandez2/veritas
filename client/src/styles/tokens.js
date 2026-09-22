// Sistema de diseño de Veritas — extraído de design-reference/
// (capturas en design-reference/design-reference/*.png + la lógica de
// estilos real en "Veritas v2.dc.html": funciones badge(), chip(),
// colorFor(), y los bloques <style> inline). Fuente única de verdad:
// nada de colores/radios/espaciados sueltos hardcodeados en componentes
// a partir de ahora — se importa de aquí.
//
// Nota: una de las 7 capturas en design-reference/design-reference/
// ("...15.19.53.png") es un pantallazo de un comentario de Reddit, no
// del diseño de Veritas — no se ha usado para extraer nada de esto.

// --- Color ------------------------------------------------------------

export const colors = {
  // Superficies, de más oscura (fondo de página) a más clara.
  surface: {
    base: '#0d1117', // fondo de página, contenido de tarjeta
    panel: '#161b22', // cabeceras de panel, inputs, tarjetas de nodo
    raised: '#21262d', // hover de botones secundarios, filas activas
    sunken: '#12171f', // relleno de cajas de fork / destacados dashed
    grid: '#1b2229' // puntos del fondo del canvas pannable (árbol/camino)
  },

  border: {
    default: '#30363d', // borde estándar de tarjetas/inputs/paneles
    subtle: '#21262d' // separadores internos (filas de lista)
  },

  text: {
    primary: '#e6edf3', // títulos, nombres de autor, texto de mayor énfasis
    body: '#c9d1d9', // cuerpo de texto (contenido de posts)
    muted: '#8b949e', // metadatos, placeholders, texto secundario
    dim: '#6e7681' // texto terciario (timestamps, hints)
  },

  accent: {
    link: '#4493f8',
    linkHover: '#6cb0fa',
    tabActive: '#f78166', // subrayado de pestaña/tab activa (nav superior, login)
    fork: '#d29922', // ámbar de bifurcación (mismo tono que fiabilidad media)
    reputation: '#a371f7' // barra de "reputación de cuenta" en Perfil
  },

  button: {
    primaryBg: '#238636', // CTA principal (Entrar, Publicar, Abrir hilo)
    primaryBgHover: '#2ea043',
    dangerBg: '#b62324' // enviar reporte
  },

  // Contenido oculto por moderación (velo + apelación).
  danger: {
    border: '#5c2b28',
    bg: '#1a1011',
    text: '#ffb4ad',
    textBright: '#ff8882',
    iconBg: '#24120f'
  },

  // Gradiente de fiabilidad: rojo (0) → ámbar (0.5) → verde (1),
  // interpolado de forma CONTINUA (confirmado — puerto de colorFor() en
  // Veritas v2.dc.html:847-850). Sustituye a las 3 franjas discretas que
  // usa hoy reliabilityColor() en client/src/utils/reliability.js
  // (<0.4 rojo, 0.4-0.7 ámbar, ≥0.7 verde) — ese cambio se aplica en la
  // siguiente fase, cuando se toquen los componentes; aquí solo queda
  // preparado el token y la función.
  reliability: {
    low: '#f85149', // v=0
    mid: '#d29922', // v=0.5
    high: '#3fb950' // v=1
  }
};

// Puerto directo de colorFor()/mix() en Veritas v2.dc.html — interpola
// linealmente low→mid en [0, 0.5] y mid→high en [0.5, 1]. Es la función
// que sustituirá a reliabilityColor() (3 franjas discretas) cuando se
// toquen los componentes — no se usa en ninguno todavía.
export function reliabilityGradient(value) {
  const v = Math.max(0, Math.min(1, value));
  const mix = (a, b, t) => {
    const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
    const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
    const [r, g, b2] = pa.map((c, i) => Math.round(c + (pb[i] - c) * t));
    return `rgb(${r},${g},${b2})`;
  };
  return v < 0.5
    ? mix(colors.reliability.low, colors.reliability.mid, v / 0.5)
    : mix(colors.reliability.mid, colors.reliability.high, (v - 0.5) / 0.5);
}

// --- Radios de borde ----------------------------------------------------
// Verificado contra el .dc.html: 6px domina (tarjetas, botones, inputs,
// paneles), 4px solo en los badges de score, 999px en chips/píldoras.

export const radii = {
  sm: 4, // badge de score (fiabilidad)
  md: 6, // radio por defecto: tarjetas, botones, inputs, paneles
  pill: 999 // chips de fuente, toggles tipo píldora
};

// --- Espaciado ----------------------------------------------------------

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22, // padding de página en desktop
  xxl: 26 // padding de página en secciones con más aire (home, compose)
};

// --- Tipografía -----------------------------------------------------------

export const typography = {
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
  monoFontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', // scores, chips, conteos, código
  size: {
    xs: 11, // timestamps, metadatos finos
    sm: 12, // texto secundario, chips, botones pequeños
    body: 13.5, // párrafo estándar (contenido de un post)
    md: 14, // texto base / inputs
    lg: 15, // títulos de tarjeta
    xl: 19, // título de hilo (cabecera del hilo abierto)
    xxl: 20, // h1 de página (Home, Nuevo hilo)
    stat: 27 // números grandes de estadísticas (Perfil)
  },
  weight: {
    regular: 400,
    semibold: 600
  },
  lineHeight: 1.5
};

// --- Sombras --------------------------------------------------------------

export const shadows = {
  selectedRing: '0 0 0 3px rgba(230,237,243,0.12)', // anillo de foco (nodo seleccionado en árbol)
  modal: '0 16px 48px rgba(1,4,9,0.8)' // modales (reportar, apelar)
};

// --- Avatar -----------------------------------------------------------
// El propio mockup ya define un avatar circular con iniciales (nav y
// perfil) — no hace falta traer nada de fuera. Pendiente de backlog
// (ver memoria "backlog-avatars", post-MVP): extender este mismo
// tratamiento a cada fila de post/comentario en las tres vistas, no
// solo a nav/perfil. No se implementa todavía, solo se deja el token.
export const avatar = {
  sm: { size: 26, fontSize: 10 }, // nav
  lg: { size: 62, fontSize: 19 } // perfil
};

// Marca de Veritas: círculo cónico rojo→ámbar→verde con un punto oscuro
// en el centro (logo en nav/login).
export const logoGradient = 'conic-gradient(from 180deg, #f85149, #d29922 45%, #3fb950 90%, #f85149)';

// --- Botones ------------------------------------------------------------
// Tres variantes del mockup: CTA principal (verde, Entrar/Publicar),
// secundaria (gris, Responder/Colapsar/controles), y "ghost" discontinua
// (Bifurcar — mismo tratamiento visual que ya usa el ámbar de fork en
// otros sitios, pero en gris cuando no es específicamente sobre un
// fork). Objetos de estilo listos para spread/usar directamente en
// `style={{...}}`, así no se repite la misma combinación en cada
// componente que tiene un botón.

export const primaryButtonStyle = {
  background: colors.button.primaryBg,
  border: '1px solid rgba(240,246,252,0.1)',
  borderRadius: radii.md,
  padding: '8px 16px',
  fontSize: typography.size.body,
  fontWeight: typography.weight.semibold,
  color: '#ffffff',
  cursor: 'pointer'
};

export const secondaryButtonStyle = {
  background: colors.surface.raised,
  border: `1px solid ${colors.border.default}`,
  borderRadius: radii.md,
  padding: '4px 11px',
  fontSize: typography.size.sm,
  fontWeight: typography.weight.semibold,
  color: colors.text.primary,
  cursor: 'pointer'
};

export const ghostButtonStyle = {
  background: 'transparent',
  border: `1px dashed ${colors.text.dim}`,
  borderRadius: radii.md,
  padding: '4px 11px',
  fontSize: typography.size.sm,
  fontWeight: typography.weight.semibold,
  color: colors.text.muted,
  cursor: 'pointer'
};

// --- Campos de formulario -------------------------------------------------
// Input/textarea/select comparten el mismo tratamiento en todo el
// mockup: fondo de página (no de panel), borde por defecto, radio
// estándar. Un objeto de estilo listo para spread evita repetirlo en
// cada formulario (login, registro, nuevo hilo, responder, reportar...).

export const inputStyle = {
  background: colors.surface.base,
  border: `1px solid ${colors.border.default}`,
  borderRadius: radii.md,
  padding: '8px 11px',
  color: colors.text.primary,
  fontSize: typography.size.md,
  fontFamily: typography.fontFamily,
  outline: 'none'
};
