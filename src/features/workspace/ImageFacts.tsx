"use client";
import { usePreferences } from "@/features/preferences/Preferences";
import { formatNumber } from "@/lib/i18n";
import { assetLabel } from "@/lib/i18n/portfolioLabels";
import type { ImageBriefing } from "@/lib/models/imageBriefing";
import styles from "./ChatImageStyles.module.css";

export function ImageFacts({ briefing }: { briefing: ImageBriefing }) {
  const { t, locale } = usePreferences();
  return (
    <section className={styles.facts}>
      <h3>{briefing.title}</h3>
      <p>
        {[briefing.selectedClient, briefing.selectedPortfolio, briefing.asOf]
          .filter(Boolean)
          .join(" · ")}
      </p>
      <dl>
        {briefing.facts.map((fact) => (
          <div key={fact.source}>
            <dt>
              {fact.label === "AUM"
                ? t.portfolioValue
                : assetLabel(fact.label, t)}
            </dt>
            <dd>
              {fact.unit === "fraction"
                ? formatNumber(Number(fact.value), locale, {
                    style: "percent",
                    maximumFractionDigits: 4,
                  })
                : `${fact.value} ${fact.unit ?? ""}`}
              <small>
                {t.source}: {fact.source}
              </small>
            </dd>
          </div>
        ))}
      </dl>
      {briefing.warnings.map((warning) => (
        <p key={warning}>{warning}</p>
      ))}
    </section>
  );
}
