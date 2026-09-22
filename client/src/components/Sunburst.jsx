import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { reliabilityColor } from '../utils/reliability.js';

const WIDTH = 640;
const RADIUS = WIDTH / 6;

// Solo se ven 3 anillos de profundidad a la vez (y0>=1 && y1<=3) — un
// debate puede tener muchos más niveles que eso, así que el resto se
// revela haciendo zoom (click en un arco) en vez de intentar dibujarlo
// todo apretado de una vez.
function arcVisible(d) {
  return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
}

function labelVisible(d) {
  return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
}

export default function Sunburst({ posts }) {
  const svgRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    if (!posts || posts.length <= 1) return;

    // Misma estructura de datos que la vista clásica (árbol aplanado por
    // parentId) — stratify() la reconstruye en jerarquía sin pedir nada
    // nuevo al backend.
    const root = d3
      .stratify()
      .id((d) => d._id)
      .parentId((d) => d.parentId)(posts);

    root.sum(() => 1);
    root.sort((a, b) => b.value - a.value);

    d3.partition().size([2 * Math.PI, root.height + 1])(root);
    root.each((d) => (d.current = d));

    const arc = d3
      .arc()
      .startAngle((d) => d.x0)
      .endAngle((d) => d.x1)
      .padAngle((d) => Math.min((d.x1 - d.x0) / 2, 0.005))
      .padRadius(RADIUS * 1.5)
      .innerRadius((d) => d.y0 * RADIUS)
      .outerRadius((d) => Math.max(d.y0 * RADIUS, d.y1 * RADIUS - 1));

    svg
      .attr('viewBox', [-WIDTH / 2, -WIDTH / 2, WIDTH, WIDTH])
      .style('width', '100%')
      .style('height', 'auto')
      .style('max-width', `${WIDTH}px`)
      .style('display', 'block')
      .style('margin', '0 auto')
      .style('font', '10px system-ui');

    const g = svg.append('g');

    const path = g
      .append('g')
      .selectAll('path')
      .data(root.descendants().slice(1))
      .join('path')
      .attr('fill', (d) => reliabilityColor(d.data.reliabilityAgg))
      .attr('stroke', (d) => (d.data.postType === 'fork' ? '#d29922' : '#0d1117'))
      .attr('stroke-width', (d) => (d.data.postType === 'fork' ? 2 : 0.5))
      .attr('fill-opacity', (d) => (arcVisible(d.current) ? (d.children ? 0.85 : 0.7) : 0))
      .attr('pointer-events', (d) => (arcVisible(d.current) ? 'auto' : 'none'))
      .attr('d', (d) => arc(d.current));

    path
      .filter((d) => d.children)
      .style('cursor', 'pointer')
      .on('click', clicked);

    path
      .on('mousemove', (event, d) => {
        setTooltip({ x: event.clientX, y: event.clientY, post: d.data });
      })
      .on('mouseleave', () => setTooltip(null));

    const label = g
      .append('g')
      .attr('pointer-events', 'none')
      .attr('text-anchor', 'middle')
      .style('user-select', 'none')
      .selectAll('text')
      .data(root.descendants().slice(1))
      .join('text')
      .attr('fill', '#0d1117')
      .attr('fill-opacity', (d) => +labelVisible(d.current))
      .attr('transform', (d) => labelTransform(d.current))
      .text((d) => (d.data.title || d.data.content || '').slice(0, 18));

    const parent = g
      .append('circle')
      .datum(root)
      .attr('r', RADIUS)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .style('cursor', 'pointer')
      .on('click', clicked);

    function clicked(event, p) {
      parent.datum(p.parent || root);

      root.each(
        (d) =>
          (d.target = {
            x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
            x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
            y0: Math.max(0, d.y0 - p.depth),
            y1: Math.max(0, d.y1 - p.depth)
          })
      );

      const t = g.transition().duration(600);

      path
        .transition(t)
        .tween('data', (d) => {
          const i = d3.interpolate(d.current, d.target);
          return (time) => (d.current = i(time));
        })
        .filter(function (d) {
          return +this.getAttribute('fill-opacity') || arcVisible(d.target);
        })
        .attr('fill-opacity', (d) => (arcVisible(d.target) ? (d.children ? 0.85 : 0.7) : 0))
        .attr('pointer-events', (d) => (arcVisible(d.target) ? 'auto' : 'none'))
        .attrTween('d', (d) => () => arc(d.current));

      label
        .filter(function (d) {
          return +this.getAttribute('fill-opacity') || labelVisible(d.target);
        })
        .transition(t)
        .attr('fill-opacity', (d) => +labelVisible(d.target))
        .attrTween('transform', (d) => () => labelTransform(d.current));
    }

    function labelTransform(d) {
      const x = (((d.x0 + d.x1) / 2) * 180) / Math.PI;
      const y = ((d.y0 + d.y1) / 2) * RADIUS;
      return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
    }
  }, [posts]);

  if (!posts || posts.length <= 1) {
    return <p style={{ opacity: 0.7, textAlign: 'center', margin: '40px 0' }}>Todavía no hay respuestas para dibujar el Sunburst.</p>;
  }

  return (
    <div style={{ position: 'relative' }}>
      <svg ref={svgRef} />
      {tooltip && (
        <div
          style={{
            position: 'fixed',
            left: tooltip.x + 12,
            top: tooltip.y + 12,
            background: '#161b22',
            border: '1px solid #30363d',
            borderRadius: 6,
            padding: '8px 10px',
            fontSize: 12,
            maxWidth: 260,
            pointerEvents: 'none',
            zIndex: 10
          }}
        >
          {tooltip.post.title && <div style={{ fontWeight: 600, marginBottom: 4 }}>{tooltip.post.title}</div>}
          <div style={{ opacity: 0.85, marginBottom: 4 }}>
            {tooltip.post.content?.slice(0, 140)}
            {tooltip.post.content?.length > 140 ? '…' : ''}
          </div>
          <div style={{ display: 'flex', gap: 8, opacity: 0.7 }}>
            <span>Fuente: {tooltip.post.sourceType}</span>
            <span>Fiabilidad: {tooltip.post.reliabilityAgg == null ? '—' : tooltip.post.reliabilityAgg.toFixed(2)}</span>
          </div>
          {tooltip.post.postType === 'fork' && <div style={{ color: '#d29922', marginTop: 4 }}>↳ Bifurcación: {tooltip.post.forkLabel}</div>}
        </div>
      )}
      <Legend />
    </div>
  );
}

function Legend() {
  return (
    <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 12, fontSize: 12, opacity: 0.8 }}>
      <LegendItem color="#f85149" label="Baja (< 0.4)" />
      <LegendItem color="#d29922" label="Media (0.4 – 0.7)" />
      <LegendItem color="#3fb950" label="Alta (≥ 0.7)" />
    </div>
  );
}

function LegendItem({ color, label }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, display: 'inline-block' }} />
      {label}
    </span>
  );
}
