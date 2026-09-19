import { list, number, record, string } from "@/lib/api/client";

export type ExtractedHolding = {
  name: string;
  isin: string | null;
  assetClass: string;
  currency: string;
  quantity: string | null;
  marketValue: string;
  sourcePage: number;
};
export type Extraction = {
  title: string;
  summary: string;
  asOf: string | null;
  currency: string | null;
  totalValue: string | null;
  holdings: ExtractedHolding[];
  warnings: string[];
  extractedText: string;
};
export type LibraryDocument = {
  id: string;
  filename: string;
  kind: string;
  status: string;
  clientId: string;
  portfolioId: string;
  chatSessionId: string;
  createdAt: number;
  virtualPortfolioId: string;
  extraction: Extraction;
};
function nullable(value: unknown) {
  return value == null ? null : string(value);
}
export function parseExtraction(value: unknown): Extraction {
  const v = record(value);
  return {
    title: string(v.title),
    summary: string(v.summary),
    asOf: nullable(v.asOf),
    currency: nullable(v.currency),
    totalValue: nullable(v.totalValue),
    extractedText: string(v.extractedText),
    warnings: list(v.warnings).map(string),
    holdings: list(v.holdings).map((item) => {
      const h = record(item);
      return {
        name: string(h.name),
        isin: nullable(h.isin),
        assetClass: string(h.assetClass),
        currency: string(h.currency),
        quantity: nullable(h.quantity),
        marketValue: string(h.marketValue),
        sourcePage: number(h.sourcePage),
      };
    }),
  };
}
export function parseDocuments(value: unknown): LibraryDocument[] {
  return list(record(value).documents).map((item) => {
    const d = record(item);
    return {
      id: string(d.id),
      filename: string(d.filename),
      kind: string(d.kind),
      status: string(d.status),
      clientId: string(d.clientId),
      portfolioId: string(d.portfolioId),
      chatSessionId: string(d.chatSessionId),
      createdAt: number(d.createdAt),
      virtualPortfolioId: string(d.virtualPortfolioId),
      extraction: parseExtraction(d.extraction),
    };
  });
}
export function inFolder(
  doc: LibraryDocument,
  folder: string,
  portfolioId: string,
  sessionId: string,
) {
  if (folder === "client") return !doc.portfolioId && !doc.chatSessionId;
  if (folder === "portfolio")
    return doc.portfolioId === portfolioId && !doc.chatSessionId;
  if (folder === "chat") return !!sessionId && doc.chatSessionId === sessionId;
  return true;
}
export function reconciliation(holdings: ExtractedHolding[], total: string) {
  const values = holdings.map((h) => Number(h.marketValue));
  const sum = values.reduce((a, b) => a + b, 0);
  return {
    sum,
    valid:
      holdings.length > 0 &&
      values.every(Number.isFinite) &&
      Number.isFinite(Number(total)) &&
      Math.abs(sum - Number(total)) <= 0.02,
  };
}
export async function filePayload(file: File) {
  if (!file.size || file.size > 4 * 1024 * 1024)
    throw new Error("Choose a file up to 4 MB.");
  const extension = file.name.split(".").at(-1)?.toLowerCase();
  const mimeType =
    extension === "pdf"
      ? "application/pdf"
      : extension === "csv"
        ? "text/csv"
        : "text/plain";
  if (!["pdf", "csv", "txt", "md"].includes(extension ?? ""))
    throw new Error("Choose a PDF, CSV or text document.");
  const bytes = new Uint8Array(await file.arrayBuffer());
  let binary = "";
  for (let i = 0; i < bytes.length; i += 8192)
    binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
  return { filename: file.name, mimeType, dataBase64: btoa(binary) };
}
