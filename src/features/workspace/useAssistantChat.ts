"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, api } from "@/lib/api/client";
import { clientConfig } from "@/lib/config";
import type { Locale, Messages } from "@/lib/i18n";
import type { ChatCopy } from "@/lib/i18n/chat";
import {
  type ChatMessage,
  imagePrompt,
  parseChatAnswer,
  parseGeneratedImage,
} from "@/lib/models/chat";

export function useAssistantChat(
  portfolioId: string,
  locale: Locale,
  t: Messages,
  copy: ChatCopy,
) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState<"chat" | "image" | null>(null);
  const [error, setError] = useState("");
  const sequence = useRef(0);
  const request = useRef<AbortController | null>(null);
  useEffect(
    () => () => {
      request.current?.abort();
      request.current = null;
    },
    [],
  );
  const append = useCallback((message: Omit<ChatMessage, "id">) => {
    setMessages((current) => [
      ...current,
      { ...message, id: String(++sequence.current) },
    ]);
  }, []);
  function cancel() {
    request.current?.abort();
    request.current = null;
    setPending(null);
  }
  async function submit() {
    if (!input.trim() || request.current) return;
    const prompt = input.trim();
    const image = imagePrompt(prompt);
    if (
      image === "" ||
      (image?.length ?? 0) > clientConfig.maxImagePromptLength
    ) {
      setError(image === "" ? copy.imageRequired : copy.imageTooLong);
      return;
    }
    const controller = new AbortController();
    request.current = controller;
    setPending(image === null ? "chat" : "image");
    setError("");
    append({ role: "user", text: prompt });
    setInput("");
    try {
      const data = await api(image === null ? "chat" : "images", {
        method: "POST",
        signal: AbortSignal.any([
          controller.signal,
          AbortSignal.timeout(clientConfig.requestTimeoutMs),
        ]),
        body: JSON.stringify(
          image === null
            ? { portfolioId, message: prompt, locale }
            : { portfolioId, prompt: image, locale },
        ),
      });
      if (request.current !== controller) return;
      append(
        image === null
          ? { role: "assistant", ...parseChatAnswer(data) }
          : {
              role: "assistant",
              text: t.imageHint,
              image: parseGeneratedImage(data),
            },
      );
    } catch (reason) {
      if (request.current === controller && !controller.signal.aborted)
        setError(
          reason instanceof ApiError && reason.status === 503
            ? t.providerUnavailable
            : t.error,
        );
    } finally {
      if (request.current === controller) {
        request.current = null;
        setPending(null);
      }
    }
  }
  return { messages, input, setInput, pending, error, append, submit, cancel };
}
