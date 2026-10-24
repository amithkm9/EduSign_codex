"use client";
import { useLocale as useInterfaceLocale } from "@/components/i18n/locale-provider";

import { T } from "@/components/i18n/locale-provider";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, RotateCcw, Hand, Check, Eye, Heart } from "lucide-react";
import { LSF_LESSONS, LESSON_TINTS } from "@/lib/data/lsf";
export function QuizPlayer() {
  const { t: _t } = useInterfaceLocale();

  const [index, setIndex] = useState(0);
  const [checked, setChecked] = useState<number[]>([]);
  const lesson = LSF_LESSONS[index];
  return (
    <div>
      <div className="mb-8">
        <p className="eyebrow">
          <T text={"L’ATELIER LIBRE"} />
        </p>
        <h1 className="mt-4 text-4xl font-extrabold sm:text-5xl">
          <T text={"On essaie, à deux ?"} />{" "}
        </h1>
        <p className="mt-5 max-w-2xl leading-relaxed text-muted-foreground">
          <T
            text={
              "Choisissez une activité, observez la vidéo LSF et essayez ensemble. Sans caméra, sans note, chacun à son rythme."
            }
          />{" "}
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[16rem_1fr]">
        <nav
          aria-label={_t("Choisir une activité")}
          className="flex gap-2 overflow-x-auto pb-2 lg:flex-col"
        >
          {LSF_LESSONS.map((l, i) => (
            <button
              key={l.id}
              onClick={() => {
                setIndex(i);
                setChecked([]);
              }}
              aria-pressed={i === index}
              className={`min-h-12 shrink-0 rounded-xl border px-4 py-3 text-left text-sm font-semibold ${i === index ? "border-primary bg-primary text-white" : "border-border bg-white hover:bg-secondary"}`}
            >
              <T text={l.title} />
            </button>
          ))}
        </nav>
        <div
          className={`rounded-[2rem] p-7 sm:p-10 ${LESSON_TINTS[lesson.tint]}`}
        >
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-bold">
              <T text={"ACTIVITÉ"} /> {index + 1} / {LSF_LESSONS.length}
            </span>
            <Hand className="size-8" />
          </div>
          <h2 className="mt-7 text-3xl font-extrabold">
            <T text={lesson.title} />
          </h2>
          <p className="mt-4 max-w-xl leading-relaxed">
            <T text={lesson.challenge} />
          </p>
          <Link
            href={`/learn/${lesson.id}`}
            className="mt-6 inline-flex min-h-12 items-center gap-3 rounded-full bg-white px-6 font-bold text-primary"
          >
            <T text={"Ouvrir la démonstration LSF"} />{" "}
            <ArrowRight className="size-4" />
          </Link>
          <fieldset className="mt-8 space-y-3">
            <legend className="mb-4 font-bold">
              <T text={"Mon petit pense-bête"} />
            </legend>
            {[
              { Icon: Eye, text: "J’ai regardé la démonstration." },
              { Icon: Hand, text: "J’ai essayé à mon rythme." },
              { Icon: Heart, text: "J’ai partagé ma découverte." },
            ].map((x, i) => (
              <label
                key={i}
                className="flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl bg-white/75 p-4 text-sm"
              >
                <input
                  type="checkbox"
                  checked={checked.includes(i)}
                  onChange={() =>
                    setChecked((old) =>
                      old.includes(i)
                        ? old.filter((v) => v !== i)
                        : [...old, i],
                    )
                  }
                  className="size-5 accent-primary"
                />
                <x.Icon className="size-4" />
                <T text={x.text} />
              </label>
            ))}
          </fieldset>
          {checked.length === 3 && (
            <p role="status" className="mt-5 flex items-center gap-2 font-bold">
              <Check className="size-5" />{" "}
              <T text={"Un beau moment de découverte !"} />{" "}
            </p>
          )}
          <div className="mt-7 flex flex-wrap gap-4">
            <button
              onClick={() => {
                setIndex((index + 1) % LSF_LESSONS.length);
                setChecked([]);
              }}
              className="inline-flex min-h-12 items-center gap-2 rounded-full bg-primary px-6 font-bold text-white"
            >
              <T text={"Une autre activité"} />{" "}
              <ArrowRight className="size-4" />
            </button>
            <button
              onClick={() => setChecked([])}
              className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold"
            >
              <RotateCcw className="size-4" /> <T text={"Recommencer"} />{" "}
            </button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            <T
              text={
                "Ce pense-bête reste sur cette page. Pour enregistrer une activité, ouvrez sa leçon."
              }
            />{" "}
          </p>
        </div>
      </div>
    </div>
  );
}
