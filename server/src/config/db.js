import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI no está definida en el entorno');
  }

  mongoose.connection.on('connected', () => {
    console.log('[db] conectado a MongoDB');
  });

  mongoose.connection.on('error', (err) => {
    console.error('[db] error de conexión:', err.message);
  });

  await mongoose.connect(uri);
}
