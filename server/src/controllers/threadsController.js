import mongoose from "mongoose";
import { Post } from "../models/Post.js";
import { SourceWeight } from "../models/SourceWeight.js";
import { AppError } from "../utils/AppError.js";
// Crea un hilo raíz. No lleva parentId — de ahí que la validación de
// `title` obligatorio viva aquí y no en el schema (una respuesta normal
// no necesita título).
export async function createThread(req, res) {
  const { title, content, sourceType, sourceUrl } = req.body;

  if (!title || !content || !sourceType) {
    throw new AppError(
      "Faltan campos: title, content y sourceType son obligatorios",
      400,
    );
  }

  const sourceWeightDoc = await SourceWeight.findOne({ sourceType });
  if (!sourceWeightDoc) {
    throw new AppError(`Tipo de fuente desconocido: ${sourceType}`, 400);
  }

  // Generamos el _id ANTES de crear el documento porque threadRootId,
  // para un hilo raíz, tiene que apuntar a su propio _id — y Mongo no
  // nos deja referenciar un _id que todavía no existe si dejamos que
  // se autogenere en el create().
  const _id = new mongoose.Types.ObjectId();

  const thread = await Post.create({
    _id,
    authorId: req.user.sub,
    parentId: null,
    threadRootId: _id,
    depth: 0,
    title,
    content,
    sourceType,
    sourceUrl,
    sourceWeight: sourceWeightDoc.weight,
    // Al crearse, un post no tiene hijos todavía — su fiabilidad
    // agregada es directamente el peso de su propia fuente.
    reliabilityAgg: sourceWeightDoc.weight,
    reliabilityUpdatedAt: new Date(),
    reliabilityAgg: sourceWeightDoc.weight,
    reliabilityUpdatedAt: new Date(),
  });

  res.status(201).json({ post: thread });
}

// Listado de hilos raíz para el Home. De momento ordenado por más
// reciente; el "ordenar por actividad" real (última respuesta) llega
// cuando tengamos más datos que mostrar en el Home.
export async function listThreads(req, res) {
  const threads = await Post.find({ parentId: null, status: "visible" })
    .sort({ createdAt: -1 })
    .select("title authorId createdAt childCount reliabilityAgg sourceType");

  res.json({ threads });
}

// Devuelve TODO el árbol de un hilo, aplanado (no anidado). El
// frontend construye la jerarquía visual a partir de parentId — es
// más simple de cachear y de paginar más adelante que anidar aquí.
export async function getThreadTree(req, res) {
  const { id } = req.params;

  const root = await Post.findById(id);
  if (!root || root.parentId !== null) {
    throw new AppError("Hilo no encontrado", 404);
  }

  const posts = await Post.find({ threadRootId: id, status: "visible" })
    .sort({ depth: 1, createdAt: 1 })
    .select(
      "authorId parentId depth title content postType forkLabel forkRationale sourceType sourceWeight reliabilityAgg childCount createdAt",
    )
    .populate("authorId", "username");

  res.json({ posts });
}

// Igual que getThreadTree, pero además resuelve el nombre de autor de
// cada post (la vista árbol/camino lo necesita para las tarjetas y las
// migas de pan) y el camino de ancestros hasta :postId, calculado aquí
// en memoria a partir de los posts ya cargados — así el cliente no
// repite esta consulta por cada click de nodo, solo la pide una vez al
// entrar en la pestaña.
export async function getThreadPath(req, res) {
  const { id, postId } = req.params;

  const root = await Post.findById(id);
  if (!root || root.parentId !== null) {
    throw new AppError("Hilo no encontrado", 404);
  }

  const posts = await Post.find({ threadRootId: id, status: "visible" })
    .sort({ depth: 1, createdAt: 1 })
    .select(
      "authorId parentId depth title content postType forkLabel forkRationale sourceType sourceWeight reliabilityAgg childCount createdAt",
    )
    .populate("authorId", "username");

  const byId = new Map(posts.map((p) => [String(p._id), p]));
  const target = byId.get(postId);
  if (!target) {
    throw new AppError("El post solicitado no existe en este hilo", 404);
  }

  const path = [];
  let current = target;
  while (current) {
    path.unshift(current._id);
    current = current.parentId ? byId.get(String(current.parentId)) : null;
  }

  res.json({ posts, path });
}
