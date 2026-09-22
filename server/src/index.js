import 'dotenv/config';
import { createApp } from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 4000;

async function start() {
  await connectDB();

  const app = createApp();

  app.listen(PORT, () => {
    console.log(`[server] escuchando en http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('[server] no se pudo arrancar:', err);
  process.exit(1);
});
