import { useEffect, useMemo, useRef, useState } from 'react';
import { reliabilityColor } from '../utils/reliability.js';
import ReliabilityBadge from './ReliabilityBadge.jsx';
import ReplyForm from './ReplyForm.jsx';
import { useAuth } from '../context/AuthContext.jsx';

// Fork = ámbar (#d29922), igual que en PostNode/Sunburst — el mockup de
// referencia usaba gris para los forks, pero este proyecto ya fijó el
// ámbar como su propio lenguaje visual para bifurcaciones.
const FORK_COLOR = '#d29922';

function sourceChipStyle(weight) {
  const color = reliabilityColor(weight);
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '1px 7px',
    borderRadius: 999,
    fontSize: 11.5,
    fontWeight: 500,
    border: `1px solid ${color}`,
    color,
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    whiteSpace: 'nowrap'
  };
}

// Layout "cursor": las hojas se colocan de izquierda a derecha en orden
// y cada padre se centra sobre sus hijos ya colocados. Puerto directo
// del algoritmo del mockup de referencia (design-reference/Veritas
// v2.dc.html:984-1019), adaptado a los posts reales.
function computeLayout(rootPost, childrenByParent, collapsed, sm) {
  const NW = sm ? 138 : 176;
  const NH = sm ? 92 : 104;
  const HGAP = sm ? 14 : 22;
  const VGAP = sm ? 52 : 74;
  const PAD = sm ? 20 : 40;

  const nodes = [];
  const edges = [];
  let cursor = PAD;

  function place(post, depth) {
    const isCollapsed = collapsed.has(post._id);
    const allKids = childrenByParent.get(post._id) || [];
    const kids = isCollapsed ? [] : allKids;

    let x;
    if (kids.length === 0) {
      x = cursor;
      cursor += NW + HGAP;
    } else {
      const placed = kids.map((k) => place(k, depth + 1));
      x = (placed[0].x + placed[placed.length - 1].x) / 2;
    }

    const y = PAD + depth * (NH + VGAP);
    const rec = { post, x, y, w: NW, h: NH, kidsHidden: isCollapsed && allKids.length > 0, childCountHidden: allKids.length };
    nodes.push(rec);

    kids.forEach((k) => {
      const kr = nodes.find((r) => r.post._id === k._id);
      const midY = y + NH + VGAP / 2;
      edges.push({
        d: `M${x + NW / 2},${y + NH} V${midY} H${kr.x + NW / 2} V${kr.y}`,
        fork: k.postType === 'fork'
      });
    });

    return rec;
  }

  place(rootPost, 0);
  const maxX = nodes.reduce((m, r) => Math.max(m, r.x + NW), 0);
  const maxY = nodes.reduce((m, r) => Math.max(m, r.y + NH), 0);
  return { nodes, edges, w: Math.max(maxX + PAD, NW + PAD * 2), h: Math.max(maxY + PAD + 26, NH + PAD * 2), NW, NH };
}

