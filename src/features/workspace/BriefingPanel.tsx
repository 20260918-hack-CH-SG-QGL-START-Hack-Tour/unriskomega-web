"use client";
import { useState } from "react";
import { Icon } from "@/components/ui/data-display/Icon/Icon";
import { usePreferences } from "@/features/preferences/Preferences";
import type { Briefing, Portfolio } from "@/lib/models/portfolio";
import styles from "./WorkspaceStyles";
export function BriefingPanel({
  briefing,
  portfolio,
  generating,
  onGenerate,
  onEvidence,
}: {
  briefing: Briefing | null;
  portfolio: Portfolio;
  generating: boolean;
  onGenerate: () => void;
  onEvidence: () => void;
}) {
  const { t } = usePreferences();
  const [draft, setDraft] = useState("");
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  async function copyDraft() {
    try {
      await navigator.clipboard.writeText(draft);
      setCopied(true);
      setCopyError(false);
    } catch {
      setCopyError(true);
    }
  }
  const labels: Record<string, string> = {
    performance: t.performance,
    development: t.performance,
    health: t.health,
    outlook: t.outlook,
    actions: t.actions,
    briefing: t.briefing,
  };
  return (
    <section className={`${styles.panel} ${styles.briefingPanel}`}>
      <div className={styles.panelHeading}>
        <div className={styles.briefingTitle}>
          <span>
            <Icon name="spark" />
          </span>
          <div>
            <span className={styles.kicker}>{t.humanControl}</span>
            <h2>{t.briefing}</h2>
          </div>
        </div>
        <span className={styles.reviewBadge}>{t.humanReview}</span>
      </div>
      {briefing ? (
        <>
          <div className={styles.modeLabel}>
            <Icon name="shield" width="14" />
            {briefing.mode.includes("deterministic")
              ? t.deterministic
              : t.grounded}
            {briefing.model && <span> · {briefing.model}</span>}
          </div>
          <div className={styles.briefingSections}>
            {briefing.sections.map((section, index) => (
              <div key={`${section.key}-${index}`}>
                <h3>
                  <span>0{index + 1}</span>
                  {labels[section.key.toLowerCase()] ?? section.key}
                </h3>
                <p>{section.text}</p>
              </div>
            ))}
          </div>
          <button
            type="button"
            className={styles.textButton}
            onClick={onEvidence}
          >
            {t.showEvidence}
            <Icon name="arrow" width="16" />
          </button>
          <details className={styles.draft}>
            <summary>{t.draft}</summary>
            <label htmlFor="discussion-draft">{t.humanReview}</label>
            <textarea
              id="discussion-draft"
              rows={4}
              maxLength={4000}
              value={draft}
              onChange={(event) => {
                setDraft(event.target.value);
                setCopied(false);
                setCopyError(false);
              }}
            />
            <button
              type="button"
              className={styles.secondaryButton}
              disabled={!draft.trim()}
              onClick={() => void copyDraft()}
            >
              <Icon name={copied ? "check" : "book"} width="15" />
              {copied ? t.draftCopied : t.copyDraft}
            </button>
            {copyError && <p role="alert">{t.error}</p>}
          </details>
        </>
      ) : (
        <div className={styles.briefingEmpty}>
          <div className={styles.briefingArt}>
            <Icon name="spark" width="36" height="36" />
          </div>
          <h3>{t.briefingEmpty}</h3>
          <p>{t.briefingHint}</p>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={onGenerate}
            disabled={generating}
          >
            <Icon name="spark" width="17" />
            {generating ? t.generating : t.generate}
          </button>
        </div>
      )}
      <div className={styles.briefingFooter}>
        <Icon name="clock" width="14" />
        {t.snapshot} · {portfolio.valuationAt || t.unavailable}
        <span>{t.noTrading}</span>
      </div>
    </section>
  );
}
