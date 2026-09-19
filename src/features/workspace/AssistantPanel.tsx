"use client";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/data-display/Icon/Icon";
import { Tooltip } from "@/components/ui/overlays/Tooltip/Tooltip";
import { DocumentLibrary } from "@/features/documents/DocumentLibrary";
import { usePreferences } from "@/features/preferences/Preferences";
import { clientConfig } from "@/lib/config";
import { chatMessages } from "@/lib/i18n/chat";
import { conversationMessages } from "@/lib/i18n/conversation";
import { imagePrompt } from "@/lib/models/chat";
import {
  type ConversationContext,
  type ConversationTurn,
  conversationNote,
} from "@/lib/models/conversation";
import type { Portfolio } from "@/lib/models/portfolio";
import { AssistantMessages } from "./AssistantMessages";
import styles from "./AssistantStyles.module.css";
import { ConversationHeader } from "./ConversationHeader";
import { contextMessages } from "./contextMessages";
import { ModelSelector } from "./ModelSelector";
import modelStyles from "./ModelSelectorStyles.module.css";
import { PortfolioContext } from "./PortfolioContext";
import { useAssistantChat } from "./useAssistantChat";
import { useDictationComposer } from "./useDictationComposer";
import type { ModelSelection } from "./useModelSelection";
import { useVoice } from "./useVoice";
import { useVoiceCards } from "./useVoiceCards";
import { VoiceControls } from "./VoiceControls";

export function AssistantPanel({
  portfolioId,
  clientId,
  onImported,
  onUpdated,
  visible,
  clientAlias,
  portfolioName,
  portfolio,
  models,
  onContext,
}: {
  portfolioId: string;
  clientId: string;
  onImported: (id: string, clientId?: string) => void;
  onUpdated: () => void;
  visible: boolean;
  clientAlias: string;
  portfolioName: string;
  portfolio: Portfolio;
  models: ModelSelection;
  onContext: (
    portfolioId: string,
    context: (() => ConversationContext) | null,
  ) => void;
}) {
  const { t, locale } = usePreferences();
  const copy = chatMessages[locale];
  const [refreshedVoice, setRefreshedVoice] = useState(false);
  const voiceNotes = useRef<((turn: ConversationTurn) => void) | null>(null);
  const chat = useAssistantChat(
    portfolioId,
    locale,
    t,
    copy,
    (message) => voiceNotes.current?.(conversationNote(message)),
    models.model,
  );
  useEffect(() => {
    onContext(portfolioId, chat.context);
    return () => onContext(portfolioId, null);
  }, [onContext, portfolioId, chat.context]);
  const conversation = conversationMessages[locale];
  const cards = useVoiceCards(
    portfolioId,
    locale,
    chat.context,
    chat.upsert,
    models.model,
  );
  const composer = useRef<HTMLTextAreaElement>(null);
  const dictation = useDictationComposer(chat.input, chat.setInput);
  const voice = useVoice(
    portfolioId,
    locale,
    (_text, mode, model, transcript) => {
      if (mode === "conversation")
        void cards.receiveQuestion(transcript, `${t.voice} · ${model}`);
      else dictation.accept(transcript);
    },
    (_text, model, transcript) =>
      cards.receiveResponse(transcript, `${t.voice} · ${model}`),
    dictation.discard,
    chat.context,
  );
  voiceNotes.current = voice.remember;
  useEffect(() => {
    if (!visible) voice.cancel();
  }, [visible, voice.cancel]);
  const active = ["active", "connecting", "finalizing"].includes(
    voice.voiceState,
  );
  const dictating = voice.voiceMode === "transcription";
  const wantsImage = imagePrompt(chat.input) !== null;
  function submit(event?: FormEvent) {
    event?.preventDefault();
    if (dictating) return;
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
      <PortfolioContext portfolio={portfolio} />
      <div className={styles.attachments}>
        <DocumentLibrary
          compact
          clientId={clientId}
          portfolioId={portfolioId}
          chatSessionId={chat.sessionId}
          onImported={onImported}
          onUpdated={() => {
            if (
              ["active", "connecting", "finalizing"].includes(voice.voiceState)
            ) {
              voice.cancel();
              setRefreshedVoice(true);
            }
            chat.cancel();
            onUpdated();
          }}
        />
      </div>
      {refreshedVoice && (
        <output className={styles.status}>
          {contextMessages[locale].refreshedVoice}
        </output>
      )}
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
      {voice.recoverableError && (
        <output className={styles.status}>
          {conversation.voiceRecoverable}
        </output>
      )}
      <form className={styles.composer} onSubmit={submit}>
        <div className={modelStyles.chat}>
          <ModelSelector id="chat-analysis-model" selection={models} explain />
        </div>
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
            <VoiceControls voice={voice} beginDictation={dictation.begin} />
            <Tooltip label={copy.imageHelp}>
              <button
                type="button"
                onClick={() => {
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
              : voice.muted
                ? conversation.muted
                : voice.speaking
                  ? conversation.speaking
                  : conversation.listening}
          <span>
            {conversation.voiceBudget} ·{" "}
            {Math.floor(voice.remainingSeconds / 60)}:
            {String(voice.remainingSeconds % 60).padStart(2, "0")}
          </span>
        </output>
      )}
      <footer>
        <Icon name="shield" width="12" />
        {t.noTrading} · {conversation.voiceLimit}
      </footer>
    </section>
  );
}
