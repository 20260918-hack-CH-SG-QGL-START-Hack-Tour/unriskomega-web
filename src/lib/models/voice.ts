export type SpokenTranscript = {
  key: string;
  role: "user" | "assistant";
  text: string;
  final: boolean;
};
export type DictationDraft = {
  initialText: string;
  segments: SpokenTranscript[];
};
export function updateDictationDraft(
  draft: DictationDraft,
  update: SpokenTranscript,
): DictationDraft {
  if (update.role !== "user") return draft;
  const index = draft.segments.findIndex(
    (segment) => segment.key === update.key,
  );
  if (index >= 0 && draft.segments[index].final) return draft;
  const segments = [...draft.segments];
  if (index < 0) segments.push(update);
  else segments[index] = update;
  return { initialText: draft.initialText, segments };
}
export function dictatedText(draft: DictationDraft): string {
  return draft.segments.reduce((text, segment) => {
    if (!segment.text) return text;
    const separator =
      text && !/\s$/.test(text) && !/^\s/.test(segment.text) ? " " : "";
    return `${text}${separator}${segment.text}`;
  }, draft.initialText);
}
function transcriptKey(
  event: Record<string, unknown>,
  role: SpokenTranscript["role"],
  text: string,
): string | null {
  if (
    event.content_index !== undefined &&
    (typeof event.content_index !== "number" ||
      !Number.isInteger(event.content_index) ||
      event.content_index < 0)
  )
    return null;
  const id = [event.item_id, event.response_id, event.event_id].find(
    (value): value is string => typeof value === "string" && value.length > 0,
  );
  return `${role}:${id ?? text}:${event.content_index ?? 0}`;
}
function transcriptRole(
  event: Record<string, unknown>,
): SpokenTranscript["role"] | null {
  if (
    event.type === "conversation.item.input_audio_transcription.delta" ||
    event.type === "conversation.item.input_audio_transcription.completed"
  )
    return "user";
  if (
    event.type === "response.output_audio_transcript.done" ||
    event.type === "response.audio_transcript.done"
  )
    return "assistant";
  return null;
}
export class VoiceTranscriptLedger {
  private readonly seen = new Set<string>();
  private readonly partials = new Map<string, string>();
  private readonly deltaEvents = new Set<string>();
  reset() {
    this.seen.clear();
    this.partials.clear();
    this.deltaEvents.clear();
  }
  accept(
    value: unknown,
    options: { partials?: boolean } = {},
  ): SpokenTranscript | null {
    if (typeof value !== "object" || value === null) return null;
    const event = value as Record<string, unknown>;
    const delta =
      event.type === "conversation.item.input_audio_transcription.delta";
    if (
      delta &&
      (!options.partials || typeof event.item_id !== "string" || !event.item_id)
    )
      return null;
    const role = transcriptRole(event);
    const text = delta ? event.delta : event.transcript;
    if (!role || typeof text !== "string") return null;
    const key = transcriptKey(event, role, text);
    if (!key || this.seen.has(key)) return null;
    if (delta) return this.acceptDelta(event, key, text);
    if (!text.trim() && !(options.partials && this.partials.has(key)))
      return null;
    this.seen.add(key);
    this.partials.delete(key);
    return { key, role, text, final: true };
  }
  private acceptDelta(
    event: Record<string, unknown>,
    key: string,
    delta: string,
  ): SpokenTranscript | null {
    if (!delta) return null;
    if (typeof event.event_id === "string" && event.event_id) {
      const eventKey = `${key}:${event.event_id}`;
      if (this.deltaEvents.has(eventKey)) return null;
      this.deltaEvents.add(eventKey);
    }
    const text = (this.partials.get(key) ?? "") + delta;
    this.partials.set(key, text);
    return { key, role: "user", text, final: false };
  }
}
