import type { ChatMessage } from "./chat";

export type ConversationTurn = {
  role: "user" | "assistant";
  content: string;
};
export type ConversationContext = {
  chatSessionId: string;
  history: ConversationTurn[];
};

const encoder = new TextEncoder();
function boundedText(value: string, limit: number): string {
  const bytes = encoder.encode(value.trim());
  if (bytes.length <= limit) return value.trim();
  // Streaming decoding drops an incomplete final UTF-8 code point.
  return new TextDecoder().decode(bytes.subarray(0, limit), { stream: true });
}

export function conversationNote(
  message: Pick<ChatMessage, "role" | "text" | "image">,
): ConversationTurn {
  const briefing = message.image?.briefing;
  return {
    role: message.role,
    content: boundedText(
      `${message.text}${briefing ? `\nIllustrative image context: ${JSON.stringify(briefing)}` : ""}`,
      4000,
    ),
  };
}

export function conversationHistory(
  messages: Pick<ChatMessage, "role" | "text" | "image">[],
): ConversationTurn[] {
  const result: ConversationTurn[] = [];
  let remaining = 16000;
  for (let i = messages.length - 1; i >= 0 && result.length < 12; i--) {
    const message = conversationNote(messages[i]);
    if (!message.content) continue;
    const content = boundedText(message.content, Math.min(4000, remaining));
    if (!content) break;
    result.unshift({ role: message.role, content });
    remaining -= encoder.encode(content).length;
    if (!remaining) break;
  }
  return result;
}
