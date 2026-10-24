import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronDown,
  Hand,
  MessageCircle,
  Play,
  Sprout,
  Users,
} from "lucide-react";
import { T } from "@/components/i18n/locale-provider";
import { CourseCard } from "@/components/courses/course-card";
import { LessonPreview } from "@/components/landing/lesson-preview";
import { getLsfLesson } from "@/lib/data/lsf";
import { getTranslator } from "@/lib/i18n/server";
import { getUser } from "@/lib/auth";

export async function generateMetadata() {
  const t = await getTranslator();
  return {
    title: t("Apprendre la langue des signes française"),
    description: t(
      "Découvrez la langue des signes française avec des ateliers vidéo, des activités à partager et des repères pour les parents. Gratuit, en français et en anglais.",
    ),
  };
}
const featured = ["lsf-alphabet", "lsf-nombres"].map((id) => getLsfLesson(id)!);
const questions = [
  [
    "Est-ce adapté si nous débutons complètement ?",
    "Oui. Choisissez un thème familier, observez la démonstration et essayez une seule activité. Aucun prérequis n’est demandé pour explorer les ateliers.",
  ],
  [
    "Les leçons sont-elles gratuites ?",
    "Oui. Les deux ateliers et leurs quiz sont accessibles librement. Créez un compte gratuit pour enregistrer vos résultats, sans carte bancaire.",
  ],
  [
    "La langue des signes change-t-elle avec le bouton FR / EN ?",
    "Non. Les vidéos enseignent toujours la langue des signes française, la LSF. Le bouton change uniquement la langue des explications et de l’interface.",
  ],
  [
    "EduSign remplace-t-il un cours avec un enseignant ?",
    "EduSign aide à découvrir et à pratiquer avec des ressources sélectionnées. Pour approfondir la langue et recevoir un retour sur vos gestes, rapprochez-vous d’un enseignant de LSF.",
  ],
];
export default async function HomePage() {
  const user = await getUser();
  return (
    <div className="landing-page">
      <section className="landing-hero relative overflow-hidden border-b border-border/60">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 top-12 size-[38rem] rounded-full bg-secondary/60 blur-3xl"
        />
        <div className="container relative grid items-center gap-10 py-10 sm:py-14 lg:grid-cols-[.95fr_1.05fr] lg:gap-16 lg:py-16">
          <div className="max-w-xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/80 px-3 py-2 text-[11px] font-semibold tracking-wide text-primary">
              <Hand aria-hidden className="size-4" />
              <T text="LA LANGUE DES SIGNES POUR DÉBUTER" />
            </p>
            <h1 className="mt-6 text-[clamp(2.6rem,4.1vw,3.8rem)] font-semibold leading-[1.1] tracking-[-.045em]">
              <T text="Apprenez la" />{" "}
              <span className="text-primary">
                <T text="langue des signes française." />
              </span>
            </h1>
            <p className="mt-5 text-xl font-medium leading-relaxed text-foreground sm:text-2xl">
              <T text="Regardez un signe. À votre tour d’essayer." />
            </p>
            <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
              <T text="Commencez par l’alphabet et les nombres. Des démonstrations vidéo, de la pratique avec votre caméra et des quiz pour apprendre pas à pas, seul ou en famille." />
            </p>
            <div className="mt-7 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Link
                href="/learn/lsf-alphabet"
                className="inline-flex min-h-14 items-center justify-center gap-3 rounded-xl bg-primary px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-primary/15 transition-colors hover:bg-primary/90"
              >
                <Play aria-hidden className="size-4" fill="currentColor" />
                <T text="Commencer ma première leçon" />
              </Link>
              <a
                href="#lessons"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-2 py-3 text-sm font-semibold text-primary hover:bg-white"
              >
                <T text="Explorer les leçons" />
                <ArrowRight aria-hidden className="size-4" />
              </a>
            </div>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
              {["Gratuit pour commencer", "Aucun compte nécessaire"].map(
                (text) => (
                  <span key={text} className="inline-flex items-center gap-1.5">
                    <Check aria-hidden className="size-3.5 text-success" />
                    <T text={text} />
                  </span>
                ),
              )}
            </div>
          </div>
          <LessonPreview />
        </div>
      </section>

      <section className="border-b border-border bg-white">
        <div className="container grid gap-6 py-7 md:grid-cols-[.75fr_1.3fr_1fr] md:items-center md:gap-10">
          <div className="flex items-center gap-4">
            <span
              aria-hidden
              className="grid size-14 shrink-0 place-items-center rounded-2xl bg-secondary text-lg font-bold text-primary"
            >
              LSF
            </span>
            <h2 className="text-lg font-semibold">
              <T text="La LSF, c’est quoi ?" />
            </h2>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            <T text="LSF signifie Langue des signes française. C’est la langue des signes enseignée dans toutes les leçons EduSign." />
          </p>
          <p className="border-l-2 border-primary/20 pl-4 text-sm leading-relaxed text-muted-foreground">
            <T text="L’interface existe en français et en anglais. Les signes restent ceux de la LSF." />
          </p>
        </div>
      </section>

      <section id="lessons" className="container scroll-mt-24 py-14 sm:py-20">
        <div className="mb-9 flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <p className="eyebrow">
              <T text="VOTRE PARCOURS DÉBUTANT" />
            </p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              <T text="Vos deux premières leçons." />
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              <T text="Apprenez à former les lettres de votre prénom et découvrez comment signer les nombres. Choisissez votre point de départ." />
            </p>
          </div>
          <Link
            href="/courses"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-white px-5 py-2 text-sm font-semibold text-primary hover:border-primary/40"
          >
            <T text="Voir tous les ateliers" />
            <ArrowUpRight aria-hidden className="size-4" />
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {featured.map((lesson) => (
            <CourseCard key={lesson.id} lesson={lesson} />
          ))}
        </div>
        <div className="mt-8 flex flex-col justify-between gap-4 border-t border-border pt-6 text-xs sm:flex-row sm:items-center">
          <p className="flex items-center gap-2 text-muted-foreground">
            <BookOpen aria-hidden className="size-4" />
            <T text="Des ressources originales. Des créateurs identifiés." />
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-3 font-semibold text-foreground/75">
            <a
              className="hover:text-primary hover:underline"
              href="https://www.maelanguedessignes.com/didactique-lsf"
              target="_blank"
              rel="noopener noreferrer"
            >
              MAE Langue des Signes
              <span className="sr-only">
                {" "}
                · <T text="Ouvrir dans un nouvel onglet" />
              </span>
            </a>
            <a
              className="hover:text-primary hover:underline"
              href="https://karinevermot.wixsite.com/website-1/post/lsf-point-par-point-les-nombres"
              target="_blank"
              rel="noopener noreferrer"
            >
              Dico Plus LSF
              <span className="sr-only">
                {" "}
                · <T text="Ouvrir dans un nouvel onglet" />
              </span>
            </a>
            <Link
              href="/resources"
              className="inline-flex items-center gap-1.5 text-primary"
            >
              <T text="Toutes les sources" />
              <ArrowUpRight aria-hidden className="size-3" />
            </Link>
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="scroll-mt-24 border-y border-border/70 bg-white"
      >
        <div className="container py-16 sm:py-20">
          <div className="max-w-2xl">
            <p className="eyebrow">
              <T text="UNE MÉTHODE TOUTE SIMPLE" />
            </p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
              <T text="Regarder. Essayer. Recommencer." />
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              <T text="Quelques minutes et un peu de curiosité suffisent pour faire une place à la LSF dans votre journée." />
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              {
                number: "01",
                Icon: Play,
                title: "Regardez la démonstration",
                text: "Observez les mains et le mouvement dans une vidéo. Faites pause et revoyez chaque passage à votre rythme.",
              },
              {
                number: "02",
                Icon: Hand,
                title: "Entraînez-vous à signer",
                text: "Reproduisez le geste. La caméra vous permet d’enregistrer et de revoir votre essai ; l’analyse automatique est une démo expérimentale.",
              },
              {
                number: "03",
                Icon: Sprout,
                title: "Vérifiez votre compréhension",
                text: "Répondez à trois questions avec des explications. Un compte gratuit permet de retrouver vos résultats et votre activité.",
              },
            ].map(({ number, Icon, title, text }) => (
              <article
                key={number}
                className="rounded-2xl border border-border bg-muted/50 p-6 sm:p-7"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold tracking-wider text-muted-foreground">
                    {number}
                  </span>
                  <Icon
                    aria-hidden
                    className="size-7 text-primary"
                    strokeWidth={1.5}
                  />
                </div>
                <h3 className="mt-6 text-lg font-semibold">
                  <T text={title} />
                </h3>
                <p className="mt-3 max-w-sm text-sm leading-[1.8] text-muted-foreground">
                  <T text={text} />
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="container py-16 sm:py-24">
        <div className="mb-9 max-w-xl">
          <p className="eyebrow">
            <T text="BIEN ACCOMPAGNÉ, DÈS LE DÉBUT" />
          </p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
            <T text="Apprendre seul. Partager en famille." />
          </h2>
        </div>
        <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
          <article className="flex flex-col rounded-[1.5rem] bg-secondary p-7 sm:p-10">
            <div className="flex items-center gap-2 text-xs font-semibold text-primary">
              <Users aria-hidden className="size-4" />
              <T text="POUR LES PARENTS" />
            </div>
            <h3 className="mt-5 max-w-sm text-3xl font-semibold leading-tight">
              <T text="Votre présence fait la différence." />
            </h3>
            <p className="mt-4 max-w-md text-sm leading-[1.8] text-muted-foreground">
              <T text="Vous n’avez pas besoin de connaître la LSF pour commencer à ses côtés. Un thème, une vidéo et un moment ensemble : c’est déjà un premier pas." />
            </p>
            <div className="my-7 rounded-xl border border-white/80 bg-white/70 p-5">
              <p className="text-[10px] font-bold uppercase tracking-[.13em] text-primary">
                <T text="UNE IDÉE POUR CE SOIR" />
              </p>
              <p className="mt-2 text-sm leading-relaxed text-foreground">
                <T text="Comptez trois objets, regardez la leçon sur les nombres, puis cherchez ce nombre dans la vidéo." />
              </p>
            </div>
            <Link
              href="/parents"
              className="mt-auto inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary"
            >
              <T text="Découvrir le guide des parents" />
              <ArrowRight aria-hidden className="size-4" />
            </Link>
          </article>
          <div className="grid gap-6">
            <article className="rounded-[1.5rem] border border-border bg-white p-7 sm:p-8">
              <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                <MessageCircle aria-hidden className="size-4" />
                <T text="UN PEU D’AIDE" />
              </div>
              <h3 className="mt-4 text-xl font-semibold">
                <T text="Une question, une piste pour avancer." />
              </h3>
              <p className="mt-3 text-sm leading-[1.8] text-muted-foreground">
                <T text="L’assistant IA vous aide à choisir une ressource et à trouver des idées d’activités, en français ou en anglais." />
              </p>
              <Link
                href="/tutor"
                className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary"
              >
                <T text="Rencontrer l’assistant" />
                <ArrowUpRight aria-hidden className="size-4" />
              </Link>
              <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                <T text="Il vous oriente ; il ne remplace pas un enseignant de LSF." />
              </p>
            </article>
            <article className="rounded-[1.5rem] bg-muted p-7 sm:p-8">
              <h3 className="text-xl font-semibold">
                <T text="Les découvertes se partagent." />
              </h3>
              <p className="mt-3 text-sm leading-[1.8] text-muted-foreground">
                <T text="Invitez un proche à explorer une leçon et trouvez des activités à essayer ensemble." />
              </p>
              <Link
                href="/community"
                className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary"
              >
                <T text="Apprendre à plusieurs" />
                <ArrowUpRight aria-hidden className="size-4" />
              </Link>
            </article>
          </div>
        </div>
      </section>

      <section className="container pb-16 sm:pb-24">
        <div className="grid gap-8 border-t border-border pt-12 lg:grid-cols-[.7fr_1.3fr] lg:gap-16">
          <div>
            <p className="eyebrow">
              <T text="VOS PREMIÈRES QUESTIONS" />
            </p>
            <h2 className="mt-3 text-3xl font-semibold">
              <T text="Commencer en confiance." />
            </h2>
            <Link
              href="/packages"
              className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary"
            >
              <T text="Découvrir nos formules" />
              <ArrowUpRight aria-hidden className="size-4" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {questions.map(([question, answer]) => (
              <details key={question} className="landing-faq group">
                <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-5 py-5 text-sm font-semibold">
                  <T text={question} />
                  <ChevronDown
                    aria-hidden
                    className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                  />
                </summary>
                <p className="max-w-2xl pb-6 pr-8 text-sm leading-[1.8] text-muted-foreground">
                  <T text={answer} />
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="container pb-16 sm:pb-20">
        <div className="relative overflow-hidden rounded-[1.5rem] bg-navy px-7 py-12 text-white sm:px-12 lg:px-14">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-36 size-[28rem] rounded-full border-[60px] border-white/[.035]"
          />
          <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
            <div className="max-w-xl">
              <p className="text-[10px] font-semibold uppercase tracking-[.16em] text-white/75">
                <T text="VOTRE PROCHAINE DÉCOUVERTE" />
              </p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight sm:text-4xl">
                <T text="Et si on commençait aujourd’hui ?" />
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-white/75">
                <T text="Un compte gratuit pour garder une trace. Des ateliers ouverts pour faire le premier pas." />
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-3">
              <Link
                href={user ? "/dashboard" : "/register"}
                className="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-navy hover:bg-secondary"
              >
                <T
                  text={
                    user ? "Retrouver mon carnet" : "Créer mon compte gratuit"
                  }
                />
                <ArrowRight aria-hidden className="size-4" />
              </Link>
              <Link
                href="/courses"
                className="inline-flex min-h-11 items-center justify-center gap-2 text-sm text-white/85 hover:text-white"
              >
                <T text="Explorer sans compte" />
                <ArrowUpRight aria-hidden className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
