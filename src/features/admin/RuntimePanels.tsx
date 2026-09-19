import type { Locale } from "@/lib/i18n";
import type { RuntimeOutcome, RuntimeRegistry } from "@/lib/models/admin";
import styles from "./AdminStyles";
import type { AdminMessages, AdminView } from "./messages";
import { Outcomes, Workflow } from "./RuntimeOperations";
import { AgentCards, SkillCards } from "./RuntimeRegistryCards";

type Props = {
  runtime: RuntimeRegistry | null;
  outcomes: RuntimeOutcome[];
  outcomeError: boolean;
  view: AdminView;
  t: AdminMessages;
  locale: Locale;
};
export function RuntimePanels({
  runtime,
  outcomes,
  outcomeError,
  view,
  t,
  locale,
}: Props) {
  if (!runtime)
    return (
      <section className={styles.card} aria-live="polite">
        <h2>{t.unavailable}</h2>
        <p>{t.runtimeHint}</p>
      </section>
    );
  if (view === "agents")
    return (
      <div className={styles.stack}>
        <Workflow runtime={runtime} t={t} locale={locale} />
        <AgentCards runtime={runtime} t={t} locale={locale} />
      </div>
    );
  if (view === "skills")
    return <SkillCards runtime={runtime} t={t} locale={locale} />;
  return (
    <div className={styles.stack}>
      <div className={styles.columns}>
        <RuntimeBoundaries runtime={runtime} t={t} />
        <Workflow runtime={runtime} t={t} locale={locale} />
      </div>
      <Outcomes outcomes={outcomes} error={outcomeError} t={t} />
    </div>
  );
}
function RuntimeBoundaries({
  runtime,
  t,
}: {
  runtime: RuntimeRegistry;
  t: AdminMessages;
}) {
  return (
    <section className={styles.card}>
      <h2>{t.boundaries}</h2>
      <span className={styles.badge}>{runtime.profile.id}</span>
      <p className={styles.muted}>{t.runtimeHint}</p>
      <ul className={styles.list}>
        {Object.entries(runtime.capabilities).map(([key, enabled]) => (
          <li key={key}>
            <span>{key in t ? t[key as keyof AdminMessages] : key}</span>
            <strong className={enabled ? "" : styles.muted}>
              {enabled ? t.enabled : t.disabled}
            </strong>
          </li>
        ))}
      </ul>
      <DeniedActions runtime={runtime} t={t} />
    </section>
  );
}
function DeniedActions({
  runtime,
  t,
}: {
  runtime: RuntimeRegistry;
  t: AdminMessages;
}) {
  return (
    <details className={styles.details}>
      <summary>{t.deniedActions}</summary>
      <div className={styles.tagList}>
        {runtime.profile.deniedActions.map((action) => (
          <span className={styles.tag} key={action}>
            {action}
          </span>
        ))}
      </div>
    </details>
  );
}
