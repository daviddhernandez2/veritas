// Contenido de /admin/docs. Es texto plano estructurado (no markdown,
// el cliente no tiene ninguna librería de parseo) — cada sección es
// { id, title, blocks }, cada block es uno de:
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
    id: 'fiabilidad',
    title: 'Motor de fiabilidad',
    blocks: [
      { type: 'p', text: 'reliabilityAgg se CACHEA en cada post y se recalcula en cascada ascendente cuando algo cambia en su rama (insertar un post nuevo, u ocultar uno por moderación) — nunca se calcula al vuelo en una lectura.' },
      { type: 'h3', text: 'Fórmula' },
      { type: 'code', text: 'reliabilityAgg = α × sourceWeight_propio + (1 − α) × promedio(reliabilityAgg de los hijos DIRECTOS visibles)\nα = 0.6\n\nSi el post no tiene hijos visibles: reliabilityAgg = sourceWeight_propio' },
      { type: 'p', text: 'Implementada en server/src/utils/reliability.js (computeAgg + recalcReliabilityUpward). recalcReliabilityUpward sube desde un post hasta la raíz, recalculando cada ancestro — no basta con propagar un número, porque el hijo que cambió puede alterar la media de TODOS sus hermanos combinada.' },
      { type: 'h3', text: 'sourceWeight es un snapshot' },
      { type: 'p', text: 'Al publicar un post se copia el weight vigente de SourceWeight en ese momento. Si un admin cambia después el peso de un tipo de fuente (PATCH /api/source-weights/:type), los posts ya publicados NO se actualizan retroactivamente — sourceWeight es historia, no una referencia viva.' },
      { type: 'h3', text: 'Pesos por defecto' },
      { type: 'ul', items: [
        'paper — 1.0', 'institucion — 0.9', 'medio — 0.6', 'libro — 0.6',
        'blog — 0.4', 'youtube — 0.3', 'otro — 0.2', 'red_social — 0.15', 'instagram — 0.1'
      ] }
    ]
  },
  {
    id: 'reply-fork',
    title: 'Reply / Fork',
    blocks: [
      { type: 'p', text: 'postType distingue una respuesta directa (reply) de una bifurcación de tema (fork). Es PURAMENTE DESCRIPTIVO: no hay sistema de turnos ni bloqueo de ningún tipo. Cualquier usuario puede responder directamente a cualquier post en cualquier momento.' },
      { type: 'p', text: 'Un fork exige forkLabel + forkRationale obligatorios (validado en el backend, no solo en el formulario) y se distingue solo visualmente — cabecera propia ámbar (#d29922) en las tres vistas.' },
      { type: 'p', text: 'Aviso para quien toque este código: turnState, awaitingReplyFrom y expiresAt NO existen en el modelo. Se implementaron en algún momento y se retiraron deliberadamente. No los reintroduzcas sin que se pida explícitamente — es una decisión de producto cerrada, no un olvido.' }
    ]
  },
  {
    id: 'moderacion',
    title: 'Moderación',
    blocks: [
      { type: 'p', text: 'MVP: solo reportes + reputación automática. No hay moderador humano todavía — todo lo que ocurre aquí es una regla automática, sin ninguna cola de revisión.' },
      { type: 'h3', text: 'Reportar un post' },
      { type: 'p', text: 'POST /api/posts/:postId/report (requiere sesión). Motivos válidos: fuente_falsa, spam, insulto, irrelevante, otro. Un usuario no puede reportar su propio post, ni reportar el mismo post dos veces (índice único postId+reporterId en el modelo Report, mismo patrón de comprobación previa que el email/username duplicado en el registro — no se depende de capturar el error de Mongo).' },
      { type: 'h3', text: 'Auto-ocultación' },
      { type: 'p', text: 'Al llegar a 3 reportes distintos sobre el mismo post: status pasa a "hidden", el autor pierde 10 puntos de reputación (suelo 0, campo User.reputation, empieza en 100), y se recalcula en cascada el reliabilityAgg de sus ancestros para que dejen de contar esa fuente — igual que si el post se hubiera "eliminado" a efectos de la fórmula.' },
      { type: 'code', text: 'const AUTO_HIDE_THRESHOLD = 3;\nconst REPUTATION_PENALTY = 10;\n// server/src/controllers/postsController.js' },
      { type: 'p', text: 'Importante para quien edite esta lógica: el post debe guardarse (post.save()) ANTES de llamar a recalcReliabilityUpward — esa función relee de la base de datos qué hijos siguen "visible", así que si el cambio de status todavía no está persistido, seguiría contando el post oculto y el agregado del padre no cambiaría (bug real que se dio y se corrigió durante el desarrollo de esta fase).' },
      { type: 'h3', text: 'Apelaciones' },
      { type: 'p', text: 'El autor de un post oculto puede apelar: POST /api/posts/:postId/appeal con un texto explicando por qué el reporte es incorrecto. Solo el propio autor puede apelar, y solo una vez por post. La apelación queda registrada con status="pending" y AHÍ SE QUEDA — no hay ningún flujo que la acepte o rechace todavía (el modelo Appeal solo admite el estado "pending" a propósito, para no construir estados que nada puede alcanzar). Resolver apelaciones es trabajo de una fase de moderación con revisión humana real, todavía no planificada.' },
      { type: 'h3', text: 'Revelar contenido oculto' },
      { type: 'p', text: 'Cualquier visitante puede pulsar "Ver de todos modos" sobre un post oculto — es un velo puramente de interfaz (estado local del componente PostModeration), el contenido nunca se redacta en el backend. No hay ninguna restricción de rol sobre quién puede revelar/leer un post oculto hoy.' }
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
        'GET /api/admin/docs — requiere rol admin → esta misma documentación'
      ] }
    ]
  }
];
