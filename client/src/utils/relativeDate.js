const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });

const UNITS = [
  ['year', 31536000],
  ['month', 2592000],
  ['week', 604800],
  ['day', 86400],
  ['hour', 3600],
  ['minute', 60]
];

// Fecha relativa ("hace 3 días") con Intl nativo — sin librería nueva.
// Por debajo de un minuto se dice "ahora mismo" en vez de "hace 12
// segundos", que no aporta nada útil en un feed de hilos.
export function relativeDate(dateInput) {
  const diffSeconds = (new Date(dateInput).getTime() - Date.now()) / 1000;

  if (Math.abs(diffSeconds) < 60) return 'ahora mismo';

  for (const [unit, secondsInUnit] of UNITS) {
    if (Math.abs(diffSeconds) >= secondsInUnit) {
      return rtf.format(Math.round(diffSeconds / secondsInUnit), unit);
    }
  }
  return rtf.format(Math.round(diffSeconds / 60), 'minute');
}
