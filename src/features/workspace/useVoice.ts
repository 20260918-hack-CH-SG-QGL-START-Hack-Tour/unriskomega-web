"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { api, record, string } from "@/lib/api/client";
import { clientConfig } from "@/lib/config";
import type { Locale } from "@/lib/i18n";
import type { ConversationContext } from "@/lib/models/conversation";
import {
  type SpokenTranscript,
  VoiceTranscriptLedger,
} from "@/lib/models/voice";
export function useVoice(
  portfolioId: string,
  locale: Locale,
  onTranscript: (
    text: string,
    mode: "conversation" | "transcription",
    model: string,
    transcript: SpokenTranscript,
  ) => void,
  onResponse: (text: string, model: string) => void,
  onDiscard: () => void,
  context?: () => ConversationContext,
) {
  const [voiceState, setState] = useState<
    "idle" | "connecting" | "active" | "finalizing" | "error"
  >("idle");
  const [voiceMode, setVoiceMode] = useState<
    "conversation" | "transcription" | null
  >(null);
  const peer = useRef<RTCPeerConnection | null>(null);
  const channel = useRef<RTCDataChannel | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);
  const generation = useRef(0);
  const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const finalTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const finalizing = useRef(false);
  const activeMode = useRef<"conversation" | "transcription" | null>(null);
  const callbacks = useRef({ onTranscript, onResponse, onDiscard });
  const transcripts = useRef(new VoiceTranscriptLedger());
  const model = useRef("");
  callbacks.current = { onTranscript, onResponse, onDiscard };
  const close = useCallback((discard = true) => {
    generation.current++;
    clearTimeout(timeout.current);
    clearTimeout(finalTimeout.current);
    if (discard && activeMode.current === "transcription")
      callbacks.current.onDiscard();
    activeMode.current = null;
    finalizing.current = false;
    stream.current?.getTracks().forEach((track) => {
      track.stop();
    });
    stream.current = null;
    channel.current?.close();
    channel.current = null;
    peer.current?.close();
    peer.current = null;
    if (audio.current) {
      audio.current.pause();
      audio.current.srcObject = null;
    }
    setVoiceMode(null);
    setState("idle");
  }, []);
  const cancel = useCallback(() => close(), [close]);
  const stop = useCallback(() => {
    if (finalizing.current) return;
    stream.current?.getTracks().forEach((track) => {
      track.stop();
    });
    stream.current = null;
    clearTimeout(timeout.current);
    if (
      activeMode.current !== "transcription" ||
      channel.current?.readyState !== "open"
    ) {
      close(false);
      return;
    }
    finalizing.current = true;
    setState("finalizing");
    finalTimeout.current = setTimeout(
      () => close(false),
      clientConfig.dictationFinalizeTimeoutMs,
    );
    try {
      channel.current.send(
        JSON.stringify({ type: "input_audio_buffer.commit" }),
      );
    } catch {
      cancel();
      setState("error");
    }
  }, [cancel, close]);
  useEffect(() => () => cancel(), [cancel]);
  async function start(mode: "conversation" | "transcription") {
    cancel();
    transcripts.current.reset();
    model.current = "";
    activeMode.current = mode;
    setVoiceMode(mode);
    const current = generation.current;
    setState("connecting");
    timeout.current = setTimeout(stop, clientConfig.maxVoiceDurationMs);
    try {
      const media = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (current !== generation.current) {
        media.getTracks().forEach((track) => {
          track.stop();
        });
        return;
      }
      stream.current = media;
      const connection = new RTCPeerConnection();
      peer.current = connection;
      audio.current = new Audio();
      connection.ontrack = (event) => {
        if (current !== generation.current) return;
        if (audio.current) {
          audio.current.srcObject = event.streams[0];
          void audio.current.play().catch(() => {
            if (current !== generation.current) return;
            cancel();
            setState("error");
          });
        }
      };
      for (const track of media.getAudioTracks())
        connection.addTrack(track, media);
      const events = connection.createDataChannel("oai-events");
      channel.current = events;
      events.onmessage = (event) => {
        if (current === generation.current) handleEvent(event.data, mode);
      };
      events.onerror = () => {
        if (current !== generation.current) return;
        cancel();
        setState("error");
      };
      events.onclose = () => {
        if (current !== generation.current) return;
        cancel();
        setState("error");
      };
      connection.onconnectionstatechange = () => {
        if (current !== generation.current) return;
        if (connection.connectionState === "connected" && !finalizing.current)
          setState("active");
        if (connection.connectionState === "failed") {
          cancel();
          setState("error");
        }
      };
      const offer = await connection.createOffer();
      await connection.setLocalDescription(offer);
      const answer = record(
        await api("voice/session", {
          method: "POST",
          body: JSON.stringify({
            portfolioId,
            locale,
            sdp: offer.sdp,
            mode,
            ...context?.(),
          }),
        }),
      );
      if (current !== generation.current) return;
      model.current = string(answer.model);
      await connection.setRemoteDescription({
        type: "answer",
        sdp: string(answer.sdp),
      });
    } catch {
      if (current !== generation.current) return;
      cancel();
      setState("error");
    }
  }
  function handleEvent(raw: string, mode: "conversation" | "transcription") {
    try {
      const event = record(JSON.parse(raw));
      const transcript = transcripts.current.accept(event, {
        partials: mode === "transcription",
      });
      if (transcript?.role === "user")
        callbacks.current.onTranscript(
          transcript.text,
          mode,
          model.current,
          transcript,
        );
      if (transcript?.role === "assistant" && mode === "conversation")
        callbacks.current.onResponse(transcript.text, model.current);
      if (transcript?.role === "user" && transcript.final && finalizing.current)
        close(false);
      if (event.type === "error") {
        cancel();
        setState("error");
      }
    } catch {
      console.warn("Invalid voice event rejected");
    }
  }
  return { voiceState, voiceMode, start, stop, cancel };
}
