import { SourceWeight } from '../models/SourceWeight.js';
import { AppError } from '../utils/AppError.js';

export async function listSourceWeights(req, res) {
  const weights = await SourceWeight.find().sort({ weight: -1 });
  res.json({ sourceWeights: weights });
}

export async function updateSourceWeight(req, res) {
  const { type } = req.params;
  const { weight } = req.body;

  if (typeof weight !== 'number' || weight < 0 || weight > 1) {
    throw new AppError('weight debe ser un número entre 0 y 1', 400);
  }

  const updated = await SourceWeight.findOneAndUpdate(
    { sourceType: type },
    { weight },
    { new: true }
  );

  if (!updated) {
    throw new AppError(`Tipo de fuente desconocido: ${type}`, 404);
  }

  res.json({ sourceWeight: updated });
}