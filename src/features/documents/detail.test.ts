import { afterEach, describe, expect, spyOn, test } from "bun:test";
import { requestDocumentDetail } from "./detail";
import { parseDocumentDetail, parseDocuments } from "./model";

const id = "322e3fcb-00a3-4ed4-a1bf-07be9233a6a7";
const otherId = "422e3fcb-00a3-4ed4-a1bf-07be9233a6a7";
const clientId = "client-one";
function fixture(documentId = id) {
  return {
    id: documentId,
    clientId,
    filename: "statement.pdf",
    kind: "custody",
    status: "ready",
    portfolioId: "",
    chatSessionId: "",
    virtualPortfolioId: "",
    createdAt: 1,
    extractionComplete: true,
    holdingCount: 1,
    extraction: {
      title: "Statement",
      summary: "Full summary",
      asOf: "2026-09-19",
      currency: "CHF",
      totalValue: "100",
      holdings: [
        {
          name: "Cash",
          isin: null,
          assetClass: "Cash",
          currency: "CHF",
          quantity: null,
          marketValue: "100",
          sourcePage: 1,
        },
      ],
      warnings: ["Review against original"],
      extractedText: "Complete original extraction",
    },
  };
}
const originalFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("full document review boundary", () => {
  test("list preview preserves holding count but cannot become review detail", () => {
    const full = fixture();
    const preview = {
      ...full,
      extractionComplete: false,
      extraction: { ...full.extraction, holdings: [], warnings: [] },
    };
    const [parsed] = parseDocuments({ documents: [preview] });
    expect(parsed.holdingCount).toBe(1);
    expect(parsed.extraction.holdings).toHaveLength(0);
    expect(() => parseDocumentDetail(preview, id, clientId)).toThrow();
    expect(() =>
      parseDocumentDetail(
        { ...full, extractionComplete: undefined },
        id,
        clientId,
      ),
    ).toThrow();
  });
  test("complete detail retains all positions and review notes", () => {
    const full = fixture();
    full.holdingCount = 100;
    full.extraction.holdings = Array.from({ length: 100 }, (_, i) => ({
      ...full.extraction.holdings[0],
      name: `Holding ${i}`,
    }));
    full.extraction.extractedText = "Text ".repeat(3000);
    expect(parseDocumentDetail(full, id, clientId).extraction).toEqual(
      full.extraction,
    );
  });
  test("another document, client, truncated holdings or unsafe ID cannot enter review", () => {
    for (const value of [
      fixture(otherId),
      { ...fixture(), clientId: "client-two" },
      { ...fixture(), holdingCount: 2 },
      { ...fixture(), id: "../content" },
      { ...fixture(), holdingCount: 1.5 },
    ])
      expect(() => parseDocumentDetail(value, id, clientId)).toThrow();
  });
  test("late response from cancelled selection cannot replace the next selection", async () => {
    let releaseFirst: (response: Response) => void = () => {
      throw new Error("Request not started");
    };
    const late = new Promise<Response>((resolve) => {
      releaseFirst = resolve;
    });
    const fetch = spyOn(globalThis, "fetch");
    fetch.mockImplementationOnce(
      Object.assign(() => late, { preconnect: originalFetch.preconnect }),
    );
    fetch.mockResolvedValueOnce(Response.json(fixture(otherId)));
    const first = requestDocumentDetail(id, clientId);
    const firstResult = first.result.catch((error: unknown) => error);
    first.cancel();
    const second = requestDocumentDetail(otherId, clientId);
    expect((await second.result).id).toBe(otherId);
    releaseFirst(Response.json(fixture()));
    expect(await firstResult).toBeInstanceOf(DOMException);
    expect(fetch.mock.calls[0]?.[1]?.signal?.aborted).toBe(true);
    fetch.mockRestore();
  });
  test("detail failure remains an error that can be retried", async () => {
    const fetch = spyOn(globalThis, "fetch");
    fetch.mockResolvedValueOnce(new Response("Unavailable", { status: 503 }));
    fetch.mockResolvedValueOnce(Response.json(fixture()));
    await expect(requestDocumentDetail(id, clientId).result).rejects.toThrow();
    expect(
      (await requestDocumentDetail(id, clientId).result).extractionComplete,
    ).toBe(true);
    fetch.mockRestore();
  });
});
