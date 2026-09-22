// Express no captura automáticamente los errores lanzados dentro de
// funciones async — si no los atrapas, el servidor se queda colgado
// en vez de responder. Este wrapper envuelve el controlador y manda
// cualquier error a `next(err)`, que termina en errorHandler.js.
//
// Uso:
//   router.post('/algo', asyncHandler(async (req, res) => { ... }))
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}