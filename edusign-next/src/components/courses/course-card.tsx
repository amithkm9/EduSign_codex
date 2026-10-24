import { T } from "@/components/i18n/locale-provider";
import Link from "next/link";
import { ArrowRight, BookOpen, Clock, Play } from "lucide-react";
import { type LsfLesson } from "@/lib/data/lsf";
import { CourseCover } from "./course-cover";
export function CourseCard({
  lesson,
  progress = 0,
}: {
  lesson: LsfLesson;
  index?: number;
  progress?: number;
}) {
  return (
    <Link
      href={`/learn/${lesson.id}`}
      className="lesson-card group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-white focus-visible:outline-offset-4"
    >
      <div className="relative aspect-video overflow-hidden">
        <CourseCover lesson={lesson} />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10"
        />
        <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-bold tracking-wide text-primary">
          <T text="LSF · ATELIER GUIDÉ" />
        </span>
        <span
          aria-hidden
          className="absolute bottom-4 right-4 flex size-10 items-center justify-center rounded-full bg-white/95 text-primary shadow-sm transition-transform group-hover:scale-110"
        >
          <Play className="ml-0.5 size-4" fill="currentColor" />
        </span>
        <span className="absolute bottom-4 left-4 max-w-[70%] text-xs font-semibold text-white">
          <T text={lesson.topic} />
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="mb-2 text-[11px] font-medium text-muted-foreground">
          {lesson.creator}
        </p>
        <h3 className="text-2xl font-semibold leading-tight">
          <T text={lesson.title} />
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
          <T text={lesson.description} />
        </p>
        <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-xs">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="size-3.5" /> <T text={"Atelier de"} />{" "}
            {lesson.practiceMinutes}
            <T text={" "} />
            <T text={"min"} />{" "}
          </span>
          <span className="flex items-center gap-2 font-semibold text-primary">
            <T
              text={progress >= 100 ? "Revoir l’atelier" : "Ouvrir l’atelier"}
            />
            <ArrowRight className="size-4" />
          </span>
        </div>
        {progress > 0 && (
          <div className="mt-3 flex items-center gap-2 text-xs text-primary">
            <BookOpen className="size-3.5" />
            <T
              text={
                progress >= 100 ? "Activité terminée" : "Activité commencée"
              }
            />
          </div>
        )}
      </div>
    </Link>
  );
}
