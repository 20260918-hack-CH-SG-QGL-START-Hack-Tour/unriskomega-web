"use client";
import { Icon } from "@/components/ui/data-display/Icon/Icon";
import { usePreferences } from "@/features/preferences/Preferences";
import { formatNumber } from "@/lib/i18n";
import { assetLabel, findingLabel } from "@/lib/i18n/portfolioLabels";
import type { Portfolio } from "@/lib/models/portfolio";
import { AllocationComparison } from "./AllocationComparison";
import styles from "./WorkspaceStyles";

const colors = [
  "var(--accent)",
  "var(--blue)",
  "var(--gold)",
  "var(--lavender)",
  "var(--muted)",
];
export function AllocationPanel({ portfolio }: { portfolio: Portfolio }) {
  const { t, locale } = usePreferences();
  let offset = 0;
  return (
    <section className={styles.panel}>
      <div className={styles.panelHeading}>
        <div>
          <span className={styles.kicker}>{portfolio.currency}</span>
          <h2>{t.allocation}</h2>
        </div>
        <Icon name="layers" />
      </div>
      <div className={styles.allocationContent}>
        <svg
          viewBox="0 0 180 180"
          className={styles.donut}
          role="img"
          aria-label={t.allocation}
        >
          <circle
            cx="90"
            cy="90"
            r="66"
            stroke="var(--surface-soft)"
            strokeWidth="19"
            fill="none"
          />
          {portfolio.allocation.map((item, index) => {
            const weight = Math.max(0, Math.min(item.weight, 100));
            const dash = `${(weight / 100) * 414.69} 414.69`;
            const current = offset;
            offset += (weight / 100) * 414.69;
            return (
              <circle
                key={assetLabel(item.assetClass, t)}
                cx="90"
                cy="90"
                r="66"
                stroke={colors[index % colors.length]}
                strokeWidth="19"
                fill="none"
                strokeDasharray={dash}
                strokeDashoffset={-current}
                transform="rotate(-90 90 90)"
              />
            );
          })}
          <text
            x="90"
            y="88"
            textAnchor="middle"
            fill="var(--text)"
            fontSize="26"
            fontWeight="500"
          >
            {portfolio.holdings.length}
          </text>
          <text
            x="90"
            y="110"
            textAnchor="middle"
            fill="var(--muted)"
            fontSize="10"
          >
            {t.holdings}
          </text>
        </svg>
        <div className={styles.allocationLegend}>
          {portfolio.allocation.map((item, index) => (
            <div key={assetLabel(item.assetClass, t)}>
              <span>
                <svg width="8" height="8" aria-hidden="true">
                  <circle
                    cx="4"
                    cy="4"
                    r="4"
                    fill={colors[index % colors.length]}
                  />
                </svg>
                {assetLabel(item.assetClass, t)}
              </span>
              <strong>
                {formatNumber(item.weight, locale, {
                  maximumFractionDigits: 1,
                })}
                %
              </strong>
            </div>
          ))}
        </div>
      </div>
      <AllocationComparison portfolio={portfolio} />
      <div className={styles.tableScroll}>
        <table className={styles.allocationTable}>
          <caption>{t.allocation}</caption>
          <thead>
            <tr>
              <th>{t.assetClass}</th>
              <th>{t.weight}</th>
              <th>{t.target}</th>
              <th>{t.range}</th>
            </tr>
          </thead>
          <tbody>
            {portfolio.allocation.map((item) => (
              <tr key={assetLabel(item.assetClass, t)}>
                <th scope="row">{assetLabel(item.assetClass, t)}</th>
                <td>
                  {formatNumber(item.weight, locale, {
                    maximumFractionDigits: 1,
                  })}
                  %
                </td>
                <td>
                  {item.target === null
                    ? "—"
                    : `${formatNumber(item.target, locale, { maximumFractionDigits: 1 })}%`}
                </td>
                <td>
                  {item.min === null || item.max === null
                    ? "—"
                    : `${item.min}–${item.max}%`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
export function HoldingsPanel({
  portfolio,
  full = false,
}: {
  portfolio: Portfolio;
  full?: boolean;
}) {
  const { t, locale } = usePreferences();
  return (
    <section className={styles.panel}>
      <div className={styles.panelHeading}>
        <h2>{t.holdings}</h2>
        <span className={styles.count}>{portfolio.holdings.length}</span>
      </div>
      <section
        className={styles.tableScroll}
        // biome-ignore lint/a11y/noNoninteractiveTabindex: The overflowing holdings table requires keyboard scrolling.
        tabIndex={0}
        aria-label={t.holdings}
      >
        <table className={styles.holdingsTable}>
          <caption>
            {t.holdings} · {portfolio.currency}
          </caption>
          <thead>
            <tr>
              <th>{t.name}</th>
              <th>{t.assetClass}</th>
              <th>{t.value}</th>
              <th>{t.weight}</th>
            </tr>
          </thead>
          <tbody>
            {portfolio.holdings
              .slice(0, full ? undefined : 6)
              .map((holding, index) => (
                <tr key={`${holding.id}-${index}`}>
                  <th scope="row">
                    <span className={styles.instrumentName}>
                      {holding.name}
                    </span>
                    <small>{holding.id}</small>
                  </th>
                  <td>{assetLabel(holding.assetClass, t)}</td>
                  <td>
                    {formatNumber(holding.marketValue, locale, {
                      maximumFractionDigits: 0,
                    })}
                    <small>{holding.currency}</small>
                  </td>
                  <td>
                    {holding.weight === null
                      ? t.unavailable
                      : `${formatNumber(holding.weight, locale, { maximumFractionDigits: 2 })}%`}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </section>
    </section>
  );
}
export function FindingsPanel({ portfolio }: { portfolio: Portfolio }) {
  const { t, locale } = usePreferences();
  return (
    <section className={styles.panel}>
      <div className={styles.panelHeading}>
        <h2>{t.checks}</h2>
        <Icon name="shield" />
      </div>
      {portfolio.findings.length ? (
        portfolio.findings.slice(0, 6).map((finding) => (
          <div className={styles.finding} key={finding.id}>
            <Icon name="info" width="17" />
            <div>
              <p>{findingLabel(finding.message, locale)}</p>
              <details>
                <summary>{t.source}</summary>
                <small>{finding.message}</small>
              </details>
              <small>{finding.source || t.unavailable}</small>
            </div>
          </div>
        ))
      ) : (
        <p className={styles.emptySmall}>{t.noFindings}</p>
      )}
      <span className={styles.sourceNote}>{t.sourceLanguage}</span>
    </section>
  );
}
