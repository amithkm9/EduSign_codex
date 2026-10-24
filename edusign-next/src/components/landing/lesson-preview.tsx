"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Clock3, Play, Video } from "lucide-react";
import { CourseCover } from "@/components/courses/course-cover";
import { useLocale } from "@/components/i18n/locale-provider";
import { getLsfLesson } from "@/lib/data/lsf";

const previews = [
  {
    id: "lsf-alphabet",
    label: "L’alphabet",
    marker: "Aa",
    title: "L’alphabet en langue des signes",
  },
  {
    id: "lsf-nombres",
    label: "Les nombres",
    marker: "123",
    title: "Les nombres en langue des signes",
  },
];
export function LessonPreview() {
  const { t } = useLocale();
  const [selected, setSelected] = useState("lsf-nombres");
  const lesson = getLsfLesson(selected)!;
  const current = previews.find((item) => item.id === selected)!;
  return (
    <div className="relative mx-auto w-full max-w-[600px]">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold">
        <span className="flex items-center gap-2 text-primary">
          <Video aria-hidden className="size-4" />
          {t("Une vraie leçon, dès maintenant")}
        </span>
        <span className="rounded-full bg-white px-3 py-1.5 text-muted-foreground">
          {t("Niveau débutant")}
        </span>
      </div>
      <div className="overflow-hidden rounded-[1.5rem] border border-white bg-white p-2 shadow-[0_16px_50px_-20px_rgba(35,59,112,.3)]">
        <Link
          href={`/learn/${lesson.id}`}
          className="group relative block aspect-[4/3] overflow-hidden rounded-[1.1rem] bg-media"
          aria-label={`${t("Regarder la leçon")} : ${t(current.title)}`}
        >
          <CourseCover
            key={lesson.id}
            lesson={lesson}
            priority
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 600px, 45vw"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-media/95 via-transparent to-transparent"
          />
          <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-2 text-[11px] font-semibold text-foreground">
            <span aria-hidden className="size-1.5 rounded-full bg-primary" />
            {t("Vidéo en langue des signes française")}
          </span>
          <span
            aria-hidden
            className="absolute inset-0 grid place-items-center"
          >
            <span className="grid size-16 place-items-center rounded-full border border-white/80 bg-white/95 text-primary shadow-xl transition-transform motion-safe:group-hover:scale-110 sm:size-20">
              <Play className="ml-1 size-7" fill="currentColor" />
            </span>
          </span>
          <div
            className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-6"
            aria-live="polite"
            aria-atomic="true"
          >
            <p className="text-[11px] font-medium text-white/80">
              {lesson.creator}
            </p>
            <h2 className="mt-2 text-xl font-semibold leading-tight sm:text-2xl">
              {t(current.title)}
            </h2>
            <span className="mt-3 inline-flex items-center gap-2 text-xs font-semibold">
              {t("Regarder la leçon")}{" "}
              <ArrowUpRight aria-hidden className="size-4" />
            </span>
          </div>
        </Link>
        <div
          role="group"
          aria-label={t("Choisissez un aperçu de leçon")}
          className="grid grid-cols-2 gap-2 p-2 pt-3"
        >
          {previews.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={selected === item.id}
              onClick={() => setSelected(item.id)}
              className={`flex min-h-16 items-center gap-3 rounded-xl border px-3 py-3 text-left text-sm font-semibold transition-colors ${selected === item.id ? "border-primary/25 bg-secondary text-primary" : "border-transparent text-muted-foreground hover:bg-secondary/60"}`}
            >
              <span
                aria-hidden
                className="grid size-9 shrink-0 place-items-center rounded-lg bg-white text-xs font-bold shadow-sm"
              >
                {item.marker}
              </span>
              {t(item.label)}
            </button>
          ))}
        </div>
      </div>
      <p className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Clock3 aria-hidden className="size-3.5 shrink-0" />
        {t("Prévoyez environ 10 minutes pour regarder et pratiquer.")}
      </p>
    </div>
  );
}
