import { adminDocs } from '../content/adminDocs.js';
import { publicDocs } from '../content/publicDocs.js';

// Trivial a propósito — el valor de estos endpoints está en quién
// puede llegar hasta aquí (ver requireAuth/requireRole en las rutas),
// no en la lógica del controlador.
export async function getAdminDocs(req, res) {
  res.json({ sections: adminDocs });
}

export async function getPublicDocs(req, res) {
  res.json({ sections: publicDocs });
}
