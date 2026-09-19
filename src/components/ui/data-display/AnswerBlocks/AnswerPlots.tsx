import { useId } from "react";
import type { Locale } from "@/lib/i18n";
import { formatNumber } from "@/lib/i18n";
import type { ChatCopy } from "@/lib/i18n/chat";
import type { ChatComponent, Point } from "@/lib/models/chatComponents";
import styles from "./AnswerBlocksStyles.module.css";

function values(points: Point[]) {
  const scale = Math.max(1, ...points.map((point) => Math.abs(point.value)));
  const min = Math.min(0, ...points.map((point) => point.value / scale));
  const max = Math.max(0, ...points.map((point) => point.value / scale));
  return { min, scale, range: max - min || 1 };
}
export function AnswerChart({
  points,
  title,
  unit,
  locale,
}: {
  points: Point[];
  title: string;
  unit?: string;
  locale: Locale;
}) {
  const { min, range, scale } = values(points);
  const zero = (-min / range) * 100;
  return (
    <section className={styles.bars} aria-label={title}>
      {points.map((point, index) => {
        const position = ((point.value / scale - min) / range) * 100;
        return (
          <div className={styles.barRow} key={`${index}-${point.label}`}>
            <span>{point.label}</span>
            <svg
              viewBox="0 0 100 12"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <rect
                x="0"
                y="2"
                width="100"
                height="8"
                rx="2"
                className={styles.track}
              />
              <rect
                x={Math.min(zero, position)}
                y="2"
                width={Math.abs(position - zero)}
                height="8"
                rx="2"
                className={point.value < 0 ? styles.negative : styles.bar}
              />
              <line
                x1={zero}
                x2={zero}
                y1="0"
                y2="12"
                className={styles.axis}
              />
            </svg>
            <strong>
              {formatNumber(point.value, locale, { maximumFractionDigits: 2 })}
              {unit ? ` ${unit}` : ""}
            </strong>
          </div>
        );
      })}
    </section>
  );
}

export function ProjectionPlot({
  component,
  locale,
  copy,
}: {
  component: Extract<ChatComponent, { type: "projection" }>;
  locale: Locale;
  copy: ChatCopy;
}) {
  const { min, range, scale } = values(component.points);
  const plot = component.points.map((point, index) => ({
    x: 32 + (index / Math.max(1, component.points.length - 1)) * 576,
    y: 170 - ((point.value / scale - min) / range) * 140,
    ...point,
  }));
  return (
    <>
      <p className={styles.disclosure}>{copy.hypothetical}</p>
      <svg
        className={styles.projection}
        viewBox="0 0 640 208"
        role="img"
        aria-label={`${component.title}. ${copy.hypothetical}`}
      >
        <title>{component.title}</title>
        <line x1="32" x2="608" y1="170" y2="170" className={styles.axis} />
        <polyline
          points={plot.map((point) => `${point.x},${point.y}`).join(" ")}
          fill="none"
          className={styles.projectionLine}
        />
        {plot.map((point, index) => (
          <circle
            key={`${index}-${point.label}`}
            cx={point.x}
            cy={point.y}
            r="4"
            className={styles.bar}
          >
            <title>{`${point.label}: ${formatNumber(point.value, locale)} ${component.unit ?? ""}`}</title>
          </circle>
        ))}
        <text x="32" y="196" className={styles.plotText}>
          {component.points[0].label}
        </text>
        <text x="608" y="196" textAnchor="end" className={styles.plotText}>
          {component.points.at(-1)?.label}
        </text>
      </svg>
      <details>
        <summary>{copy.chartData}</summary>
        <AnswerChart {...component} locale={locale} />
      </details>
      <div className={styles.assumptions}>
        <strong>{copy.assumptions}</strong>
        <ul>
          {component.assumptions.map((assumption, index) => (
            <li key={`${index}-${assumption}`}>{assumption}</li>
          ))}
        </ul>
      </div>
    </>
  );
}

export function AnswerDiagram({
  component,
  copy,
}: {
  component: Extract<ChatComponent, { type: "diagram" }>;
  copy: ChatCopy;
}) {
  const marker = useId();
  const positions = component.nodes.map((node, index) => ({
    ...node,
    x: 120 + (index % 3) * 200,
    y: 52 + Math.floor(index / 3) * 110,
  }));
  const height = Math.ceil(positions.length / 3) * 110;
  return (
    <>
      <p className={styles.disclosure}>{copy.conceptual}</p>
      <svg
        className={styles.diagram}
        viewBox={`0 0 640 ${height}`}
        role="img"
        aria-label={component.title}
      >
        <title>{component.title}</title>
        <defs>
          <marker
            id={marker}
            markerWidth="8"
            markerHeight="8"
            refX="7"
            refY="4"
            orient="auto"
          >
            <path d="M 0 0 L 8 4 L 0 8 z" className={styles.bar} />
          </marker>
        </defs>
        {component.edges.map((edge, index) => {
          const from = positions.find((node) => node.id === edge.from);
          const to = positions.find((node) => node.id === edge.to);
          if (!from || !to) return null;
          const horizontal = from.y === to.y;
          const direction = horizontal
            ? Math.sign(to.x - from.x)
            : Math.sign(to.y - from.y);
          return (
            <line
              key={`${index}-${edge.from}-${edge.to}`}
              x1={from.x + (horizontal ? direction * 82 : 0)}
              y1={from.y + (horizontal ? 0 : direction * 29)}
              x2={to.x - (horizontal ? direction * 85 : 0)}
              y2={to.y - (horizontal ? 0 : direction * 32)}
              markerEnd={`url(#${marker})`}
              className={styles.edge}
            >
              <title>{edge.label ?? `${from.label} → ${to.label}`}</title>
            </line>
          );
        })}
        {positions.map((node) => (
          <g key={node.id}>
            <rect
              x={node.x - 82}
              y={node.y - 29}
              width="164"
              height="58"
              rx="12"
              className={styles.node}
            />
            <text
              x={node.x}
              y={node.y - 3}
              textAnchor="middle"
              className={styles.plotText}
            >
              <tspan x={node.x}>{node.label.slice(0, 23)}</tspan>
              <tspan x={node.x} dy="17">
                {node.label.length > 46
                  ? `${node.label.slice(23, 43)}…`
                  : node.label.slice(23)}
              </tspan>
            </text>
            <title>{node.label}</title>
          </g>
        ))}
      </svg>
      <ul className={styles.relationships}>
        {component.edges.map((edge, index) => (
          <li key={`${index}-${edge.from}-${edge.to}`}>
            <span>
              {component.nodes.find((node) => node.id === edge.from)?.label}
            </span>
            <span aria-hidden="true"> → </span>
            <span>
              {component.nodes.find((node) => node.id === edge.to)?.label}
            </span>
            {edge.label && <small>{edge.label}</small>}
          </li>
        ))}
      </ul>
    </>
  );
}
