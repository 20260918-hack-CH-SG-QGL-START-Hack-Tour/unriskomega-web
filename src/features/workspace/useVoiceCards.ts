"use client";
import { useEffect, useRef } from "react";
import { api } from "@/lib/api/client";
import { clientConfig } from "@/lib/config";
import type { Locale } from "@/lib/i18n";
import {
  type ChatMessage,
  imagePrompt,
  parseChatAnswer,
  parseGeneratedImage,
} from "@/lib/models/chat";
import type { ConversationContext } from "@/lib/models/conversation";
import type { SpokenTranscript } from "@/lib/models/voice";

type MessageUpdate = Pick<ChatMessage, "id" | "role"> & Partial<ChatMessage>;
export function useVoiceCards(
  portfolioId: string,
  locale: Locale,
  context: (excludeIds?: string[]) => ConversationContext,
  upsert: (update: MessageUpdate) => void,
) {
  const requests = useRef(new Map<string, AbortController>());
  const callbacks = useRef({ context, upsert });
  callbacks.current = { context, upsert };
  useEffect(
    () => () => {
      for (const request of requests.current.values()) request.abort();
      requests.current.clear();
    },
    [],
  );

  function receiveResponse(transcript: SpokenTranscript, model: string) {
    const userId = `voice-user-${transcript.key}`;
    callbacks.current.upsert({ id: userId, role: "user" });
    callbacks.current.upsert({
      id: `voice-assistant-${transcript.key}`,
      role: "assistant",
      text: transcript.text,
      spoken: true,
      model,
    });
  }
  async function receiveQuestion(transcript: SpokenTranscript, model: string) {
    const userId = `voice-user-${transcript.key}`;
    const id = `voice-assistant-${transcript.key}`;
    const scope = callbacks.current.context([userId, id]);
    callbacks.current.upsert({
      id: userId,
      role: "user",
      text: transcript.text,
      model,
    });
    callbacks.current.upsert({
      id,
      role: "assistant",
      visualPending: true,
      visualError: false,
    });
    requests.current.get(id)?.abort();
    requests.current.delete(id);
    if (requests.current.size >= clientConfig.maxVoiceVisualRequests) {
      const oldest = requests.current.entries().next().value;
      if (oldest) {
        oldest[1].abort();
        requests.current.delete(oldest[0]);
        callbacks.current.upsert({
          id: oldest[0],
          role: "assistant",
          visualPending: false,
          visualError: true,
        });
      }
    }
    const controller = new AbortController();
    requests.current.set(id, controller);
    try {
      const image = imagePrompt(transcript.text);
      if (
        image === "" ||
        (image?.length ?? 0) > clientConfig.maxImagePromptLength
      )
        throw new Error("Invalid image prompt");
      const data = await api(image === null ? "chat" : "images", {
        method: "POST",
        signal: AbortSignal.any([
          controller.signal,
          AbortSignal.timeout(clientConfig.requestTimeoutMs),
        ]),
        body: JSON.stringify({
          portfolioId,
          locale,
          ...scope,
          ...(image === null
            ? { message: transcript.text }
            : { prompt: image }),
        }),
      });
      if (requests.current.get(id) !== controller) return;
      const answer = image === null ? parseChatAnswer(data) : null;
      callbacks.current.upsert({
        id,
        role: "assistant",
        visualPending: false,
        visualError: false,
        ...(answer
          ? {
              components: answer.components,
              evidence: answer.evidence,
              warnings: answer.warnings,
              outcome: answer.outcome,
              visualText: answer.text,
            }
          : { image: parseGeneratedImage(data) }),
      });
    } catch {
      if (requests.current.get(id) === controller && !controller.signal.aborted)
        callbacks.current.upsert({
          id,
          role: "assistant",
          visualPending: false,
          visualError: true,
        });
    } finally {
      if (requests.current.get(id) === controller) requests.current.delete(id);
    }
  }
  return { receiveQuestion, receiveResponse };
}
