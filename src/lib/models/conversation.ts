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
type ConversationMessage = Pick<
  ChatMessage,
  "role" | "text" | "image" | "components" | "evidence" | "visualText"
>;
function boundedText(value: string, limit: number): string {
  const bytes = encoder.encode(value.trim());
  if (bytes.length <= limit) return value.trim();
  // Streaming decoding drops an incomplete final UTF-8 code point.
  return new TextDecoder().decode(bytes.subarray(0, limit), { stream: true });
}

export function conversationNote(
  message: ConversationMessage,
): ConversationTurn {
  const briefing = message.image?.briefing;
  const visuals = message.components?.length
    ? `\nPreviously displayed visuals (conversation context): ${JSON.stringify({
        components: message.components,
        evidence: message.evidence,
      })}`
    : "";
  const image = briefing
    ? `\nIllustrative image context: ${JSON.stringify(briefing)}`
    : "";
  const extra = `${visuals}${image}${message.visualText ? `\nVisual explanation: ${message.visualText}` : ""}`;
  return {
    role: message.role,
    content: boundedText(
      `${boundedText(message.text, extra ? 2400 : 4000)}${extra}`,
      4000,
    ),
  };
}

export function conversationHistory(
  messages: ConversationMessage[],
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
