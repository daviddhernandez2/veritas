import { User } from '../models/User.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';
import { AppError } from '../utils/AppError.js';

export async function register(req, res) {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    throw new AppError('Faltan campos: username, email y password son obligatorios', 400);
  }
  if (password.length < 8) {
    throw new AppError('La contraseña debe tener al menos 8 caracteres', 400);
  }

  const existing = await User.findOne({ $or: [{ email }, { username }] });
  if (existing) {
    throw new AppError('Ya existe una cuenta con ese email o nombre de usuario', 409);
  }

  const passwordHash = await hashPassword(password);
  const user = await User.create({ username, email, passwordHash });

  const token = generateToken(user);

  // Nunca devolvemos passwordHash en la respuesta, ni aquí ni en login.
  res.status(201).json({
    token,
    user: { id: user._id, username: user.username, email: user.email, role: user.role }
  });
}

export async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError('Faltan campos: email y password son obligatorios', 400);
  }

  const user = await User.findOne({ email });
  // Mensaje deliberadamente genérico: no decimos si el fallo fue el
  // email o la contraseña, para no dar pistas a quien intenta adivinar.
  if (!user) {
    throw new AppError('Credenciales inválidas', 401);
  }

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) {
    throw new AppError('Credenciales inválidas', 401);
  }

  if (user.suspendedUntil && user.suspendedUntil > new Date()) {
    throw new AppError(`Cuenta suspendida hasta ${user.suspendedUntil.toISOString()}`, 403);
  }

  const token = generateToken(user);

  res.json({
    token,
    user: { id: user._id, username: user.username, email: user.email, role: user.role }
  });
}

// Requiere requireAuth antes en la ruta. req.user.sub viene del token
// (ver middleware/requireAuth.js) — aquí sí consultamos Mongo, para
// devolver datos frescos (ej. reputación actualizada) y no solo lo
// que había en el token al hacer login.
export async function me(req, res) {
  const user = await User.findById(req.user.sub);
  if (!user) {
    throw new AppError('Usuario no encontrado', 404);
  }

  res.json({
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      reputation: user.reputation
    }
  });
}