// Contenido de /admin/docs (solo rol admin — ver server/src/routes/docsRoutes.js).
// Documentación INTERNA: arquitectura, guía operativa y referencia de
// API. El contenido de cara a cualquier usuario logueado (motor de
// fiabilidad, reply/fork, moderación) vive aparte, en
// server/src/content/publicDocs.js — antes de esta división todo esto
// era un único array servido entero solo a admins.
//
// Es texto plano estructurado (no markdown, el cliente no tiene
// ninguna librería de parseo) — cada sección es { id, title, blocks },
// cada block es uno de:
//   { type: 'p', text }
//   { type: 'h3', text }
//   { type: 'ul', items: [...] }
//   { type: 'code', text }
// Mantener esto sincronizado con el código real cuando cambie algo que
// se documenta aquí (fórmulas, umbrales, endpoints).

export const adminDocs = [
  {
    id: 'arquitectura',
    title: 'Arquitectura',
    blocks: [
      { type: 'p', text: 'Monorepo MERN: MongoDB Atlas + Express en /server, React + Vite en /client. ES Modules en todo el backend (import/export, no require).' },
      { type: 'h3', text: 'Modelo de datos' },
      { type: 'p', text: 'Todos los posts (hilos raíz y respuestas) viven en una única colección self-referencing: Post. Un hilo es simplemente un Post con parentId=null.' },
      { type: 'ul', items: [
        'parentId — post inmediato al que responde (null en la raíz)',
        'threadRootId — el post raíz del hilo entero (apunta a sí mismo si es la raíz)',
        'depth — nivel de anidación, 0 en la raíz',
        'postType — "reply" o "fork", puramente descriptivo (ver sección Reply/Fork)',
        'sourceType / sourceWeight — tipo de fuente citada y su peso (0-1) EN EL MOMENTO de publicar (snapshot, ver más abajo)',
        'reliabilityAgg — fiabilidad agregada cacheada de la rama (ver Motor de fiabilidad)',
        'childCount — nº total de descendientes (para el tamaño de los arcos del Sunburst)',
        'status — visible | hidden | removed (moderación, ver esa sección)',
        'reportCount — nº de reportes distintos recibidos'
      ] },
      { type: 'h3', text: 'Las tres vistas de un hilo' },
      { type: 'p', text: 'Sunburst, árbol/camino y clásica muestran el mismo hilo con proyecciones distintas, pero no todas usan el mismo endpoint:' },
      { type: 'ul', items: [
        'Clásica y Sunburst: GET /api/threads/:id/classic — árbol completo aplanado (lista de posts con parentId), sin anidar en el JSON; cada vista construye la jerarquía que necesita en el cliente.',
        'Árbol/camino: GET /api/threads/:id/path/:postId — mismos campos que /classic más el autor poblado (username) y el camino de ancestros hasta :postId resuelto en servidor. Se pide una sola vez al entrar en la pestaña; cambiar de nodo seleccionado recalcula las migas de pan en cliente, sin más peticiones.'
      ] },
      { type: 'p', text: 'Los posts con status="hidden" se siguen devolviendo en ambos endpoints (no desaparecen) — si desaparecieran, descolgarían a sus hijos (que pueden seguir visibles) del árbol reconstruido en el cliente. Solo status="removed" queda excluido (borrado real, sin ningún flujo que lo produzca todavía).' }
    ]
  },
  {
    id: 'operativa',
    title: 'Guía operativa',
    blocks: [
      { type: 'h3', text: 'Cambiar el peso de un tipo de fuente' },
      { type: 'p', text: 'No hay interfaz todavía — se hace directamente contra la API (rol admin obligatorio):' },
      { type: 'code', text: 'PATCH /api/source-weights/:type\nAuthorization: Bearer <token de admin>\nBody: { "weight": 0.75 }' },
      { type: 'p', text: 'Solo afecta a posts publicados DESPUÉS del cambio — sourceWeight es un snapshot, ver Motor de fiabilidad.' },
      { type: 'h3', text: 'Promover un usuario a admin' },
      { type: 'p', text: 'Tampoco hay flujo de producto para esto (es intencional — no es una acción que deba poder hacerse desde la UI). Se cambia a mano el campo role de un User en Mongo a "admin" o "moderator" (el rol "moderator" existe en el schema pero todavía no desbloquea ninguna capacidad extra en el código).' },
      { type: 'h3', text: 'Apelaciones pendientes' },
      { type: 'p', text: 'Hoy no hay forma de listarlas ni resolverlas desde la aplicación — solo existen como documentos Appeal en Mongo con status="pending". Para revisarlas manualmente: consultar la colección appeals directamente.' }
    ]
  },
  {
    id: 'api',
    title: 'Referencia de API',
    blocks: [
      { type: 'ul', items: [
        'POST /api/auth/register — { username, email, password } → { token, user }',
        'POST /api/auth/login — { email, password } → { token, user }',
        'GET /api/auth/me — requiere sesión → { user } (incluye reputation actualizada)',
        'GET /api/threads — lista hilos raíz visibles',
        'POST /api/threads — requiere sesión → crea un hilo raíz',
        'GET /api/threads/:id/classic — árbol aplanado del hilo (visible + hidden)',
        'GET /api/threads/:id/path/:postId — árbol aplanado + autor poblado + camino de ancestros',
        'POST /api/posts/:parentId/reply — requiere sesión → { content, sourceType, sourceUrl?, postType, forkLabel?, forkRationale? }',
        'POST /api/posts/:postId/report — requiere sesión → { reason, note? }',
        'POST /api/posts/:postId/appeal — requiere sesión, solo el autor del post oculto → { text }',
        'GET /api/source-weights — lista pública de pesos por tipo de fuente',
        'PATCH /api/source-weights/:type — requiere rol admin → { weight }',
        'GET /api/docs — requiere sesión (cualquier rol) → documentación pública ("Cómo funciona")',
        'GET /api/admin/docs — requiere rol admin → esta misma documentación'
      ] }
    ]
  }
];
