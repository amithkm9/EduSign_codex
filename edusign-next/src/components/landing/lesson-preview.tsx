"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, BookOpen, Clock3, Play } from "lucide-react";
import { CourseCover } from "@/components/courses/course-cover";
import { useLocale } from "@/components/i18n/locale-provider";
import { getLsfLesson } from "@/lib/data/lsf";

const previews = [
  { id: "lsf-alphabet", label: "L’alphabet" },
  { id: "lsf-nombres", label: "Compter" },
];
export function LessonPreview() {
  const { t } = useLocale();
  const [selected, setSelected] = useState(previews[0].id);
  const lesson = getLsfLesson(selected)!;
  return (
    <div className="relative mx-auto w-full max-w-[540px]">
      <div
        aria-hidden
        className="absolute -right-2 -top-2 size-20 rounded-full border border-white/15"
      />
      <div className="relative overflow-hidden rounded-2xl border border-white/30 bg-white shadow-[0_24px_60px_-32px_rgba(23,42,83,.4)]">
        <div className="flex items-center justify-between gap-3 border-b border-border/70 px-5 py-4 sm:px-6">
          <span className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <BookOpen aria-hidden className="size-4 text-primary" />
            {t("Votre espace de découverte")}
          </span>
          <span className="rounded-md bg-secondary px-2 py-1 text-[10px] font-bold tracking-wider text-primary">
            LSF
          </span>
        </div>
        <div className="p-4 sm:p-5">
          <div
            role="group"
            aria-label={t("Choisissez un aperçu de leçon")}
            className="mb-4 grid grid-cols-2 gap-1 rounded-xl bg-[#f2f4f8] p-1"
          >
            {previews.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={selected === item.id}
                onClick={() => setSelected(item.id)}
                className={`min-h-10 rounded-lg px-2 text-xs font-semibold transition-colors sm:text-sm ${selected === item.id ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:bg-white/60 hover:text-foreground"}`}
              >
                {t(item.label)}
              </button>
            ))}
          </div>
          <Link
            href={`/learn/${lesson.id}`}
            className="group relative block aspect-video overflow-hidden rounded-xl"
            aria-label={`${t("Découvrir cette leçon")} : ${t(lesson.title)}`}
          >
            <CourseCover
              key={lesson.id}
              lesson={lesson}
              priority
              sizes="(max-width: 640px) 90vw, (max-width: 1024px) 540px, 45vw"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent"
            />
            <span
              aria-hidden
              className="absolute inset-0 grid place-items-center"
            >
              <span className="grid size-14 place-items-center rounded-full bg-white/95 text-primary shadow-md transition-transform group-hover:scale-110">
                <Play className="ml-1 size-5" fill="currentColor" />
              </span>
            </span>
            <span className="absolute bottom-3 left-4 text-[10px] font-medium text-white sm:text-xs">
              {t("Démonstration LSF")} · {lesson.creator}
            </span>
          </Link>
          <div aria-live="polite" aria-atomic="true" className="px-1 pb-1 pt-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[.12em] text-primary">
                  {t("Un atelier pour commencer")}
                </p>
                <h2 className="mt-2 text-xl font-semibold leading-snug sm:text-2xl">
                  {t(lesson.title)}
                </h2>
              </div>
              <span className="mt-1 flex shrink-0 items-center gap-1.5 rounded-full bg-background px-2.5 py-1.5 text-[11px] text-muted-foreground">
                <Clock3 aria-hidden className="size-3" />~
                {lesson.practiceMinutes} min
              </span>
            </div>
            <Link
              href={`/learn/${lesson.id}`}
              className="mt-4 flex min-h-12 items-center justify-between rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
            >
              {t("Découvrir cette leçon")}
              <ArrowUpRight aria-hidden className="size-4" />
            </Link>
          </div>
        </div>
      </div>
      <p className="relative mt-5 text-center text-xs leading-relaxed text-white/75">
        {t(
          "Un aperçu réel de nos ateliers. Le temps indiqué est une suggestion de pratique.",
        )}
      </p>
    </div>
  );
}
