import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "@playwright/test";
import {
  verifyGenerativeChat,
  verifyLiveStructuredChat,
} from "./browser-generative.mjs";
import { verifyClientSwitchIsolation } from "./browser-scope.mjs";
import {
  assertVoiceConnected,
  assertVoiceMuted,
  assertVoiceStopped,
  installVoiceProbe,
} from "./browser-voice.mjs";

const base = process.env.QA_BASE_URL ?? "http://localhost:3000";
const output = process.env.QA_OUTPUT_DIR ?? "/tmp/unriskomega-web-qa";
const executablePath = process.env.QA_CHROMIUM_PATH;
const phases = (process.env.QA_PHASES ?? "public,flow").split(",");
await mkdir(output, { recursive: true });
const errors = [];
const checks = [];
let completed = false;
let failure = null;
let browser;
try {
  browser = await chromium.launch({
    executablePath,
    headless: true,
    args: [
      "--use-fake-device-for-media-stream",
      "--use-fake-ui-for-media-stream",
    ],
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    permissions: ["microphone"],
  });
  await installVoiceProbe(context);
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text().slice(0, 250));
  });
  const check = (name) => {
    checks.push(name);
    console.log(`PASS ${name}`);
  };
  async function shot(name) {
    await page.screenshot({ path: `${output}/${name}.png`, fullPage: true });
  }
  async function signIn() {
    await page.goto(`${base}/login`);
    await page
      .getByRole("button", { name: "Demo advisor account", exact: true })
      .click();
    await page.waitForURL("**/workspace");
    await page.getByText("Portfolio value", { exact: true }).waitFor();
  }
  if (phases.includes("public")) {
    const response = await page.goto(base);
    assert.equal(response.status(), 200);
    assert.ok(
      response.headers()["content-security-policy"].includes("'nonce-"),
    );
    await page
      .getByRole("heading", { name: "Less preparation. More perspective." })
      .waitFor();
    await shot("landing-en-light");
    check("landing and strict CSP");
    for (const [locale, phrase] of [
      ["es", "Menos preparación. Más perspectiva."],
      ["de", "Weniger Vorbereitung. Mehr Perspektive."],
      ["fr", "Moins de préparation. Plus de perspective."],
      ["en", "Less preparation. More perspective."],
    ]) {
      await page
        .getByLabel("Language")
        .or(page.getByLabel("Idioma"))
        .or(page.getByLabel("Sprache"))
        .or(page.getByLabel("Langue"))
        .selectOption(locale);
      await page.getByRole("heading", { name: phrase }).waitFor();
    }
    check("all four interface languages");
    await page.getByRole("button", { name: "Dark mode", exact: true }).click();
    await shot("landing-en-dark");
    await page.getByRole("button", { name: "Light mode", exact: true }).click();
    check("dark and light themes");
    await page.setViewportSize({ width: 390, height: 844 });
    await shot("landing-mobile");
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      true,
    );
    await page.setViewportSize({ width: 1440, height: 1000 });
    check("mobile landing reflow");
    await page.goto(`${base}/deck/JO202609190900`);
    await page
      .getByRole("heading", {
        name: "Portfolio context. Ready for the conversation.",
      })
      .first()
      .waitFor();
    await shot("deck-opening");
    await page.getByRole("button", { name: "Next slide", exact: true }).click();
    await page
      .getByRole("heading", {
        name: "The client calls. The context is scattered.",
      })
      .first()
      .waitFor();
    check("pitch deck navigation");
  }
  if (
    phases.includes("flow") ||
    phases.includes("providers") ||
    phases.includes("chat")
  ) {
    await signIn();
    await shot("workspace-overview");
    check("demo authentication and actual portfolio analytics");
    await page.evaluate(
      () =>
        new Promise((resolve, reject) => {
          const selected = document.querySelector("#portfolio-select").value;
          const socket = new WebSocket(
            `${location.origin.replace(/^http/, "ws")}/api/v1/ws?portfolioId=${encodeURIComponent(selected)}`,
          );
          const timeout = setTimeout(() => {
            socket.close();
            reject(new Error("WebSocket exchange timed out"));
          }, 30000);
          socket.onerror = () => {
            clearTimeout(timeout);
            reject(new Error("WebSocket handshake failed"));
          };
          socket.onmessage = (event) => {
            const payload = JSON.parse(event.data);
            if (payload.type === "connected")
              socket.send(JSON.stringify({ type: "ping" }));
            if (payload.type === "pong") {
              clearTimeout(timeout);
              socket.close();
              resolve(true);
            }
          };
        }),
    );
    check("authenticated bidirectional WebSocket ping and pong");

    const briefingResponse = page.waitForResponse(
      (response) =>
        response.url().endsWith("/briefings") &&
        response.request().method() === "POST",
      { timeout: 120000 },
    );
    await page
      .getByRole("button", { name: "Generate briefing", exact: true })
      .first()
      .click();
    const generated = await briefingResponse;
    assert.equal(generated.status(), 200);
    const briefing = await generated.json();
    if (phases.includes("providers")) {
      assert.equal(
        briefing.assistantResponse?.source,
        "provider",
        "Briefing must include real synthesized provider response",
      );
      assert.equal(briefing.assistantResponse.outcome.status, "accepted");
    }
    await page
      .getByText(
        briefing.assistantResponse
          ? "Grounded generation"
          : "Computed from snapshot",
        { exact: false },
      )
      .waitFor({ timeout: 30000 });
    await shot("workspace-briefing");
    check("actual source-backed briefing");
    await page.getByRole("button", { name: "Evidence", exact: true }).click();
    await page
      .getByText("START Hack · UnRiskOmega portfolio dataset")
      .waitFor();
    await shot("workspace-evidence");
    check("source evidence");
    await page
      .getByRole("button", { name: "AI companion", exact: false })
      .first()
      .click();
    if (phases.includes("chat")) await verifyGenerativeChat(page, check, shot);
    if (phases.includes("providers")) {
      await verifyLiveStructuredChat(page, check, shot);
      await page
        .getByRole("button", { name: "Create image", exact: true })
        .click();
      await page
        .getByLabel("Ask about this portfolio", { exact: true })
        .fill(
          "/image A minimalist emerald landscape illustration for a financial planning conversation, no numbers, no text.",
        );
      await page
        .getByRole("button", { name: "Send message", exact: true })
        .click();
      await page
        .getByAltText("AI-generated illustration")
        .waitFor({ timeout: 120000 });
      await shot("workspace-image");
      check("actual provider image generation");
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
        const payload = await response.json();
        assert.ok(payload.sdp.startsWith("v=0"));
        await assertVoiceConnected(page);
        if (mode === "conversation") {
          assert.ok(
            payload.maxDurationSeconds > 60 &&
              payload.maxDurationSeconds <= 3600,
          );
          await page
            .getByRole("button", { name: "Mute microphone", exact: true })
            .click();
          await assertVoiceMuted(page, true);
          await page
            .getByRole("button", { name: "Unmute microphone", exact: true })
            .click();
          await assertVoiceMuted(page, false);
        }
        await page
          .getByRole("button", {
            name:
              mode === "conversation" ? "End voice call" : "Stop microphone",
            exact: true,
          })
          .click();

        await assertVoiceStopped(page);
        check(
          `synthetic microphone ${mode}: peer connected, data channel open, tracks ended on stop`,
        );
      }
    }
    await page.getByRole("button", { name: "Overview", exact: true }).click();
    if (await verifyClientSwitchIsolation(page))
      check("client switch clears context and rejects late responses");
    await page.setViewportSize({ width: 390, height: 844 });
    await shot("workspace-mobile");
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      true,
    );
    check("mobile workspace reflow");
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.getByRole("button", { name: "Sign out", exact: true }).click();
    await page.waitForURL("**/login");
    check("sign out clears authenticated workspace");
  }
  assert.deepEqual(errors, [], `Browser errors: ${errors.join("\n")}`);
  check("no browser errors");
  completed = true;
} catch (error) {
  failure = (error instanceof Error ? error.message : String(error)).slice(
    0,
    2000,
  );
  throw error;
} finally {
  await writeFile(
    `${output}/results.json`,
    JSON.stringify({ completed, failure, checks, errors }, null, 2),
  );
  await browser?.close();
}
