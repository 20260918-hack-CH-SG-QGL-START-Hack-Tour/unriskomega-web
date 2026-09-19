import { expect, spyOn, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import type { ChatMessage } from "@/lib/models/chat";
import { useVoiceCards } from "./useVoiceCards";

function mockFetch(
  callback: (...args: Parameters<typeof fetch>) => Promise<Response>,
) {
  return spyOn(globalThis, "fetch").mockImplementation(
    Object.assign(callback, { preconnect() {} }),
  );
}

const answer = {
  text: "Verified visual summary",
  model: "verified-model",
  evidence: [{ id: "E1", label: "Snapshot", locator: "portfolio.aum" }],
  components: [
    {
      type: "metric",
      label: "Value",
      value: "1000",
      detail: "CHF",
      sourceIds: ["E1"],
    },
  ],
};
function harness() {
  const messages = new Map<string, ChatMessage>();
  let cards: ReturnType<typeof useVoiceCards> | undefined;
  function Harness() {
    cards = useVoiceCards(
      "portfolio-1",
      "en",
      () => ({
        chatSessionId: "conversation-id",
        history: [{ role: "user", content: "Earlier question" }],
      }),
      (update) => {
        messages.set(update.id, {
          text: "",
          ...messages.get(update.id),
          ...update,
        });
      },
    );
    return null;
  }
  renderToStaticMarkup(<Harness />);
  if (!cards) throw new Error("Missing hook");
  return { cards, messages };
}
test("a spoken question automatically requests verified cards without replacing its spoken answer", async () => {
  let body: Record<string, unknown> = {};
  const fetch = mockFetch(async (_url, options) => {
    body = JSON.parse(String(options?.body));
    return Response.json(answer);
  });
  try {
    const { cards, messages } = harness();
    cards.receiveResponse(
      {
        key: "turn",
        role: "assistant",
        text: "Actual spoken answer",
        final: true,
      },
      "voice-model",
    );
    await cards.receiveQuestion(
      { key: "turn", role: "user", text: "Show value", final: true },
      "voice-model",
    );
    expect(messages.size).toBe(2);
    expect(messages.get("voice-assistant-turn")).toMatchObject({
      text: "Actual spoken answer",
      visualText: "Verified visual summary",
      visualPending: false,
      components: answer.components,
    });
    expect(body).toMatchObject({
      portfolioId: "portfolio-1",
      chatSessionId: "conversation-id",
      history: [{ role: "user", content: "Earlier question" }],
      message: "Show value",
    });
  } finally {
    fetch.mockRestore();
  }
});
test("spoken image requests use the same session context and attach their image to the turn", async () => {
  let path = "";
  const fetch = mockFetch(async (url) => {
    path = String(url);
    return Response.json({
      mimeType: "image/png",
      image: "YWJjZA==",
      model: "image-model",
    });
  });
  try {
    const { cards, messages } = harness();
    await cards.receiveQuestion(
      {
        key: "image",
        role: "user",
        text: "Create an image of this portfolio",
        final: true,
      },
      "voice-model",
    );
    expect(path).toBe("/api/v1/images");
    expect(messages.get("voice-assistant-image")?.image?.src).toBe(
      "data:image/png;base64,YWJjZA==",
    );
  } finally {
    fetch.mockRestore();
  }
});
test("visual provider failure is scoped to the current turn", async () => {
  const fetch = mockFetch(
    async () => new Response("unavailable", { status: 503 }),
  );
  try {
    const { cards, messages } = harness();
    cards.receiveResponse(
      {
        key: "turn",
        role: "assistant",
        text: "Audio is still available",
        final: true,
      },
      "voice-model",
    );
    await cards.receiveQuestion(
      { key: "turn", role: "user", text: "Show value", final: true },
      "voice-model",
    );
    expect(messages.get("voice-assistant-turn")).toMatchObject({
      text: "Audio is still available",
      visualPending: false,
      visualError: true,
    });
  } finally {
    fetch.mockRestore();
  }
});
