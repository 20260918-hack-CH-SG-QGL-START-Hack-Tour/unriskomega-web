import styles from "./GraphCanvasStyles.module.css";
import type { ExplorerEdge, Position } from "./types";
export function GraphLinks({
  edges,
  points,
  active,
  neighbors,
  marker,
  labels,
}: {
  edges: ExplorerEdge[];
  points: Record<string, Position>;
  active: string;
  neighbors: Set<string>;
  marker: string;
  labels: boolean;
}) {
  return edges.map((edge, index) => {
    const from = points[edge.source],
      to = points[edge.target];
    if (!from || !to) return null;
    const selected = active === edge.source || active === edge.target;
    return (
      <g key={`${edge.source}:${edge.target}:${index}`}>
        <line
          x1={from.x}
          y1={from.y}
          x2={to.x}
          y2={to.y}
          className={styles.edge}
          data-active={selected}
          data-dim={Boolean(active) && !neighbors.has(edge.source)}
          markerEnd={labels ? `url(#${marker})` : undefined}
        />
        {labels && (
          <text
            x={(from.x + to.x) / 2}
            y={(from.y + to.y) / 2 - 8}
            className={styles.edgeLabel}
            data-dim={Boolean(active) && !selected}
          >
            {edge.label}
          </text>
        )}
      </g>
    );
  });
}
