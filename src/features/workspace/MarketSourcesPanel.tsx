"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/data-display/Icon/Icon";
import { usePreferences } from "@/features/preferences/Preferences";
import { api } from "@/lib/api/client";
import { regions } from "@/lib/i18n";
import {
  type MarketSources,
  parseMarketSources,
} from "@/lib/models/marketSources";
import styles from "./MarketSourcesStyles.module.css";
import { marketMessages } from "./marketMessages";

export function MarketSourcesPanel({ compact = false }: { compact?: boolean }) {
  const { locale } = usePreferences();
  const copy = marketMessages[locale];
  const [data, setData] = useState<MarketSources | null>(null);
  const [failed, setFailed] = useState(false);
  const request = useRef<AbortController | null>(null);
  const load = useCallback(() => {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setFailed(false);
    setData(null);
    api("market-context", { signal: controller.signal })
      .then((value) => {
        if (!controller.signal.aborted) setData(parseMarketSources(value));
      })
      .catch(() => {
        if (!controller.signal.aborted) setFailed(true);
      });
  }, []);
  useEffect(() => {
    load();
    return () => request.current?.abort();
  }, [load]);
  function date(value: string | null, time = false) {
    if (!value) return copy.dateUnknown;
    const parsed = new Date(value);
    return Number.isNaN(parsed.valueOf())
      ? value
      : new Intl.DateTimeFormat(regions[locale], {
          dateStyle: "medium",
          ...(time ? { timeStyle: "short" as const } : {}),
          timeZone: "UTC",
        }).format(parsed);
  }
  return (
    <section className={styles.panel} aria-label={copy.title}>
      <header>
        <h2>
          <Icon name="globe" width="18" />
          {copy.title}
        </h2>
        <small>{copy.sourceLanguage}</small>
      </header>
      {failed ? (
        <div role="alert">
          <p>{copy.error}</p>
          <button type="button" onClick={load}>
            {copy.retry}
          </button>
        </div>
      ) : !data ? (
        <output>{copy.loading}</output>
      ) : (
        <div className={styles.sources}>
          <article>
            <h3>
              {copy.news}
              <span data-available={data.marketNews.status === "available"}>
                {copy[data.marketNews.status]}
              </span>
            </h3>
            <p>{data.marketNews.sourceName}</p>
            <small>
              {copy.retrieved}: {date(data.marketNews.retrievedAt, true)} UTC
            </small>
            <p className={styles.scope}>{copy.newsScope}</p>
            {data.marketNews.status === "available" ? (
              <ul className={styles.news}>
                {data.marketNews.items.slice(0, compact ? 2 : 6).map((item) => (
                  <li key={`${item.title}-${item.publishedAt}`}>
                    {item.url ? (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {item.title}
                        <Icon name="arrow" width="13" />
                      </a>
                    ) : (
                      <strong>{item.title}</strong>
                    )}
                    <small>
                      {copy.published}: {date(item.publishedAt, true)} UTC
                    </small>
                    {!compact && <p>{item.summary}</p>}
                  </li>
                ))}
              </ul>
            ) : (
              <p>{copy.missing}</p>
            )}
          </article>
          <article>
            <h3>
              {copy.house}
              <span data-available={data.houseView.status === "available"}>
                {copy[data.houseView.status]}
              </span>
            </h3>
            <p>{data.houseView.sourceName}</p>
            <small>
              {copy.retrieved}: {date(data.houseView.retrievedAt, true)} UTC
            </small>
            <p className={styles.scope}>{copy.houseScope}</p>
            {data.houseView.status === "available" ? (
              <>
                <strong>
                  {copy.sourceDate}:{" "}
                  {data.houseView.sourceDateLabel ?? copy.dateUnknown}
                </strong>
                <p className={styles.scope}>{copy.dateCaveat}</p>
                <details open={!compact}>
                  <summary>{data.houseView.title || copy.more}</summary>
                  <ul>
                    {data.houseView.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </details>
                {data.houseView.sourceUrl && (
                  <a
                    href={data.houseView.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {copy.read}
                    <Icon name="arrow" width="13" />
                  </a>
                )}
              </>
            ) : (
              <p>{copy.missing}</p>
            )}
          </article>
        </div>
      )}
    </section>
  );
}
