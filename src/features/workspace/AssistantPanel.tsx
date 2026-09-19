"use client";
import { type FormEvent, useRef } from "react";
import { Icon } from "@/components/ui/data-display/Icon/Icon";
import { Tooltip } from "@/components/ui/overlays/Tooltip/Tooltip";
import { usePreferences } from "@/features/preferences/Preferences";
import { clientConfig } from "@/lib/config";
import { chatMessages } from "@/lib/i18n/chat";
import { imagePrompt } from "@/lib/models/chat";
import { AssistantMessages } from "./AssistantMessages";
import styles from "./AssistantStyles.module.css";
import { ConversationHeader } from "./ConversationHeader";
import { useAssistantChat } from "./useAssistantChat";
import { useDictationComposer } from "./useDictationComposer";
import { useVoice } from "./useVoice";

export function AssistantPanel({
  portfolioId,
  clientAlias,
  portfolioName,
}: {
  portfolioId: string;
  clientAlias: string;
  portfolioName: string;
}) {
  const { t, locale } = usePreferences();
  const copy = chatMessages[locale];
  const chat = useAssistantChat(portfolioId, locale, t, copy);
  const composer = useRef<HTMLTextAreaElement>(null);
  const dictation = useDictationComposer(chat.input, chat.setInput);
  const voice = useVoice(
    portfolioId,
    locale,
    (text, mode, model, transcript) => {
      if (mode === "conversation")
        chat.append({ role: "user", text, model: `${t.voice} · ${model}` });
      else dictation.accept(transcript);
    },
    (text, model) =>
      chat.append({ role: "assistant", text, model: `${t.voice} · ${model}` }),
    dictation.discard,
    chat.context,
  );
  const active = ["active", "connecting", "finalizing"].includes(
    voice.voiceState,
  );
  const dictating = voice.voiceMode === "transcription";
  const wantsImage = imagePrompt(chat.input) !== null;
  function submit(event?: FormEvent) {
    event?.preventDefault();
    if (dictating) return;
    if (wantsImage && active) voice.cancel();
    void chat.submit();
  }
  function choosePrompt(prompt: string) {
    chat.setInput(prompt);
    composer.current?.focus();
  }
  return (
    <section className={styles.panel}>
      <ConversationHeader
        clientAlias={clientAlias}
        portfolioName={portfolioName}
        sessionId={chat.sessionId}
      />
      <AssistantMessages
        messages={chat.messages}
        onPrompt={choosePrompt}
        disabled={dictating || !!chat.pending}
      />
      {chat.pending && (
        <output className={styles.status}>
          <span className={styles.pulse} />
          {chat.pending === "image" ? copy.imageGenerating : t.thinking}
          <button type="button" onClick={chat.cancel}>
            {copy.cancel}
          </button>
        </output>
      )}
      {chat.error && (
        <p role="alert" className={styles.error}>
          {chat.error}
        </p>
      )}
      {voice.voiceState === "error" && (
        <p role="alert" className={styles.error}>
          {t.voiceError}
        </p>
      )}
      <form className={styles.composer} onSubmit={submit}>
        <label htmlFor="companion-message" className={styles.srOnly}>
          {t.askPortfolio}
        </label>
        <textarea
          id="companion-message"
          ref={composer}
          value={chat.input}
          onChange={(event) => chat.setInput(event.target.value)}
          placeholder={wantsImage ? copy.imagePlaceholder : t.chatPlaceholder}
          rows={3}
          readOnly={dictating}
          maxLength={clientConfig.maxMessageLength}
          onKeyDown={(event) => {
            if (
              event.key === "Enter" &&
              !event.shiftKey &&
              !event.nativeEvent.isComposing
            ) {
              event.preventDefault();
              submit();
            }
          }}
        />
        {wantsImage && <p className={styles.imageHint}>{t.imageHint}</p>}
        <div className={styles.composerActions}>
          <div>
            <Tooltip label={active ? t.stopVoice : copy.voiceHelp}>
              <button
                type="button"
                onClick={() =>
                  active ? voice.stop() : void voice.start("conversation")
                }
                aria-label={active ? t.stopVoice : t.voice}
                aria-pressed={active}
                disabled={voice.voiceState === "finalizing"}
              >
                <Icon name={active ? "stop" : "mic"} width="18" />
                <span>{active ? t.stopVoice : t.voice}</span>
              </button>
            </Tooltip>
            <Tooltip label={copy.dictateHelp}>
              <button
                type="button"
                onClick={() => {
                  dictation.begin();
                  void voice.start("transcription");
                }}
                disabled={active}
                aria-label={t.dictate}
              >
                <Icon name="book" width="18" />
              </button>
            </Tooltip>
            <Tooltip label={copy.imageHelp}>
              <button
                type="button"
                onClick={() => {
                  voice.cancel();
                  choosePrompt("/image ");
                }}
                disabled={dictating || !!chat.pending}
                aria-label={t.image}
              >
                <Icon name="image" width="18" />
              </button>
            </Tooltip>
          </div>
          <Tooltip label={copy.sendHelp} align="end">
            <button
              type="submit"
              disabled={!!chat.pending || !chat.input.trim() || dictating}
              className={styles.send}
              aria-label={t.send}
            >
              <Icon name="send" width="19" />
            </button>
          </Tooltip>
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
