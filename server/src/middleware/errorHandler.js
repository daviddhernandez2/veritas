// 404 para rutas no encontradas
export function notFound(req, res, next) {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
}

// Manejador central de errores. Cualquier `next(err)` en controladores
// termina aquí. Los controladores deben lanzar errores con `.status`
// cuando quieran un código HTTP específico (ver utils/AppError.js en
// fases siguientes); si no, se responde 500 por defecto.
export function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const message = status === 500 ? 'Error interno del servidor' : err.message;

  if (status === 500) {
    console.error('[error]', err);
  }

  res.status(status).json({ error: message });
}
