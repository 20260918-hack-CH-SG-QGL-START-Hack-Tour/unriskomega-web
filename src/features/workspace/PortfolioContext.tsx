"use client";
import { usePreferences } from "@/features/preferences/Preferences";
import { formatNumber } from "@/lib/i18n";
import type { Portfolio } from "@/lib/models/portfolio";
import { contextMessages } from "./contextMessages";
import styles from "./PortfolioContextStyles.module.css";

export function PortfolioContext({ portfolio }: { portfolio: Portfolio }) {
  const { locale, t } = usePreferences();
  const copy = contextMessages[locale];
  const largest = [...portfolio.holdings]
    .sort((a, b) => (b.marketValue ?? -Infinity) - (a.marketValue ?? -Infinity))
    .slice(0, 3);
  return (
    <section className={styles.snapshot} aria-label={copy.ready}>
      <header>
        <strong>{copy.ready}</strong>
        <span>
          {t.snapshot}: {portfolio.valuationAt || t.unavailable}
        </span>
      </header>
      <dl>
        <div>
          <dt>{t.portfolioValue}</dt>
          <dd>
            {formatNumber(portfolio.totalValue, locale, {
              maximumFractionDigits: 0,
            })}{" "}
            {portfolio.reportingCurrency}
          </dd>
        </div>
        <div>
          <dt>{t.holdings}</dt>
          <dd>{portfolio.holdings.length}</dd>
        </div>
        <div>
          <dt>{t.checks}</dt>
          <dd>{portfolio.findings.length}</dd>
        </div>
      </dl>
      <details>
        <summary>{copy.positions}</summary>
        <ul>
          {largest.map((holding, index) => (
            <li key={`${holding.id}-${index}`}>
              <span>{holding.name}</span>
              <strong>
                {formatNumber(holding.marketValue, locale, {
                  maximumFractionDigits: 0,
                })}{" "}
                {portfolio.reportingCurrency}
              </strong>
            </li>
          ))}
        </ul>
      </details>
    </section>
  );
}
