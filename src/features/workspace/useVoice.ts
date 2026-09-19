"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { api, record, string } from "@/lib/api/client";
import { clientConfig } from "@/lib/config";
import type { Locale } from "@/lib/i18n";
import { VoiceTranscriptLedger } from "@/lib/models/voice";
export function useVoice(
  portfolioId: string,
  locale: Locale,
  onTranscript: (
    text: string,
    mode: "conversation" | "transcription",
    model: string,
  ) => void,
  onResponse: (text: string, model: string) => void,
) {
  const [voiceState, setState] = useState<
    "idle" | "connecting" | "active" | "error"
  >("idle");
  const peer = useRef<RTCPeerConnection | null>(null);
  const channel = useRef<RTCDataChannel | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);
  const generation = useRef(0);
  const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const callbacks = useRef({ onTranscript, onResponse });
  const transcripts = useRef(new VoiceTranscriptLedger());
  const model = useRef("");
  callbacks.current = { onTranscript, onResponse };
  const stop = useCallback(() => {
    generation.current++;
    clearTimeout(timeout.current);
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
    setState("idle");
  }, []);
  useEffect(() => () => stop(), [stop]);
  async function start(mode: "conversation" | "transcription") {
    stop();
    transcripts.current.reset();
    model.current = "";
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
            stop();
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
      connection.onconnectionstatechange = () => {
        if (current !== generation.current) return;
        if (connection.connectionState === "connected") setState("active");
        if (connection.connectionState === "failed") {
          stop();
          setState("error");
        }
      };
      const offer = await connection.createOffer();
      await connection.setLocalDescription(offer);
      const answer = record(
        await api("voice/session", {
          method: "POST",
          body: JSON.stringify({ portfolioId, locale, sdp: offer.sdp, mode }),
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
      stop();
      setState("error");
    }
  }
  function handleEvent(raw: string, mode: "conversation" | "transcription") {
    try {
      const event = record(JSON.parse(raw));
      const transcript = transcripts.current.accept(event);
      if (transcript?.role === "user")
        callbacks.current.onTranscript(transcript.text, mode, model.current);
      if (transcript?.role === "assistant" && mode === "conversation")
        callbacks.current.onResponse(transcript.text, model.current);
      if (event.type === "error") {
        stop();
        setState("error");
      }
    } catch {
      console.warn("Invalid voice event rejected");
    }
  }
  return { voiceState, start, stop };
}
