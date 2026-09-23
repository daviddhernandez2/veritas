import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProfileRequest, getMyPostsRequest } from '../api/profile.js';
import { useAuth } from '../context/AuthContext.jsx';
import { relativeDate } from '../utils/relativeDate.js';
import { getSourceTypeLabel } from '../utils/sourceTypeLabels.js';
import Avatar from '../components/Avatar.jsx';
import ReliabilityBadge from '../components/ReliabilityBadge.jsx';
import LoadingScreen from '../components/LoadingScreen.jsx';
import useIsMobile from '../hooks/useIsMobile.js';
import { colors, radii, spacing, typography, reliabilityGradient, secondaryButtonStyle } from '../styles/tokens.js';

// Perfil de terceros todavía no existe (ni endpoint público ni enlaces
// desde autor en ninguna vista) — se deja esta constante ya preparada
// para cuando exista esa navegación, en vez de codificar "true" suelto
// en cada sitio que depende de ello.
const isOwnProfile = true;

export default function ProfilePage() {
  const { user: authUser, logout } = useAuth();
  const isMobile = useIsMobile();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getProfileRequest()
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p style={{ maxWidth: 720, margin: '40px auto', color: colors.reliability.low }}>{error}</p>;
  if (!data) return <LoadingScreen message="Cargando perfil…" fullScreen={false} />;

  const { user, stats, appeals } = data;
  const reputationColor = reliabilityGradient(user.reputation / 100);

  return (
    <div style={{ maxWidth: 720, margin: isMobile ? 0 : '40px auto', padding: isMobile ? spacing.md : `0 ${spacing.lg}px` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md, marginBottom: spacing.xxl }}>
        <Avatar username={user.username} size="lg" />
        <div style={{ minWidth: 0 }}>
          <h1 style={{ fontSize: typography.size.xxl, fontWeight: typography.weight.semibold, color: colors.text.primary, margin: '0 0 3px', overflowWrap: 'break-word', wordBreak: 'break-word' }}>
            {user.username}
          </h1>
          <p style={{ margin: 0, fontFamily: typography.monoFontFamily, fontSize: typography.size.sm, color: colors.text.muted }}>
            {stats.intervenciones} {stats.intervenciones === 1 ? 'intervención' : 'intervenciones'} · {stats.hilos} {stats.hilos === 1 ? 'hilo' : 'hilos'}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(160px, 1fr))', gap: spacing.sm, marginBottom: spacing.xxl }}>
        <StatCard
          label="Fiabilidad media"
          value={stats.fiabilidadMedia == null ? '—' : stats.fiabilidadMedia.toFixed(2)}
          color={stats.fiabilidadMedia == null ? colors.text.muted : reliabilityGradient(stats.fiabilidadMedia)}
        />
        <StatCard label="Hilos" value={String(stats.hilos)} color={colors.text.primary} />
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing.lg,
          border: `1px solid ${colors.border.default}`,
          borderLeft: `3px solid ${colors.accent.reputation}`,
          borderRadius: radii.md,
          padding: spacing.md + 2,
          background: colors.surface.panel,
          marginBottom: spacing.xxl
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: typography.size.sm, color: colors.text.muted, marginBottom: spacing.xs + 3 }}>Reputación de cuenta</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, marginBottom: spacing.xs + 3 }}>
            <span style={{ fontFamily: typography.monoFontFamily, fontSize: 27, fontWeight: typography.weight.semibold, color: colors.accent.reputation, lineHeight: 1 }}>
              {user.reputation}
            </span>
            <span style={{ fontFamily: typography.monoFontFamily, fontSize: typography.size.body, color: colors.text.dim }}>/100</span>
          </div>
          <div style={{ height: 6, borderRadius: radii.pill, background: colors.surface.raised, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${user.reputation}%`, background: reputationColor }} />
          </div>
          <div style={{ marginTop: spacing.xs + 3, fontSize: typography.size.sm, color: colors.text.dim }}>
            Mide el comportamiento de la cuenta, no la calidad de sus fuentes.
          </div>
        </div>
      </div>

      <MyActivity />

      {isOwnProfile && (
        <div style={{ border: `1px solid ${colors.border.default}`, borderRadius: radii.md, overflow: 'hidden', marginTop: spacing.xxl }}>
          <div style={{ padding: '8px 12px', background: colors.surface.panel, borderBottom: `1px solid ${colors.border.default}`, fontSize: typography.size.sm, fontWeight: typography.weight.semibold, color: colors.text.primary }}>
            Mis apelaciones
          </div>
          {appeals.length === 0 && <div style={{ padding: spacing.md, fontSize: typography.size.sm, color: colors.text.dim }}>Sin apelaciones todavía.</div>}
          {appeals.map((a) => (
            <div key={a.id} style={{ padding: spacing.md, borderBottom: `1px solid ${colors.border.subtle}` }}>
              {a.post && (
                <div style={{ fontSize: typography.size.sm, color: colors.text.muted, marginBottom: spacing.xs }}>
                  {a.post.isFork && <span style={{ color: colors.accent.fork }}>↳ {a.post.forkLabel} — </span>}
                  {(a.post.title || a.post.content || '').slice(0, 90)}
                </div>
              )}
              <div style={{ fontSize: typography.size.body, color: colors.text.body, marginBottom: spacing.xs }}>{a.text}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
                <span style={{ fontSize: typography.size.xs, color: colors.text.dim }}>{new Date(a.createdAt).toLocaleDateString()}</span>
                <span
                  style={{
                    fontFamily: typography.monoFontFamily,
                    fontSize: typography.size.xs,
                    fontWeight: typography.weight.semibold,
                    padding: '2px 9px',
                    borderRadius: radii.pill,
                    background: colors.surface.raised,
                    border: `1px solid ${colors.border.default}`,
                    color: colors.text.body
                  }}
                >
                  pendiente de revisión
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: spacing.xxl, display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
        <Link to="/como-funciona" style={{ fontSize: typography.size.body, color: colors.accent.link, textDecoration: 'none' }}>
          Cómo funciona →
        </Link>
        <Link to="/notifications" style={{ fontSize: typography.size.body, color: colors.accent.link, textDecoration: 'none' }}>
          Notificaciones →
        </Link>
        {authUser?.role === 'admin' && (
          <Link to="/admin/docs" style={{ fontSize: typography.size.body, color: colors.accent.link, textDecoration: 'none' }}>
            Documentación interna →
          </Link>
        )}
        {isOwnProfile && (
          <button onClick={logout} style={{ ...secondaryButtonStyle, alignSelf: 'flex-start', marginTop: spacing.sm, minHeight: 44 }}>
            Salir
          </button>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div style={{ border: `1px solid ${colors.border.default}`, borderRadius: radii.md, padding: spacing.md + 2, background: colors.surface.panel }}>
      <div style={{ fontSize: typography.size.sm, color: colors.text.muted, marginBottom: spacing.xs + 3 }}>{label}</div>
      <div style={{ fontFamily: typography.monoFontFamily, fontSize: 27, fontWeight: typography.weight.semibold, color, lineHeight: 1 }}>{value}</div>
    </div>
  );
}

// "Mi actividad": pestañas Hilos/Intervenciones sobre GET
// /api/auth/my-posts (nuevo, solo para el propio usuario). Cada fila
// navega al hilo correspondiente — no hay forma de saltar a un post
// concreto dentro de un hilo en ningún otro sitio de la app tampoco
// (Sunburst/TreeView "ver en clásica" tampoco lo hacen), así que aquí
// se sigue el mismo criterio.
function MyActivity() {
  const [tab, setTab] = useState('hilos');
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setPage(1);
    getMyPostsRequest({ tab, page: 1 })
      .then((data) => {
        setItems(data.items);
        setHasMore(data.hasMore);
      })
      .finally(() => setLoading(false));
  }, [tab]);

  function loadMore() {
    const nextPage = page + 1;
    setLoading(true);
    getMyPostsRequest({ tab, page: nextPage })
      .then((data) => {
        setItems((prev) => [...prev, ...data.items]);
        setHasMore(data.hasMore);
        setPage(nextPage);
      })
      .finally(() => setLoading(false));
  }

  return (
    <div style={{ border: `1px solid ${colors.border.default}`, borderRadius: radii.md, overflow: 'hidden', marginBottom: spacing.xxl }}>
      <div style={{ display: 'flex', background: colors.surface.panel, borderBottom: `1px solid ${colors.border.default}` }}>
        {[
          { key: 'hilos', label: 'Hilos' },
          { key: 'intervenciones', label: 'Intervenciones' }
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              flex: 1,
              minHeight: 44,
              padding: '9px 0',
              background: 'none',
              border: 'none',
              borderBottom: `2px solid ${tab === t.key ? colors.accent.tabActive : 'transparent'}`,
              color: tab === t.key ? colors.text.primary : colors.text.muted,
              fontFamily: typography.fontFamily,
              fontWeight: tab === t.key ? typography.weight.semibold : typography.weight.regular,
              fontSize: typography.size.sm,
              cursor: 'pointer'
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {!loading && items.length === 0 && (
        <div style={{ padding: spacing.md, fontSize: typography.size.sm, color: colors.text.dim }}>
          {tab === 'hilos' ? 'Todavía no has participado en ningún hilo.' : 'Todavía no tienes intervenciones.'}
        </div>
      )}

      {items.map((item) => (
        <Link
          key={item.id}
          to={`/threads/${item.threadRootId}`}
          style={{
            display: 'block',
            padding: spacing.md,
            borderBottom: `1px solid ${colors.border.subtle}`,
            textDecoration: 'none',
            color: 'inherit'
          }}
        >
          {tab === 'intervenciones' && item.isFork && (
            <div style={{ fontSize: typography.size.sm, color: colors.accent.fork, marginBottom: spacing.xs }}>↳ {item.forkLabel}</div>
          )}
          <div
            style={{
              fontSize: typography.size.body,
              color: colors.text.primary,
              marginBottom: spacing.xs,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {tab === 'hilos' ? item.title : item.title || item.excerpt}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, fontSize: typography.size.xs, color: colors.text.dim }}>
            <ReliabilityBadge value={item.reliabilityAgg} />
            <span>{getSourceTypeLabel(item.sourceType)}</span>
            {tab === 'hilos' && <span>{item.childCount} {item.childCount === 1 ? 'respuesta' : 'respuestas'}</span>}
            <span>{relativeDate(item.createdAt)}</span>
          </div>
        </Link>
      ))}

      {hasMore && (
        <div style={{ padding: spacing.md, textAlign: 'center' }}>
          <button onClick={loadMore} disabled={loading} style={{ ...secondaryButtonStyle, minHeight: 44 }}>
            {loading ? 'Cargando…' : 'Cargar más'}
          </button>
        </div>
      )}
    </div>
  );
}
