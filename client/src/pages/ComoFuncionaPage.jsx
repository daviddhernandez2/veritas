import { useEffect, useState } from 'react';
import { getPublicDocsRequest } from '../api/docs.js';
import LoadingScreen from '../components/LoadingScreen.jsx';
import DocsViewer from '../components/DocsViewer.jsx';
import { colors } from '../styles/tokens.js';

// Documentación pública ("Cómo funciona"), enlazada desde Perfil —
// visible para cualquier usuario logueado, sin rol. La interna
// (arquitectura, guía operativa, API) sigue en AdminDocsPage.jsx.
export default function ComoFuncionaPage() {
  const [sections, setSections] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getPublicDocsRequest()
      .then(setSections)
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p style={{ maxWidth: 720, margin: '40px auto', color: colors.reliability.low }}>{error}</p>;
  if (!sections) return <LoadingScreen message="Cargando…" fullScreen={false} />;

  return <DocsViewer sections={sections} eyebrow="Cómo funciona" backTo="/profile" />;
}
