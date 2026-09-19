"use client";
import { useRef } from "react";
import { clientConfig } from "@/lib/config";
import {
  type DictationDraft,
  dictatedText,
  type SpokenTranscript,
  updateDictationDraft,
} from "@/lib/models/voice";

export function useDictationComposer(
  input: string,
  setInput: (text: string) => void,
) {
  const draft = useRef<DictationDraft>({ initialText: "", segments: [] });
  return {
    begin() {
      draft.current = { initialText: input, segments: [] };
    },
    accept(transcript: SpokenTranscript) {
      draft.current = updateDictationDraft(draft.current, transcript);
      setInput(
        dictatedText(draft.current).slice(0, clientConfig.maxMessageLength),
      );
    },
    discard() {
      setInput(draft.current.initialText);
    },
  };
}
