import { list, number, record, string } from "@/lib/api/client";
export type Client = {
  id: string;
  alias: string;
  currency: string;
  aum: number;
  portfolioCount: number;
  violations: number;
};
export type PortfolioSummary = {
  id: string;
  name: string;
  currency: string;
  totalValue: number;
};
export type Holding = {
  id: string;
  name: string;
  assetClass: string;
  currency: string;
  marketValue: number | null;
  weight: number | null;
};
export type Allocation = {
  assetClass: string;
  weight: number;
  target: number | null;
  min: number | null;
  max: number | null;
};
export type Finding = {
  id: string;
  severity: string;
  message: string;
  source: string;
};
export type EvidenceSource = {
  id: string;
  title: string;
  url: string;
  asOf: string;
};
export type Portfolio = {
  id: string;
  name: string;
  currency: string;
  totalValue: number;
  valuationAt: string;
  reportingCurrency: string;
  holdings: Holding[];
  allocation: Allocation[];
  findings: Finding[];
  dataGaps: string[];
  source: string;
  sources: EvidenceSource[];
  raw: Record<string, unknown>;
};
export type Briefing = {
  mode: string;
  model: string;
  sections: { key: string; text: string }[];
  sources: EvidenceSource[];
  generatedAt: string;
};
export function parseClients(value: unknown): Client[] {
  return list(record(value).clients).map((item) => {
    const v = record(item);
    return {
      id: string(v.id),
      alias: string(v.alias),
      currency: string(v.currency),
      aum: number(v.aum),
      portfolioCount: number(v.portfolioCount),
      violations: number(v.violations),
    };
  });
}
export function parseSummaries(value: unknown): PortfolioSummary[] {
  return list(record(value).portfolios).map((item) => {
    const v = record(item);
    return {
      id: string(v.id),
      name: string(v.name),
      currency: string(v.currency),
      totalValue: number(v.aum),
    };
  });
}
function optionalNumber(value: unknown) {
  return value == null ? null : number(value);
}
function parseHolding(value: unknown): Holding {
  const h = record(value);
  return {
    id: string(h.id),
    name: string(h.name),
    assetClass: string(h.assetClass ?? "Other"),
    currency: string(h.currency),
    marketValue: optionalNumber(h.value),
    weight: h.weight == null ? null : number(h.weight) * 100,
  };
}
function parseAllocation(value: unknown): Allocation {
  const a = record(value);
  return {
    assetClass: string(a.category),
    weight: number(a.weight) * 100,
    target: a.target == null ? null : number(a.target) * 100,
    min: a.min == null ? null : number(a.min) * 100,
    max: a.max == null ? null : number(a.max) * 100,
  };
}
function parseFinding(value: unknown, index: number): Finding {
  const f = record(value);
  return {
    id: `${string(f.code)}-${index}`,
    severity: string(f.severity),
    message: string(f.code),
    source: string(f.sourceRef),
  };
}
export function parseSources(value: unknown): EvidenceSource[] {
  return list(value).map((item) => {
    const source = record(item);
    return {
      id: string(source.id),
      title: string(source.title),
      url: string(source.url),
      asOf: string(source.asOf),
    };
  });
}
export function parsePortfolio(value: unknown): Portfolio {
  const v = record(value);
  return {
    id: string(v.id),
    name: string(v.name),
    currency: string(v.currency),
    totalValue: number(v.aum),
    valuationAt: string(v.asOf),
    reportingCurrency: string(v.reportingCurrency),
    holdings: list(v.holdings).map(parseHolding),
    allocation: list(v.allocation).map(parseAllocation),
    findings: list(v.violations).map(parseFinding),
    dataGaps: list(v.dataGaps).map(string),
    source: string(v.sourceRef),
    sources: parseSources(v.sources),
    raw: v,
  };
}
export function parseBriefing(value: unknown): Briefing {
  const v = record(value);
  const sections = list(v.sections).map((item) => {
    const section = record(item);
    return { key: string(section.key), text: string(section.text) };
  });
  return {
    mode: string(v.mode),
    model: typeof v.model === "string" ? v.model : "",
    sections,
    sources: parseSources(v.sources),
    generatedAt: string(v.generatedAt),
  };
}
