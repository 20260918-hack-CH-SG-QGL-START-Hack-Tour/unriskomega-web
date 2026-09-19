import { describe, expect, it } from "bun:test";
import { VoiceTranscriptLedger } from "./voice";

describe("spoken transcript boundaries", () => {
  it("keeps one final user turn and rejects repeated delivery", () => {
    const ledger = new VoiceTranscriptLedger();
    const event = {
      type: "conversation.item.input_audio_transcription.completed",
      item_id: "item-a",
      transcript: "Bonjour",
    };
    expect(ledger.accept(event)?.role).toBe("user");
    expect(ledger.accept(event)).toBeNull();
  });
  it("deduplicates provider event aliases for the same assistant turn", () => {
    const ledger = new VoiceTranscriptLedger();
    const event = {
      type: "response.output_audio_transcript.done",
      item_id: "answer-a",
      transcript: "Hello",
    };
    expect(ledger.accept(event)?.role).toBe("assistant");
    expect(
      ledger.accept({ ...event, type: "response.audio_transcript.done" }),
    ).toBeNull();
  });
  it("allows identical words in distinct conversation turns", () => {
    const ledger = new VoiceTranscriptLedger();
    const event = {
      type: "conversation.item.input_audio_transcription.completed",
      item_id: "item-a",
      transcript: "Yes",
    };
    expect(ledger.accept(event)).not.toBeNull();
    expect(ledger.accept({ ...event, item_id: "item-b" })).not.toBeNull();
  });
  it("ignores partial or malformed events", () => {
    const ledger = new VoiceTranscriptLedger();
    expect(
      ledger.accept({
        type: "response.output_audio_transcript.delta",
        delta: "Hello",
      }),
    ).toBeNull();
    expect(
      ledger.accept({
        type: "response.output_audio_transcript.done",
        transcript: 42,
      }),
    ).toBeNull();
  });
});
