"use client";
import { useMemo } from "react";
import { GraphExplorer } from "@/components/ui/data-display/GraphExplorer/GraphExplorer";
import type { Locale } from "@/lib/i18n";
import type { AdminCatalog } from "@/lib/models/admin";
import styles from "./AdminStyles";
import { graphCopy } from "./graph-copy";
import type { AdminMessages } from "./messages";
export function KnowledgeExplorer({
  data,
  t,
  locale,
}: {
  data: AdminCatalog;
  t: AdminMessages;
  locale: Locale;
}) {
  const copy = graphCopy[locale];
  const groups = useMemo(
    () =>
      [...new Set(data.graph.nodes.map((node) => node.kind))].map((id) => ({
        id,
        label: label(t, id),
      })),
    [data, t],
  );
  const nodes = useMemo(
    () =>
      data.graph.nodes.map((node) => ({
        id: node.id,
        label: node.label,
        group: node.kind,
        facts: [
          { label: copy.sourceId, value: node.id },
          ...(node.kind === "assetClass"
            ? []
            : [
                {
                  label: node.kind === "client" ? t.portfolios : t.holdings,
                  value: String(node.count),
                },
              ]),
        ],
      })),
    [data, copy, t],
  );
  const edges = useMemo(
    () =>
      data.graph.edges.map((edge) => ({
        source: edge.from,
        target: edge.to,
        label: label(t, edge.relation),
      })),
    [data, t],
  );
  return (
    <div className={styles.stack}>
      <p className={styles.muted}>{copy.graphIntro}</p>
      <GraphExplorer nodes={nodes} edges={edges} groups={groups} copy={copy} />
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
export function label(t: AdminMessages, key: string) {
  return key in t ? t[key as keyof AdminMessages] : key;
}
