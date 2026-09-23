// Único mapa de etiquetas legibles para sourceType — el enum crudo
// (server/src/models/Post.js) no debe imprimirse nunca en la UI.
export const SOURCE_TYPE_LABELS = {
  paper: 'Paper científico',
  institucion: 'Institución',
  medio: 'Medio',
  libro: 'Libro',
  blog: 'Blog',
  youtube: 'Vídeo',
  instagram: 'Instagram',
  red_social: 'Red social',
  otro: 'Otro'
};

export function getSourceTypeLabel(sourceType) {
  return SOURCE_TYPE_LABELS[sourceType] || sourceType;
}
