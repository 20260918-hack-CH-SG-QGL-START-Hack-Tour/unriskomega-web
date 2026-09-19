import { expect, test } from "bun:test";
import { filePayload } from "./model";
import { runUploadBatch } from "./uploadBatch";

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
