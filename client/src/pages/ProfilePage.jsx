import { useEffect, useState } from 'react';
import { getProfileRequest } from '../api/profile.js';
import Avatar from '../components/Avatar.jsx';
import { colors, radii, spacing, typography, reliabilityGradient } from '../styles/tokens.js';

export default function ProfilePage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getProfileRequest()
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p style={{ maxWidth: 720, margin: '40px auto', color: colors.reliability.low }}>{error}</p>;
  if (!data) return <p style={{ maxWidth: 720, margin: '40px auto', color: colors.text.muted }}>Cargando perfil...</p>;

  const { user, stats, appeals } = data;
  const reputationColor = reliabilityGradient(user.reputation / 100);

  return (
    <div style={{ maxWidth: 720, margin: '40px auto', padding: `0 ${spacing.lg}px` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md, marginBottom: spacing.xxl }}>
        <Avatar username={user.username} size="lg" />
        <div>
          <h1 style={{ fontSize: typography.size.xxl, fontWeight: typography.weight.semibold, color: colors.text.primary, margin: '0 0 3px' }}>
            {user.username}
          </h1>
          <p style={{ margin: 0, fontFamily: typography.monoFontFamily, fontSize: typography.size.sm, color: colors.text.muted }}>
            {stats.intervenciones} {stats.intervenciones === 1 ? 'intervención' : 'intervenciones'} · {stats.hilos} {stats.hilos === 1 ? 'hilo' : 'hilos'}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: spacing.sm, marginBottom: spacing.xxl }}>
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

      <div style={{ border: `1px solid ${colors.border.default}`, borderRadius: radii.md, overflow: 'hidden' }}>
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
