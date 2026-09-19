import { expect, test } from "bun:test";
import { filePayload } from "./model";
import { parseUploadResult, runUploadBatch } from "./uploadBatch";

test("batch uploads never exceed two simultaneous provider requests", async () => {
  let active = 0,
    peak = 0;
  const finished: number[] = [];
  await runUploadBatch(
    [0, 1, 2, 3, 4],
    async (value) => {
      active++;
      peak = Math.max(peak, active);
      await new Promise((resolve) => setTimeout(resolve, value % 2 ? 1 : 5));
      finished.push(value);
      active--;
    },
    new AbortController().signal,
  );
  expect(peak).toBe(2);
  expect(finished.toSorted()).toEqual([0, 1, 2, 3, 4]);
});

test("switching portfolio cancels files that have not started", async () => {
  const controller = new AbortController();
  const started: number[] = [];
  await runUploadBatch(
    [0, 1, 2, 3],
    async (value) => {
      started.push(value);
      controller.abort();
    },
    controller.signal,
  );
  expect(started).toEqual([0]);
});

test("sponsor JSON files retain the JSON MIME type and exact bytes", async () => {
  const source = '{"alias":"Client é","portfolios":[]}';
  const payload = await filePayload(
    new File([source], "test-clients-bond.json"),
  );
  expect(payload.mimeType).toBe("application/json");
  expect(Buffer.from(payload.dataBase64, "base64").toString()).toBe(source);
});

test("PDF success responses keep their selected context without requiring JSON-only response fields", () => {
  expect(
    parseUploadResult(
      { id: "document-id", status: "ready", extraction: {} },
      { clientId: "client-a", portfolioId: "portfolio-a", review: true },
    ),
  ).toEqual({
    documentId: "document-id",
    clientId: "client-a",
    portfolioId: "portfolio-a",
    review: true,
    imported: false,
  });
});

test("JSON imports use their imported identity and reject incomplete results", () => {
  const context = {
    clientId: "selected-client",
    portfolioId: "selected-portfolio",
    review: false,
  };
  expect(
    parseUploadResult(
      {
        id: "document-id",
        status: "imported",
        clientId: "bond",
        portfolioId: "bond-portfolio",
      },
      context,
    ),
  ).toMatchObject({
    clientId: "bond",
    portfolioId: "bond-portfolio",
    imported: true,
  });
  expect(() =>
    parseUploadResult({ id: "document-id", status: "imported" }, context),
  ).toThrow();
});
