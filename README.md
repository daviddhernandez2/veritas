# Veritas — Plataforma de debates estructurados

Monorepo: `/server` (Express + MongoDB) y `/client` (React + Vite).

## Fase 0 — estado actual

- Servidor Express arrancando, conectado a MongoDB, con `/api/health` como único endpoint.
- Cliente React que consulta ese healthcheck y muestra el resultado.
- Sin auth, sin modelos de datos, sin vistas todavía — eso llega en las fases siguientes del roadmap.

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

Si todo está bien conectado, `http://localhost:5173` debe mostrar "Estado del servidor: ok".

## Estructura

```
veritas/
  server/
    src/
      config/       # conexión a Mongo, config general
      models/       # schemas Mongoose (vacío hasta Fase 2)
      routes/       # rutas Express por dominio (vacío hasta Fase 1)
      controllers/  # lógica de cada ruta
      middleware/    # auth, manejo de errores, roles
      utils/         # helpers compartidos
  client/
    src/
      api/           # cliente HTTP hacia el backend
      pages/         # pantallas (Home, Hilo, Compose, Perfil...)
      components/    # piezas reutilizables (Sunburst, Tree, PostCard...)
      hooks/
      styles/
```

## Roadmap

Ver el documento de proyecto para el roadmap completo por fases (0 a 9).
Estamos en: **Fase 0 — Setup**.
