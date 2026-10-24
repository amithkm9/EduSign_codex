import Link from "next/link";
import {
  ArrowRight,
  Eye,
  Heart,
  Sparkles,
  BookOpen,
  Users,
  Hand,
} from "lucide-react";
import { getTranslator } from "@/lib/i18n/server";
import { T } from "@/components/i18n/locale-provider";
import { CourseCover } from "@/components/courses/course-cover";
import { LSF_LESSONS } from "@/lib/data/lsf";
export async function generateMetadata() {
  const t = await getTranslator();
  return {
    title: t("À propos d’EduSign"),
    description: t(
      "Un projet pour apprendre, essayer et se rapprocher grâce à la LSF.",
    ),
  };
}
export default function About() {
  return (
    <div className="container py-12 sm:py-16">
      <section className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="eyebrow">
            <T text="À PROPOS DE NOUS" />
          </p>
          <h1 className="mt-4 max-w-xl text-4xl font-extrabold leading-tight sm:text-6xl">
            <T text="Apprendre pour se rapprocher." />
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            <T text="Nous imaginons un apprentissage qui commence par la curiosité, grandit avec la pratique et se partage avec les autres." />
          </p>
          <p className="mt-4 max-w-xl leading-relaxed text-muted-foreground">
            <T text="EduSign est un projet pédagogique pour les élèves, les parents et tous ceux qui souhaitent découvrir la langue des signes française ensemble." />
          </p>
          <Link
            href="/courses"
            className="mt-7 inline-flex min-h-12 items-center gap-3 rounded-full bg-primary px-6 py-3 font-bold text-white"
          >
            <T text="Faire ma première découverte" />
            <ArrowRight aria-hidden className="size-4" />
          </Link>
        </div>
        <div className="relative rounded-[2.5rem] bg-[#dceaff] p-6 sm:p-9">
          <div
            aria-hidden
            className="absolute -right-2 -top-4 grid size-16 rotate-12 place-items-center rounded-2xl bg-[#fff0b5] text-primary shadow-sm"
          >
            <Sparkles className="size-8" />
          </div>
          <Link
            href="/learn/lsf-nombres"
            className="group relative block aspect-video overflow-hidden rounded-2xl border-4 border-white shadow-lg"
          >
            <CourseCover
              lesson={LSF_LESSONS.find((lesson) => lesson.id === "lsf-nombres")!}
              sizes="(max-width: 1024px) 90vw, 45vw"
              priority
            />
          </Link>
          <div className="relative -mt-5 ml-5 mr-2 rounded-2xl bg-white p-5 shadow-sm sm:ml-10">
            <p className="flex items-center gap-2 text-sm font-bold">
              <Hand aria-hidden className="size-4 text-primary" />
              <T text="De vraies ressources. Des moments à partager." />
            </p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              <T text="Aperçu d’un atelier LSF de Dico Plus LSF, à retrouver dans notre catalogue." />
            </p>
          </div>
        </div>
      </section>
      <div className="my-14 grid gap-5 rounded-3xl border border-border bg-white p-7 text-center sm:grid-cols-3">
        {[
          [String(LSF_LESSONS.length), "ateliers pour commencer"],
          ["FR + EN", "deux langues pour vous guider"],
          ["LSF", "une langue à découvrir ensemble"],
        ].map(([value, label]) => (
          <div key={value}>
            <p className="text-3xl font-extrabold text-primary">{value}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              <T text={label} />
            </p>
          </div>
        ))}
      </div>
      <section className="py-3">
        <p className="eyebrow">
          <T text="CE QUI NOUS ANIME" />
        </p>
        <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">
          <T text="Moins de pression. Plus de découvertes." />
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Eye,
              title: "Observer avec attention",
              text: "Les mains, le visage et le mouvement font partie de la langue. Les vidéos LSF restent notre point de départ.",
              tint: "bg-[#ffe1ce]",
            },
            {
              icon: Heart,
              title: "Apprendre côte à côte",
              text: "Un parent, un ami, un camarade : partager une activité aide à prendre le temps et à oser essayer.",
              tint: "bg-[#f7dbea]",
            },
            {
              icon: BookOpen,
              title: "Respecter la langue et ses créateurs",
              text: "Nous créditons les ressources utilisées et invitons à poursuivre l’apprentissage auprès de personnes compétentes en LSF.",
              tint: "bg-[#d9efdf]",
            },
          ].map(({ icon: Icon, title, text, tint }) => (
            <article key={title} className={`rounded-3xl p-7 ${tint}`}>
              <Icon
                aria-hidden
                className="size-8 text-primary"
                strokeWidth={1.6}
              />
              <h3 className="mt-6 text-xl font-bold">
                <T text={title} />
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-foreground/75">
                <T text={text} />
              </p>
            </article>
          ))}
        </div>
      </section>
      <section className="mt-14 grid gap-8 rounded-[2rem] bg-white p-7 ring-1 ring-border sm:p-10 lg:grid-cols-[.7fr_1fr]">
        <div>
          <p className="eyebrow">
            <T text="NOTRE APPROCHE" />
          </p>
          <h2 className="mt-3 text-3xl font-extrabold">
            <T text="Une aide pour commencer. Une envie d’aller plus loin." />
          </h2>
        </div>
        <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
          <p>
            <T text="EduSign réunit des vidéos publiées par leurs créateurs, des activités guidées et un carnet de pratique. Cocher une activité indique que vous l’avez essayée ; cela ne certifie pas la maîtrise d’un signe." />
          </p>
          <p>
            <T text="Notre assistant IA aide à s’orienter et à trouver des idées. Il ne remplace ni un enseignant de LSF ni les échanges avec la communauté sourde." />
          </p>
          <p>
            <T text="Le projet continue d’évoluer. Nous souhaitons le faire grandir avec les retours des familles et des personnes qui connaissent et pratiquent la LSF." />
          </p>
          <Link
            href="/resources"
            className="inline-flex min-h-11 items-center gap-2 font-bold text-primary"
          >
            <T text="Rencontrer nos sources pédagogiques" />
            <ArrowRight aria-hidden className="size-4" />
          </Link>
        </div>
      </section>
      <section className="mt-12 flex flex-col items-start justify-between gap-6 rounded-3xl bg-primary p-8 text-white sm:flex-row sm:items-center sm:p-10">
        <div>
          <Users aria-hidden className="mb-4 size-7 text-[#fff0b5]" />
          <h2 className="text-2xl font-bold">
            <T text="La prochaine découverte se partage." />
          </h2>
          <p className="mt-2 text-sm text-white/75">
            <T text="Retrouvez des idées pour apprendre et pratiquer à plusieurs." />
          </p>
        </div>
        <Link
          href="/community"
          className="inline-flex min-h-12 shrink-0 items-center gap-3 rounded-full bg-[#fff0b5] px-6 py-3 text-sm font-bold text-primary"
        >
          <T text="Découvrir la communauté" />
          <ArrowRight aria-hidden className="size-4" />
        </Link>
      </section>
    </div>
  );
}
