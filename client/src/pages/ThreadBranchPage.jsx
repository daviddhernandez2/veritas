import { useParams } from 'react-router-dom';
import PostNode from '../components/PostNode.jsx';
import LoadingScreen from '../components/LoadingScreen.jsx';
import useThreadData from '../hooks/useThreadData.js';
import { colors, spacing } from '../styles/tokens.js';

// Destino de "Continuar rama →" en PostNode.jsx (vista clásica, tope
// de indentación en móvil). Reutiliza la MISMA query de subárbol que
// ThreadPage.jsx (/classic del hilo completo, vía useThreadData) —
// solo cambia qué post se trata como raíz visual al renderizar, sin
// endpoint nuevo.
export default function ThreadBranchPage() {
  const { id, postId } = useParams();
  const thread = useThreadData(id);
  const { posts, sourceWeights, loading, error, childrenByParent } = thread;

  if (loading) return <LoadingScreen message="Cargando rama…" fullScreen={false} />;
  if (error) return <p style={{ maxWidth: 720, margin: '40px auto', color: colors.reliability.low }}>{error}</p>;

  const branchRoot = posts.find((p) => p._id === postId);
  if (!branchRoot) return <p style={{ color: colors.text.muted, padding: spacing.lg }}>Rama no encontrada.</p>;

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: spacing.md }}>
      <PostNode
        post={branchRoot}
        childrenByParent={childrenByParent}
        sourceWeights={sourceWeights}
        threadId={id}
        onReply={thread.handleReply}
        onReport={thread.handleReport}
        onAppeal={thread.handleAppeal}
      />
    </div>
  );
}
