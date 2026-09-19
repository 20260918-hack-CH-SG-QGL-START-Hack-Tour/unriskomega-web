import { describe, expect, it } from "bun:test";
import {
  type DictationDraft,
  dictatedText,
  updateDictationDraft,
  VoiceTranscriptLedger,
} from "./voice";

const delta = (text: string, item = "item-a", index = 0) => ({
  type: "conversation.item.input_audio_transcription.delta",
  item_id: item,
  content_index: index,
  delta: text,
});
const completed = (text: string, item = "item-a", index = 0) => ({
  type: "conversation.item.input_audio_transcription.completed",
  item_id: item,
  content_index: index,
  transcript: text,
});

describe("spoken transcript boundaries", () => {
  it("keeps one final user turn and rejects repeated delivery", () => {
    const ledger = new VoiceTranscriptLedger();
    const event = completed("Bonjour");
    expect(ledger.accept(event)).toMatchObject({ role: "user", final: true });
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
    expect(ledger.accept(completed("Yes"))).not.toBeNull();
    expect(ledger.accept(completed("Yes", "item-b"))).not.toBeNull();
  });
  it("keeps default conversation behavior final-only", () => {
    const ledger = new VoiceTranscriptLedger();
    expect(ledger.accept(delta("Draft"))).toBeNull();
    expect(ledger.accept(completed("Final"))?.text).toBe("Final");
    expect(
      ledger.accept(
        { type: "response.output_audio_transcript.delta", delta: "Hello" },
        { partials: true },
      ),
    ).toBeNull();
  });
  it("ignores malformed transcript values and content indices", () => {
    const ledger = new VoiceTranscriptLedger();
    expect(ledger.accept({ ...completed(""), transcript: 42 })).toBeNull();
    expect(
      ledger.accept({ ...completed("Hello"), content_index: -1 }),
    ).toBeNull();
    expect(
      ledger.accept(
        { ...delta("Hello"), item_id: undefined },
        { partials: true },
      ),
    ).toBeNull();
  });
});

describe("dictation reconciliation", () => {
  it("accumulates deltas then replaces them with the final correction once", () => {
    const ledger = new VoiceTranscriptLedger();
    expect(ledger.accept(delta("Bon"), { partials: true })?.text).toBe("Bon");
    expect(ledger.accept(delta(" jour"), { partials: true })).toMatchObject({
      text: "Bon jour",
      final: false,
    });
    expect(
      ledger.accept(completed("Bonjour!"), { partials: true }),
    ).toMatchObject({ text: "Bonjour!", final: true });
    expect(ledger.accept(completed("Bonjour!"), { partials: true })).toBeNull();
    expect(ledger.accept(delta(" late"), { partials: true })).toBeNull();
  });
  it("deduplicates retried delta event IDs without removing repeated words", () => {
    const ledger = new VoiceTranscriptLedger();
    const first = { ...delta("ha"), event_id: "event-1" };
    expect(ledger.accept(first, { partials: true })?.text).toBe("ha");
    expect(ledger.accept(first, { partials: true })).toBeNull();
    expect(
      ledger.accept({ ...first, event_id: "event-2" }, { partials: true })
        ?.text,
    ).toBe("haha");
  });
  it("keeps interleaved items and content indices independent", () => {
    const ledger = new VoiceTranscriptLedger();
    const a = ledger.accept(delta("First"), { partials: true });
    const b = ledger.accept(delta("Second", "item-b"), { partials: true });
    const c = ledger.accept(delta("Content", "item-a", 1), { partials: true });
    expect(new Set([a?.key, b?.key, c?.key]).size).toBe(3);
    expect(
      ledger.accept(completed("Second final", "item-b"), { partials: true })
        ?.text,
    ).toBe("Second final");
    expect(ledger.accept(delta(" continued"), { partials: true })?.text).toBe(
      "First continued",
    );
  });
  it("reset clears partials, final deduplication, and delta IDs", () => {
    const ledger = new VoiceTranscriptLedger();
    const event = { ...delta("old"), event_id: "reusable" };
    ledger.accept(event, { partials: true });
    ledger.accept(completed("old"), { partials: true });
    ledger.reset();
    expect(
      ledger.accept({ ...event, delta: "new" }, { partials: true })?.text,
    ).toBe("new");
    expect(ledger.accept(completed("new"), { partials: true })?.final).toBe(
      true,
    );
  });
  it("allows an empty final to clear an incorrect partial", () => {
    const ledger = new VoiceTranscriptLedger();
    ledger.accept(delta("Noise"), { partials: true });
    expect(ledger.accept(completed(""), { partials: true })).toMatchObject({
      text: "",
      final: true,
    });
    expect(ledger.accept(completed(""), { partials: true })).toBeNull();
  });
});

describe("dictated composer", () => {
  it("preserves typed baseline and replaces the same segment instead of appending it", () => {
    const ledger = new VoiceTranscriptLedger();
    let draft: DictationDraft = {
      initialText: "  Typed baseline",
      segments: [],
    };
    for (const event of [
      delta("Bon"),
      delta(" jour"),
      completed("Bonjour!"),
      completed("Second.", "item-b"),
    ]) {
      const update = ledger.accept(event, { partials: true });
      if (update) draft = updateDictationDraft(draft, update);
    }
    expect(dictatedText(draft)).toBe("  Typed baseline Bonjour! Second.");
    expect(draft.segments).toHaveLength(2);
  });
  it("avoids an extra separator when the baseline already ends with whitespace", () => {
    const segment = {
      key: "user:a:0",
      role: "user" as const,
      text: "Hello",
      final: false,
    };
    expect(
      dictatedText(
        updateDictationDraft({ initialText: "Typed\n", segments: [] }, segment),
      ),
    ).toBe("Typed\nHello");
    expect(
      dictatedText(
        updateDictationDraft({ initialText: "", segments: [] }, segment),
      ),
    ).toBe("Hello");
  });
  it("does not mutate input state or replace a final with a late partial", () => {
    const original: DictationDraft = { initialText: "Typed", segments: [] };
    const final = {
      key: "user:a:0",
      role: "user" as const,
      text: "Final",
      final: true,
    };
    const updated = updateDictationDraft(original, final);
    expect(original.segments).toHaveLength(0);
    expect(
      updateDictationDraft(updated, { ...final, text: "Late", final: false }),
    ).toBe(updated);
    expect(
      updateDictationDraft(updated, {
        ...final,
        key: "assistant:a:0",
        role: "assistant",
      }),
    ).toBe(updated);
  });
});
