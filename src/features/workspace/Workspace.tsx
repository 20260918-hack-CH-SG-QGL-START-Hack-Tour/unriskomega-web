"use client";
import { useState } from "react";
import { Icon, type IconName } from "@/components/ui/data-display/Icon/Icon";
import { DocumentLibrary } from "@/features/documents/DocumentLibrary";
import {
  Preferences,
  usePreferences,
} from "@/features/preferences/Preferences";
import { formatNumber } from "@/lib/i18n";
import { conversationMessages } from "@/lib/i18n/conversation";
import { gapLabel } from "@/lib/i18n/portfolioLabels";
import { AssistantPanel } from "./AssistantPanel";
import { BriefingPanel } from "./BriefingPanel";
import {
  AllocationPanel,
  FindingsPanel,
  HoldingsPanel,
} from "./PortfolioPanels";
import { useWorkspace } from "./useWorkspace";
import { type Tab, WorkspaceNavigation } from "./WorkspaceNavigation";
import styles from "./WorkspaceStyles";
export function Workspace() {
  const { t, locale } = usePreferences();
  const state = useWorkspace(locale);
  const [tab, setTab] = useState<Tab>("overview");
  const [menu, setMenu] = useState(false);
  const p = state.portfolio;
  const nav: [Tab, IconName, string][] = [
    ["overview", "grid", t.overview],
    ["portfolios", "wallet", t.portfolios],
    ["assistant", "spark", t.assistant],
    ["evidence", "book", t.evidence],
    ["documents", "book", conversationMessages[locale].documents],
  ];
  return (
    <div className={styles.shell}>
      <a className={styles.skip} href="#workspace-main">
        {t.skip}
      </a>
      <WorkspaceNavigation
        menu={menu}
        tab={tab}
        nav={nav}
        onNavigate={(value) => {
          setTab(value);
          setMenu(false);
        }}
        user={state.user}
        signOut={state.signOut}
      />
      <div className={styles.mainColumn}>
        <header className={styles.topbar}>
          <button
            type="button"
            className={styles.menuButton}
            onClick={() => setMenu((value) => !value)}
            aria-label={t.workspace}
            aria-expanded={menu}
          >
            <Icon name={menu ? "close" : "menu"} />
          </button>
          <span className={styles.breadcrumb}>
            {t.workspace}
            <Icon name="chevron" width="13" />
            <strong>{nav.find(([id]) => id === tab)?.[2]}</strong>
          </span>
          <div className={styles.topActions}>
            <span className={styles.connection}>
              <i data-connected={state.connected} />
              {state.connected ? t.live : t.reconnecting}
            </span>
            <Preferences />
            <span className={styles.avatar}>JO</span>
          </div>
        </header>
        <main id="workspace-main" className={styles.main}>
          <div className={styles.pageHeading}>
            <div>
              <span className={styles.kicker}>{t.product}</span>
              <h1>{t.goodMorning}</h1>
              <p>{t.dashboardSubtitle}</p>
            </div>
            <button
              className={styles.primaryButton}
              type="button"
              disabled={!p || state.generating}
              onClick={() => {
                setTab("overview");
                void state.generate();
              }}
            >
              <Icon name="spark" width="18" />
              {state.generating ? t.generating : t.generate}
            </button>
          </div>
          <div className={styles.contextBar}>
            <div>
              <Icon name="user" width="16" />
              <label htmlFor="client-select">{t.selectClient}</label>
              <select
                id="client-select"
                value={state.clientId}
                onChange={(event) => state.setClientId(event.target.value)}
              >
                {state.clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.alias}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Icon name="wallet" width="16" />
              <label htmlFor="portfolio-select">{t.selectPortfolio}</label>
              <select
                id="portfolio-select"
                value={state.portfolioId}
                onChange={(event) => state.setPortfolioId(event.target.value)}
              >
                {state.summaries.map((summary) => (
                  <option key={summary.id} value={summary.id}>
                    {summary.name}
                  </option>
                ))}
              </select>
            </div>
            <span className={styles.snapshotBadge}>
              <Icon name="clock" width="13" />
              {t.challengeSnapshot}
            </span>
          </div>
          {state.error && (
            <div className={styles.error} role="alert">
              <Icon name="info" />
              {t.error}
              <button type="button" onClick={() => location.reload()}>
                {t.retry}
              </button>
            </div>
          )}
          {state.loading ? (
            <output className={styles.loading}>
              <span />
              {t.loading}
            </output>
          ) : !p ? (
            <div className={styles.empty}>{t.noData}</div>
          ) : (
            <>
              {tab === "overview" && (
                <>
                  <div className={styles.stats}>
                    {[
                      {
                        label: t.portfolioValue,
                        value: formatNumber(p.totalValue, locale, {
                          maximumFractionDigits: 0,
                        }),
                        detail: p.reportingCurrency,
                        icon: "wallet",
                      },
                      {
                        label: t.holdings,
                        value: String(p.holdings.length),
                        detail: t.challengeSnapshot,
                        icon: "layers",
                      },
                      {
                        label: t.checks,
                        value: String(p.findings.length),
                        detail: t.humanReview,
                        icon: "shield",
                      },
                    ].map((stat) => (
                      <section className={styles.statCard} key={stat.label}>
                        <div>
                          <span>{stat.label}</span>
                          <Icon name={stat.icon as IconName} width="17" />
                        </div>
                        <strong>{stat.value}</strong>
                        <small>{stat.detail}</small>
                      </section>
                    ))}
                  </div>
                  <div className={styles.overviewGrid}>
                    <div className={styles.leftStack}>
                      <AllocationPanel portfolio={p} />
                      <FindingsPanel portfolio={p} />
                    </div>
                    <BriefingPanel
                      key={p.id}
                      portfolio={p}
                      briefing={state.briefing}
                      generating={state.generating}
                      onGenerate={() => void state.generate()}
                      onEvidence={() => setTab("evidence")}
                    />
                  </div>
                  <HoldingsPanel portfolio={p} />
                  <button
                    type="button"
                    className={styles.textButton}
                    onClick={() => setTab("portfolios")}
                  >
                    {t.viewAll}
                    <Icon name="arrow" width="16" />
                  </button>
                </>
              )}
              {tab === "portfolios" && (
                <>
                  <AllocationPanel portfolio={p} />
                  <HoldingsPanel portfolio={p} full />
                </>
              )}
              <div hidden={tab !== "assistant"}>
                <AssistantPanel
                  key={p.id}
                  portfolioId={p.id}
                  clientId={state.clientId}
                  onImported={(id) => void state.refreshAfterImport(id)}
                  visible={tab === "assistant"}
                  clientAlias={
                    state.clients.find((client) => client.id === state.clientId)
                      ?.alias ?? ""
                  }
                  portfolioName={p.name}
                />
              </div>
              {tab === "documents" && (
                <DocumentLibrary
                  clientId={state.clientId}
                  portfolioId={p.id}
                  chatSessionId=""
                  onImported={(id) => void state.refreshAfterImport(id)}
                />
              )}
              {tab === "evidence" && (
                <>
                  <section className={styles.panel}>
                    <div className={styles.panelHeading}>
                      <h2>{t.evidence}</h2>
                      <Icon name="book" />
                    </div>
                    <dl className={styles.evidenceList}>
                      <div>
                        <dt>{t.source}</dt>
                        <dd>{p.source}</dd>
                      </div>
                      <div>
                        <dt>{t.snapshot}</dt>
                        <dd>{p.valuationAt || t.unavailable}</dd>
                      </div>
                      <div>
                        <dt>{t.currency}</dt>
                        <dd>{p.currency}</dd>
                      </div>
                      <div>
                        <dt>{t.portfolioValue}</dt>
                        <dd>
                          {formatNumber(p.totalValue, locale, {
                            maximumFractionDigits: 2,
                          })}{" "}
                          {p.reportingCurrency}
                        </dd>
                      </div>
                    </dl>
                    {(state.briefing?.sources ?? p.sources).map((source) => (
                      <p key={source.id} className={styles.sourceText}>
                        {source.title} · {source.asOf}
                      </p>
                    ))}
                    <p className={styles.sourceNote}>{t.sourceLanguage}</p>
                  </section>
                  <FindingsPanel portfolio={p} />
                </>
              )}
              <section className={styles.coverage}>
                <Icon name="info" width="17" />
                <div>
                  <strong>{t.dataGaps}</strong>
                  {p.dataGaps.length ? (
                    p.dataGaps.map((gap) => <p key={gap}>{gapLabel(gap, t)}</p>)
                  ) : (
                    <p>{t.noHistory}</p>
                  )}
                </div>
                <span>{t.challengeSnapshot}</span>
              </section>
            </>
          )}
          <footer className={styles.pageFooter}>
            <span>{t.footer}</span>
            <span>
              <Icon name="shield" width="12" />
              {t.privacy}
            </span>
          </footer>
        </main>
      </div>
    </div>
  );
}
