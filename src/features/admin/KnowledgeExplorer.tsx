"use client";
import { useState } from "react";
import type { AdminCatalog, GraphNode } from "@/lib/models/admin";
import styles from "./AdminStyles";
import type { AdminMessages } from "./messages";
export function KnowledgeExplorer({
  data,
  t,
}: {
  data: AdminCatalog;
  t: AdminMessages;
}) {
  const [selected, setSelected] = useState(data.graph.nodes[0]?.id ?? "");
  const [limit, setLimit] = useState(16);
  const focus = data.graph.nodes.find((node) => node.id === selected);
  const neighbors = data.graph.edges
    .filter((edge) => edge.from === selected || edge.to === selected)
    .map((edge) => ({
      edge,
      node: data.graph.nodes.find(
        (node) => node.id === (edge.from === selected ? edge.to : edge.from),
      ),
    }))
    .filter((item): item is typeof item & { node: GraphNode } =>
      Boolean(item.node),
    );
  const choose = (id: string) => {
    setSelected(id);
    setLimit(16);
  };
  return (
    <div className={styles.stack}>
      <div className={styles.sectionHeader}>
        <p className={styles.muted}>{t.graphHint}</p>
        <span className={styles.badge}>
          {data.graph.nodes.length} {t.nodes} · {data.graph.edges.length}{" "}
          {t.edges}
        </span>
      </div>
      <label className={styles.field}>
        {t.focus}
        <select
          value={selected}
          onChange={(event) => choose(event.target.value)}
        >
          {data.graph.nodes.map((node) => (
            <option key={node.id} value={node.id}>
              {node.label} · {label(t, node.kind)}
            </option>
          ))}
        </select>
      </label>
      {focus && (
        <figure
          className={styles.graph}
          aria-label={`${t.focus}: ${focus.label}`}
        >
          <div className={styles.focusNode}>
            <small>{label(t, focus.kind)}</small>
            <strong>{focus.label}</strong>
            <span>
              {neighbors.length} {t.edges}
            </span>
          </div>
          <div className={styles.neighbors}>
            {neighbors.slice(0, limit).map(({ edge, node }) => (
              <button
                className={styles.neighbor}
                type="button"
                key={`${edge.from}:${edge.to}`}
                onClick={() => choose(node.id)}
                title={`${t.focus}: ${node.label}`}
              >
                <span>
                  <strong>{node.label}</strong>
                  <small>{label(t, node.kind)}</small>
                </span>
                <span className={styles.connector}>
                  {edge.from === selected ? "→" : "←"} {label(t, edge.relation)}
                </span>
              </button>
            ))}
            {neighbors.length === 0 && <p>{t.noNeighbors}</p>}
            {neighbors.length > limit && (
              <button
                className={styles.button}
                type="button"
                onClick={() => setLimit(limit + 16)}
              >
                {t.showMore}
              </button>
            )}
          </div>
        </figure>
      )}
      <section className={styles.card}>
        <h2>{t.documents}</h2>
        <p className={styles.muted}>{t.documentHint}</p>
        <details className={styles.details}>
          <summary>
            {data.source.documents.length} {t.documentTopics}
          </summary>
          <ul className={styles.list}>
            {data.source.documents.map((document) => (
              <li key={document.id}>
                <span className={styles.code}>{document.id}</span>
                <span className={styles.tag}>
                  {document.languages.join(" · ").toUpperCase()}
                </span>
              </li>
            ))}
          </ul>
        </details>
      </section>
    </div>
  );
}
function label(t: AdminMessages, key: string) {
  return key in t ? t[key as keyof AdminMessages] : key;
}
export function Ontology({
  data,
  t,
}: {
  data: AdminCatalog;
  t: AdminMessages;
}) {
  return (
    <div className={styles.stack}>
      <p className={styles.muted}>{t.rawMetadata}</p>
      <div className={styles.cards}>
        {data.ontology.map((entry) => (
          <section className={styles.card} key={entry.id}>
            <p className={styles.eyebrow}>{t.relation}</p>
            <h2>
              {entry.from} → {entry.to}
            </h2>
            <p className={styles.code} title={t.join}>
              {entry.join}
            </p>
            <p>{label(t, `rule_${entry.rule}`)}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
