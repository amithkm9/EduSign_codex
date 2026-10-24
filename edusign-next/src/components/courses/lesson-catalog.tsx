"use client";
import { useLocale as useInterfaceLocale } from "@/components/i18n/locale-provider";

import { T } from "@/components/i18n/locale-provider";

import { useState } from "react";
import { Search, X } from "lucide-react";
import { type LsfLesson } from "@/lib/data/lsf";
import { CourseCard } from "./course-card";
const topics = ["Tout découvrir", "L’alphabet", "Les nombres"];
export function LessonCatalog({
  lessons,
  progress = {},
}: {
  lessons: LsfLesson[];
  progress?: Record<string, { progressPercentage: number }>;
}) {
  const { t: _t } = useInterfaceLocale();

  const [topic, setTopic] = useState(topics[0]);
  const [query, setQuery] = useState("");
  const normalize = (s: string) =>
    s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  const filtered = lessons.filter(
    (l) =>
      (topic === topics[0] || topic === l.topic) &&
      normalize(
        l.title +
          " " +
          _t(l.title) +
          " " +
          l.topic +
          " " +
          _t(l.topic) +
          " " +
          l.description +
          " " +
          _t(l.description),
      ).includes(normalize(query)),
  );
  return (
    <div>
      <div className="mb-7 flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
        <div
          className="flex flex-wrap gap-2"
          aria-label={_t("Thèmes des leçons")}
        >
          {topics.map((t) => (
            <button
              key={t}
              onClick={() => setTopic(t)}
              aria-pressed={topic === t}
              className={`min-h-11 rounded-full border px-4 text-sm font-semibold transition-colors ${t === topic ? "border-primary bg-primary text-white" : "border-border bg-white hover:border-primary/40"}`}
            >
              <T text={t} />
            </button>
          ))}
        </div>
        <label className="flex min-h-12 items-center gap-2 rounded-full border border-border bg-white px-4">
          <Search className="size-4 text-muted-foreground" />
          <span className="sr-only">
            <T text={"Rechercher une leçon"} />
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={_t("Une envie d’apprendre ?")}
            className="w-full min-w-0 bg-transparent py-3 text-sm outline-none lg:w-44"
          />
          {query && (
            <button
              aria-label={_t("Effacer la recherche")}
              onClick={() => setQuery("")}
            >
              <X className="size-4" />
            </button>
          )}
        </label>
      </div>
      <p role="status" className="mb-5 text-sm text-muted-foreground">
        {filtered.length}
        <T text={" "} />
        <T
          text={
            filtered.length === 1
              ? "découverte à explorer"
              : "découvertes à explorer"
          }
        />
      </p>
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-2">
        {filtered.map((l) => (
          <CourseCard
            key={l.id}
            lesson={l}
            index={lessons.indexOf(l)}
            progress={progress[l.id]?.progressPercentage}
          />
        ))}
      </div>
      {!filtered.length && (
        <div className="rounded-3xl border border-dashed border-primary/30 bg-white p-12 text-center">
          <h3 className="text-xl font-bold">
            <T text={"Une autre découverte vous attend."} />{" "}
          </h3>
          <p className="mt-2 text-muted-foreground">
            <T
              text={"Essayez un autre mot ou explorez tous les thèmes."}
            />{" "}
          </p>
          <button
            className="mt-5 font-bold text-primary underline"
            onClick={() => {
              setQuery("");
              setTopic(topics[0]);
            }}
          >
            <T text={"Voir toutes les leçons"} />{" "}
          </button>
        </div>
      )}
    </div>
  );
}
