// Rojo -> ámbar -> verde, igual que en el diseño de Veritas.
// null significa "todavía no calculado" (no debería pasar en la
// práctica, ya que se asigna al crear el post, pero por si acaso).
export function reliabilityColor(agg) {
  if (agg === null || agg === undefined) return '#8b949e'; // gris neutro
  if (agg < 0.4) return '#f85149'; // rojo
  if (agg < 0.7) return '#d29922'; // ámbar
  return '#3fb950'; // verde
}