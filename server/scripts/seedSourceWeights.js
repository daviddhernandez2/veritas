// Este script se ejecuta UNA VEZ (o cada vez que quieras resetear los
// pesos a sus valores por defecto) con: npm run seed
// No es parte del servidor en marcha — es una tarea puntual.
import 'dotenv/config';
import mongoose from 'mongoose';
import { SourceWeight } from '../src/models/SourceWeight.js';

const DEFAULT_WEIGHTS = [
  { sourceType: 'paper', weight: 1.0 },
  { sourceType: 'institucion', weight: 0.9 },
  { sourceType: 'medio', weight: 0.6 },
  { sourceType: 'libro', weight: 0.6 },
  { sourceType: 'blog', weight: 0.4 },
  { sourceType: 'youtube', weight: 0.3 },
  { sourceType: 'red_social', weight: 0.15 },
  { sourceType: 'instagram', weight: 0.1 },
  { sourceType: 'otro', weight: 0.2 }
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('[seed] conectado');

  for (const entry of DEFAULT_WEIGHTS) {
    // upsert: si ya existe ese sourceType, actualiza el peso; si no, lo crea.
    // Así puedes volver a correr el script sin duplicar filas.
    await SourceWeight.updateOne(
      { sourceType: entry.sourceType },
      { $set: entry },
      { upsert: true }
    );
    console.log(`[seed] ${entry.sourceType} -> ${entry.weight}`);
  }

  console.log('[seed] completado');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('[seed] error:', err);
  process.exit(1);
});