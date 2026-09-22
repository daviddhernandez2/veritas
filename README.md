# Veritas — Plataforma de debates estructurados

Web de debates tipo hilos/subhilos anidados, cuyo eje diferencial es que
cada mensaje debe aportar una fuente clasificada manualmente por tipo, y esa
fuente tiene un peso de fiabilidad de 0 a 1 que se agrega de forma recursiva
por rama del árbol de conversación.

Monorepo: `/server` (Express + MongoDB) y `/client` (React + Vite).

## Estado actual

Completado:
- **Fase 0** — setup del monorepo, healthcheck.
- **Fase 1** — auth JWT (registro/login).
- **Fase 2** — hilos/posts (modelo `Post` self-referencing) + vista clásica.
- **Fase 3** — motor de fiabilidad (`reliabilityAgg` cacheado, cascada
  ascendente, α = 0.6) + badges reales.
- **Fase 4** — reply/fork descriptivo (sin bloqueo ni turnos).
- **Fase 5** — vista Sunburst (D3) sobre la misma estructura de datos que la
  vista clásica.
- **Fase 6** — vista árbol/camino: layout de árbol con pan/zoom, migas de
  pan y paneles de nodo/ramas hijas (diseño portado desde
  `design-reference/`), sobre el endpoint nuevo `GET /api/threads/:id/path/:postId`.
- **Fase 7** — moderación MVP: reportes (`Report`) con auto-ocultación a
  los 3 reportes distintos, reputación automática (-10 al autor por post
  ocultado), y apelaciones (`Appeal`) que quedan registradas en `pending`
  sin resolución todavía (no hay moderador humano hasta una fase
  posterior).

Pendiente: Fase 8 (documentación interna solo-admin en `/admin/docs`),
Fase 9 (hardening y despliegue).

## Cómo arrancar en local

### 1. Requisitos
- Node.js 18+
- MongoDB corriendo en local (o una URI de MongoDB Atlas)

### 2. Servidor
```bash
cd server
cp .env.example .env     # ajusta MONGODB_URI si hace falta
npm install
npm run dev               # http://localhost:4000
```

### 3. Cliente
```bash
cd client
cp .env.example .env
npm install
npm run dev               # http://localhost:5173
```

Si todo está bien conectado, `http://localhost:5173` debe mostrar los hilos
existentes (o el mensaje de "todavía no hay hilos" si la base está vacía).

## Endpoints principales

- `POST /api/auth/register`, `POST /api/auth/login`
- `GET /api/threads`, `POST /api/threads`
- `GET /api/threads/:id/classic` — árbol completo de un hilo, aplanado.
  Alimenta Sunburst y la vista clásica.
- `GET /api/threads/:id/path/:postId` — mismos posts que `/classic` más el
  autor poblado y el camino de ancestros hasta `:postId`. Alimenta la vista
  árbol/camino; se pide una sola vez al entrar en la pestaña.
- `POST /api/posts/:parentId/reply` — responder o bifurcar (`postType`)
- `POST /api/posts/:postId/report` — reportar un post (motivo + nota
  opcional); auto-oculta a los 3 reportes distintos
- `POST /api/posts/:postId/appeal` — el autor de un post oculto apela
  (queda `pending`)
- `GET /api/source-weights` — pesos de fiabilidad por tipo de fuente

## Estructura

```
veritas/
  server/
    src/
      config/       # conexión a Mongo
      models/       # Post, User, SourceWeight, Report, Appeal
      routes/       # rutas Express por dominio (auth, threads, posts, source-weights)
      controllers/  # lógica de cada ruta
      middleware/    # auth, manejo de errores
      utils/         # cascade (childCount), reliability (reliabilityAgg), jwt, password
  client/
    src/
      api/           # cliente HTTP hacia el backend
      pages/         # Home, Login, Register, NewThread, Thread
      components/    # PostNode, Sunburst, TreeView, PostModeration, ReliabilityBadge, ReplyForm...
      context/        # AuthContext
      utils/         # reliabilityColor (escala compartida rojo/ámbar/verde)
```

## Roadmap

Ver el documento de proyecto para el roadmap completo por fases (0 a 9).
Estamos en: **Fase 8 — Documentación interna solo-admin**.
