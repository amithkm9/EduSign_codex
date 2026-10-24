"use client";
import { useLocale as useInterfaceLocale } from "@/components/i18n/locale-provider";

import { T } from "@/components/i18n/locale-provider";

import { useEffect, useRef, useState } from "react";
import {
  Send,
  Mic,
  Square,
  Volume2,
  VolumeX,
  Sparkles,
  ExternalLink,
  Loader2,
} from "lucide-react";
import Link from "next/link";
type Resource = { title: string; url: string };
type Reply = {
  response?: string;
  resources?: Resource[];
  suggestions?: string[];
};
type Message = {
  role: "user" | "assistant";
  text: string;
  resources?: Resource[];
};
const suggestions = [
  "Par quoi commencer en LSF ?",
  "Une activité à faire avec mon enfant",
  "Où apprendre l’alphabet en LSF ?",
];
function safeResource(url: string) {
  try {
    const u = new URL(url, "https://edusign.local");
    return (
      (u.origin === "https://edusign.local" &&
        u.pathname.startsWith("/learn/")) ||
      (u.protocol === "https:" &&
        [
          "dico.elix-lsf.fr",
          "www.youtube.com",
          "lsfdico.injs-metz.fr",
          "www.maelanguedessignes.com",
        ].includes(u.hostname))
    );
  } catch {
    return false;
  }
}
export function TutorChat() {
  const { t: _t, locale } = useInterfaceLocale();

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: _t(
        "Bonjour ! Je suis l’assistant EduSign. Je peux vous aider à choisir une leçon LSF, proposer une activité en famille ou trouver une ressource. Qu’aimeriez-vous découvrir ?",
      ),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [voiceOut, setVoiceOut] = useState(false);
  const [voiceError, setVoiceError] = useState("");
  const end = useRef<HTMLDivElement>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (recorder.current?.state === "recording") {
        recorder.current.onstop = null;
        recorder.current.stop();
      }
      stream.current?.getTracks().forEach((t) => t.stop());
      audio.current?.pause();
    };
  }, []);
  useEffect(() => {
    end.current?.scrollIntoView({ block: "nearest" });
  }, [messages, loading]);
  function addError() {
    setMessages((m) => [
      ...m,
      {
        role: "assistant",
        text: _t(
          "L’assistant est momentanément indisponible. Réessayez dans un instant ; les leçons et les ressources LSF restent accessibles.",
        ),
      },
    ]);
  }
  function play(base64: string) {
    audio.current?.pause();
    audio.current = new Audio(`data:audio/mp3;base64,${base64}`);
    audio.current
      .play()
      .catch(() =>
        setVoiceError(
          "La lecture audio n’a pas démarré. La réponse reste disponible à l’écrit.",
        ),
      );
  }
  async function speak(text: string) {
    try {
      const r = await fetch("/api/voice/text-to-speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, language: locale }),
      });
      const d = await r.json();
      if (!r.ok || !d.audio) throw new Error();
      play(d.audio);
    } catch {
      setVoiceError(
        "La voix est indisponible pour le moment. Vous pouvez lire la réponse.",
      );
    }
  }
  function append(reply: Reply) {
    if (!reply.response) throw new Error();
    setMessages((m) => [
      ...m,
      {
        role: "assistant",
        text: reply.response!,
        resources: reply.resources?.filter((r) => safeResource(r.url)),
      },
    ]);
  }
  const history = () =>
    messages.slice(-10).map((m) => ({ role: m.role, content: m.text }));
  async function send(text: string) {
    const value = text.trim();
    if (!value || loading || recording) return;
    setInput("");
    setLoading(true);
    setVoiceError("");
    const previous = history();
    setMessages((m) => [...m, { role: "user", text: value }]);
    try {
      const r = await fetch("/api/tutor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: value,
          language: locale,
          conversationHistory: previous,
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error();
      append(data.response);
      if (voiceOut) void speak(data.response.response);
    } catch {
      addError();
    } finally {
      setLoading(false);
    }
  }
  async function toggleRecording() {
    if (recording) {
      recorder.current?.stop();
      return;
    }
    if (loading) return;
    setVoiceError("");
    try {
      stream.current = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      const mime = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/mp4";
      const rec = new MediaRecorder(stream.current, { mimeType: mime });
      recorder.current = rec;
      const chunks: BlobPart[] = [];
      rec.ondataavailable = (e) => {
        if (e.data.size) chunks.push(e.data);
      };
      rec.onstop = async () => {
        stream.current?.getTracks().forEach((t) => t.stop());
        if (!mounted.current) return;
        setRecording(false);
        setLoading(true);
        try {
          const blob = new Blob(chunks, { type: mime });
          if (blob.size > 7_000_000) throw new Error();
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result).split(",")[1]);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
          const r = await fetch("/api/voice/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              audio: base64,
              language: locale,
              voiceEnabled: voiceOut,
              conversationHistory: history(),
            }),
          });
          const data = await r.json();
          if (!r.ok) throw new Error();
          if (data.transcription)
            setMessages((m) => [
              ...m,
              { role: "user", text: data.transcription },
            ]);
          append(data.response);
          if (data.audio) play(data.audio);
        } catch {
          setVoiceError(
            "Votre message vocal n’a pas pu être envoyé. Réessayez avec un message court ou écrivez votre question.",
          );
        } finally {
          setLoading(false);
        }
      };
      rec.start();
      setRecording(true);
    } catch {
      stream.current?.getTracks().forEach((t) => t.stop());
      setVoiceError(
        "Le microphone est inaccessible. Autorisez-le dans le navigateur ou écrivez votre question.",
      );
    }
  }
  return (
    <div className="overflow-hidden rounded-[1.7rem] border border-border bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-secondary/60 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-white">
            <Sparkles className="size-5" />
          </span>
          <div>
            <p className="font-bold">
              <T text={"L’assistant EduSign"} />
            </p>
            <p className="text-xs text-muted-foreground">
              <T text={"En français · Texte et voix"} />{" "}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setVoiceOut(!voiceOut);
            if (voiceOut) audio.current?.pause();
          }}
          aria-pressed={voiceOut}
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-white px-4 text-xs font-semibold"
        >
          {voiceOut ? (
            <Volume2 className="size-4" />
          ) : (
            <VolumeX className="size-4" />
          )}
          <T text={" "} />
          <T text={"Réponses vocales"} />{" "}
          <T text={voiceOut ? "activées" : "désactivées"} />
        </button>
      </div>
      <div
        role="log"
        aria-label={_t("Conversation avec l’assistant")}
        aria-live="polite"
        className="h-[24rem] space-y-5 overflow-y-auto p-5 sm:p-7"
      >
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[90%] rounded-2xl p-4 text-sm leading-relaxed sm:max-w-[80%] ${m.role === "user" ? "rounded-br-sm bg-primary text-white" : "rounded-bl-sm bg-secondary"}`}
            >
              <p className="whitespace-pre-wrap">{m.text}</p>
              {m.resources?.map((r) => (
                <a
                  key={r.url}
                  href={r.url}
                  target={r.url.startsWith("/") ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  className="mt-3 flex min-h-11 items-center gap-2 rounded-xl border border-primary/15 bg-white px-3 py-2 font-semibold text-primary"
                >
                  <T text={r.title} />
                  <ExternalLink className="size-3 shrink-0" />
                </a>
              ))}
            </div>
          </div>
        ))}
        {loading && (
          <p
            role="status"
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            <Loader2 className="size-4 animate-spin" />{" "}
            <T text={"Un instant, je prépare ma réponse…"} />{" "}
          </p>
        )}
        <div ref={end} />
      </div>
      {messages.length === 1 && (
        <div className="flex flex-wrap gap-2 px-5 pb-5">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => send(_t(s))}
              className="min-h-11 rounded-full border border-primary/20 px-4 py-2 text-xs font-semibold text-primary hover:bg-secondary"
            >
              <T text={s} />
            </button>
          ))}
        </div>
      )}
      <div className="border-t border-border p-4">
        {voiceError && (
          <p role="alert" className="mb-3 text-sm text-destructive">
            <T text={voiceError} />
          </p>
        )}
        {recording && (
          <p
            role="status"
            className="mb-3 text-sm font-semibold text-destructive"
          >
            <T
              text={
                "Enregistrement en cours. Appuyez sur Arrêter pour envoyer."
              }
            />{" "}
          </p>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void send(input);
          }}
          className="flex items-center gap-2"
        >
          <button
            type="button"
            onClick={() => void toggleRecording()}
            disabled={loading}
            aria-label={_t(
              recording
                ? "Arrêter et envoyer le message vocal"
                : "Enregistrer un message vocal",
            )}
            className={`flex size-12 shrink-0 items-center justify-center rounded-full ${recording ? "bg-destructive text-white" : "bg-secondary text-primary"}`}
          >
            {recording ? (
              <Square className="size-4" />
            ) : (
              <Mic className="size-5" />
            )}
          </button>
          <label className="flex-1">
            <span className="sr-only">
              <T text={"Votre question"} />
            </span>
            <input
              maxLength={2000}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={_t("Écrivez votre question…")}
              disabled={recording}
              className="h-12 w-full min-w-0 rounded-full border border-border bg-background px-4 text-sm"
            />
          </label>
          <button
            type="submit"
            disabled={loading || recording || !input.trim()}
            aria-label={_t("Envoyer la question")}
            className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-white disabled:opacity-40"
          >
            <Send className="size-5" />
          </button>
        </form>
        <div className="mt-3 flex flex-wrap justify-between gap-2 text-[11px] text-muted-foreground">
          <span>
            <T
              text={
                "Voix générée par IA. L’historique disparaît en quittant cette page."
              }
            />{" "}
          </span>
          <Link href="/resources" className="font-semibold text-primary">
            <T text={"Consulter les ressources LSF →"} />{" "}
          </Link>
        </div>
      </div>
    </div>
  );
}
