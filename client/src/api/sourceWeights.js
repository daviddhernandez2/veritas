import { apiFetch } from './client.js';

export async function listSourceWeightsRequest() {
  const data = await apiFetch('/source-weights');
  return data.sourceWeights;
}