"use client";
import { usePreferences } from "@/features/preferences/Preferences";
import { formatNumber } from "@/lib/i18n";
import { assetLabel } from "@/lib/i18n/portfolioLabels";
import { allocationGaps } from "@/lib/models/allocation";
import type { Portfolio } from "@/lib/models/portfolio";
import { contextMessages } from "./contextMessages";
import styles from "./PortfolioContextStyles.module.css";

export function AllocationComparison({ portfolio }: { portfolio: Portfolio }) {
  const { locale, t } = usePreferences();
  const copy = contextMessages[locale];
  const gaps = allocationGaps(portfolio);
  return (
    <section className={styles.comparison} aria-label={copy.gap}>
      <header>
        <h3>{copy.gap}</h3>
        <span>{portfolio.reportingCurrency}</span>
      </header>
      <p>{gaps.length ? copy.explanation : copy.targetUnavailable}</p>
      {gaps.map((gap) => (
        <div className={styles.gapRow} key={gap.assetClass}>
          <div>
            <strong>{assetLabel(gap.assetClass, t)}</strong>
            <span>
              {formatNumber(gap.percentagePoints, locale, {
                maximumFractionDigits: 1,
                signDisplay: "exceptZero",
              })}{" "}
              pp ·{" "}
              {formatNumber(gap.amount, locale, {
                maximumFractionDigits: 0,
                signDisplay: "exceptZero",
              })}{" "}
              {portfolio.reportingCurrency}
            </span>
          </div>
          <svg
            viewBox="0 0 100 8"
            preserveAspectRatio="none"
            role="img"
            aria-label={`${assetLabel(gap.assetClass, t)}: ${t.weight} ${formatNumber(gap.weight, locale, { maximumFractionDigits: 1 })}%, ${t.target} ${formatNumber(gap.target, locale, { maximumFractionDigits: 1 })}%`}
          >
            <rect
              x="0"
              y="2"
              width="100"
              height="4"
              rx="2"
              fill="var(--surface-soft)"
            />
            <rect
              x="0"
              y="2"
              width={Math.max(0, Math.min(100, gap.weight))}
              height="4"
              rx="2"
              fill="var(--accent)"
            />
            <line
              x1={Math.max(0, Math.min(100, gap.target))}
              x2={Math.max(0, Math.min(100, gap.target))}
              y1="0"
              y2="8"
              stroke="var(--gold)"
              strokeWidth="1"
            />
          </svg>
          <footer>
            <span>
              {t.weight}:{" "}
              {formatNumber(gap.weight, locale, { maximumFractionDigits: 1 })}%
            </span>
            <span>
              {t.target}:{" "}
              {formatNumber(gap.target, locale, { maximumFractionDigits: 1 })}%
            </span>
          </footer>
        </div>
      ))}
    </section>
  );
}
