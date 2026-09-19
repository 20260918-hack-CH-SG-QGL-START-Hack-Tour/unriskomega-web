import type { ChatMessage } from "@/lib/models/chat";
import type { ConversationContext } from "@/lib/models/conversation";
import type { Briefing } from "@/lib/models/portfolio";

export type WorkspaceConversation = {
  context: () => ConversationContext;
  rememberBriefing: (briefing: Briefing) => void;
};

export function briefingConversationMessage(
  briefing: Briefing,
): ChatMessage | null {
  if (
    !briefing.id ||
    !briefing.assistantResponse ||
    briefing.mode === "deterministic-fallback"
  )
    return null;
  return {
    ...briefing.assistantResponse,
    id: `briefing-${briefing.id}`,
    role: "assistant",
  };
}
