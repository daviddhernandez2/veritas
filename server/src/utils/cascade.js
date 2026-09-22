import { Post } from '../models/Post.js';

// Sube desde `startPostId` hasta la raíz del hilo, incrementando
// childCount en cada ancestro por el camino. Se llama cada vez que se
// crea un post nuevo, pasándole el parentId del post recién creado.
//
// Por qué así y no "actualizar solo el padre directo": el Sunburst
// (Fase 5) necesita saber cuántos descendientes TOTALES tiene cada
// nodo, no solo sus hijos directos, para dibujar el tamaño de cada
// segmento correctamente.
export async function incrementChildCountUpward(startPostId) {
  let currentId = startPostId;

  while (currentId) {
    const current = await Post.findByIdAndUpdate(
      currentId,
      { $inc: { childCount: 1 } },
      { new: true, select: 'parentId' } // solo necesitamos parentId para seguir subiendo
    );

    if (!current) break; // por si el post fue borrado a mitad de camino
    currentId = current.parentId;
  }
}