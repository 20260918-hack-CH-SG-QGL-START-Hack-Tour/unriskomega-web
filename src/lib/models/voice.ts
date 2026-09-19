export type SpokenTranscript = {
  key: string;
  role: "user" | "assistant";
  text: string;
};
export class VoiceTranscriptLedger {
  private readonly seen = new Set<string>();
  reset() {
    this.seen.clear();
  }
  accept(value: unknown): SpokenTranscript | null {
    if (typeof value !== "object" || value === null) return null;
    const event = value as Record<string, unknown>;
    const role =
      event.type === "conversation.item.input_audio_transcription.completed"
        ? "user"
        : event.type === "response.output_audio_transcript.done" ||
            event.type === "response.audio_transcript.done"
          ? "assistant"
          : null;
    if (
      !role ||
      typeof event.transcript !== "string" ||
      !event.transcript.trim()
    )
      return null;
    const id =
      typeof event.item_id === "string"
        ? event.item_id
        : typeof event.response_id === "string"
          ? event.response_id
          : typeof event.event_id === "string"
            ? event.event_id
            : event.transcript;
    const key = `${role}:${id}:${typeof event.content_index === "number" ? event.content_index : 0}`;
    if (this.seen.has(key)) return null;
    this.seen.add(key);
    return { key, role, text: event.transcript };
  }
}