export default function TreeView({ posts, initialPath, sourceWeights, onReply }) {
  const { user } = useAuth();
  const byId = useMemo(() => new Map(posts.map((p) => [p._id, p])), [posts]);
  const childrenByParent = useMemo(() => {
    const map = new Map();
    for (const post of posts) {
      if (post.parentId === null) continue;
      const list = map.get(post.parentId) || [];
      list.push(post);
      map.set(post.parentId, list);
    }
    return map;
  }, [posts]);
  const rootPost = useMemo(() => posts.find((p) => p.parentId === null), [posts]);

  const [selectedId, setSelectedId] = useState(initialPath[initialPath.length - 1] || rootPost?._id);
  const [collapsed, setCollapsed] = useState(
    () => new Set(posts.filter((p) => p.postType === 'fork').map((p) => p._id))
  );
  const [replying, setReplying] = useState(false);
  const [vw, setVw] = useState(typeof window !== 'undefined' ? window.innerWidth : 1280);
  const sm = vw < 720;

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const vpRef = useRef(null);
  const dragRef = useRef(null);

  const layout = useMemo(
    () => (rootPost ? computeLayout(rootPost, childrenByParent, collapsed, sm) : null),
    [rootPost, childrenByParent, collapsed, sm]
  );

  function fit() {
    const el = vpRef.current;
    if (!el || !layout) return;
    const vpW = el.clientWidth;
    const vpH = el.clientHeight;
    if (!vpW || !vpH) return;
    const z = Math.max(0.4, Math.min(1, (vpW - 24) / layout.w, (vpH - 24) / layout.h));
    const zoomVal = Math.round(z * 100) / 100;
    setZoom(zoomVal);
    setPan({ x: (vpW - layout.w * zoomVal) / 2, y: Math.min(16, (vpH - layout.h * zoomVal) / 2) });
  }

  useEffect(() => {
    fit();
    function onResize() {
      setVw(window.innerWidth);
      fit();
    }
    window.addEventListener('resize', onResize);
    const ro = new ResizeObserver(() => fit());
    if (vpRef.current) ro.observe(vpRef.current);
    return () => {
      window.removeEventListener('resize', onResize);
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout?.w, layout?.h]);

  function zoomAt(next) {
    const el = vpRef.current;
    const z1 = Math.max(0.4, Math.min(1.8, Math.round(next * 100) / 100));
    if (!el) {
      setZoom(z1);
      return;
    }
    const cx = el.clientWidth / 2;
    const cy = el.clientHeight / 2;
    setPan((p) => ({ x: cx - ((cx - p.x) * z1) / zoom, y: cy - ((cy - p.y) * z1) / zoom }));
    setZoom(z1);
  }

  function onPanStart(e) {
    dragRef.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
    setDragging(true);
  }
  function onPanMove(e) {
    if (!dragRef.current) return;
    const { x, y, px, py } = dragRef.current;
    setPan({ x: px + (e.clientX - x), y: py + (e.clientY - y) });
  }
  function onPanEnd() {
    dragRef.current = null;
    setDragging(false);
  }
  function onWheel(e) {
    e.preventDefault();
    zoomAt(zoom - Math.sign(e.deltaY) * 0.08);
  }

  function toggleCollapsed(id) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // Cadena de ancestros hasta el nodo seleccionado, recalculada en
  // cliente recorriendo parentId — igual que pathTo() en el mockup. Solo
  // se pide al servidor una vez, al entrar en la pestaña.
  const crumbs = useMemo(() => {
    const chain = [];
    let cur = byId.get(selectedId);
    while (cur) {
      chain.unshift(cur);
      cur = cur.parentId ? byId.get(cur.parentId) : null;
    }
    return chain;
  }, [byId, selectedId]);

  if (!rootPost || !layout) {
    return <p style={{ opacity: 0.7, textAlign: 'center', margin: '40px 0' }}>Nada que dibujar todavía.</p>;
  }

  const selected = byId.get(selectedId) || rootPost;
  const selectedChildren = childrenByParent.get(selectedId) || [];

  async function handleReplySubmit(data) {
    await onReply(selectedId, data);
    setReplying(false);
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
        {crumbs.map((post, i) => (
          <span key={post._id} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <button
              onClick={() => setSelectedId(post._id)}
              style={
                post.postType === 'fork'
                  ? {
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      padding: '3px 9px',
                      borderRadius: 6,
                      border: `1px dashed ${FORK_COLOR}`,
                      background: '#12171f',
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#e6edf3',
                      cursor: 'pointer'
                    }
                  : {
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      padding: '3px 9px',
                      borderRadius: 6,
                      border: `1px solid ${post._id === selectedId ? '#30363d' : 'transparent'}`,
                      background: post._id === selectedId ? '#0d1117' : 'transparent',
                      fontSize: 12,
                      fontWeight: post._id === selectedId ? 600 : 400,
                      color: post._id === selectedId ? '#e6edf3' : '#8b949e',
                      cursor: 'pointer'
                    }
              }
            >
              {post.postType === 'fork' && <span>↳</span>}
              <span>{post.postType === 'fork' ? post.forkLabel : i === 0 ? 'Raíz del hilo' : post.authorId?.username || '—'}</span>
            </button>
            {i < crumbs.length - 1 && <span style={{ fontSize: 12, color: '#6e7681' }}>›</span>}
          </span>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: sm ? '1fr' : 'minmax(0,1fr) 300px', gap: 14, alignItems: 'start' }}>
        <div style={{ border: '1px solid #30363d', borderRadius: 6, background: '#0d1117', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, padding: '7px 10px', background: '#161b22', borderBottom: '1px solid #30363d' }}>
            {!sm && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12, fontSize: 11.5, color: '#8b949e' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 18, height: 0, borderTop: `1px dashed ${FORK_COLOR}`, display: 'inline-block' }} />
                  bifurcación
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 18, height: 0, borderTop: '1px solid #30363d', display: 'inline-block' }} />
                  respuesta directa
                </span>
              </span>
            )}
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
              <button onClick={() => zoomAt(zoom - 0.15)} style={zoomBtnStyle}>−</button>
              <span style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 11.5, color: '#8b949e', width: 38, textAlign: 'center' }}>
                {Math.round(zoom * 100)}%
              </span>
              <button onClick={() => zoomAt(zoom + 0.15)} style={zoomBtnStyle}>+</button>
              <button onClick={fit} style={fitBtnStyle}>Centrar</button>
            </span>
          </div>

          <div
            ref={vpRef}
            onMouseDown={onPanStart}
            onMouseMove={onPanMove}
            onMouseUp={onPanEnd}
            onMouseLeave={onPanEnd}
            onWheel={onWheel}
            style={{
              position: 'relative',
              minHeight: sm ? 320 : 440,
              height: sm ? '64vh' : '56vh',
              touchAction: 'none',
              overflow: 'hidden',
              cursor: dragging ? 'grabbing' : 'grab'
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: 'radial-gradient(#1b2229 1px, transparent 1px)',
                backgroundSize: '22px 22px',
                backgroundPosition: `${Math.round(pan.x % 22)}px ${Math.round(pan.y % 22)}px`,
                pointerEvents: 'none'
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: layout.w,
                height: layout.h,
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: '0 0'
              }}
            >
              <svg width={layout.w} height={layout.h} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none' }}>
                {layout.edges.map((e, i) => (
                  <path key={i} d={e.d} fill="none" stroke={e.fork ? FORK_COLOR : '#30363d'} strokeWidth={e.fork ? 1.4 : 1.6} strokeDasharray={e.fork ? '5 4' : '0'} />
                ))}
              </svg>

              {layout.nodes.map((r) => {
                const post = r.post;
                const isFork = post.postType === 'fork';
                const isSelected = post._id === selectedId;
                return (
                  <div key={post._id} style={{ position: 'absolute', left: r.x, top: r.y, width: r.w }}>
                    <button
                      onClick={() => setSelectedId(post._id)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        width: '100%',
                        height: r.h,
                        padding: 0,
                        overflow: 'hidden',
                        background: isFork ? '#12171f' : '#161b22',
                        border: `1px ${isFork ? 'dashed' : 'solid'} ${isSelected ? '#e6edf3' : isFork ? FORK_COLOR : '#30363d'}`,
                        borderRadius: 6,
                        cursor: 'pointer',
                        font: 'inherit',
                        color: 'inherit',
                        textAlign: 'left',
                        boxShadow: isSelected ? '0 0 0 3px rgba(230,237,243,0.12)' : 'none'
                      }}
                    >
                      <span style={{ display: 'block', height: 3, width: '100%', background: reliabilityColor(post.reliabilityAgg) }} />
                      {isFork && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '0 10px', marginTop: 8 }}>
                          <span style={{ fontSize: 11, color: '#8b949e' }}>↳</span>
                          <span style={{ fontSize: 11.5, fontWeight: 600, color: '#e6edf3', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.forkLabel}</span>
                        </span>
                      )}
                      <span style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 10px 0' }}>
                        <ReliabilityBadge value={post.reliabilityAgg} />
                        <span style={{ fontSize: 12.5, fontWeight: 600, color: '#e6edf3', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {post.authorId?.username || '—'}
                        </span>
                      </span>
                      <span style={{ display: 'block', padding: '6px 10px 0', fontSize: 11.5, lineHeight: 1.45, color: '#8b949e', overflow: 'hidden' }}>
                        {(post.content || '').slice(0, sm ? 52 : 78)}…
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 10px 9px', marginTop: 'auto' }}>
                        <span style={sourceChipStyle(post.sourceWeight)}>{post.sourceType}</span>
                      </span>
                    </button>
                    {r.childCountHidden > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCollapsed(post._id);
                        }}
                        style={{
                          position: 'absolute',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          top: r.h + 3,
                          minWidth: 24,
                          height: 19,
                          padding: '0 6px',
                          borderRadius: 999,
                          border: `1px solid ${isFork ? FORK_COLOR : '#30363d'}`,
                          background: '#0d1117',
                          color: '#8b949e',
                          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                          fontSize: 10.5,
                          lineHeight: 1,
                          cursor: 'pointer'
                        }}
                      >
                        {r.kidsHidden ? `+ ${post.childCount}` : '−'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ border: '1px solid #30363d', borderRadius: 6, overflow: 'hidden' }}>
            <div style={{ padding: '8px 12px', background: '#161b22', borderBottom: '1px solid #30363d', fontSize: 12, fontWeight: 600, color: '#e6edf3' }}>
              Nodo seleccionado
            </div>
            <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 9 }}>
              {selected.postType === 'fork' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '8px 10px', border: `1px dashed ${FORK_COLOR}`, borderRadius: 6, background: '#12171f' }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#e6edf3' }}>↳ Bifurcación: {selected.forkLabel}</span>
                  <span style={{ fontSize: 11.5, color: '#6e7681' }}>{selected.forkRationale}</span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <ReliabilityBadge value={selected.reliabilityAgg} />
                <span style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3' }}>{selected.authorId?.username || '—'}</span>
              </div>
              {selected.title && <div style={{ fontSize: 14, fontWeight: 600, color: '#e6edf3' }}>{selected.title}</div>}
              <div style={{ fontSize: 13, lineHeight: 1.6, color: '#c9d1d9' }}>{selected.content}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={sourceChipStyle(selected.sourceWeight)}>
                  {selected.sourceType} {selected.sourceWeight.toFixed(2)}
                </span>
                <span style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 11, color: '#6e7681' }}>
                  {selected.childCount} en rama · nivel {selected.depth}
                </span>
              </div>
              {user && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingTop: 3 }}>
                  <button onClick={() => setReplying((r) => !r)} style={sideActionStyle}>
                    {replying ? 'Cancelar' : 'Responder'}
                  </button>
                </div>
              )}
              {user && replying && <ReplyForm sourceWeights={sourceWeights} onSubmit={handleReplySubmit} onCancel={() => setReplying(false)} />}
            </div>
          </div>

          <div style={{ border: '1px solid #30363d', borderRadius: 6, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, padding: '8px 12px', background: '#161b22', borderBottom: '1px solid #30363d' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#e6edf3' }}>Ramas hijas directas</span>
              <span style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 11, color: '#6e7681', marginLeft: 'auto' }}>
                {selectedChildren.length}
              </span>
            </div>
            {selectedChildren.length === 0 && <div style={{ padding: 12, fontSize: 12.5, color: '#6e7681' }}>Sin respuestas todavía.</div>}
            {selectedChildren.map((child) => (
              <button
                key={child._id}
                onClick={() => setSelectedId(child._id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 9,
                  width: '100%',
                  padding: 13,
                  background: child.postType === 'fork' ? '#12171f' : '#161b22',
                  border: `1px ${child.postType === 'fork' ? 'dashed' : 'solid'} ${child.postType === 'fork' ? FORK_COLOR : '#30363d'}`,
                  borderRadius: 6,
                  borderTop: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  font: 'inherit',
                  color: 'inherit'
                }}
              >
                {child.postType === 'fork' && (
                  <span style={{ fontSize: 11.5, fontWeight: 600, color: '#e6edf3' }}>↳ {child.forkLabel}</span>
                )}
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ReliabilityBadge value={child.reliabilityAgg} />
                  <span style={{ fontSize: 12.5, color: '#c9d1d9' }}>{child.authorId?.username || '—'}</span>
                </span>
                <span style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 10.5, color: '#6e7681' }}>
                  {child.sourceType} {child.sourceWeight.toFixed(2)} · {child.childCount} resp.
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const zoomBtnStyle = {
  width: 22,
  height: 22,
  borderRadius: 6,
  border: '1px solid #30363d',
  background: '#0d1117',
  color: '#e6edf3',
  fontSize: 13,
  lineHeight: 1,
  cursor: 'pointer',
  padding: 0
};

const fitBtnStyle = {
  padding: '3px 9px',
  borderRadius: 6,
  border: '1px solid #30363d',
  background: '#0d1117',
  color: '#e6edf3',
  fontSize: 11.5,
  fontWeight: 600,
  cursor: 'pointer'
};

const sideActionStyle = {
  background: '#21262d',
  border: '1px solid #30363d',
  borderRadius: 6,
  padding: '4px 11px',
  fontSize: 12,
  fontWeight: 600,
  color: '#e6edf3',
  cursor: 'pointer'
};
