"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowUp,
  ArrowUpRight,
  BookOpen,
  Check,
  Clock3,
  Hand,
  Headphones,
  Loader2,
  Mic,
  Plus,
  Sparkles,
  Square,
  X,
} from "lucide-react";
import { useLocale } from "@/components/i18n/locale-provider";
import type { Locale } from "@/lib/i18n/translate";
import { safeTutorResource } from "@/lib/tutor-resources.mjs";
import { useTutorVoice } from "./use-tutor-voice";

type Action =
  | { kind: "practice"; exercise_id?: string }
  | { kind: "answer"; exercise_id: string; choice: number };
type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
  language: Locale;
  resources?: { title: string; url: string }[];
  suggestions?: string[];
  mode?: string;
  exercise?: { id: string; question: string; choices: string[] };
  exercise_result?: { correct: boolean };
  answered?: boolean;
};
const starters = [
  {
    icon: Clock3,
    title: "Mon programme de 5 minutes",
    detail: "Un petit pas, à votre rythme.",
    prompt: "Propose-moi un programme de 5 minutes pour commencer la LSF.",
  },
  {
    icon: Hand,
    title: "Commencer par mon prénom",
    detail: "Découvrir l’alphabet manuel.",
    prompt: "Comment commencer à épeler mon prénom en LSF ?",
  },
  {
    icon: Sparkles,
    title: "Une question pour pratiquer",
    detail: "Choisissez une réponse, puis échangeons.",
    prompt: "Pose-moi une question de compréhension.",
    action: { kind: "practice" } as Action,
  },
  {
    icon: BookOpen,
    title: "Apprendre en famille",
    detail: "Une activité à essayer ensemble.",
    prompt: "Propose une activité LSF simple à faire avec mon enfant.",
  },
];

