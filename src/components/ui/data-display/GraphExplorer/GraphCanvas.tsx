"use client";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import styles from "./GraphCanvasStyles.module.css";
import { GraphLinks } from "./GraphLinks";
import { degrees, forceLayout, neighborhood } from "./graph-layout";
import type {
  ExplorerEdge,
  ExplorerGroup,
  ExplorerNode,
  GraphCopy,
} from "./types";
import { useGraphCamera } from "./useGraphCamera";

type Props = {
  nodes: ExplorerNode[];
  edges: ExplorerEdge[];
  groups: ExplorerGroup[];
  selected: string;
  labels: boolean;
  spread: number;
  copy: GraphCopy;
  onSelect: (id: string) => void;
};
export function GraphCanvas({
  nodes,
  edges,
  groups,
  selected,
  labels,
  spread,
  copy,
  onSelect,
}: Props) {
  const marker = useId().replaceAll(":", "");
  const positions = useMemo(
    () => forceLayout(nodes, edges, spread),
    [nodes, edges, spread],
  );
  const counts = useMemo(() => degrees(nodes, edges), [nodes, edges]);
  const [hover, setHover] = useState("");
  const active = hover || selected;
  const neighbors = useMemo(
    () => neighborhood(active, edges, 1),
    [active, edges],
  );
  const controls = useGraphCamera(onSelect);
  const points = { ...positions, ...controls.moved };
  const canvas = useRef<SVGSVGElement>(null);
  const zoom = controls.zoom;
  useEffect(() => {
    const element = canvas.current;
    const wheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.metaKey) return;
      event.preventDefault();
      zoom(event.deltaY < 0 ? 1.08 : 1 / 1.08);
    };
    element?.addEventListener("wheel", wheel, { passive: false });
    return () => element?.removeEventListener("wheel", wheel);
  }, [zoom]);
  return (
    <div className={styles.canvasWrap}>
      <svg
        ref={canvas}
        className={styles.canvas}
        viewBox="-500 -330 1000 660"
        role="application"
        // biome-ignore lint/a11y/noNoninteractiveTabindex: Interactive SVG supports keyboard pan and zoom, with a native node selector alternative.
        tabIndex={0}
        aria-label={copy.overview}
        aria-describedby={`${marker}-help`}
        onPointerDown={(event) => controls.start(event, points)}
        onPointerMove={controls.move}
        onPointerUp={controls.end}
        onPointerCancel={controls.end}
        onKeyDown={controls.keyboard}
      >
        <title>{copy.overview}</title>
        <defs>
          <marker
            id={marker}
            viewBox="0 0 10 10"
            refX="22"
            refY="5"
            markerWidth="4"
            markerHeight="4"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" className={styles.arrow} />
          </marker>
        </defs>
        <g
          transform={`translate(${controls.camera.x} ${controls.camera.y}) scale(${controls.camera.scale})`}
        >
          <GraphLinks
            edges={edges}
            points={points}
            active={active}
            neighbors={neighbors}
            marker={marker}
            labels={nodes.length < 25}
          />
          {nodes.map((node) => (
            // biome-ignore lint/a11y/useSemanticElements: SVG nodes cannot contain HTML buttons; equivalent native select is provided below.
            <g
              key={node.id}
              transform={`translate(${points[node.id]?.x ?? 0} ${points[node.id]?.y ?? 0})`}
              data-node-id={node.id}
              data-group={
                groups.findIndex((group) => group.id === node.group) % 5
              }
              data-selected={node.id === selected}
              data-dim={Boolean(active) && !neighbors.has(node.id)}
              className={styles.node}
              role="button"
              aria-label={node.label}
              aria-pressed={node.id === selected}
              tabIndex={node.id === selected ? 0 : -1}
              onPointerEnter={() => setHover(node.id)}
              onPointerLeave={() => setHover("")}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelect(node.id);
                }
              }}
            >
              <title>
                {`${node.label} · ${counts.get(node.id)} ${copy.connections}`}
              </title>
              <circle
                className={styles.nodeHalo}
                r={radius(counts.get(node.id) ?? 0) + 6}
              />
              <circle r={radius(counts.get(node.id) ?? 0)} />
              <text
                y={radius(counts.get(node.id) ?? 0) + 17}
                className={styles.nodeLabel}
                data-visible={
                  labels || nodes.length < 25 || neighbors.has(node.id)
                }
              >
                {node.label}
              </text>
            </g>
          ))}
        </g>
      </svg>
      {nodes.length === 0 && <p className={styles.empty}>{copy.empty}</p>}
      <div className={styles.canvasTools}>
        <button
          type="button"
          onClick={() => controls.zoom(1.2)}
          aria-label={copy.zoomIn}
          title={copy.zoomIn}
        >
          +
        </button>
        <output>{Math.round(controls.camera.scale * 100)}%</output>
        <button
          type="button"
          onClick={() => controls.zoom(1 / 1.2)}
          aria-label={copy.zoomOut}
          title={copy.zoomOut}
        >
          −
        </button>
        <button
          type="button"
          onClick={controls.reset}
          aria-label={copy.reset}
          title={copy.reset}
        >
          ↺
        </button>
      </div>
      <p id={`${marker}-help`} className={styles.instructions}>
        {copy.instructions}
      </p>
    </div>
  );
}
function radius(count: number) {
  return Math.min(15, 4.5 + Math.sqrt(count) * 1.3);
}
