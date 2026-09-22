import jwt from 'jsonwebtoken';

const EXPIRES_IN = '7d'; // duración de la sesión antes de tener que hacer login de nuevo

// Genera el token que el cliente guardará y enviará en cada petición
// para demostrar quién es, sin tener que mandar la contraseña otra vez.
export function generateToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: EXPIRES_IN }
  );
}

// Verifica que un token es válido y no ha caducado. Si no lo es,
// jwt.verify lanza un error — lo dejamos propagarse, lo captura
// asyncHandler/errorHandler más arriba en la cadena.
export function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}