import { Post } from '../models/Post.js';
import { SourceWeight } from '../models/SourceWeight.js';
import { AppError } from '../utils/AppError.js';
import { incrementChildCountUpward } from '../utils/cascade.js';
import { recalcReliabilityUpward } from '../utils/reliability.js';

// Crea una respuesta colgando de `parentId`. postType distingue una
// continuación directa (reply) de una bifurcación de tema (fork) —
// ambas están siempre permitidas, sin restricción de turno. La
// distinción es descriptiva: cambia cómo se muestra el post en las
// vistas, no quién puede publicarlo.
export async function reply(req, res) {
  const { parentId } = req.params;
  const { content, sourceType, sourceUrl, postType, forkLabel, forkRationale } = req.body;

  if (!content || !sourceType) {
    throw new AppError('Faltan campos: content y sourceType son obligatorios', 400);
  }
  if (postType !== 'reply' && postType !== 'fork') {
    throw new AppError("postType debe ser 'reply' o 'fork'", 400);
  }

  const parent = await Post.findById(parentId);
  if (!parent || parent.status !== 'visible') {
    throw new AppError('El post al que respondes no existe o no está disponible', 404);
  }

  if (postType === 'fork' && (!forkLabel || !forkRationale)) {
    throw new AppError('Una bifurcación requiere forkLabel y forkRationale', 400);
  }

  const sourceWeightDoc = await SourceWeight.findOne({ sourceType });
  if (!sourceWeightDoc) {
    throw new AppError(`Tipo de fuente desconocido: ${sourceType}`, 400);
  }

  const post = await Post.create({
    authorId: req.user.sub,
    parentId: parent._id,
    threadRootId: parent.threadRootId,
    depth: parent.depth + 1,
    postType,
    forkLabel: postType === 'fork' ? forkLabel : null,
    forkRationale: postType === 'fork' ? forkRationale : null,
    content,
    sourceType,
    sourceUrl,
    sourceWeight: sourceWeightDoc.weight,
    reliabilityAgg: sourceWeightDoc.weight,
    reliabilityUpdatedAt: new Date()
  });

  await incrementChildCountUpward(parent._id);
  await recalcReliabilityUpward(parent._id);

  res.status(201).json({ post });
}