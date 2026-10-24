"use client";
import { useLocale as useInterfaceLocale } from "@/components/i18n/locale-provider";

import { T } from "@/components/i18n/locale-provider";

import { useRef, useState } from "react";
import { YouTubePlayer, type YouTubeControls } from "./youtube-player";
import { summarizeVideo, type VideoSummary } from "@/lib/video/progress.mjs";
import { CameraPractice } from "@/components/quiz/camera-practice";
import { LessonQuiz } from "@/components/quiz/lesson-quiz";
import Link from "next/link";
import {
  Play,
  ExternalLink,
  CheckCircle2,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { type LsfLesson, youtubeUrl } from "@/lib/data/lsf";
import { CourseCover } from "@/components/courses/course-cover";
import { Button } from "@/components/ui/button";
export function LessonPlayer({
  lesson,
  track,
  initialProgress = 0,
  initialVideo,
}: {
  lesson: LsfLesson;
  track: boolean;
  initialProgress?: number;
  initialVideo?: VideoSummary;
}) {
  const { t: _t } = useInterfaceLocale();

  const [videoProgress, setVideoProgress] = useState(
    () => initialVideo ?? summarizeVideo([]),
  );
  const [videoSaveState, setVideoSaveState] = useState<
    "saving" | "saved" | "error"
  >("saved");
  const [quizOpen, setQuizOpen] = useState(false);
  const [activity, setActivity] = useState<"camera" | "quiz">("camera");
  const [quizVisited, setQuizVisited] = useState(false);
  const controls = useRef<YouTubeControls | null>(null);
  const quizRegion = useRef<HTMLDivElement>(null);
  const videoRegion = useRef<HTMLDivElement>(null);
  function openQuiz(kind: "camera" | "quiz" = "camera") {
    if (controls.current) controls.current.pause();
    else setLoaded(false);
    setQuizOpen(true);
    setActivity(kind);
    if (kind === "quiz") setQuizVisited(true);
    requestAnimationFrame(() => {
      quizRegion.current?.scrollIntoView({
        behavior: "instant",
        block: "start",
      });
      quizRegion.current?.focus({ preventScroll: true });
    });
  }
  function replay() {
    controls.current?.pause();
    setQuizOpen(false);
    setLoaded(false);
    requestAnimationFrame(() => {
      videoRegion.current?.scrollIntoView({
        behavior: "instant",
        block: "start",
      });
      videoRegion.current
        ?.querySelector("button")
        ?.focus({ preventScroll: true });
    });
  }
  const [loaded, setLoaded] = useState(false);
  const [done, setDone] = useState(initialProgress >= 100);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  async function complete() {
    if (saving || done) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/learning/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: lesson.id,
          type: "end",
          activeMs: 0,
          progressPercentage: 100,
        }),
      });
      if (!res.ok) throw new Error();
      setDone(true);
    } catch {
      setError(
        "Votre activité n’a pas été enregistrée. Réessayez dans un instant.",
      );
    } finally {
      setSaving(false);
    }
  }
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
      <div
        className="flex items-center gap-1 border-b border-border bg-white p-3"
        role="group"
        aria-label={_t("Votre atelier, à votre rythme")}
      >
        {(["1. Regarder", "2. Pratiquer", "3. Quiz"] as const).map(
          (label, i) => (
            <button
              key={label}
              type="button"
              onClick={() =>
                i === 0 ? replay() : openQuiz(i === 1 ? "camera" : "quiz")
              }
              aria-pressed={
                i === 0
                  ? !quizOpen
                  : quizOpen && activity === (i === 1 ? "camera" : "quiz")
              }
              className="min-h-11 flex-1 rounded-lg px-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-secondary aria-pressed:bg-secondary aria-pressed:text-primary sm:text-sm"
            >
              {_t(label)}
            </button>
          ),
        )}
      </div>
      <div
        ref={videoRegion}
        className="aspect-video min-h-[200px] scroll-mt-28 bg-[#24366b]"
      >
        {loaded ? (
          <YouTubePlayer
            lesson={lesson}
            onEnded={() => openQuiz()}
            controls={controls}
            track={track}
            onProgress={setVideoProgress}
            onSaveState={setVideoSaveState}
          />
        ) : (
          <div className="relative isolate flex h-full flex-col items-center justify-center gap-3 overflow-hidden p-6 text-center text-white">
            <div className="absolute inset-0 -z-20">
              <CourseCover
                lesson={lesson}
                sizes="(max-width: 1024px) 100vw, 65vw"
                priority
              />
            </div>
            <div
              className="absolute inset-0 -z-10 bg-[#142247]/75"
              aria-hidden
            />
            <button
              onClick={() => setLoaded(true)}
              className="flex size-16 items-center justify-center rounded-full bg-[#fff0b5] text-[#24366b] shadow-lg transition-transform hover:scale-105 sm:size-20"
              aria-label={_t(`Charger la vidéo : ${lesson.sourceTitle}`)}
            >
              <Play className="ml-1 size-7" fill="currentColor" />
            </button>
            <p className="mt-1 text-lg font-bold sm:text-2xl">
              {lesson.sourceTitle}
            </p>
            <p className="text-xs text-white/65">
              <T text={"Vidéo LSF ·"} /> {lesson.creator}
            </p>
            <p className="max-w-sm text-[11px] text-white/60">
              <T
                text={
                  "Le lecteur YouTube est chargé uniquement après votre clic."
                }
              />{" "}
            </p>
          </div>
        )}
      </div>
      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold">
              <T text={"Une vidéo de"} /> {lesson.creator}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              <T
                text={
                  "Le lecteur ne fonctionne pas ? Ouvrez la vidéo sur YouTube."
                }
              />{" "}
            </p>
          </div>
          <a
            href={youtubeUrl(lesson)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-4 text-sm font-semibold text-primary"
          >
            <T text={"Voir sur YouTube"} /> <ExternalLink className="size-4" />
            <span className="sr-only">
              {" "}
              <T text={"(nouvel onglet)"} />
            </span>
          </a>
        </div>
        <section
          aria-label={_t("Votre progression vidéo")}
          className="mt-5 rounded-2xl border border-border p-4"
        >
          <div className="flex flex-wrap justify-between gap-3 text-sm font-semibold">
            <span>
              {_t("Temps de lecture actif")} ·{" "}
              {Math.floor(videoProgress.activeMs / 60000)} min{" "}
              {Math.floor(videoProgress.activeMs / 1000) % 60} s
            </span>
            <span>
              {videoProgress.coverage}% {_t("de la vidéo regardée")}
            </span>
          </div>
          <progress
            value={videoProgress.coverage}
            max={100}
            aria-label={_t("Partie de la vidéo regardée")}
            className="mt-3 h-2 w-full accent-primary"
          />
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            {_t(
              "Seule la lecture active dans cet onglet visible est comptée. Les pauses, les sauts et le visionnage sur YouTube sont exclus.",
            )}
          </p>
          <p role="status" className="mt-2 text-xs text-primary">
            {_t(
              !track
                ? "Connectez-vous pour retrouver ce suivi dans votre bilan."
                : videoSaveState === "saving"
                  ? "Enregistrement du suivi…"
                  : videoSaveState === "error"
                    ? "Suivi non synchronisé. Gardez cette page ouverte pour réessayer."
                    : "Le suivi est enregistré automatiquement pendant la lecture.",
            )}
          </p>
        </section>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-primary/15 bg-secondary/60 p-5">
          <div>
            <p className="font-bold">
              <T text="Choisissez votre activité" />
            </p>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              <T text="Une capture de 3 secondes, ou 3 questions sans caméra. Vous pouvez essayer les deux." />
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => openQuiz()}
              className="rounded-lg"
              aria-expanded={quizOpen}
              aria-controls="lesson-quiz"
            >
              <T text="Commencer le défi caméra" />
            </Button>
            <Button variant="outline" onClick={() => openQuiz("quiz")}>
              <T text="Faire le quiz sans caméra" />
            </Button>
          </div>
        </div>
        <div
          id="lesson-quiz"
          ref={quizRegion}
          tabIndex={-1}
          role="region"
          aria-label={_t("Activités de la leçon")}
          className="mt-6 scroll-mt-28 rounded-3xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
        >
          {quizOpen && (
            <div className="space-y-4">
              <div
                className="flex flex-wrap gap-2"
                role="group"
                aria-label={_t("Choisissez votre activité")}
              >
                {(["camera", "quiz"] as const).map((kind) => (
                  <button
                    key={kind}
                    type="button"
                    aria-pressed={activity === kind}
                    className="min-h-11 rounded-lg border border-border px-4 text-sm font-semibold aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-white"
                    onClick={() => {
                      setActivity(kind);
                      if (kind === "quiz") setQuizVisited(true);
                    }}
                  >
                    {_t(
                      kind === "camera"
                        ? "Pratique caméra"
                        : "Quiz de compréhension",
                    )}
                  </button>
                ))}
              </div>
              {activity === "camera" && (
                <CameraPractice
                  courseId={lesson.id}
                  onReplay={replay}
                  track={track}
                />
              )}
            </div>
          )}
          {quizVisited && (
            <div className="mt-4" hidden={!quizOpen || activity !== "quiz"}>
              <LessonQuiz
                courseId={lesson.id}
                track={track}
                onReplay={replay}
              />
            </div>
          )}
        </div>
        <div className="mt-6 rounded-2xl bg-secondary p-5">
          <h2 className="font-bold">
            <T text={"À vous de jouer"} />
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            <T text={lesson.challenge} />
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {track ? (
              <Button
                onClick={complete}
                disabled={saving || done}
                className="rounded-full"
              >
                {saving ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="size-4" />
                )}
                <T
                  text={
                    done
                      ? "Activité enregistrée"
                      : "J’ai pratiqué cette activité"
                  }
                />
              </Button>
            ) : (
              <Button asChild className="rounded-full">
                <Link href={`/login?redirectTo=/learn/${lesson.id}`}>
                  <T text={"Me connecter pour garder une trace"} />{" "}
                </Link>
              </Button>
            )}
            {loaded && (
              <button
                onClick={replay}
                className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary"
              >
                <RotateCcw className="size-4" />{" "}
                <T text={"Revoir la vidéo"} />{" "}
              </button>
            )}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <T
              text={
                "Une activité cochée indique votre pratique déclarée, pas une évaluation de vos signes."
              }
            />{" "}
          </p>
          {error && (
            <p role="alert" className="mt-3 text-sm text-destructive">
              <T text={error} />
            </p>
          )}
          {done && (
            <p
              role="status"
              className="mt-3 text-sm font-semibold text-primary"
            >
              <T
                text={
                  "Bravo pour ce moment de découverte ! Retrouvez-le dans vos progrès."
                }
              />{" "}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
