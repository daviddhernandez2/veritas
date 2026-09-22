import { verifyToken } from '../utils/jwt.js';
import { AppError } from '../utils/AppError.js';

// Exige que la petición traiga un token válido en la cabecera:
//   Authorization: Bearer <token>
// Si es válido, añade `req.user = { sub, role }` para que el resto
// de la cadena sepa quién hace la petición, sin volver a consultar Mongo.
export function requireAuth(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return next(new AppError('No autenticado', 401));
  }

  const token = header.slice('Bearer '.length);

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    next(new AppError('Token inválido o caducado', 401));
  }
}

// Se usa DESPUÉS de requireAuth. Ejemplo: la Fase 8 (documentación
// interna) montará requireAuth + requireRole('admin') en su ruta.
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(new AppError('No tienes permiso para esta acción', 403));
    }
    next();
  };
}