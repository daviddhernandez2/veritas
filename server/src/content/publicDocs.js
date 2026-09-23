// Contenido de "Cómo funciona" (GET /api/docs, cualquier usuario
// logueado — sin requireRole). Documentación de cara al usuario: motor
// de fiabilidad, reply/fork, moderación. La parte interna
// (arquitectura, guía operativa, referencia de API) vive aparte en
// server/src/content/adminDocs.js, protegida con requireRole('admin')
// — antes de esta división todo era un único array servido entero
// solo a admins.
//
// Mismo formato de bloques que adminDocs.js — ver ese archivo para el
// detalle de { type: 'p' | 'h3' | 'ul' | 'code', ... }.

export const publicDocs = [
  {
    id: 'fiabilidad',
    title: 'Motor de fiabilidad',
    blocks: [
      { type: 'p', text: 'reliabilityAgg se CACHEA en cada post y se recalcula en cascada ascendente cuando algo cambia en su rama (insertar un post nuevo, u ocultar uno por moderación) — nunca se calcula al vuelo en una lectura.' },
      { type: 'h3', text: 'Fórmula' },
      { type: 'code', text: 'reliabilityAgg = α × sourceWeight_propio + (1 − α) × promedio(reliabilityAgg de los hijos DIRECTOS visibles)\nα = 0.6\n\nSi el post no tiene hijos visibles: reliabilityAgg = sourceWeight_propio' },
      { type: 'p', text: 'Implementada en server/src/utils/reliability.js (computeAgg + recalcReliabilityUpward). recalcReliabilityUpward sube desde un post hasta la raíz, recalculando cada ancestro — no basta con propagar un número, porque el hijo que cambió puede alterar la media de TODOS sus hermanos combinada.' },
      { type: 'h3', text: 'sourceWeight es un snapshot' },
      { type: 'p', text: 'Al publicar un post se copia el weight vigente de SourceWeight en ese momento. Si un admin cambia después el peso de un tipo de fuente, los posts ya publicados NO se actualizan retroactivamente — sourceWeight es historia, no una referencia viva.' },
      { type: 'h3', text: 'Pesos por defecto' },
      { type: 'ul', items: [
        'Paper científico — 1.0', 'Institución — 0.9', 'Medio — 0.6', 'Libro — 0.6',
        'Blog — 0.4', 'Vídeo — 0.3', 'Otro — 0.2', 'Red social — 0.15', 'Instagram — 0.1'
      ] }
    ]
  },
  {
    id: 'reply-fork',
    title: 'Reply / Fork',
    blocks: [
      { type: 'p', text: 'postType distingue una respuesta directa (reply) de una bifurcación de tema (fork). Es PURAMENTE DESCRIPTIVO: no hay sistema de turnos ni bloqueo de ningún tipo. Cualquier usuario puede responder directamente a cualquier post en cualquier momento.' },
      { type: 'p', text: 'Un fork exige un título y una razón obligatorios (validado en el servidor, no solo en el formulario) y se distingue solo visualmente — cabecera propia ámbar en las tres vistas.' }
    ]
  },
  {
    id: 'moderacion',
    title: 'Moderación',
    blocks: [
      { type: 'p', text: 'MVP: solo reportes + reputación automática. No hay moderador humano todavía — todo lo que ocurre aquí es una regla automática, sin ninguna cola de revisión.' },
      { type: 'h3', text: 'Reportar un post' },
      { type: 'p', text: 'Cualquier usuario logueado puede reportar un post ajeno. Motivos válidos: fuente falsa, spam, insulto, irrelevante, otro. No puedes reportar tu propio post, ni el mismo post dos veces.' },
      { type: 'h3', text: 'Auto-ocultación' },
      { type: 'p', text: 'Al llegar a 3 reportes distintos sobre el mismo post: se oculta, el autor pierde 10 puntos de reputación (suelo 0, empieza en 100), y deja de contar en la fiabilidad de sus posts ancestros — igual que si el post se hubiera eliminado a efectos del cálculo.' },
      { type: 'h3', text: 'Apelaciones' },
      { type: 'p', text: 'El autor de un post oculto puede apelar explicando por qué el reporte es incorrecto. Solo el propio autor puede apelar, y solo una vez por post. La apelación queda registrada como "pendiente de revisión" — todavía no hay ningún flujo que la acepte o rechace, eso es trabajo de una fase de moderación con revisión humana real, no planificada todavía.' },
      { type: 'h3', text: 'Revelar contenido oculto' },
      { type: 'p', text: 'Cualquiera puede pulsar "Ver de todos modos" sobre un post oculto para leerlo igualmente — el contenido nunca se borra de verdad, solo se vela en la interfaz.' }
    ]
  }
];
