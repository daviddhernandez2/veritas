import { adminDocs } from '../content/adminDocs.js';

// Trivial a propósito — el valor de este endpoint está en quién puede
// llegar hasta aquí (requireAuth + requireRole('admin') en la ruta), no
// en la lógica del controlador.
export async function getAdminDocs(req, res) {
  res.json({ sections: adminDocs });
}
