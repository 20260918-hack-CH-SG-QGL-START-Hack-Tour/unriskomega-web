import assert from "node:assert/strict";
import { expect } from "@playwright/test";

/** Transport fixture only. Live WebRTC acceptance is a separate provider check. */
export async function verifyVoiceUi(page, check, shot) {
  await page.evaluate(() => {
    const track = {
      enabled: true,
      readyState: "live",
      stop() {
        this.readyState = "ended";
      },
    };
    const originalPeer = window.RTCPeerConnection;
    const originalMedia = navigator.mediaDevices.getUserMedia;
    const captured = {
      track,
      originalPeer,
      originalMedia,
      sent: [],
      peer: null,
      channel: null,
    };
    window.__uroVoiceFixture = captured;
    navigator.mediaDevices.getUserMedia = async () => ({
      getTracks: () => [track],
      getAudioTracks: () => [track],
    });
    window.RTCPeerConnection = class {
      connectionState = "new";
      constructor() {
        captured.peer = this;
      }
      addTrack() {}
      createDataChannel() {
        const channel = {
          readyState: "open",
          close() {
            this.readyState = "closed";
          },
          send(data) {
            captured.sent.push(JSON.parse(data));
          },
        };
        captured.channel = channel;
        return channel;
      }
      async createOffer() {
        return { type: "offer", sdp: "v=0\r\nfixture-offer" };
      }
      async setLocalDescription() {}
      async setRemoteDescription() {
        this.connectionState = "connected";
        this.onconnectionstatechange?.();
      }
      close() {
        this.connectionState = "closed";
      }
    };
  });
  let request;
  await page.route("**/api/v1/voice/session", (route) => {
    request = route.request().postDataJSON();
    return route.fulfill({
      json: {
        sdp: "v=0\r\nfixture-answer",
        model: "voice-ui-fixture",
        maxDurationSeconds: 1800,
      },
    });
  });
  try {
    const before = await page.locator("article").count();
    await page
      .getByRole("button", { name: "Voice conversation", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "Mute microphone", exact: true }),
    ).toBeEnabled();
    assert.match(request.chatSessionId, /^[0-9a-f-]{36}$/);
    assert.ok(request.history.length >= 2);
    await expect(
      page.getByText(/Call time remaining · (30:00|29:5\d)/),
    ).toBeVisible();
    await page.evaluate(() => {
      const send = (event) =>
        window.__uroVoiceFixture.channel.onmessage({
          data: JSON.stringify(event),
        });
      send({ type: "input_audio_buffer.committed", item_id: "question-a" });
      send({ type: "input_audio_buffer.committed", item_id: "question-b" });
      send({ type: "response.created", response: { id: "response-a" } });
      send({
        type: "conversation.item.input_audio_transcription.completed",
        item_id: "question-a",
        transcript: "Show the allocation",
      });
      send({
        type: "conversation.item.input_audio_transcription.completed",
        item_id: "question-b",
        transcript: "as a chart.",
      });
      send({
        type: "response.output_audio_transcript.done",
        response_id: "response-a",
        item_id: "answer-a",
        transcript: "This is the actual spoken answer.",
      });
      send({
        type: "response.audio_transcript.done",
        response_id: "response-a",
        item_id: "answer-a",
        transcript: "This is the actual spoken answer.",
      });
    });
    const answer = page.locator("article").nth(before + 1);
    await expect(answer.locator('[data-component-type="chart"]')).toBeVisible();
    await expect(page.locator("article")).toHaveCount(before + 2);
    await expect(page.locator("article").nth(before)).toContainText(
      "Show the allocation as a chart.",
    );
    await expect(answer).toContainText("This is the actual spoken answer.");
    await page
      .getByRole("button", { name: "Mute microphone", exact: true })
      .click();
    assert.deepEqual(
      await page.evaluate(() => ({
        enabled: window.__uroVoiceFixture.track.enabled,
        state: window.__uroVoiceFixture.peer.connectionState,
      })),
      { enabled: false, state: "connected" },
    );
    await page
      .getByRole("button", { name: "Unmute microphone", exact: true })
      .click();
    assert.equal(
      await page.evaluate(() => window.__uroVoiceFixture.track.enabled),
      true,
    );
    await page
      .getByRole("button", { name: "Create image", exact: true })
      .click();
    await page
      .getByLabel("Ask about this portfolio", { exact: true })
      .fill("/image illustrate the selected portfolio");
    await page
      .getByRole("button", { name: "Send message", exact: true })
      .click();
    await expect(
      page.getByAltText("AI-generated illustration", { exact: true }),
    ).toHaveCount(2);
    assert.equal(
      await page.evaluate(() => window.__uroVoiceFixture.peer.connectionState),
      "connected",
    );
    const notes = await page.evaluate(() => window.__uroVoiceFixture.sent);
    assert.equal(notes.length, 2);
    assert.ok(
      notes.every(
        (event) =>
          event.type === "conversation.item.create" &&
          event.item.content[0].type === "input_text",
      ),
    );
    assert.ok(
      notes.some((event) =>
        event.item.content[0].text.includes("selected portfolio"),
      ),
    );
    assert.equal(JSON.stringify(notes).includes("data:image"), false);
    await page.evaluate(() =>
      window.__uroVoiceFixture.channel.onmessage({
        data: JSON.stringify({
          type: "error",
          error: {
            type: "invalid_request_error",
            code: "input_audio_buffer_commit_empty",
          },
        }),
      }),
    );
    await expect(
      page.getByText(
        "This voice turn could not complete. The call is still connected; please try again.",
      ),
    ).toBeVisible();
    await shot("chat-live-voice-ui-fixture");
    await page
      .getByRole("button", { name: "End voice call", exact: true })
      .click();
    assert.deepEqual(
      await page.evaluate(() => ({
        state: window.__uroVoiceFixture.peer.connectionState,
        track: window.__uroVoiceFixture.track.readyState,
      })),
      { state: "closed", track: "ended" },
    );
    check(
      "fixture voice: merged transcript, automatic cards, separate mute, image retains call, recoverable errors and explicit end",
    );
  } finally {
    await page.unroute("**/api/v1/voice/session");
    await page.evaluate(() => {
      window.RTCPeerConnection = window.__uroVoiceFixture.originalPeer;
      navigator.mediaDevices.getUserMedia =
        window.__uroVoiceFixture.originalMedia;
      delete window.__uroVoiceFixture;
    });
  }
}
