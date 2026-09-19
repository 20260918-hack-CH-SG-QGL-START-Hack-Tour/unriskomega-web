import { expect, test } from "bun:test";
import { conversationHistory } from "@/lib/models/conversation";
import type { Briefing } from "@/lib/models/portfolio";
import { briefingConversationMessage } from "./briefingConversation";

const briefing: Briefing = {
  id: "briefing-identity",
  mode: "provider-grounded",
  model: "chosen-analysis",
  sections: [],
  sources: [],
  generatedAt: "2026-09-19T15:00:00Z",
  assistantResponse: {
    model: "chosen-analysis",
    text: "Confirm the liquidity need before reviewing these allocation gaps.",
    components: [
      {
        type: "metric",
        label: "Source value",
        value: "1000",
        detail: "CHF",
        sourceIds: ["E1"],
      },
    ],
    evidence: [
      { id: "E1", label: "Portfolio snapshot", locator: "portfolio.aum" },
    ],
    warnings: [],
  },
};
test("generated briefing history retains actions, structured evidence and actual model with stable deduplication identity", () => {
  const message = briefingConversationMessage(briefing);
  expect(message).not.toBeNull();
  expect(message?.model).toBe("chosen-analysis");
  expect(message?.id).toBe(briefingConversationMessage(briefing)?.id);
  if (!message) throw new Error("Generated briefing message is missing");
  const history = conversationHistory([message]);
  expect(history[0].content).toContain("Confirm the liquidity need");
  expect(history[0].content).toContain("Source value");
  expect(history[0].content).toContain("portfolio.aum");
});
test("fallbacks and responses without a generated briefing identity cannot be promoted into assistant conversation history", () => {
  expect(
    briefingConversationMessage({ ...briefing, assistantResponse: undefined }),
  ).toBeNull();
  expect(
    briefingConversationMessage({ ...briefing, id: undefined }),
  ).toBeNull();
  expect(
    briefingConversationMessage({
      ...briefing,
      mode: "deterministic-fallback",
    }),
  ).toBeNull();
});
