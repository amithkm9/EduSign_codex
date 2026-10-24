"use client";

import Image from "next/image";
import { useState } from "react";
import { BookOpen } from "lucide-react";
import { useLocale } from "@/components/i18n/locale-provider";
import { type LsfLesson, LESSON_TINTS } from "@/lib/data/lsf";

export function CourseCover({
  lesson,
  priority = false,
  sizes = "(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw",
}: {
  lesson: LsfLesson;
  priority?: boolean;
  sizes?: string;
}) {
  const [failed, setFailed] = useState(false);
  const { t } = useLocale();
  return (
    <div
      className={`absolute inset-0 overflow-hidden ${LESSON_TINTS[lesson.tint]}`}
    >
      <div
        aria-hidden
        className="flex h-full items-center justify-center text-primary/50"
      >
        <BookOpen className="size-16" strokeWidth={1.2} />
      </div>
      {!failed && (
        <Image
          src={`https://i.ytimg.com/vi/${lesson.youtubeId}/hqdefault.jpg`}
          alt={`${t("Aperçu de la vidéo")} : ${lesson.sourceTitle} — ${lesson.creator}`}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-105"
          onError={() => setFailed(true)}
        />
      )}
      {failed && (
        <span className="absolute inset-x-4 bottom-4 text-center text-xs font-semibold text-primary">
          {t("Aperçu indisponible · La leçon reste accessible")}
        </span>
      )}
    </div>
  );
}
