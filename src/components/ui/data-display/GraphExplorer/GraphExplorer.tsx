"use client";
import { useMemo, useState } from "react";
import { GraphCanvas } from "./GraphCanvas";
import styles from "./GraphExplorerStyles.module.css";
import { GraphInspector } from "./GraphInspector";
import { neighborhood } from "./graph-layout";
import type {
  ExplorerEdge,
  ExplorerGroup,
  ExplorerNode,
  GraphCopy,
} from "./types";
export function GraphExplorer({
  nodes,
  edges,
  groups,
  copy,
}: {
  nodes: ExplorerNode[];
  edges: ExplorerEdge[];
  groups: ExplorerGroup[];
  copy: GraphCopy;
}) {
  const [selected, setSelected] = useState("");
  const [query, setQuery] = useState("");
  const [hidden, setHidden] = useState<string[]>([]);
  const [local, setLocal] = useState(false);
  const [depth, setDepth] = useState(1);
  const [labels, setLabels] = useState(false);
  const [spread, setSpread] = useState(1);
  const visible = useMemo(() => {
    const near =
      local && selected ? neighborhood(selected, edges, depth) : null;
    return nodes.filter(
      (node) =>
        !hidden.includes(node.group) &&
        (!near || near.has(node.id)) &&
        (!query ||
          `${node.label} ${node.group}`
            .toLowerCase()
            .includes(query.toLowerCase())),
    );
  }, [nodes, edges, selected, local, depth, hidden, query]);
  const visibleEdges = useMemo(() => {
    const ids = new Set(visible.map((node) => node.id));
    return edges.filter((edge) => ids.has(edge.source) && ids.has(edge.target));
  }, [visible, edges]);
  const select = (id: string) => {
    setSelected(id);
    setQuery("");
    setHidden([]);
  };
  return (
    <section className={styles.explorer} aria-label={copy.overview}>
      <div className={styles.toolbar}>
        <label className={styles.search}>
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={copy.search}
            aria-label={copy.search}
          />
        </label>
        <div className={styles.mode}>
          <button
            type="button"
            aria-pressed={!local}
            onClick={() => setLocal(false)}
          >
            {copy.all}
          </button>
          <button
            type="button"
            aria-pressed={local}
            disabled={!selected}
            onClick={() => setLocal(true)}
          >
            {copy.local}
          </button>
        </div>
        {local && (
          <label className={styles.depth}>
            {copy.depth}
            <select
              value={depth}
              onChange={(event) => setDepth(Number(event.target.value))}
            >
              <option>1</option>
              <option>2</option>
              <option>3</option>
            </select>
          </label>
        )}
        <label className={styles.labelToggle}>
          <input
            type="checkbox"
            checked={labels}
            onChange={(event) => setLabels(event.target.checked)}
          />
          {copy.labels}
        </label>
      </div>
      <div className={styles.graphBody}>
        <div className={styles.graphMain}>
          <fieldset className={styles.legend} aria-label={copy.groups}>
            {groups.map((group, index) => (
              <button
                type="button"
                key={group.id}
                data-group={index % 5}
                aria-pressed={!hidden.includes(group.id)}
                onClick={() =>
                  setHidden((values) =>
                    values.includes(group.id)
                      ? values.filter((id) => id !== group.id)
                      : [...values, group.id],
                  )
                }
              >
                <i />
                {group.label}
                <span>
                  {nodes.filter((node) => node.group === group.id).length}
                </span>
              </button>
            ))}
          </fieldset>
          <GraphCanvas
            nodes={visible}
            edges={visibleEdges}
            groups={groups}
            selected={selected}
            labels={labels}
            spread={spread}
            copy={copy}
            onSelect={select}
          />
          <div className={styles.bottomBar}>
            <output aria-live="polite">
              {visible.length} {copy.nodes} · {visibleEdges.length} {copy.edges}
            </output>
            <label>
              {copy.spread}
              <input
                type="range"
                min="0.6"
                max="1.8"
                step="0.2"
                value={spread}
                onChange={(event) => setSpread(Number(event.target.value))}
              />
            </label>
          </div>
        </div>
        <GraphInspector
          node={nodes.find((node) => node.id === selected)}
          nodes={nodes}
          edges={edges}
          groups={groups}
          copy={copy}
          onSelect={select}
        />
      </div>
      <details className={styles.accessible}>
        <summary>{copy.list}</summary>
        <label>
          {copy.focus}
          <select
            value={selected}
            onChange={(event) => select(event.target.value)}
          >
            <option value="">{copy.choose}</option>
            {nodes.map((node) => (
              <option key={node.id} value={node.id}>
                {node.label} ·{" "}
                {groups.find((group) => group.id === node.group)?.label}
              </option>
            ))}
          </select>
        </label>
      </details>
    </section>
  );
}
