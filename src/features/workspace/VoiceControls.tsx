"use client";
import { Icon } from "@/components/ui/data-display/Icon/Icon";
import { Tooltip } from "@/components/ui/overlays/Tooltip/Tooltip";
import { usePreferences } from "@/features/preferences/Preferences";
import { chatMessages } from "@/lib/i18n/chat";
import { conversationMessages } from "@/lib/i18n/conversation";
import type { useVoice } from "./useVoice";

export function VoiceControls({
  voice,
  beginDictation,
}: {
  voice: ReturnType<typeof useVoice>;
  beginDictation: () => void;
}) {
  const { t, locale } = usePreferences();
  const copy = conversationMessages[locale];
  const chat = chatMessages[locale];
  const active = ["active", "connecting", "finalizing"].includes(
    voice.voiceState,
  );
  const dictating = voice.voiceMode === "transcription";
  return (
    <>
      <Tooltip
        label={
          active ? (dictating ? t.stopVoice : copy.endCall) : chat.voiceHelp
        }
      >
        <button
          type="button"
          onClick={() =>
            active ? voice.stop() : void voice.start("conversation")
          }
          aria-label={
            active ? (dictating ? t.stopVoice : copy.endCall) : t.voice
          }
          aria-pressed={active}
          disabled={voice.voiceState === "finalizing"}
        >
          <Icon name={active ? "stop" : "mic"} width="18" />
          <span>
            {active ? (dictating ? t.stopVoice : copy.endCall) : t.voice}
          </span>
        </button>
      </Tooltip>
      {active && !dictating && (
        <Tooltip label={voice.muted ? copy.unmute : copy.mute}>
          <button
            type="button"
            onClick={voice.toggleMute}
            disabled={voice.voiceState !== "active"}
            aria-label={voice.muted ? copy.unmute : copy.mute}
            aria-pressed={voice.muted}
          >
            <Icon name="mic" width="18" />
            <span>{voice.muted ? copy.unmute : copy.mute}</span>
          </button>
        </Tooltip>
      )}
      <Tooltip label={chat.dictateHelp}>
        <button
          type="button"
          onClick={() => {
            beginDictation();
            void voice.start("transcription");
          }}
          disabled={active}
          aria-label={t.dictate}
        >
          <Icon name="book" width="18" />
        </button>
      </Tooltip>
    </>
  );
}
