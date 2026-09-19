import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { chromium } from "@playwright/test";
import {
  assertVoiceConnected,
  assertVoiceMuted,
  assertVoiceStopped,
  installVoiceProbe,
} from "./browser-voice.mjs";

const base = process.env.QA_BASE_URL;
const audio = process.env.QA_AUDIO_PATH;
const output = process.env.QA_OUTPUT_DIR;
if (!base || !audio || !output)
  throw new Error("Voice image check requires URL, audio and output paths");
await mkdir(output, { recursive: true });
const checks = [];
let completed = false;
let failure = null;
const browser = await chromium.launch({
  executablePath: process.env.QA_CHROMIUM_PATH,
  headless: true,
  args: [
    "--use-fake-device-for-media-stream",
    "--use-fake-ui-for-media-stream",
    `--use-file-for-fake-audio-capture=${audio}`,
  ],
});
try {
  const context = await browser.newContext({ permissions: ["microphone"] });
  await installVoiceProbe(context);
  const page = await context.newPage();
  const check = (name) => {
    checks.push(name);
    console.log(`PASS ${name}`);
  };
  await page.goto(`${base}/login`);
  await page
    .getByRole("button", { name: "Demo advisor account", exact: true })
    .click();
  await page.waitForURL("**/workspace");
  await page.getByText("Portfolio value", { exact: true }).waitFor();
  const selected = await page.evaluate(() => ({
    client: document.querySelector("#client-select option:checked").textContent,
    portfolio: document.querySelector("#portfolio-select option:checked")
      .textContent,
  }));
  await page
    .getByRole("button", { name: "AI companion", exact: false })
    .first()
    .click();
  const imagePending = page.waitForResponse(
    (response) =>
      response.url().endsWith("/images") &&
      response.request().method() === "POST",
    { timeout: 150000 },
  );
  await page
    .getByRole("button", { name: "Voice conversation", exact: true })
    .click();
  await assertVoiceConnected(page);
  const response = await imagePending;
  assert.equal(response.status(), 200);
  const result = await response.json();
  assert.equal(result.briefing.selectedClient, selected.client);
  assert.equal(result.briefing.selectedPortfolio, selected.portfolio);
  await page
    .getByAltText("AI-generated illustration", { exact: true })
    .waitFor();
  check(
    "spoken image request automatically generates a real selected-portfolio illustration in the call",
  );
  await page
    .getByRole("button", { name: "Mute microphone", exact: true })
    .click();
  await assertVoiceMuted(page, true);
  await page
    .getByRole("button", { name: "Open image preview", exact: true })
    .click();
  const dialog = page.getByRole("dialog", {
    name: "AI-generated illustration",
    exact: true,
  });
  assert.equal(await dialog.isVisible(), true);
  const downloadPending = page.waitForEvent("download");
  await dialog
    .getByRole("link", { name: "Download image", exact: true })
    .click();
  const download = await downloadPending;
  assert.match(download.suggestedFilename(), /\.(png|webp|jpe?g)$/);
  await download.saveAs(`${output}/${download.suggestedFilename()}`);
  const downloaded = await readFile(
    `${output}/${download.suggestedFilename()}`,
  );
  assert.deepEqual(downloaded, Buffer.from(result.image, "base64"));
  check(
    "preview downloads the exact generated image bytes during an active muted call",
  );
  await page.screenshot({ path: `${output}/voice-image-preview.png` });
  await dialog.press("Escape");
  await assertVoiceMuted(page, true);
  await page
    .getByRole("button", { name: "End voice call", exact: true })
    .click();
  await assertVoiceStopped(page);
  check(
    "closing preview preserves the muted call and ending releases all microphone tracks",
  );
  completed = true;
} catch (error) {
  failure = error.stack;
  throw error;
} finally {
  await writeFile(
    `${output}/results.json`,
    JSON.stringify({ completed, failure, checks }, null, 2),
  );
  await browser.close();
}
