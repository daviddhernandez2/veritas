import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

// Convierte la contraseña en texto plano en un hash que sí se puede
// guardar en la base de datos. Nunca guardamos la contraseña original.
export async function hashPassword(plainPassword) {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

// Compara la contraseña que el usuario escribe al hacer login con el
// hash guardado. Devuelve true/false, nunca revela el hash.
export async function comparePassword(plainPassword, passwordHash) {
  return bcrypt.compare(plainPassword, passwordHash);
}