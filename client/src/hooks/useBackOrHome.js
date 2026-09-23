import { useNavigate } from 'react-router-dom';

// En iOS standalone no existe el botón "atrás" del navegador — las
// pantallas de detalle necesitan uno propio. react-router v6 guarda un
// índice creciente en history.state.idx por cada entrada añadida desde
// que se cargó la app; si es 0 (o no existe) no hay "atrás" real dentro
// de la sesión y hay que mandar a un sitio conocido en vez de salir de
// la app.
export default function useBackOrHome() {
  const navigate = useNavigate();

  return function goBack(fallback = '/') {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate(fallback);
    }
  };
}
