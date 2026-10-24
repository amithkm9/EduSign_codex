"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n/translate";

export function useTutorVoice(
  locale: Locale,
  onTranscript: (text: string) => void,
) {
  const [phase, setPhase] = useState<
    "idle" | "requesting" | "recording" | "transcribing"
  >("idle");
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState("");
  const [speaking, setSpeaking] = useState<string | null>(null);
  const [preparing, setPreparing] = useState(false);
  const stream = useRef<MediaStream | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const request = useRef<AbortController | null>(null);
  const speechRequest = useRef<AbortController | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);
  const generation = useRef(0);
  const speechGeneration = useRef(0);
  const phaseRef = useRef(phase);
  const clearCapture = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    stream.current?.getTracks().forEach((track) => track.stop());
    stream.current = null;
  }, []);
  const stopSpeech = useCallback(() => {
    speechGeneration.current++;
    speechRequest.current?.abort();
    audio.current?.pause();
    audio.current = null;
    setSpeaking(null);
    setPreparing(false);
  }, []);
  const cancel = useCallback(() => {
    generation.current++;
    request.current?.abort();
    if (recorder.current?.state === "recording") {
      recorder.current.onstop = null;
      recorder.current.stop();
    }
    clearCapture();
    phaseRef.current = "idle";
    setPhase("idle");
  }, [clearCapture]);
  useEffect(() => {
    const hide = () => {
      if (document.hidden) {
        cancel();
        stopSpeech();
      }
    };
    document.addEventListener("visibilitychange", hide);
    return () => {
      document.removeEventListener("visibilitychange", hide);
      cancel();
      stopSpeech();
    };
  }, [cancel, stopSpeech]);
  async function speak(id: string, text: string, language: Locale = locale) {
    if (speaking === id) {
      stopSpeech();
      return;
    }
    stopSpeech();
    const version = speechGeneration.current;
    setError("");
    setSpeaking(id);
    setPreparing(true);
    const controller = new AbortController();
    speechRequest.current = controller;
    const limit = setTimeout(() => controller.abort(), 35000);
    try {
      const response = await fetch("/api/voice/text-to-speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.slice(0, 5000), language }),
        signal: controller.signal,
      });
      const data = await response.json();
      if (!response.ok || !data.audio) throw new Error();
      if (version !== speechGeneration.current) return;
      const sound = new Audio(`data:audio/mp3;base64,${data.audio}`);
      audio.current = sound;
      sound.onended = () => {
        if (version === speechGeneration.current) stopSpeech();
      };
      sound.onerror = () => {
        if (version === speechGeneration.current) {
          stopSpeech();
          setError(
            "La lecture audio a échoué. Réessayez avec le bouton Écouter.",
          );
        }
      };
      setPreparing(false);
      await sound.play();
    } catch {
      if (version === speechGeneration.current) {
        stopSpeech();
        setError(
          "La voix est indisponible pour le moment. Vous pouvez lire la réponse.",
        );
      }
    } finally {
      clearTimeout(limit);
    }
  }
  async function start() {
    if (phaseRef.current !== "idle") return;
    stopSpeech();
    setError("");
    const version = ++generation.current;
    phaseRef.current = "requesting";
    setPhase("requesting");
    try {
      if (
        !navigator.mediaDevices?.getUserMedia ||
        typeof MediaRecorder === "undefined"
      )
        throw new Error();
      const media = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (version !== generation.current) {
        media.getTracks().forEach((track) => track.stop());
        return;
      }
      stream.current = media;
      const mime = [
        "audio/webm;codecs=opus",
        "audio/mp4",
        "audio/webm",
        "audio/ogg",
      ].find((value) => MediaRecorder.isTypeSupported(value));
      if (!mime) throw new Error();
      const rec = new MediaRecorder(media, { mimeType: mime });
      recorder.current = rec;
      const chunks: Blob[] = [];
      let bytes = 0;
      rec.ondataavailable = (event) => {
        if (event.data.size) {
          chunks.push(event.data);
          bytes += event.data.size;
        }
        if (bytes > 7_000_000) {
          cancel();
          setError(
            "Le message vocal est trop long. Essayez une phrase plus courte.",
          );
        }
      };
      rec.onerror = () => {
        cancel();
        setError(
          "L’enregistrement a échoué. Réessayez ou écrivez votre question.",
        );
      };
      rec.onstop = async () => {
        clearCapture();
        if (version !== generation.current) return;
        phaseRef.current = "transcribing";
        setPhase("transcribing");
        const controller = new AbortController();
        request.current = controller;
        const limit = setTimeout(() => controller.abort(), 35000);
        try {
          const blob = new Blob(chunks, { type: rec.mimeType });
          if (blob.size < 100 || blob.size > 7_000_000) throw new Error();
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result).split(",")[1]);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
          if (version !== generation.current) return;
          const response = await fetch("/api/voice/transcribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              audio: base64,
              mimeType: rec.mimeType.split(";")[0],
              language: locale,
            }),
            signal: controller.signal,
          });
          const data = await response.json();
          if (!response.ok || !data.transcription?.trim()) throw new Error();
          if (version === generation.current) onTranscript(data.transcription);
        } catch {
          if (version === generation.current)
            setError(
              "La transcription est indisponible ou aucun mot n’a été reconnu. Réessayez ou écrivez votre question.",
            );
        } finally {
          clearTimeout(limit);
          if (version === generation.current) {
            phaseRef.current = "idle";
            setPhase("idle");
          }
        }
      };
      rec.start(250);
      phaseRef.current = "recording";
      setPhase("recording");
      setSeconds(0);
      const started = Date.now();
      timer.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - started) / 1000);
        setSeconds(elapsed);
        if (elapsed >= 60 && rec.state === "recording") rec.stop();
      }, 250);
    } catch {
      if (version === generation.current) {
        cancel();
        setError(
          "Le microphone est inaccessible. Autorisez-le dans le navigateur ou écrivez votre question.",
        );
      }
    }
  }
  return {
    phase,
    seconds,
    error,
    setError,
    speaking,
    preparing,
    speak,
    stopSpeech,
    start,
    cancel,
    stop: () => {
      if (recorder.current?.state === "recording") recorder.current.stop();
    },
  };
}
