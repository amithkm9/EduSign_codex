"use client";
import { useState } from "react";
import Link from "next/link";
import { Share2, Copy, ArrowUpRight, Check } from "lucide-react";
import { useLocale } from "@/components/i18n/locale-provider";
import { LSF_LESSONS } from "@/lib/data/lsf";
import { CourseCover } from "@/components/courses/course-cover";

export function ShareLesson() {
  const { t } = useLocale();
  const [id, setId] = useState("lsf-couleurs");
  const [status, setStatus] = useState("");
  const [manualLink, setManualLink] = useState("");
  const [busy, setBusy] = useState(false);
  const lesson = LSF_LESSONS.find((l) => l.id === id)!;
  async function share(copyOnly: boolean) {
    setBusy(true);
    setStatus("");
    setManualLink("");
    const url = new URL(
      `/learn/${lesson.id}`,
      window.location.origin,
    ).toString();
    try {
      if (!copyOnly && navigator.share) {
        await navigator.share({
          title: `EduSign · ${t(lesson.title)}`,
          text: t(
            "On découvre la LSF ensemble ? Voici une petite activité à essayer.",
          ),
          url,
        });
        setStatus("Le partage a été transmis à votre application.");
      } else {
        await navigator.clipboard.writeText(url);
        setStatus("Lien copié. À vous de l’envoyer à un proche !");
      }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        setManualLink(url);
        setStatus("Copiez ce lien pour partager la découverte.");
      }
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="grid items-center gap-8 lg:grid-cols-[1fr_.8fr]">
      <div>
        <p className="eyebrow">{t("UNE INVITATION TOUTE SIMPLE")}</p>
        <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">
          {t("À deux, c’est encore mieux.")}
        </h2>
        <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground">
          {t(
            "Choisissez une découverte et envoyez-la à un proche. Regardez la vidéo, prenez votre temps, puis essayez l’activité ensemble.",
          )}
        </p>
        <label
          htmlFor="shared-lesson"
          className="mb-2 mt-6 block text-sm font-bold"
        >
          {t("Quelle découverte partager ?")}
        </label>
        <select
          id="shared-lesson"
          value={id}
          onChange={(e) => {
            setId(e.target.value);
            setStatus("");
            setManualLink("");
          }}
          className="min-h-12 w-full max-w-lg rounded-xl border border-border bg-white px-4 text-sm"
        >
          {LSF_LESSONS.map((l) => (
            <option key={l.id} value={l.id}>
              {t(l.title)}
            </option>
          ))}
        </select>
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            disabled={busy}
            onClick={() => share(false)}
            className="inline-flex min-h-12 items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-white disabled:opacity-60"
          >
            <Share2 aria-hidden className="size-4" />
            {t("Partager cette découverte")}
          </button>
          <button
            disabled={busy}
            onClick={() => share(true)}
            className="inline-flex min-h-12 items-center gap-2 rounded-full border border-border bg-white px-5 py-3 text-sm font-bold text-primary disabled:opacity-60"
          >
            <Copy aria-hidden className="size-4" />
            {t("Copier le lien")}
          </button>
        </div>
        <p
          role="status"
          className="mt-3 min-h-5 text-sm font-medium text-primary"
        >
          {t(status)}
        </p>
        {manualLink && (
          <label className="mt-3 block text-sm">
            {t("Lien à partager")}
            <input
              readOnly
              value={manualLink}
              onFocus={(e) => e.target.select()}
              className="mt-2 min-h-12 w-full rounded-xl border border-border bg-white px-3 text-sm"
            />
          </label>
        )}
      </div>
      <article className="overflow-hidden rounded-3xl border border-border bg-white shadow-sm">
        <div className="relative aspect-video">
          <CourseCover
            key={lesson.id}
            lesson={lesson}
            sizes="(max-width: 1024px) 90vw, 40vw"
          />
        </div>
        <div className="p-6">
          <p className="text-[11px] text-muted-foreground">{lesson.creator}</p>
          <h3 className="mt-2 text-xl font-bold">{t(lesson.title)}</h3>
          <p className="mt-3 flex gap-2 text-sm leading-relaxed text-muted-foreground">
            <Check aria-hidden className="mt-1 size-4 shrink-0 text-primary" />
            {t(lesson.challenge)}
          </p>
          <Link
            href={`/learn/${lesson.id}`}
            className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-primary"
          >
            {t("Ouvrir la leçon")}
            <ArrowUpRight aria-hidden className="size-4" />
          </Link>
        </div>
      </article>
    </div>
  );
}
