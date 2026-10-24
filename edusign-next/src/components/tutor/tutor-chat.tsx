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
  Play,
  MessageCircle,
  Sparkles,
  Square,
  X,
} from "lucide-react";
import { useLocale } from "@/components/i18n/locale-provider";
import { translate, type Locale } from "@/lib/i18n/translate";
import { safeTutorResource } from "@/lib/tutor-resources.mjs";
import { useTutorVoice } from "./use-tutor-voice";
import { SignVideoCard } from "./sign-video-card";
import signCatalog from "@/lib/data/sign-videos.json";
import projectCatalog from "@/lib/data/project-sign-videos.json";
import { SignLibrary } from "./sign-library";

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
  sign_ids?: string[];
  collection?: "project" | "lsf";
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
  const [intent, setIntent] = useState<"sign" | "coach">("sign");
  const [collection, setCollection] = useState<"project" | "lsf">("project");
  const featured =
    collection === "lsf"
      ? signCatalog
      : [
          "project-hi",
          "project-hello",
          "project-bye",
          "project-mother",
          "project-water",
          "project-apple",
        ].map((id) => projectCatalog.find((item) => item.id === id)!);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [connection, setConnection] = useState("checking");
  const [automaticAudio, setAutomaticAudio] = useState(false);
  const request = useRef<AbortController | null>(null);
  const busy = useRef(false);
  const [selectedSign, setSelectedSign] = useState<string | null>(null);
  const messageLog = useRef<HTMLDivElement>(null);
  const latestReply = useRef<HTMLElement>(null);
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
    if (!messageLog.current) return;
    if (
      !loading &&
      messages.at(-1)?.role === "assistant" &&
      latestReply.current
    ) {
      messageLog.current.scrollTop = latestReply.current.offsetTop;
    } else messageLog.current.scrollTop = messageLog.current.scrollHeight;
  }, [messages, loading]);
  const capturing = voice.phase !== "idle";
  async function send(
    text: string,
    action?: Action,
    exerciseMessage?: string,
    requestedIntent?: "sign" | "coach",
    requestedLanguage: Locale = locale,
  ) {
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
    const history = messages.slice(-12).map((m) => ({
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
          language: requestedLanguage,
          conversationHistory: history,
          action,
          intent: action ? "coach" : (requestedIntent ?? intent),
          collection,
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
        language:
          data.language === "fr" || data.language === "en"
            ? data.language
            : locale,
      };
      setMessages((previous) => [
        ...previous.map((m) =>
          m.id === exerciseMessage ? { ...m, answered: true } : m,
        ),
        reply,
      ]);
      if (reply.sign_ids) setSelectedSign(reply.sign_ids[0] ?? null);
      if (reply.collection) setCollection(reply.collection);
      if (reply.mode === "fallback") setConnection("unavailable");
      if (reply.mode === "ai") setConnection("ready");
      if (automaticAudio)
        void voice.speak(
          reply.id,
          reply.text + (reply.exercise ? " " + reply.exercise.question : ""),
          reply.language,
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
    setSelectedSign(null);
    setInput("");
    setError("");
    composer.current?.focus();
  }
  const latest = messages.at(-1);
  const catalog = [...projectCatalog, ...signCatalog];
  const selectedLanguage =
    messages.findLast((m) => m.sign_ids?.includes(selectedSign ?? ""))
      ?.language ?? locale;
  const recentSigns = [
    ...new Set(messages.flatMap((m) => m.sign_ids || [])),
  ].slice(-8);
  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-white shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3 sm:px-7">
        <div
          role="group"
          aria-label={t("Que souhaitez-vous faire ?")}
          className="flex gap-1 rounded-full bg-muted p-1"
        >
          {(["sign", "coach"] as const).map((mode) => (
            <button
              key={mode}
              aria-pressed={intent === mode}
              disabled={loading || capturing}
              onClick={() => {
                setIntent(mode);
                voice.stopSpeech();
              }}
              className={`flex min-h-10 items-center gap-2 rounded-full px-4 text-xs font-semibold transition disabled:opacity-50 ${intent === mode ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:bg-white"}`}
            >
              {mode === "sign" ? (
                <Hand size={16} />
              ) : (
                <MessageCircle size={16} />
              )}
              {t(mode === "sign" ? "Trouver un signe" : "Demander au coach")}
            </button>
          ))}
        </div>
        <button
          onClick={reset}
          disabled={loading || capturing || !messages.length}
          className="flex min-h-10 items-center gap-2 rounded-full px-3 text-xs font-medium text-muted-foreground hover:bg-muted disabled:opacity-35"
        >
          <Plus size={16} />
          {t("Nouvelle conversation")}
        </button>
      </div>

      <div className="grid lg:grid-cols-[1.1fr_1fr]">
        <section
          aria-label={t("Espace de démonstration")}
          className="min-w-0 bg-muted/50 p-4 sm:p-6 lg:border-r lg:border-border"
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {t("Regarder & essayer")}
            </span>
            <label className="max-w-full">
              <span className="sr-only">{t("Collection vidéo")}</span>
              <select
                value={collection}
                disabled={loading || capturing}
                onChange={(event) =>
                  setCollection(event.target.value as "project" | "lsf")
                }
                className="min-h-10 max-w-full cursor-pointer rounded-full border border-border bg-transparent px-3 text-xs text-foreground focus:ring-2 focus:ring-primary"
              >
                <option value="project">
                  {t("Bibliothèque · 354 vidéos")}
                </option>
                <option value="lsf">{t("LSF · 6 vidéos sourcées")}</option>
              </select>
            </label>
          </div>
          {selectedSign ? (
            <SignVideoCard
              key={selectedSign}
              id={selectedSign}
              language={selectedLanguage}
              active={!loading && !capturing && !voice.speaking}
            />
          ) : (
            <div className="relative flex min-h-[300px] flex-col justify-between overflow-hidden rounded-2xl bg-navy p-7 text-white sm:min-h-[350px] sm:p-8">
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20">
                  <Hand size={23} />
                </span>
                <span className="text-[11px] tracking-widest text-white/75">
                  EDUSIGN STUDIO
                </span>
              </div>
              <div className="relative z-10 my-7 max-w-xs">
                <p className="text-3xl font-medium leading-tight tracking-tight sm:text-4xl">
                  {t("Un petit signe. Un grand lien.")}
                </p>
                <p className="mt-4 max-w-[260px] text-sm leading-6 text-white/80">
                  {t("Choisissez un mot. Regardez le geste. Essayez ensemble.")}
                </p>
              </div>
              <button
                disabled={loading || capturing}
                onClick={() =>
                  void send(
                    locale === "fr" ? "bonjour" : "hello",
                    undefined,
                    undefined,
                    "sign",
                  )
                }
                className="relative z-10 flex min-h-11 w-fit items-center gap-3 rounded-full bg-white py-2 pl-4 pr-5 text-sm font-semibold text-navy hover:bg-white disabled:opacity-50"
              >
                <Play size={15} fill="currentColor" />
                {t("Commencer par bonjour")}
              </button>
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full border-[40px] border-white/[0.04]"
              />
            </div>
          )}
          <div className="mt-5">
            <p className="mb-2.5 text-xs font-medium text-muted-foreground">
              {t(
                recentSigns.length
                  ? "Vos signes explorés"
                  : "À découvrir ensemble",
              )}
            </p>
            <div className="flex flex-wrap gap-2">
              {recentSigns.length
                ? recentSigns.map((id) => {
                    const item = catalog.find((x) => x.id === id);
                    return (
                      item && (
                        <button
                          key={id}
                          onClick={() => setSelectedSign(id)}
                          aria-pressed={selectedSign === id}
                          className={`min-h-10 rounded-full border px-3.5 text-xs transition ${selectedSign === id ? "border-primary bg-primary text-white" : "border-border bg-white text-foreground hover:border-primary"}`}
                        >
                          {item.label[locale]}
                        </button>
                      )
                    );
                  })
                : featured.map((item) => (
                    <button
                      key={item.id}
                      disabled={loading || capturing}
                      onClick={() =>
                        void send(
                          item.label[locale],
                          undefined,
                          undefined,
                          "sign",
                        )
                      }
                      className="min-h-10 rounded-full border border-border bg-white px-3.5 text-xs text-foreground hover:border-primary disabled:opacity-40"
                    >
                      {item.label[locale]}
                    </button>
                  ))}
            </div>
          </div>
        </section>

        <section
          aria-label={t("Conversation avec l’assistant")}
          className="flex min-w-0 flex-col"
        >
          <div className="flex items-center justify-between gap-3 px-5 pt-5 sm:px-6">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-primary">
                <Sparkles size={15} />
              </span>
              <h2 className="text-sm font-semibold">{t("Votre guide")}</h2>
            </div>
            <span className="text-[11px] text-muted-foreground">
              {intent === "sign"
                ? t("Français & anglais")
                : t(
                    connection === "ready"
                      ? "Assistant IA · connecté"
                      : connection === "checking"
                        ? "Connexion en cours…"
                        : "Mode guidé · IA indisponible",
                  )}
            </span>
          </div>
          <div
            ref={messageLog}
            role="log"
            aria-label={t("Messages")}
            aria-live="polite"
            aria-relevant="additions text"
            className="relative h-[300px] space-y-5 overflow-y-auto overscroll-contain px-5 py-6 sm:px-6 lg:h-[360px]"
          >
            {!messages.length && (
              <div className="pt-4">
                <h3 className="max-w-xs text-2xl font-medium leading-snug tracking-tight">
                  {t(
                    intent === "sign"
                      ? "Quel mot aimeriez-vous apprendre ?"
                      : "Avançons à votre rythme.",
                  )}
                </h3>
                <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
                  {t(
                    intent === "sign"
                      ? "Dites-moi un mot, en français ou en anglais. Je trouverai la vidéo pour vous et votre enfant."
                      : "Une idée d’activité, une question ou un peu de pratique ? Je suis là pour vous accompagner.",
                  )}
                </p>
                <div className="mt-6 space-y-2">
                  {(intent === "sign"
                    ? [
                        {
                          title: "Comment signer bonjour ?",
                          prompt: locale === "fr" ? "bonjour" : "hello",
                        },
                        {
                          title:
                            collection === "lsf"
                              ? "Montre-moi le signe pour chapeau"
                              : "Montre-moi le signe pour maman",
                          prompt:
                            collection === "lsf"
                              ? locale === "fr"
                                ? "chapeau"
                                : "hat"
                              : locale === "fr"
                                ? "maman"
                                : "mother",
                        },
                      ]
                    : starters.slice(0, 3)
                  ).map((item) => (
                    <button
                      key={item.title}
                      disabled={capturing}
                      onClick={() =>
                        void send(
                          t(item.prompt),
                          "action" in item
                            ? (item.action as Action)
                            : undefined,
                        )
                      }
                      className="flex min-h-11 w-full items-center justify-between gap-3 border-b border-border py-3 text-left text-xs text-primary hover:text-primary/90 disabled:opacity-50"
                    >
                      {t(item.title)}
                      <ArrowUpRight size={15} />
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((message) => (
              <article
                key={message.id}
                lang={message.language}
                ref={
                  message.role === "assistant" && message.id === latest?.id
                    ? latestReply
                    : undefined
                }
                className={
                  message.role === "user"
                    ? "ml-auto w-fit max-w-[90%] rounded-2xl rounded-br-md bg-secondary px-4 py-2.5"
                    : "max-w-full"
                }
              >
                <span className="sr-only">
                  {message.role === "user" ? t("Vous") : "EduSign"}
                </span>
                {message.mode === "fallback" && (
                  <p className="mb-2 text-[11px] text-warning-foreground">
                    {t("Réponse guidée")}
                  </p>
                )}
                {message.exercise_result && (
                  <p
                    className={`mb-2 flex items-center gap-2 rounded-lg p-3 text-xs font-medium ${message.exercise_result.correct ? "bg-success-subtle text-success-foreground" : "bg-warning-subtle text-warning-foreground"}`}
                  >
                    <Check size={15} />
                    {t(
                      message.exercise_result.correct
                        ? "Bien joué, c’est la bonne réponse !"
                        : "Une occasion d’apprendre",
                    )}
                  </p>
                )}
                <p className="whitespace-pre-wrap break-words text-sm leading-6">
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
                {!!message.sign_ids?.length && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {message.sign_ids.slice(0, 3).map((id) => {
                      const item = catalog.find((x) => x.id === id);
                      return (
                        item && (
                          <button
                            key={id}
                            onClick={() => setSelectedSign(id)}
                            aria-pressed={selectedSign === id}
                            className="flex min-h-10 items-center gap-2 rounded-full border border-border px-3 text-xs font-semibold text-primary hover:bg-secondary"
                          >
                            <Play size={13} />
                            {item.label[message.language]}
                          </button>
                        )
                      );
                    })}
                  </div>
                )}
                {message.resources
                  ?.filter((resource) => safeTutorResource(resource.url))
                  .map((resource) => (
                    <Link
                      key={resource.url}
                      href={resource.url}
                      target={
                        resource.url.startsWith("https:") ? "_blank" : undefined
                      }
                      rel={
                        resource.url.startsWith("https:")
                          ? "noopener noreferrer"
                          : undefined
                      }
                      className="mt-3 flex min-h-10 items-center gap-2 text-xs font-semibold text-primary underline underline-offset-4"
                    >
                      {resource.title}
                      <ArrowUpRight size={13} />
                      {resource.url.startsWith("https:") && (
                        <span className="sr-only">
                          {t("Ouvre un nouvel onglet")}
                        </span>
                      )}
                    </Link>
                  ))}
                {message.exercise && (
                  <fieldset
                    disabled={loading || capturing || message.answered}
                    className="mt-4 rounded-xl bg-muted/50 p-3"
                  >
                    <legend className="text-xs font-semibold">
                      {t("À vous de jouer")}
                    </legend>
                    <p className="mb-3 text-sm">{message.exercise.question}</p>
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
                              undefined,
                              message.language,
                            )
                          }
                          className="w-full rounded-lg border bg-white p-3 text-left text-xs hover:border-primary disabled:opacity-50"
                        >
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
                    className="mt-2 flex min-h-9 items-center gap-1.5 text-[11px] text-muted-foreground hover:text-primary disabled:opacity-50"
                  >
                    {voice.speaking === message.id ? (
                      voice.preparing ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <Square size={13} />
                      )
                    ) : (
                      <Headphones size={13} />
                    )}{" "}
                    {translate(
                      voice.speaking === message.id
                        ? "Arrêter la lecture"
                        : "Écouter",
                      message.language,
                    )}
                  </button>
                )}
              </article>
            ))}
            {loading && (
              <div
                role="status"
                className="flex items-center gap-2 text-xs text-muted-foreground"
              >
                <Loader2 size={15} className="animate-spin" />
                {t(
                  intent === "sign"
                    ? "Recherche de votre démonstration…"
                    : "Votre coach prépare une réponse…",
                )}
                <button
                  onClick={() => request.current?.abort()}
                  className="ml-auto min-h-10 px-2 underline"
                >
                  {t("Annuler")}
                </button>
              </div>
            )}
          </div>
          <div className="mt-auto px-4 pb-4 sm:px-5">
            {!loading &&
              latest?.role === "assistant" &&
              !!latest.suggestions?.length && (
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {latest.suggestions.slice(0, 3).map((suggestion) => (
                    <button
                      key={suggestion}
                      disabled={capturing}
                      onClick={() => void send(suggestion)}
                      className="min-h-9 rounded-full bg-muted px-3 text-[11px] text-muted-foreground hover:bg-accent disabled:opacity-50"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            {(error || voice.error) && (
              <p
                role="alert"
                className="mb-3 rounded-lg bg-warning-subtle p-3 text-xs text-warning-foreground"
              >
                {t(error || voice.error)}
              </p>
            )}
            {capturing && (
              <div
                role="status"
                className="mb-3 flex flex-wrap items-center gap-2 rounded-xl bg-secondary p-3 text-xs"
              >
                <span className="flex flex-1 items-center gap-2">
                  {voice.phase === "recording" ? (
                    <Mic size={15} className="text-destructive" />
                  ) : (
                    <Loader2 size={15} className="animate-spin" />
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
                    className="min-h-10 rounded-full bg-primary px-3 text-white"
                  >
                    {t("Terminer")}
                  </button>
                )}
                <button
                  onClick={voice.cancel}
                  aria-label={t("Annuler l’enregistrement")}
                  className="p-2"
                >
                  <X size={16} />
                </button>
              </div>
            )}
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void send(input);
              }}
              className="rounded-2xl border border-border bg-background p-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10"
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
                  intent === "sign"
                    ? "Un mot, une envie d’apprendre…"
                    : "Posez votre question…",
                )}
                className="w-full resize-none bg-transparent px-1 text-sm leading-6 outline-none disabled:opacity-50"
              />
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  disabled={loading || capturing}
                  onClick={() => void voice.start()}
                  aria-label={t("Dicter une question")}
                  className="flex min-h-10 items-center gap-2 rounded-full px-2.5 text-xs text-muted-foreground hover:bg-secondary disabled:opacity-40"
                >
                  <Mic size={17} />
                  {t("Dicter")}
                </button>
                <div className="flex items-center gap-2">
                  {input.length > 1800 && (
                    <span className="text-[10px] text-muted-foreground">
                      {input.length}/2000
                    </span>
                  )}
                  <button
                    type="submit"
                    disabled={!input.trim() || loading || capturing}
                    aria-label={t("Envoyer la question")}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white hover:bg-primary/90 disabled:opacity-30"
                  >
                    <ArrowUp size={19} />
                  </button>
                </div>
              </div>
            </form>
            <label className="mt-2 flex min-h-9 w-fit cursor-pointer items-center gap-2 text-[10px] text-muted-foreground">
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
        </section>
      </div>
      <div className="border-t border-border px-5 py-3 sm:px-7">
        <SignLibrary
          collection={collection}
          disabled={loading || capturing}
          onSelect={(word) => {
            setIntent("sign");
            void send(word, undefined, undefined, "sign");
          }}
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-border bg-background px-5 py-3 text-[10px] leading-5 text-muted-foreground sm:px-7">
        <span>
          {t(
            collection === "project"
              ? "Clips du projet · langue des signes non vérifiée"
              : "Collection LSF · Elix / Signes de sens",
          )}
        </span>
        <details className="max-w-xl">
          <summary className="cursor-pointer">
            {t("À propos de votre échange")}
          </summary>
          <p className="mt-2">
            {t(
              "Les échanges restent dans cette page. La dictée envoie votre audio au service de transcription ; relisez le texte avant de l’envoyer. Les réponses du coach et la voix utilisent l’IA.",
            )}
          </p>
        </details>
      </div>
    </div>
  );
}
