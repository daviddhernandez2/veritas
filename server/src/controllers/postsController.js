import { Post } from '../models/Post.js';
import { SourceWeight } from '../models/SourceWeight.js';
import { User } from '../models/User.js';
import { Report } from '../models/Report.js';
import { Appeal } from '../models/Appeal.js';
import { AppError } from '../utils/AppError.js';
import { incrementChildCountUpward } from '../utils/cascade.js';
import { recalcReliabilityUpward } from '../utils/reliability.js';

const REPORT_REASONS = ['fuente_falsa', 'spam', 'insulto', 'irrelevante', 'otro'];
const AUTO_HIDE_THRESHOLD = 3;
const REPUTATION_PENALTY = 10;

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

// Registra un reporte de un usuario sobre un post. Al llegar al umbral
// de reportes distintos, el post se oculta automáticamente y su autor
// pierde reputación — sin moderador humano todavía, es puramente
// automático (ver CLAUDE.md, Fase 7).
export async function report(req, res) {
  const { postId } = req.params;
  const { reason, note } = req.body;

  if (!REPORT_REASONS.includes(reason)) {
    throw new AppError(`reason debe ser uno de: ${REPORT_REASONS.join(', ')}`, 400);
  }

  const post = await Post.findById(postId);
  if (!post) {
    throw new AppError('Post no encontrado', 404);
  }
  if (post.status !== 'visible') {
    throw new AppError('Este post ya no está visible', 400);
  }
  if (String(post.authorId) === req.user.sub) {
    throw new AppError('No puedes reportar tu propio post', 400);
  }

  const existing = await Report.findOne({ postId, reporterId: req.user.sub });
  if (existing) {
    throw new AppError('Ya has reportado este post', 409);
  }

  await Report.create({ postId, reporterId: req.user.sub, reason, note });

  post.reportCount += 1;

  const author = await User.findById(post.authorId);

  if (author) {
    author.reportsReceived += 1;
  }

  const willHide = post.reportCount >= AUTO_HIDE_THRESHOLD;
  if (willHide) {
    post.status = 'hidden';
    if (author) {
      author.reportsConfirmed += 1;
      author.reputation = Math.max(0, author.reputation - REPUTATION_PENALTY);
    }
  }

  // Guardamos ANTES de recalcular la cascada — recalcReliabilityUpward
  // relee de la base de datos qué hijos siguen 'visible', así que si
  // post.status='hidden' no está persistido todavía, la cascada seguiría
  // contando este post como visible y el agregado del padre no cambiaría.
  await post.save();
  if (author) {
    await author.save();
  }
  if (willHide && post.parentId) {
    await recalcReliabilityUpward(post.parentId);
  }

  res.json({ post });
}

// El autor de un post oculto puede apelar — se registra pero no se
// resuelve automáticamente (queda 'pending' hasta que exista una fase
// de moderación con revisión real).
export async function appeal(req, res) {
  const { postId } = req.params;
  const { text } = req.body;

  if (!text) {
    throw new AppError('Falta el texto de la apelación', 400);
  }

  const post = await Post.findById(postId);
  if (!post) {
    throw new AppError('Post no encontrado', 404);
  }
  if (post.status !== 'hidden') {
    throw new AppError('Solo se puede apelar un post oculto', 400);
  }
  if (String(post.authorId) !== req.user.sub) {
    throw new AppError('Solo el autor del post puede apelarlo', 403);
  }

  const existing = await Appeal.findOne({ postId });
  if (existing) {
    throw new AppError('Ya existe una apelación para este post', 409);
  }

  const appealDoc = await Appeal.create({ postId, text });

  res.status(201).json({ appeal: appealDoc });
}