export function TutorChat() {
  const { t, locale } = useLocale();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [connection, setConnection] = useState("checking");
  const [automaticAudio, setAutomaticAudio] = useState(false);
  const request = useRef<AbortController | null>(null);
  const busy = useRef(false);
  const end = useRef<HTMLDivElement>(null);
  const composer = useRef<HTMLTextAreaElement>(null);
  const voice = useTutorVoice(locale, (text) => {
    setInput((previous) =>
      [previous, text].filter(Boolean).join(" ").slice(0, 2000),
    );
    composer.current?.focus();
  });
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/tutor/status", { signal: controller.signal })
      .then(async (r) => {
        const data = await r.json();
        if (!controller.signal.aborted)
          setConnection(r.ok ? data.connection : "unavailable");
      })
      .catch(() => {
        if (!controller.signal.aborted) setConnection("unavailable");
      });
    return () => {
      controller.abort();
      request.current?.abort();
    };
  }, []);
  useEffect(() => {
    if (messages.length || loading)
      end.current?.scrollIntoView({ block: "nearest" });
  }, [messages, loading]);
  const capturing = voice.phase !== "idle";
  async function send(text: string, action?: Action, exerciseMessage?: string) {
    const value = text.trim();
    if (!value || busy.current || capturing) return;
    busy.current = true;
    setLoading(true);
    setError("");
    voice.setError("");
    voice.stopSpeech();
    const controller = new AbortController();
    request.current = controller;
    const timeout = setTimeout(() => controller.abort(), 65000);
    const userId = crypto.randomUUID();
    const history = messages
      .slice(-12)
      .map((m) => ({
        role: m.role,
        content: [m.text, m.exercise?.question, m.exercise?.choices.join("; ")]
          .filter(Boolean)
          .join("\n")
          .slice(0, 4000),
      }));
    setMessages((previous) => [
      ...previous,
      { id: userId, role: "user", text: value, language: locale },
    ]);
    setInput("");
    try {
      const response = await fetch("/api/tutor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: value,
          language: locale,
          conversationHistory: history,
          action,
        }),
        signal: controller.signal,
      });
      const data = await response.json();
      if (!response.ok || !data.response?.response) throw new Error();
      const reply: Message = {
        ...data.response,
        id: crypto.randomUUID(),
        role: "assistant",
        text: data.response.response,
        language: locale,
      };
      setMessages((previous) => [
        ...previous.map((m) =>
          m.id === exerciseMessage ? { ...m, answered: true } : m,
        ),
        reply,
      ]);
      if (reply.mode === "fallback") setConnection("unavailable");
      if (reply.mode === "ai") setConnection("ready");
      if (automaticAudio)
        void voice.speak(
          reply.id,
          reply.text + (reply.exercise ? " " + reply.exercise.question : ""),
          locale,
        );
    } catch {
      setMessages((previous) => previous.filter((m) => m.id !== userId));
      setInput(value);
      setError(
        controller.signal.aborted
          ? "La demande a été arrêtée. Votre question est prête à être renvoyée."
          : "La réponse n’a pas pu être chargée. Réessayez ; votre question est conservée.",
      );
    } finally {
      clearTimeout(timeout);
      busy.current = false;
      setLoading(false);
    }
  }
  function reset() {
    voice.cancel();
    voice.stopSpeech();
    voice.setError("");
    setMessages([]);
    setInput("");
    setError("");
    composer.current?.focus();
  }
  const latest = messages.at(-1);
  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
      <section
        aria-label={t("Conversation avec l’assistant")}
        className="min-w-0 overflow-hidden rounded-[28px] border bg-white shadow-sm"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4 sm:px-7">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-white">
              <Sparkles size={21} aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-bold">{t("Votre coach EduSign")}</h2>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${connection === "ready" ? "bg-emerald-600" : "bg-amber-600"}`}
                />
                {t(
                  connection === "checking"
                    ? "Connexion en cours…"
                    : connection === "ready"
                      ? "Assistant IA · connecté"
                      : "Mode guidé · IA indisponible",
                )}
              </p>
            </div>
          </div>
          <button
            onClick={reset}
            disabled={loading || messages.length === 0}
            className="flex min-h-10 items-center gap-1.5 rounded-xl px-3 text-xs font-semibold hover:bg-muted disabled:opacity-40"
          >
            <Plus size={15} />
            {t("Nouvelle conversation")}
          </button>
        </div>
        <div
          className="max-h-[580px] min-h-[360px] overflow-y-auto overscroll-contain px-5 py-7 sm:px-7"
          role="log"
          aria-label={t("Messages")}
          aria-live="polite"
          aria-relevant="additions text"
        >
          {messages.length === 0 ? (
            <div className="py-3">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
                {t("APPRENDRE, UN ÉCHANGE À LA FOIS")}
              </p>
              <h3 className="mt-3 max-w-md text-3xl font-bold leading-tight tracking-tight">
                {t("Qu’aimeriez-vous apprendre aujourd’hui ?")}
              </h3>
              <p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
                {t(
                  "Une question, un petit programme ou une activité : trouvons votre prochain pas en langue des signes française.",
                )}
              </p>
              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {starters.map(
                  ({ icon: Icon, title, detail, prompt, action }) => (
                    <button
                      key={title}
                      onClick={() => void send(t(prompt), action)}
                      disabled={capturing}
                      className="group rounded-2xl border bg-[#fafbf8] p-4 text-left transition hover:border-primary/40 hover:bg-primary/5 disabled:opacity-50"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <Icon size={20} className="text-primary" />
                        <ArrowUpRight
                          size={16}
                          className="text-muted-foreground group-hover:text-primary"
                        />
                      </div>
                      <span className="block text-sm font-bold">
                        {t(title)}
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                        {t(detail)}
                      </span>
                    </button>
                  ),
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message) => (
                <article
                  key={message.id}
                  className={
                    message.role === "user"
                      ? "ml-auto max-w-[90%] rounded-2xl rounded-br-sm bg-primary px-5 py-4 text-white sm:max-w-[80%]"
                      : "max-w-full"
                  }
                >
                  <p
                    className={`mb-2 text-[11px] font-bold uppercase tracking-wider ${message.role === "user" ? "text-white/75" : "text-muted-foreground"}`}
                  >
                    {message.role === "user" ? t("Vous") : "EduSign"}
                    {message.mode === "fallback" && (
                      <span className="ml-2 font-normal normal-case tracking-normal">
                        · {t("Réponse guidée")}
                      </span>
                    )}
                  </p>
                  {message.exercise_result && (
                    <div
                      className={`mb-3 flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold ${message.exercise_result.correct ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-900"}`}
                    >
                      {message.exercise_result.correct ? (
                        <Check size={16} />
                      ) : (
                        <BookOpen size={16} />
                      )}
                      {t(
                        message.exercise_result.correct
                          ? "Bien joué, c’est la bonne réponse !"
                          : "Une occasion d’apprendre",
                      )}
                    </div>
                  )}
                  <p className="whitespace-pre-wrap break-words text-sm leading-7">
                    {message.text
                      .split(/(\*\*[^*\n]+\*\*)/g)
                      .map((part, index) =>
                        part.startsWith("**") && part.endsWith("**") ? (
                          <strong key={index}>{part.slice(2, -2)}</strong>
                        ) : (
                          part
                        ),
                      )}
                  </p>
                  {message.resources
                    ?.filter((resource) => safeTutorResource(resource.url))
                    .map((resource) => (
                      <Link
                        key={resource.url}
                        href={resource.url}
                        target={
                          resource.url.startsWith("https:")
                            ? "_blank"
                            : undefined
                        }
                        rel={
                          resource.url.startsWith("https:")
                            ? "noopener noreferrer"
                            : undefined
                        }
                        className="mt-3 flex items-center justify-between gap-3 rounded-xl border bg-muted/30 px-4 py-3 text-sm font-semibold hover:border-primary/40"
                      >
                        <span className="flex items-center gap-2">
                          <BookOpen
                            size={16}
                            className="shrink-0 text-primary"
                          />
                          {resource.title}
                        </span>
                        <ArrowUpRight size={16} className="shrink-0" />
                        <span className="sr-only">
                          {resource.url.startsWith("https:")
                            ? t("Ouvre un nouvel onglet")
                            : ""}
                        </span>
                      </Link>
                    ))}
                  {message.exercise && (
                    <fieldset
                      disabled={loading || capturing || message.answered}
                      className="mt-4 rounded-2xl border bg-primary/[0.03] p-4"
                    >
                      <legend className="px-1 text-xs font-bold text-primary">
                        {t("À vous de jouer")}
                      </legend>
                      <p className="mb-3 text-sm font-semibold">
                        {message.exercise.question}
                      </p>
                      <div className="space-y-2">
                        {message.exercise.choices.map((choice, index) => (
                          <button
                            key={choice}
                            onClick={() =>
                              void send(
                                choice,
                                {
                                  kind: "answer",
                                  exercise_id: message.exercise!.id,
                                  choice: index,
                                },
                                message.id,
                              )
                            }
                            className="flex w-full items-center gap-3 rounded-xl border bg-white px-3 py-3 text-left text-sm hover:border-primary disabled:opacity-50"
                          >
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold">
                              {String.fromCharCode(65 + index)}
                            </span>
                            {choice}
                          </button>
                        ))}
                      </div>
                      {message.answered && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          {t("Réponse envoyée")}
                        </p>
                      )}
                    </fieldset>
                  )}
                  {message.role === "assistant" && (
                    <button
                      disabled={capturing}
                      onClick={() =>
                        void voice.speak(
                          message.id,
                          message.text +
                            (message.exercise
                              ? " " +
                                message.exercise.question +
                                " " +
                                message.exercise.choices.join(". ")
                              : ""),
                          message.language,
                        )
                      }
                      className="mt-3 flex min-h-9 items-center gap-2 rounded-lg px-2 text-xs font-semibold text-muted-foreground hover:bg-muted disabled:opacity-50"
                    >
                      {voice.speaking === message.id ? (
                        voice.preparing ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Square size={14} />
                        )
                      ) : (
                        <Headphones size={14} />
                      )}
                      {t(
                        voice.speaking === message.id
                          ? "Arrêter la lecture"
                          : "Écouter",
                      )}
                    </button>
                  )}
                </article>
              ))}
            </div>
          )}
          {loading && (
            <div className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 size={16} className="animate-spin" />
              {t("Votre coach prépare une réponse…")}
              <button
                onClick={() => request.current?.abort()}
                className="ml-auto rounded-lg px-3 py-2 font-semibold hover:bg-muted"
              >
                {t("Annuler")}
              </button>
            </div>
          )}
          <div ref={end} />
        </div>
        <div className="border-t bg-[#fafbf8] p-4 sm:px-6">
          {!loading &&
            latest?.role === "assistant" &&
            !!latest.suggestions?.length && (
              <div className="mb-4 flex flex-wrap gap-2">
                {latest.suggestions.slice(0, 3).map((suggestion) => (
                  <button
                    key={suggestion}
                    disabled={capturing}
                    onClick={() => void send(suggestion)}
                    className="rounded-full border bg-white px-3 py-2 text-left text-xs font-medium hover:border-primary disabled:opacity-50"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          {(error || voice.error) && (
            <p
              role="alert"
              className="mb-3 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900"
            >
              {t(error || voice.error)}
            </p>
          )}
          {capturing && (
            <div
              role="status"
              className="mb-3 flex flex-wrap items-center gap-3 rounded-xl bg-primary/5 p-3 text-sm"
            >
              <span className="flex flex-1 items-center gap-2">
                {voice.phase === "recording" ? (
                  <Mic size={16} className="text-red-600" />
                ) : (
                  <Loader2 size={16} className="animate-spin" />
                )}
                {voice.phase === "recording"
                  ? `${t("Enregistrement")} · ${voice.seconds}s / 60s`
                  : t(
                      voice.phase === "requesting"
                        ? "Autorisez le microphone dans le navigateur…"
                        : "Transcription en cours…",
                    )}
              </span>
              {voice.phase === "recording" && (
                <button
                  onClick={voice.stop}
                  className="rounded-lg bg-primary px-3 py-2 font-semibold text-white"
                >
                  {t("Terminer")}
                </button>
              )}
              <button
                onClick={voice.cancel}
                className="rounded-lg p-2 hover:bg-muted"
                aria-label={t("Annuler l’enregistrement")}
              >
                <X size={18} />
              </button>
            </div>
          )}
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void send(input);
            }}
            className="rounded-2xl border bg-white p-3 shadow-sm focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10"
          >
            <label htmlFor="tutor-question" className="sr-only">
              {t("Votre question")}
            </label>
            <textarea
              ref={composer}
              id="tutor-question"
              rows={2}
              maxLength={2000}
              value={input}
              disabled={loading || capturing}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  !event.shiftKey &&
                  !event.nativeEvent.isComposing
                ) {
                  event.preventDefault();
                  void send(input);
                }
              }}
              placeholder={t(
                "Posez votre question, ou utilisez le microphone…",
              )}
              className="w-full resize-none border-0 bg-transparent px-1 text-sm leading-6 outline-none disabled:opacity-60"
            />
            <div className="mt-1 flex items-center justify-between gap-2">
              <button
                type="button"
                disabled={loading || capturing}
                onClick={() => void voice.start()}
                aria-label={t("Dicter une question")}
                className="flex min-h-10 items-center gap-2 rounded-xl px-3 text-xs font-semibold hover:bg-muted disabled:opacity-40"
              >
                <Mic size={17} />
                {t("Dicter")}
              </button>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-muted-foreground">
                  {input.length} / 2000
                </span>
                <button
                  type="submit"
                  disabled={!input.trim() || loading || capturing}
                  aria-label={t("Envoyer la question")}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white transition hover:bg-primary/90 disabled:opacity-30"
                >
                  <ArrowUp size={19} />
                </button>
              </div>
            </div>
          </form>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
            <span>{t("Relisez votre transcription avant de l’envoyer.")}</span>
            <label className="flex min-h-8 cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={automaticAudio}
                onChange={(event) => {
                  setAutomaticAudio(event.target.checked);
                  if (!event.target.checked) voice.stopSpeech();
                }}
                className="accent-primary"
              />
              {t("Lire les réponses à voix haute")}
            </label>
          </div>
        </div>
      </section>
      <aside className="space-y-4">
        <div className="rounded-2xl bg-[#eaf0e6] p-5">
          <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/80 text-[#3b5439]">
            <Hand size={22} />
          </span>
          <h2 className="font-bold">{t("De la conversation à la pratique")}</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {t(
              "Les signes se découvrent en vidéo. Votre coach vous aide à trouver quoi regarder et comment pratiquer.",
            )}
          </p>
          <Link
            href="/learn/lsf-alphabet"
            className="mt-4 flex items-center justify-between rounded-xl bg-white px-3 py-3 text-sm font-bold"
          >
            {t("L’alphabet en LSF")}
            <ArrowUpRight size={16} />
          </Link>
          <Link
            href="/learn/lsf-nombres"
            className="mt-2 flex items-center justify-between rounded-xl bg-white px-3 py-3 text-sm font-bold"
          >
            {t("Les nombres en LSF")}
            <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className="rounded-2xl border p-5">
          <p className="text-xs font-bold uppercase tracking-wider">
            {t("À votre façon")}
          </p>
          <p className="mt-3 text-sm leading-6">
            {t(
              "Écrivez, dictez ou écoutez. Le bouton FR / EN change la langue de l’échange ; les signes enseignés restent en LSF.",
            )}
          </p>
          <div className="my-4 h-px bg-border" />
          <p className="text-xs leading-5 text-muted-foreground">
            {t(
              "Assistant et voix générés par IA. Vérifiez les signes dans les vidéos de référence. Cette conversation n’est pas enregistrée dans votre historique EduSign.",
            )}
          </p>
          <p className="mt-3 text-xs leading-5 text-muted-foreground">
            {t(
              "En terminant un message vocal, vous envoyez l’audio au service de transcription. Vous pouvez annuler avant l’envoi.",
            )}
          </p>
        </div>
        {connection !== "checking" && connection !== "ready" && (
          <p
            role="status"
            className="rounded-xl bg-amber-50 p-4 text-xs leading-5 text-amber-900"
          >
            {t(
              "La connexion IA est indisponible. Les activités guidées restent disponibles ; les réponses libres et la voix peuvent être limitées.",
            )}
          </p>
        )}
      </aside>
    </div>
  );
}
