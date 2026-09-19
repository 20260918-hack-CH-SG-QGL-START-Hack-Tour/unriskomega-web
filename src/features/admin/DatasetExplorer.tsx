"use client";
import Link from "next/link";
import { useState } from "react";
import type { AdminCatalog, Dataset } from "@/lib/models/admin";
import styles from "./AdminStyles";
import type { AdminMessages } from "./messages";
export function DatasetExplorer({
  data,
  t,
  locale,
}: {
  data: AdminCatalog;
  t: AdminMessages;
  locale: string;
}) {
  const [search, setSearch] = useState("");
  const datasets = data.source.datasets.filter((d) =>
    `${d.id} ${d.sourceId}`.toLowerCase().includes(search.toLowerCase()),
  );
  const format = new Intl.NumberFormat(locale);
  return (
    <div className={styles.stack}>
      <p className={styles.muted}>{t.sourceHint}</p>
      <label className={styles.field}>
        {t.search}
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </label>
      <div className={styles.cards}>
        {datasets.map((d) => (
          <Link
            className={`${styles.card} ${styles.cardLink}`}
            key={d.id}
            href={`/ai/structure?dataset=${encodeURIComponent(d.id)}`}
            title={t.openDataset}
          >
            <div className={styles.sectionHeader}>
              <h2>{d.id}</h2>
              <span className={styles.tag}>{d.sourceId}.json</span>
            </div>
            <strong className={styles.number}>
              {format.format(d.records)}
            </strong>
            <p className={styles.muted}>
              {t.records} · {d.fields.length} {t.fields.toLowerCase()}
            </p>
            <span className={styles.code}>{d.locator}</span>
          </Link>
        ))}
      </div>
      {!datasets.length && <p>{t.empty}</p>}
      <SourceFiles data={data} t={t} />
    </div>
  );
}
function SourceFiles({ data, t }: { data: AdminCatalog; t: AdminMessages }) {
  return (
    <section className={styles.card}>
      <h2>{t.source}</h2>
      <p className={styles.muted}>{t.metadataOnly}</p>
      {data.source.sources.map((source) => (
        <div key={source.id}>
          <strong>{source.file}</strong>
          <p className={styles.code}>
            {t.hash}: {source.sha256}
          </p>
        </div>
      ))}
      <p className={styles.footer}>
        {t.generated}: {data.source.generatedAt}
      </p>
    </section>
  );
}
export function DataStructure({
  data,
  t,
  initial,
}: {
  data: AdminCatalog;
  t: AdminMessages;
  initial?: string;
}) {
  const [selected, setSelected] = useState(
    initial ?? data.source.datasets[0]?.id ?? "",
  );
  const dataset =
    data.source.datasets.find((d) => d.id === selected) ??
    data.source.datasets[0];
  return (
    <div className={styles.stack}>
      <p className={styles.muted}>{t.metadataOnly}</p>
      <label className={styles.field}>
        {t.chooseDataset}
        <select
          value={dataset?.id ?? ""}
          onChange={(event) => setSelected(event.target.value)}
        >
          {data.source.datasets.map((d) => (
            <option key={d.id} value={d.id}>
              {d.id} · {d.records}
            </option>
          ))}
        </select>
      </label>
      {dataset && <FieldTable dataset={dataset} t={t} />}
    </div>
  );
}
function FieldTable({ dataset, t }: { dataset: Dataset; t: AdminMessages }) {
  return (
    <section className={styles.card}>
      <div className={styles.sectionHeader}>
        <h2>{dataset.id}</h2>
        <span className={styles.code}>{dataset.locator}</span>
      </div>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">{t.field}</th>
              <th scope="col">{t.type}</th>
              <th scope="col">{t.presence}</th>
              <th scope="col">{t.nullable}</th>
            </tr>
          </thead>
          <tbody>
            {dataset.fields.map((field) => (
              <tr key={field.name}>
                <td>{field.name}</td>
                <td>{field.types.join(" | ")}</td>
                <td>
                  {field.present} / {dataset.records}
                </td>
                <td>{field.nullable ? t.yes : t.no}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className={styles.muted}>{t.rawMetadata}</p>
    </section>
  );
}
