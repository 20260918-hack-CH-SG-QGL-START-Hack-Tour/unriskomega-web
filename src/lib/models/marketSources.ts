import { record } from "@/lib/api/client";
import { array, text } from "./chatComponents";

type SourceStatus = "available" | "unavailable" | "disabled";
export type MarketSource = {
  status: SourceStatus;
  sourceName: string;
  sourceUrl: string | null;
  retrievedAt: string;
};
export type MarketSources = {
  marketNews: MarketSource & {
    items: {
      title: string;
      summary: string;
      url: string | null;
      publishedAt: string;
    }[];
  };
  houseView: MarketSource & {
    title: string;
    sourceDateLabel: string | null;
    points: string[];
  };
};
export function publicHttpsUrl(value: unknown): string | null {
  if (typeof value !== "string" || value.length > 2000) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      (!url.port || url.port === "443")
      ? url.href
      : null;
  } catch {
    return null;
  }
}
function source(value: Record<string, unknown>): MarketSource {
  if (!["available", "unavailable", "disabled"].includes(String(value.status)))
    throw new Error("Invalid market source status");
  return {
    status: value.status as SourceStatus,
    sourceName: text(value.sourceName, 160),
    sourceUrl: publicHttpsUrl(value.sourceUrl),
    retrievedAt: text(value.retrievedAt, 80),
  };
}
export function parseMarketSources(value: unknown): MarketSources {
  const v = record(value);
  const news = record(v.marketNews);
  const house = record(v.houseView);
  return {
    marketNews: {
      ...source(news),
      items: array(news.items ?? [], 6, 0).map((item) => {
        const v = record(item);
        return {
          title: text(v.title, 300),
          summary: text(v.summary ?? "", 500, true),
          url: publicHttpsUrl(v.url),
          publishedAt: text(v.publishedAt, 80),
        };
      }),
    },
    houseView: {
      ...source(house),
      title: typeof house.title === "string" ? text(house.title, 300) : "",
      sourceDateLabel:
        house.sourceDateLabel == null ? null : text(house.sourceDateLabel, 100),
      points: array(house.points ?? [], 4, 0).map((point) => text(point, 500)),
    },
  };
}
