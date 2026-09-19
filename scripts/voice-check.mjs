import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "@playwright/test";
import {
  assertVoiceConnected,
  assertVoiceMuted,
  assertVoiceStopped,
  installVoiceProbe,
} from "./browser-voice.mjs";

const base = process.env.QA_BASE_URL ?? "http://localhost:3000";
const speechFixture = process.env.QA_AUDIO_PATH;
const output = process.env.QA_OUTPUT_DIR ?? "/tmp/unriskomega-voice-qa";
await mkdir(output, { recursive: true });
const checks = [];
let completed = false;
let failure = null;
function check(message) {
  checks.push(message);
  console.log(`PASS ${message}`);
}
const browser = await chromium.launch({
  executablePath: process.env.QA_CHROMIUM_PATH,
  headless: true,
  args: [
    "--use-fake-device-for-media-stream",
    "--use-fake-ui-for-media-stream",
    ...(speechFixture
      ? [`--use-file-for-fake-audio-capture=${speechFixture}`]
      : []),
  ],
});
const context = await browser.newContext({ permissions: ["microphone"] });
await installVoiceProbe(context);
const page = await context.newPage();
try {
  await page.goto(`${base}/login`);
  await page
    .getByRole("button", { name: "Demo advisor account", exact: true })
    .click();
  await page.waitForURL("**/workspace");
  await page.getByText("Portfolio value", { exact: true }).waitFor();
  await page
    .getByRole("button", { name: "AI companion", exact: false })
    .first()
    .click();
  for (const [label, mode] of [
    ["Voice conversation", "conversation"],
    ["Dictate message", "transcription"],
  ]) {
    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().endsWith("/voice/session") &&
        response.request().method() === "POST",
      { timeout: 90000 },
    );
    await page.getByRole("button", { name: label, exact: true }).click();
    const response = await responsePromise;
    assert.equal(response.status(), 200, `${mode} SDP status`);
    await assertVoiceConnected(page);
    if (speechFixture && mode === "conversation") {
      await Promise.all(
        ["user", "assistant"].map((role) =>
          page
            .locator(`article[class*="${role}Message"] p`)
            .filter({ hasText: /\S/ })
            .first()
            .waitFor({ state: "visible", timeout: 45000 }),
        ),
      );
      for (const type of (process.env.QA_VOICE_COMPONENTS ?? "")
        .split(",")
        .filter(Boolean)) {
        await page
          .locator(
            `article[class*="assistantMessage"] [data-component-type="${type}"]`,
          )
          .first()
          .waitFor({ state: "visible", timeout: 120000 });
        check(`actual spoken prompt automatically produced ${type} component`);
      }
      await page.screenshot({
        path: `${output}/spoken-visual-response.png`,
        fullPage: true,
      });
      check(
        "synthetic speech produced visible user and assistant conversation turns",
      );
    }
    if (speechFixture && mode === "transcription") {
      await page.waitForFunction(
        () =>
          document.querySelector("#companion-message").value.trim().length > 10,
        undefined,
        { timeout: 30000 },
      );
    }
    if (mode === "conversation") {
      await page
        .getByRole("button", { name: "Mute microphone", exact: true })
        .click();
      await assertVoiceMuted(page, true);
      await page.screenshot({
        path: `${output}/microphone-muted.png`,
        fullPage: true,
      });
      await page
        .getByRole("button", { name: "Unmute microphone", exact: true })
        .click();
      await assertVoiceMuted(page, false);
    }
    await page
      .getByRole("button", {
        name: mode === "conversation" ? "End voice call" : "Stop microphone",
        exact: true,
      })
      .click();
    await assertVoiceStopped(page);
    if (speechFixture && mode === "transcription") {
      assert.ok(
        (await page.locator("#companion-message").inputValue()).trim().length >
          10,
      );
      check("synthetic dictation remains in composer after microphone stop");
    }
    check(
      `${mode}: live peer/data channel connected; all synthetic microphone tracks stopped`,
    );
  }
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
