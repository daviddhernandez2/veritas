import { Post } from '../models/Post.js';

// α controla cuánto pesa la fuente propia del post frente a lo que
// opinan sus respuestas. Con 0.6, el post pesa algo más que su propia
// rama — ver documentación del proyecto para la justificación completa
// de por qué esta fórmula y no otras alternativas que se descartaron.
const ALPHA = 0.6;

// Recalcula reliabilityAgg de un post concreto a partir de:
//   - su propio sourceWeight (siempre cuenta)
//   - la media de reliabilityAgg de sus hijos DIRECTOS (si tiene)
// Si no tiene hijos todavía, reliabilityAgg = sourceWeight sin más.
function computeAgg(sourceWeight, childrenAggs) {
  if (childrenAggs.length === 0) return sourceWeight;

  const childrenAvg = childrenAggs.reduce((sum, v) => sum + v, 0) / childrenAggs.length;
  return ALPHA * sourceWeight + (1 - ALPHA) * childrenAvg;
}

// Sube desde `startPostId` hasta la raíz, recalculando reliabilityAgg
// en cada ancestro del camino. Se llama con el parentId del post recién
// creado — el propio post nuevo no necesita pasar por aquí, porque al
// no tener hijos todavía su reliabilityAgg es simplemente su sourceWeight
// (eso se asigna directamente al crearlo, ver postsController.js).
//
// Por qué recalculamos cada nivel en vez de solo "insertar el nuevo
// valor": el hijo que acaba de cambiar puede alterar la media de TODOS
// sus hermanos combinada, así que cada ancestro necesita su propia
// consulta de hijos directos, no basta con propagar un número.
export async function recalcReliabilityUpward(startPostId) {
  let currentId = startPostId;

  while (currentId) {
    const current = await Post.findById(currentId);
    if (!current) break;

    const children = await Post.find({ parentId: current._id, status: 'visible' }).select('reliabilityAgg');
    const childrenAggs = children
      .map((c) => c.reliabilityAgg)
      .filter((agg) => agg !== null && agg !== undefined);

    current.reliabilityAgg = computeAgg(current.sourceWeight, childrenAggs);
    current.reliabilityUpdatedAt = new Date();
    await current.save();

    currentId = current.parentId;
  }
}