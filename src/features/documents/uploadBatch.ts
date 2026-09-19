export type UploadState =
  | "queued"
  | "reading"
  | "uploading"
  | "saved"
  | "review"
  | "imported"
  | "failed";
export type UploadResult = {
  documentId: string;
  clientId: string;
  portfolioId: string;
  imported: boolean;
  review: boolean;
};
export type UploadItem = {
  id: string;
  file: File;
  state: UploadState;
  error?: string;
  result?: UploadResult;
};

// Keep provider work bounded while letting independent files make progress.
export async function runUploadBatch<T>(
  items: T[],
  upload: (item: T, index: number) => Promise<void>,
  signal: AbortSignal,
) {
  let cursor = 0;
  async function worker() {
    while (!signal.aborted && cursor < items.length) {
      const index = cursor++;
      await upload(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(2, items.length) }, worker));
}
