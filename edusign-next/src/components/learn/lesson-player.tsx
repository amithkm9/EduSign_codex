"use client";
import { useLocale as useInterfaceLocale } from "@/components/i18n/locale-provider";

import { T } from "@/components/i18n/locale-provider";

import { useState } from "react";
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
}: {
  lesson: LsfLesson;
  track: boolean;
  initialProgress?: number;
}) {
  const { t: _t, locale } = useInterfaceLocale();

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
    <div className="overflow-hidden rounded-[1.6rem] border border-border bg-white shadow-sm">
      <div className="aspect-video bg-[#24366b]">
        {loaded ? (
          <iframe
            className="h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${lesson.youtubeId}?rel=0&hl=${locale}`}
            title={`${lesson.sourceTitle} — ${lesson.creator} — LSF`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
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
                onClick={() => setLoaded(false)}
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
