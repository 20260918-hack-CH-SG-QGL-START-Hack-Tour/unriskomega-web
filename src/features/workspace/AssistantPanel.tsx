"use client";
import Image from "next/image";
import { type FormEvent, useRef, useState } from "react";
import { Icon } from "@/components/ui/data-display/Icon/Icon";
import { usePreferences } from "@/features/preferences/Preferences";
import { ApiError, api, record, string } from "@/lib/api/client";
import { clientConfig } from "@/lib/config";
import styles from "./AssistantStyles.module.css";
import { useDictationComposer } from "./useDictationComposer";
import { useVoice } from "./useVoice";

type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
  model?: string;
};
export function AssistantPanel({ portfolioId }: { portfolioId: string }) {
  const { t, locale } = usePreferences();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [imageMode, setImageMode] = useState(false);
  const [generatedImage, setImage] = useState("");
  const [imageModel, setImageModel] = useState("");
  const sequence = useRef(0);
  const dictation = useDictationComposer(input, setInput);
  const append = (role: Message["role"], text: string, model?: string) =>
    setMessages((values) => [
      ...values,
      { id: String(++sequence.current), role, text, model },
    ]);
  const voice = useVoice(
    portfolioId,
    locale,
    (text, mode, model, transcript) => {
      if (mode === "conversation")
        append("user", text, `${t.voice} · ${model}`);
      else dictation.accept(transcript);
    },
    (text, model) => append("assistant", text, `${t.voice} · ${model}`),
    dictation.discard,
  );
  async function submit(event?: FormEvent) {
    event?.preventDefault();
    if (!input.trim() || pending || voice.voiceMode === "transcription") return;
    const prompt = input.trim();
    setPending(true);
    setError("");
    if (!imageMode) {
      append("user", prompt);
      setInput("");
    }
    try {
      const data = record(
        await api(imageMode ? "images" : "chat", {
          method: "POST",
          body: JSON.stringify(
            imageMode
              ? { portfolioId, prompt, locale }
              : { portfolioId, message: prompt, locale },
          ),
        }),
      );
      if (imageMode) {
        const mime = string(data.mimeType);
        const b64 = string(data.image);
        if (
          !["image/png", "image/jpeg", "image/webp"].includes(mime) ||
          !/^[A-Za-z0-9+/=]+$/.test(b64) ||
          b64.length > 30_000_000
        )
          throw new Error("Invalid image");
        setImage(`data:${mime};base64,${b64}`);
        setImageModel(string(data.model));
      } else append("assistant", string(data.text), string(data.model ?? ""));
    } catch (reason) {
      setError(
        reason instanceof ApiError && reason.status === 503
          ? t.providerUnavailable
          : t.error,
      );
    } finally {
      setPending(false);
    }
  }
  const active =
    voice.voiceState === "active" ||
    voice.voiceState === "connecting" ||
    voice.voiceState === "finalizing";
  return (
    <section className={styles.panel}>
      <div className={styles.heading}>
        <span className={styles.assistantIcon}>
          <Icon name="spark" />
        </span>
        <div>
          <h2>{t.assistant}</h2>
          <span>{t.humanControl}</span>
        </div>
        <span className={styles.scope}>
          <Icon name="shield" width="13" />
          {t.portfolioOverview}
        </span>
      </div>
      <div className={styles.modeTabs}>
        <button
          type="button"
          aria-pressed={!imageMode}
          onClick={() => setImageMode(false)}
        >
          <Icon name="chat" width="16" />
          {t.askPortfolio}
        </button>
        <button
          type="button"
          aria-pressed={imageMode}
          onClick={() => {
            voice.cancel();
            setImageMode(true);
          }}
        >
          <Icon name="image" width="16" />
          {t.image}
        </button>
      </div>
      {imageMode ? (
        <div className={styles.imageArea}>
          <span className={styles.largeIcon}>
            <Icon name="image" width="32" height="32" />
          </span>
          <h3>{t.image}</h3>
          <p>{t.imageHint}</p>
          {generatedImage && (
            <figure>
              <Image
                unoptimized
                src={generatedImage}
                alt={t.imageLabel}
                width={1024}
                height={1024}
              />
              <figcaption>
                {t.imageLabel} · {imageModel}
              </figcaption>
            </figure>
          )}
        </div>
      ) : (
        <div className={styles.messages} aria-live="polite">
          {messages.length === 0 ? (
            <div className={styles.welcome}>
              <span className={styles.largeIcon}>
                <Icon name="spark" width="32" height="32" />
              </span>
              <h3>{t.askPortfolio}</h3>
              <p>{t.chatIntro}</p>
              <div className={styles.suggestions}>
                {[t.chatPrompt1, t.chatPrompt2].map((prompt) => (
                  <button
                    type="button"
                    key={prompt}
                    onClick={() => setInput(prompt)}
                    disabled={voice.voiceMode === "transcription"}
                  >
                    {prompt}
                    <Icon name="arrow" width="15" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <article
                key={message.id}
                className={
                  message.role === "user"
                    ? styles.userMessage
                    : styles.assistantMessage
                }
              >
                <span>
                  {message.role === "assistant" ? (
                    <Icon name="spark" width="16" />
                  ) : (
                    <Icon name="user" width="16" />
                  )}
                </span>
                <div>
                  <p>{message.text}</p>
                  {message.model && <small>{message.model}</small>}
                </div>
              </article>
            ))
          )}
        </div>
      )}
      {pending && (
        <output className={styles.status}>
          <span className={styles.pulse} />
          {t.thinking}
        </output>
      )}
      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}
      {voice.voiceState === "error" && (
        <p role="alert" className={styles.error}>
          {t.voiceError}
        </p>
      )}
      <form className={styles.composer} onSubmit={submit}>
        <label htmlFor="companion-message" className={styles.srOnly}>
          {imageMode ? t.image : t.askPortfolio}
        </label>
        <textarea
          id="companion-message"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={imageMode ? t.imagePlaceholder : t.chatPlaceholder}
          rows={3}
          readOnly={voice.voiceMode === "transcription"}
          maxLength={
            imageMode
              ? clientConfig.maxImagePromptLength
              : clientConfig.maxMessageLength
          }
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void submit();
            }
          }}
        />
        <div className={styles.composerActions}>
          <div>
            {!imageMode && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    active ? voice.stop() : void voice.start("conversation")
                  }
                  aria-label={active ? t.stopVoice : t.voice}
                  title={active ? t.stopVoice : t.voice}
                  aria-pressed={active}
                  disabled={voice.voiceState === "finalizing"}
                >
                  <Icon name={active ? "stop" : "mic"} width="18" />
                  {active ? t.stopVoice : t.voice}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    dictation.begin();
                    void voice.start("transcription");
                  }}
                  disabled={active}
                  title={t.dictate}
                  aria-label={t.dictate}
                >
                  <Icon name="book" width="18" />
                </button>
              </>
            )}
          </div>
          <button
            type="submit"
            disabled={
              pending || !input.trim() || voice.voiceMode === "transcription"
            }
            className={styles.send}
            aria-label={t.send}
          >
            <Icon name="send" width="19" />
          </button>
        </div>
      </form>
      {active && (
        <output className={styles.voiceStatus}>
          <span className={styles.pulse} />
          {voice.voiceState === "connecting"
            ? t.voiceConnecting
            : voice.voiceState === "finalizing"
              ? t.voiceFinalizing
              : t.voiceActive}
        </output>
      )}
      <footer>
        <Icon name="shield" width="12" />
        {t.noTrading} · {t.voiceLimit}
      </footer>
    </section>
  );
}
