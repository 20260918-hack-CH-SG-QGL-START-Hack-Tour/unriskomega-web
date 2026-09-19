import type { SpokenTranscript } from "./voice";

// Commit order is authoritative: transcription completion can arrive after
// the corresponding response or after a later input item.
export class VoiceTurnLedger {
  private readonly items = new Map<string, string>();
  private readonly responses = new Map<string, string>();
  private readonly texts = new Map<string, Map<string, string>>();
  private pending: string | null = null;
  private latest: string | null = null;
  constructor(private readonly callId: string) {}

  observe(event: Record<string, unknown>) {
    if (
      event.type === "input_audio_buffer.committed" &&
      typeof event.item_id === "string"
    )
      this.input(event.item_id);
    if (event.type === "response.created") {
      const response = event.response as Record<string, unknown> | undefined;
      if (response && typeof response.id === "string") {
        const turn =
          this.pending ?? this.latest ?? `${this.callId}:${response.id}`;
        this.responses.set(response.id, turn);
        this.latest = turn;
        this.pending = null;
      }
    }
    if (event.type === "response.output_item.added") {
      const item = event.item as Record<string, unknown> | undefined;
      const turn =
        typeof event.response_id === "string"
          ? this.responses.get(event.response_id)
          : undefined;
      if (item && typeof item.id === "string" && turn)
        this.items.set(item.id, turn);
    }
  }
  private input(id: string) {
    const existing = this.items.get(id);
    if (existing) return existing;
    const turn = this.pending ?? `${this.callId}:${id}`;
    this.pending = turn;
    this.latest = turn;
    this.items.set(id, turn);
    const texts = this.texts.get(turn) ?? new Map<string, string>();
    texts.set(id, "");
    this.texts.set(turn, texts);
    return turn;
  }
  attach(
    event: Record<string, unknown>,
    transcript: SpokenTranscript,
  ): SpokenTranscript {
    const item =
      typeof event.item_id === "string" ? event.item_id : transcript.key;
    if (transcript.role === "user") {
      const turn = this.input(item);
      const texts = this.texts.get(turn) as Map<string, string>;
      texts.set(item, transcript.text);
      return {
        ...transcript,
        key: turn,
        text: [...texts.values()].filter(Boolean).join(" "),
      };
    }
    const response =
      typeof event.response_id === "string"
        ? this.responses.get(event.response_id)
        : undefined;
    return {
      ...transcript,
      key:
        response ??
        this.items.get(item) ??
        this.latest ??
        `${this.callId}:${item}`,
    };
  }
}

export function voiceDurationSeconds(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isInteger(value) && value > 0
    ? Math.min(value, 3600)
    : fallback;
}

export function muteMicrophone(
  stream: Pick<MediaStream, "getAudioTracks"> | null,
  muted: boolean,
) {
  for (const track of stream?.getAudioTracks() ?? []) track.enabled = !muted;
}

export function terminalVoiceError(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const error = value as Record<string, unknown>;
  return (
    error.type === "authentication_error" ||
    error.type === "permission_error" ||
    error.code === "session_expired" ||
    error.code === "invalid_api_key"
  );
}
