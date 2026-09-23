import { useEffect, useState } from 'react';

// En iOS, al abrir el teclado el visualViewport se encoge pero
// 100dvh/window.innerHeight no siempre refleja cuánto tapa — es la
// única API fiable para anclar una barra de acción justo encima del
// teclado en vez de que quede escondida debajo de él.
export default function useKeyboardInset() {
  const [inset, setInset] = useState(0);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    function update() {
      const bottomInset = window.innerHeight - vv.height - vv.offsetTop;
      setInset(Math.max(0, Math.round(bottomInset)));
    }

    update();
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
    };
  }, []);

  return inset;
}
