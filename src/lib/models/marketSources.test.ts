import { expect, test } from "bun:test";
import { parseMarketSources, publicHttpsUrl } from "./marketSources";

const sources = {
  marketNews: {
    status: "available",
    sourceName: "BBC Business",
    sourceUrl: "https://feeds.bbci.co.uk/news/business/rss.xml",
    retrievedAt: "2026-09-19T11:00:00Z",
    items: [
      {
        title: "Market headline",
        summary: "A public headline, with no asserted portfolio impact.",
        url: "https://www.bbc.com/news/articles/example",
        publishedAt: "2026-09-18T17:57:30Z",
      },
    ],
  },
  houseView: {
    status: "available",
    sourceName: "J.P. Morgan Asset Management",
    sourceUrl: "https://am.jpmorgan.com/us/en/asset-management/adv/insights/",
    retrievedAt: "2026-09-19T11:00:00Z",
    title: "Economic & Market Update",
    sourceDateLabel: "June 30, 2026",
    points: ["Published public perspective"],
  },
};
test("keeps the publisher date distinct from retrieval and news publication dates", () => {
  const value = parseMarketSources(sources);
  expect(value.houseView.sourceDateLabel).toBe("June 30, 2026");
  expect(value.houseView.retrievedAt).toBe("2026-09-19T11:00:00Z");
  expect(value.marketNews.items[0].publishedAt).toBe("2026-09-18T17:57:30Z");
});
test("unavailable and disabled sources never require invented source content", () => {
  const value = parseMarketSources({
    marketNews: {
      ...sources.marketNews,
      status: "unavailable",
      items: undefined,
    },
    houseView: {
      ...sources.houseView,
      status: "disabled",
      points: undefined,
      title: undefined,
      sourceDateLabel: null,
    },
  });
  expect(value.marketNews.items).toEqual([]);
  expect(value.houseView.points).toEqual([]);
  expect(value.houseView.sourceDateLabel).toBeNull();
});
test("links accept HTTPS without credentials and reject executable or insecure schemes", () => {
  for (const url of [
    "javascript:alert(1)",
    "data:text/html,bad",
    "http://bbc.com",
    "https://user:secret@bbc.com/",
    "https://bbc.com:8443/",
    "not a url",
  ])
    expect(publicHttpsUrl(url)).toBeNull();
  expect(publicHttpsUrl("https://www.bbc.com/news/articles/example")).toBe(
    "https://www.bbc.com/news/articles/example",
  );
});
test("malformed status and unbounded source payloads fail closed", () => {
  expect(() =>
    parseMarketSources({
      ...sources,
      marketNews: { ...sources.marketNews, status: "trusted" },
    }),
  ).toThrow();
  expect(() =>
    parseMarketSources({
      ...sources,
      houseView: { ...sources.houseView, points: Array(5).fill("extra") },
    }),
  ).toThrow();
});
