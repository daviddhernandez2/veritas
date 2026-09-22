Veritas — Plataforma de debates estructurados

Web de debates tipo Reddit (hilos/subhilos anidados), cuyo eje diferencial es que cada mensaje debe aportar una fuente clasificada manualmente por tipo, y esa fuente tiene un peso de fiabilidad de 0 a 1 que se agrega de forma recursiva por rama del árbol de conversación.

Stack
MERN: MongoDB Atlas, Express, React + Vite, Node (ES Modules en todo el backend)
Visualizaciones pendientes: D3.js (Sunburst con d3-hierarchy/partition, árbol jerárquico)
Monorepo: /server (Express) y /client (React + Vite)
Autor: David, diseñador gráfico/web con perfil híbrido técnico
Regla de naming

Nunca usar nombres de marcas de terceros (Reddit, etc.) en código, rutas, nombres de componentes o archivos — solo como comparación verbal en comentarios o conversación está bien, nunca como identificador.

Decisiones de arquitectura cerradas (no reabrir sin que se pida explícitamente)
Posts en una sola colección self-referencing (parentId, threadRootId, depth)
reliabilityAgg CACHEADO en cada post, recalculado en cascada ascendente al insertar/eliminar posts — nunca calculado al vuelo en lectura
Fórmula: reliabilityAgg = α × sourceWeight_propio + (1-α) × promedio(reliabilityAgg hijos directos), α = 0.6
sourceWeight es un snapshot al publicar — cambiar los pesos admin no afecta retroactivamente a posts ya publicados
Tres vistas (Sunburst, árbol/camino, clásica) se alimentan de la MISMA estructura de datos (GET /api/threads/:id/classic para el árbol aplanado), solo cambia la proyección/query
postType (reply | fork) es PURAMENTE DESCRIPTIVO — no hay sistema de turnos ni bloqueo de ningún tipo. Cualquier usuario puede responder directamente a cualquier post en cualquier momento. Un fork exige forkLabel + forkRationale obligatorios y se distingue solo visualmente (cabecera propia en las vistas)
NO existe turnState, awaitingReplyFrom ni expiresAt en el modelo — se implementaron y se retiraron deliberadamente, no los reintroduzcas
Moderación MVP: solo reportes + reputación automática (sin moderador humano todavía) — pendiente de implementar
La capa de verificación por IA está APARCADA deliberadamente
Estado actual (ver también README.md del repo)

Completado: Fase 0 (setup), Fase 1 (auth JWT), Fase 2 (hilos/posts + vista clásica), Fase 3 (motor de fiabilidad + badges reales), Fase 4 (reply/fork descriptivo, sin bloqueo). Pendiente: Fase 5 (Sunburst D3), Fase 6 (vista árbol/camino), Fase 7 (moderación: reportes + reputación automática), Fase 8 (documentación interna solo-admin en /admin/docs), Fase 9 (hardening y despliegue).

Cómo ayudar en este proyecto
Respuestas técnicas directas, en español, sin rodeos
Mantén el código coherente con las decisiones ya cerradas arriba
Si una petición contradice una decisión ya cerrada, señálalo antes de proceder, no lo cambies en silencio
Antes de cambios grandes o que toquen varios archivos, usa plan mode y déjame revisar el plan antes de ejecutar
Corre y prueba tú mismo lo que construyas (arrancar servidor, hacer peticiones, revisar la terminal) en vez de asumir que algo funciona
Haz commit de git tras cada cambio que funcione y esté verificado