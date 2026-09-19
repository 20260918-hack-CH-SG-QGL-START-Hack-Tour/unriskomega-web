"use client";
import Link from "next/link";
import { Icon, type IconName } from "@/components/ui/data-display/Icon/Icon";
import { Brand } from "@/components/ui/navigation/Brand/Brand";
import {
  Preferences,
  usePreferences,
} from "@/features/preferences/Preferences";
import { AdminOverview } from "./AdminOverview";
import styles from "./AdminStyles";
import { DataStructure, DatasetExplorer } from "./DatasetExplorer";
import { KnowledgeExplorer } from "./KnowledgeExplorer";
import {
  type AdminMessages,
  type AdminView,
  adminMessages,
  adminViews,
} from "./messages";
import { Ontology } from "./Ontology";
import { RuntimePanels } from "./RuntimePanels";
import { useAdmin } from "./useAdmin";

const icons: Record<AdminView, IconName> = {
  overview: "grid",
  datasets: "layers",
  structure: "menu",
  "knowledge-graph": "globe",
  ontology: "shield",
  agents: "spark",
  skills: "check",
  runtime: "clock",
};
export function AdminWorkspace({
  view,
  dataset,
}: {
  view: AdminView;
  dataset?: string;
}) {
  const { locale } = usePreferences();
  const t = adminMessages[locale];
  const state = useAdmin();
  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <Brand />
          <span className={styles.badge}>{t.adminView}</span>
        </div>
        <nav className={styles.nav} aria-label={t.title}>
          {adminViews.map((item) => (
            <Link
              key={item}
              href={`/ai/${item}`}
              className={item === view ? styles.active : ""}
              aria-current={item === view ? "page" : undefined}
              title={t[item]}
            >
              <Icon name={icons[item]} width="18" />
              {t[item]}
            </Link>
          ))}
        </nav>
        <div className={styles.sidebarFooter}>
          <Link
            href="/workspace"
            className={styles.switch}
            title={t.advisorView}
          >
            <Icon name="arrow" width="16" />
            {t.advisorView}
          </Link>
          <button
            className={styles.button}
            type="button"
            onClick={() => void state.signOut()}
            title={t.signOut}
          >
            <Icon name="logOut" width="16" />
            {t.signOut}
          </button>
        </div>
      </aside>
      <main className={styles.main}>
        <header className={styles.header}>
          <div>
            <span className={styles.eyebrow}>{t.title}</span>
            <h1>{t[view]}</h1>
            <p>{t.subtitle}</p>
          </div>
          <div className={styles.headerControls}>
            <Preferences />
            <button
              className={styles.button}
              type="button"
              onClick={() => void state.refresh()}
              disabled={state.loading}
              title={t.refreshHint}
            >
              {t.refresh}
            </button>
          </div>
        </header>
        <div className={styles.notice}>
          <Icon name="shield" width="19" />
          <div>
            <strong>{t.readonly}</strong>
            <p>{t.disclosure}</p>
          </div>
        </div>
        <Content
          view={view}
          dataset={dataset}
          state={state}
          t={t}
          locale={locale}
        />
        {state.catalog && (
          <p className={styles.footer}>
            {t.checked}:{" "}
            {new Date(state.catalog.checkedAt).toLocaleString(locale)}
          </p>
        )}
      </main>
    </div>
  );
}
function Content({
  view,
  dataset,
  state,
  t,
  locale,
}: {
  view: AdminView;
  dataset?: string;
  state: ReturnType<typeof useAdmin>;
  t: AdminMessages;
  locale: "en" | "es" | "de" | "fr";
}) {
  if (state.loading && !state.catalog) return <output>{t.loading}</output>;
  if (["agents", "skills", "runtime"].includes(view))
    return (
      <RuntimePanels
        runtime={state.runtime}
        outcomes={state.outcomes}
        outcomeError={state.outcomeError}
        view={view}
        t={t}
        locale={locale}
      />
    );
  if (state.error || !state.catalog)
    return (
      <section className={styles.card} role="alert">
        <p>{t.failed}</p>
        <button
          className={styles.button}
          type="button"
          onClick={() => void state.refresh()}
        >
          {t.retry}
        </button>
      </section>
    );
  const data = state.catalog;
  if (view === "datasets")
    return <DatasetExplorer data={data} t={t} locale={locale} />;
  if (view === "structure")
    return <DataStructure key={dataset} data={data} t={t} initial={dataset} />;
  if (view === "knowledge-graph")
    return <KnowledgeExplorer data={data} t={t} locale={locale} />;
  if (view === "ontology")
    return <Ontology data={data} t={t} locale={locale} />;
  return (
    <AdminOverview data={data} runtime={state.runtime} t={t} locale={locale} />
  );
}
