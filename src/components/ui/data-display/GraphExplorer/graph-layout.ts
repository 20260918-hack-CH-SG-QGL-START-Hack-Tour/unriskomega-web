import type { ExplorerEdge, ExplorerNode, Position } from "./types";

type Particle = Position & { vx: number; vy: number };

export function neighborhood(id: string, edges: ExplorerEdge[], depth: number) {
  const ids = new Set([id]);
  for (let step = 0; step < depth; step++) {
    const frontier = new Set(ids);
    for (const edge of edges) {
      if (frontier.has(edge.source)) ids.add(edge.target);
      if (frontier.has(edge.target)) ids.add(edge.source);
    }
  }
  return ids;
}
export function degrees(nodes: ExplorerNode[], edges: ExplorerEdge[]) {
  const counts = new Map(nodes.map((node) => [node.id, 0]));
  for (const edge of edges) {
    counts.set(edge.source, (counts.get(edge.source) ?? 0) + 1);
    counts.set(edge.target, (counts.get(edge.target) ?? 0) + 1);
  }
  return counts;
}
function repel(particles: Particle[], spread: number) {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const a = particles[i],
        b = particles[j];
      const dx = a.x - b.x,
        dy = a.y - b.y;
      const distance = Math.max(1, Math.hypot(dx, dy));
      const force = Math.min(8, spread / (distance * distance));
      a.vx += (dx / distance) * force;
      a.vy += (dy / distance) * force;
      b.vx -= (dx / distance) * force;
      b.vy -= (dy / distance) * force;
    }
  }
}
function attract(
  particles: Map<string, Particle>,
  edges: ExplorerEdge[],
  distance: number,
) {
  for (const edge of edges) {
    const a = particles.get(edge.source),
      b = particles.get(edge.target);
    if (!a || !b) continue;
    const dx = b.x - a.x,
      dy = b.y - a.y;
    const length = Math.max(1, Math.hypot(dx, dy));
    const force = (length - distance) * 0.015;
    a.vx += (dx / length) * force;
    a.vy += (dy / length) * force;
    b.vx -= (dx / length) * force;
    b.vy -= (dy / length) * force;
  }
}
export function forceLayout(
  nodes: ExplorerNode[],
  edges: ExplorerEdge[],
  spread = 1,
) {
  const particles = nodes.map((_, index): Particle => {
    const angle = index * 2.3999632297;
    const radius = Math.sqrt(index + 1) * 24;
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      vx: 0,
      vy: 0,
    };
  });
  const byId = new Map(nodes.map((node, index) => [node.id, particles[index]]));
  for (let tick = 0; tick < 240; tick++) {
    repel(particles, 1900 * spread);
    attract(byId, edges, 70 * spread);
    for (const p of particles) {
      p.vx = (p.vx - p.x * 0.003) * 0.76;
      p.vy = (p.vy - p.y * 0.003) * 0.76;
      p.x += p.vx;
      p.y += p.vy;
    }
  }
  const extent = Math.max(
    0.2,
    ...particles.map((p) => Math.max(Math.abs(p.x) / 430, Math.abs(p.y) / 265)),
  );
  return Object.fromEntries(
    nodes.map((node, index) => [
      node.id,
      {
        x: particles[index].x / extent,
        y: particles[index].y / extent,
      },
    ]),
  ) as Record<string, Position>;
}
