import type { Locale } from "@/lib/i18n";
import type { RuntimeOutcome, RuntimeRegistry } from "@/lib/models/admin";
import styles from "./AdminStyles";
import type { AdminMessages } from "./messages";
import { registryLabel } from "./registryLabels";
import { runtimeCopy } from "./runtime-copy";
export function Workflow({
  runtime,
  t,
  locale,
}: {
  runtime: RuntimeRegistry;
  t: AdminMessages;
  locale: Locale;
}) {
  return (
    <section className={styles.card}>
      <div className={styles.sectionHeader}>
        <h2>{t.workflow}</h2>
        <span className={styles.tag}>{t.bounded}</span>
      </div>
      <ol className={styles.flow}>
        {runtime.workflow.steps.map((step, index) => (
          <li key={`${step.agentId}:${index}`}>
            <strong>{registryLabel(step.agentId, locale)}</strong>
            <small>
              {runtimeCopy[locale].steps[step.agentId] ?? step.action}
            </small>
          </li>
        ))}
      </ol>
      <p className={styles.code}>
        {runtime.workflow.id} · v{runtime.version}
      </p>
    </section>
  );
}
export function Outcomes({
  outcomes,
  error,
  t,
}: {
  outcomes: RuntimeOutcome[];
  error: boolean;
  t: AdminMessages;
}) {
  return (
    <section className={styles.card}>
      <h2>{t.outcomes}</h2>
      <p className={styles.muted}>{t.outcomeHint}</p>
      {error ? (
        <output className={styles.error}>{t.unavailable}</output>
      ) : outcomes.length === 0 ? (
        <p>{t.noOutcomes}</p>
      ) : (
        <ul className={styles.list}>
          {outcomes.map((outcome) => (
            <li key={outcome.id}>
              <div>
                <strong>{message(t, outcome.status)}</strong>
                <p className={styles.code}>{outcome.id}</p>
              </div>
              <details className={styles.details}>
                <summary>
                  {t.checks}: {outcome.verification.checks.length}
                </summary>
                <div className={styles.tagList}>
                  {outcome.verification.checks.map((check) => (
                    <span className={styles.tag} key={check}>
                      {check}
                    </span>
                  ))}
                </div>
                {outcome.warnings.length > 0 && (
                  <p>
                    {t.warnings}: {outcome.warnings.join(" · ")}
                  </p>
                )}
              </details>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
function message(t: AdminMessages, key: string) {
  return key === "needs_review"
    ? t.revision
    : key in t
      ? t[key as keyof AdminMessages]
      : key;
}
