import styles from "./GraphInspectorStyles.module.css";
import type {
  ExplorerEdge,
  ExplorerGroup,
  ExplorerNode,
  GraphCopy,
} from "./types";
export function GraphInspector({
  node,
  nodes,
  edges,
  groups,
  copy,
  onSelect,
}: {
  node?: ExplorerNode;
  nodes: ExplorerNode[];
  edges: ExplorerEdge[];
  groups: ExplorerGroup[];
  copy: GraphCopy;
  onSelect: (id: string) => void;
}) {
  const connections = edges.filter(
    (edge) => edge.source === node?.id || edge.target === node?.id,
  );
  return (
    <aside className={styles.inspector} aria-label={copy.inspector}>
      <p className={styles.eyebrow}>{copy.inspector}</p>
      {node ? (
        <>
          <span className={styles.nodeType}>
            {groups.find((group) => group.id === node.group)?.label}
          </span>
          <h2>{node.label}</h2>
          {node.description && (
            <p className={styles.description}>{node.description}</p>
          )}
          {node.facts?.length ? (
            <dl>
              {node.facts.map((fact) => (
                <div key={fact.label}>
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          <h3>
            {connections.length} {copy.connections}
          </h3>
          <div className={styles.connections}>
            {connections.map((edge, index) => {
              const outgoing = edge.source === node.id;
              const target = nodes.find(
                (item) => item.id === (outgoing ? edge.target : edge.source),
              );
              return (
                target && (
                  <button
                    type="button"
                    key={`${target.id}:${index}`}
                    onClick={() => onSelect(target.id)}
                  >
                    <span>
                      {outgoing ? "↗" : "↙"} {edge.label}
                    </span>
                    <strong>{target.label}</strong>
                    {edge.detail && <small>{edge.detail}</small>}
                  </button>
                )
              );
            })}
          </div>
        </>
      ) : (
        <div className={styles.placeholder}>
          <span aria-hidden="true">◎</span>
          <h2>{copy.choose}</h2>
          <p>{copy.instructions}</p>
        </div>
      )}
    </aside>
  );
}
