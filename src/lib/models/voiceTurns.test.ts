import { expect, test } from "bun:test";
import {
  muteMicrophone,
  realtimeConversationNote,
  terminalVoiceError,
  VoiceTurnLedger,
  voiceDurationSeconds,
} from "./voiceTurns";

const transcript = (text: string, role: "user" | "assistant" = "user") => ({
  key: "unused",
  text,
  role,
  final: true,
});
test("groups committed input fragments and restores their order after delayed transcription", () => {
  const turns = new VoiceTurnLedger("call");
  turns.observe({ type: "input_audio_buffer.committed", item_id: "first" });
  turns.observe({ type: "input_audio_buffer.committed", item_id: "second" });
  turns.observe({ type: "response.created", response: { id: "reply" } });
  const answer = turns.attach(
    { response_id: "reply" },
    transcript("The portfolio is…", "assistant"),
  );
  expect(
    turns.attach({ item_id: "second" }, transcript("is selected?")),
  ).toMatchObject({ key: answer.key, text: "is selected?" });
  expect(
    turns.attach({ item_id: "first" }, transcript("Which portfolio")),
  ).toMatchObject({ key: answer.key, text: "Which portfolio is selected?" });
});
test("keeps new questions separate while earlier responses finish", () => {
  const turns = new VoiceTurnLedger("call");
  turns.observe({ type: "input_audio_buffer.committed", item_id: "first" });
  turns.observe({ type: "response.created", response: { id: "reply-1" } });
  turns.observe({ type: "input_audio_buffer.committed", item_id: "second" });
  turns.observe({ type: "response.created", response: { id: "reply-2" } });
  expect(
    turns.attach({ response_id: "reply-1" }, transcript("First", "assistant"))
      .key,
  ).toBe("call:first");
  expect(
    turns.attach({ response_id: "reply-2" }, transcript("Second", "assistant"))
      .key,
  ).toBe("call:second");
});
test("maps output item IDs when an audio transcript omits response ID", () => {
  const turns = new VoiceTurnLedger("call");
  turns.observe({ type: "input_audio_buffer.committed", item_id: "first" });
  turns.observe({ type: "response.created", response: { id: "reply" } });
  turns.observe({
    type: "response.output_item.added",
    response_id: "reply",
    item: { id: "output" },
  });
  expect(
    turns.attach({ item_id: "output" }, transcript("Answer", "assistant")).key,
  ).toBe("call:first");
});
test("mute changes microphone enabled state without stopping tracks", () => {
  let stopped = false;
  const track = {
    enabled: true,
    stop() {
      stopped = true;
    },
  };
  const stream = { getAudioTracks: () => [track] } as unknown as MediaStream;
  muteMicrophone(stream, true);
  expect(track.enabled).toBe(false);
  expect(stopped).toBe(false);
  muteMicrophone(stream, false);
  expect(track.enabled).toBe(true);
});
test("uses the returned call budget with a one-hour hard ceiling", () => {
  expect(voiceDurationSeconds(1800, 60)).toBe(1800);
  expect(voiceDurationSeconds(7200, 1800)).toBe(3600);
  expect(voiceDurationSeconds(-1, 1800)).toBe(1800);
  expect(voiceDurationSeconds("1800", 1800)).toBe(1800);
});

test("item and response errors do not terminate a live voice call", () => {
  expect(
    terminalVoiceError({
      type: "invalid_request_error",
      code: "input_audio_buffer_commit_empty",
    }),
  ).toBe(false);
  expect(
    terminalVoiceError({ code: "conversation_already_has_active_response" }),
  ).toBe(false);
  expect(terminalVoiceError({ code: "session_expired" })).toBe(true);
  expect(terminalVoiceError({ type: "authentication_error" })).toBe(true);
});

test("typed context enters the live session as a silent bounded item", () => {
  const event = realtimeConversationNote({
    role: "assistant",
    content: "The selected portfolio is Portfolio 01",
  });
  expect(event.type).toBe("conversation.item.create");
  expect(event.item.content[0].type).toBe("input_text");
  expect(event.item.content[0].text).toContain("Portfolio 01");
  expect(JSON.stringify(event)).not.toContain("response.create");
  expect(
    new TextEncoder().encode(
      realtimeConversationNote({ role: "user", content: "€".repeat(10000) })
        .item.content[0].text,
    ).length,
  ).toBeLessThanOrEqual(4000);
});
