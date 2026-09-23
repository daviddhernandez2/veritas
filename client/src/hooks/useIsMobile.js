import { useEffect, useState } from 'react';

const BREAKPOINT = 768;

// Fuente única del breakpoint móvil — cualquier componente que necesite
// bifurcar layout desktop/móvil usa este hook en vez de reinventar su
// propio matchMedia o comprobar window.innerWidth suelto.
export default function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(`(max-width: ${BREAKPOINT}px)`).matches
  );

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${BREAKPOINT}px)`);
    const onChange = (e) => setIsMobile(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return isMobile;
}
