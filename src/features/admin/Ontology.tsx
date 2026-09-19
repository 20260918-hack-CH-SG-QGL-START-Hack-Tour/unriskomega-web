"use client";
import { useMemo } from "react";
import { GraphExplorer } from "@/components/ui/data-display/GraphExplorer/GraphExplorer";
import type { Locale } from "@/lib/i18n";
import type { AdminCatalog } from "@/lib/models/admin";
import styles from "./AdminStyles";
import { graphCopy } from "./graph-copy";
import { label } from "./KnowledgeExplorer";
import type { AdminMessages } from "./messages";
export function Ontology({
  data,
  t,
  locale,
}: {
  data: AdminCatalog;
  t: AdminMessages;
  locale: Locale;
}) {
  const copy = graphCopy[locale];
  const nodes = useMemo(
    () =>
      [
        ...new Set(data.ontology.flatMap((entry) => [entry.from, entry.to])),
      ].map((id) => ({
        id,
        label: copy.entities[id as keyof typeof copy.entities] ?? id,
        group: ["Clients", "Portfolios", "RiskProfiles"].includes(id)
          ? "portfolio"
          : [
                "Securities",
                "SecurityPositions",
                "FundUnbundlingMappings",
              ].includes(id)
            ? "holdings"
            : "rules",
        facts: [{ label: copy.sourceId, value: id }],
        description: data.ontology
          .filter((entry) => entry.from === id)
          .map((entry) => label(t, `rule_${entry.rule}`))
          .join(" "),
      })),
    [data, t, copy],
  );
  const edges = useMemo(
    () =>
      data.ontology.map((entry) => ({
        source: entry.from,
        target: entry.to,
        label:
          copy.relations[entry.id as keyof typeof copy.relations] ?? entry.id,
        detail: entry.join,
      })),
    [data, copy],
  );
  const groups = [
    { id: "portfolio", label: t.portfolios },
    { id: "holdings", label: t.holdings },
    { id: "rules", label: copy.ontology },
  ];
  return (
    <div className={styles.stack}>
      <p className={styles.muted}>{copy.ontologyIntro}</p>
      <GraphExplorer nodes={nodes} edges={edges} groups={groups} copy={copy} />
      <p className={styles.code}>{t.rawMetadata}</p>
    </div>
  );
}
