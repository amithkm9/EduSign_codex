"use client";
import { useState } from "react";
import { useLocale } from "@/components/i18n/locale-provider";
import { LSF_LESSONS } from "@/lib/data/lsf";
import { LessonPlayer } from "@/components/learn/lesson-player";

export function QuizPlayer({ track }: { track: boolean }) {
  const { t } = useLocale();
  const [index, setIndex] = useState(0);
  const lesson = LSF_LESSONS[index];
  return (
    <div className="mx-auto max-w-4xl">
      <p className="eyebrow">{t("VIDÉO + QUIZ")}</p>
      <h1 className="mt-4 text-4xl font-bold sm:text-5xl">
        {t("Regardez. Jouez. Apprenez.")}
      </h1>
      <p className="mt-5 max-w-2xl leading-relaxed text-muted-foreground">
        {t(
          "L’alphabet et les nombres en LSF : une vidéo, trois questions et des explications pour progresser ensemble.",
        )}
      </p>
      <div
        role="group"
        aria-label={t("Choisir une activité")}
        className="my-7 flex flex-wrap gap-3"
      >
        {LSF_LESSONS.map((entry, i) => (
          <button
            key={entry.id}
            aria-pressed={index === i}
            onClick={() => setIndex(i)}
            className={`min-h-12 rounded-full border px-6 text-sm font-semibold ${index === i ? "border-primary bg-primary text-white" : "border-border bg-white text-primary"}`}
          >
            {t(entry.topic)}
          </button>
        ))}
      </div>
      <h2 className="mb-5 text-2xl font-bold">{t(lesson.title)}</h2>
      <LessonPlayer key={lesson.id} lesson={lesson} track={track} />
    </div>
  );
}
