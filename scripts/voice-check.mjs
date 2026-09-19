import assert from "node:assert/strict";
import { chromium } from "@playwright/test";
import { installVoiceProbe, assertVoiceConnected, assertVoiceStopped } from "./browser-voice.mjs";

const base = process.env.QA_BASE_URL ?? "http://localhost:3000";
const speechFixture = process.env.QA_AUDIO_PATH;
const browser = await chromium.launch({
  executablePath: process.env.QA_CHROMIUM_PATH,
  headless: true,
  args: ["--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream",
    ...(speechFixture ? [`--use-file-for-fake-audio-capture=${speechFixture}`] : [])],
});
const context = await browser.newContext({ permissions: ["microphone"] });
await installVoiceProbe(context);
const page = await context.newPage();
try {
  await page.goto(`${base}/login`);
  await page.getByRole("button", { name: "Demo advisor account", exact: true }).click();
  await page.waitForURL("**/workspace");
  await page.getByText("Portfolio value", { exact: true }).waitFor();
  await page.getByRole("button", { name: "AI companion", exact: false }).first().click();
  for (const [label, mode] of [["Voice conversation", "conversation"], ["Dictate message", "transcription"]]) {
    const responsePromise = page.waitForResponse(
      response => response.url().endsWith("/voice/session") && response.request().method() === "POST",
      { timeout: 90000 },
    );
    await page.getByRole("button", { name: label, exact: true }).click();
    const response = await responsePromise;
    assert.equal(response.status(), 200, `${mode} SDP status`);
    await assertVoiceConnected(page);
    if (speechFixture && mode === "conversation") {
      await page.waitForFunction(() => document.querySelectorAll("article p").length >= 2,
        undefined, { timeout: 45000 });
      console.log("PASS synthetic speech produced visible user and assistant conversation turns");
    }
    if (speechFixture && mode === "transcription") {
      await page.waitForFunction(() => document.querySelector("#companion-message").value.trim().length > 10,
        undefined, { timeout: 30000 });
    }
    await page.getByRole("button", { name: "Stop microphone", exact: true }).click();
    await assertVoiceStopped(page);
    if (speechFixture && mode === "transcription") {
      assert.ok((await page.locator("#companion-message").inputValue()).trim().length > 10);
      console.log("PASS synthetic dictation remains in composer after microphone stop");
    }
    console.log(`PASS ${mode}: live peer/data channel connected; all synthetic microphone tracks stopped`);
  }
} finally {
  await browser.close();
}
