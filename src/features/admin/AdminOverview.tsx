import Link from "next/link";
import type { AdminCatalog, RuntimeRegistry } from "@/lib/models/admin";
import styles from "./AdminStyles";
import type { AdminMessages } from "./messages";
export function AdminOverview({
  data,
  runtime,
  t,
  locale,
}: {
  data: AdminCatalog;
  runtime: RuntimeRegistry | null;
  t: AdminMessages;
  locale: string;
}) {
  const format = new Intl.NumberFormat(locale);
  return (
    <div className={styles.stack}>
      <p className={styles.muted}>{t.overviewHint}</p>
      <div className={styles.metrics}>
        {(["clients", "portfolios", "holdings", "violations"] as const).map(
          (key) => (
            <div className={styles.metric} key={key} title={t.loadedData}>
              <span>{t[key]}</span>
              <strong>{format.format(data.counts[key])}</strong>
              <small>{t.loadedData}</small>
            </div>
          ),
        )}
      </div>
      <div className={styles.columns}>
        <section className={styles.card}>
          <h2>{t.sourceSnapshot}</h2>
          <dl className={styles.definition}>
            <dt>{t.sourceCollections}</dt>
            <dd>{data.source.datasets.length}</dd>
            <dt>{t.documentTopics}</dt>
            <dd>{data.source.documents.length}</dd>
            <dt>{t.valuation}</dt>
            <dd>
              {data.valuationRange.from ?? "—"}
              <br />
              {data.valuationRange.to ?? "—"}
            </dd>
          </dl>
          <p className={styles.muted}>{t.dataWarning}</p>
          <Link
            className={styles.button}
            href="/ai/datasets"
            title={t.openDataset}
          >
            {t.datasets} →
          </Link>
        </section>
        <section className={styles.card}>
          <div className={styles.sectionHeader}>
            <h2>{t.runtime}</h2>
            <span
              className={styles.badge}
              data-state={runtime ? "available" : "unavailable"}
            >
              {runtime ? t.available : t.unavailable}
            </span>
          </div>
          {runtime && (
            <dl className={styles.definition}>
              <dt>{t.agents}</dt>
              <dd>{runtime.agents.length}</dd>
              <dt>{t.skills}</dt>
              <dd>{runtime.skills.length}</dd>
              <dt>{t.profile}</dt>
              <dd className={styles.code}>{runtime.profile.id}</dd>
            </dl>
          )}
          <p className={styles.muted}>{t.runtimeHint}</p>
          <Link
            className={styles.button}
            href="/ai/runtime"
            title={t.runtimeHint}
          >
            {t.runtime} →
          </Link>
        </section>
      </div>
      <section className={`${styles.notice} ${styles.warning}`}>
        <div>
          <strong>
            {format.format(data.counts.missingPerformanceYtd)} · {t.missingYtd}
          </strong>
          <p>{t.missingHint}</p>
        </div>
      </section>
    </div>
  );
}
