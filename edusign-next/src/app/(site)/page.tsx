import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronDown,
  Globe2,
  Heart,
  MessageCircle,
  Play,
  Sprout,
  Users,
} from "lucide-react";
import { T } from "@/components/i18n/locale-provider";
import { CourseCard } from "@/components/courses/course-card";
import { LessonPreview } from "@/components/landing/lesson-preview";
import { LSF_LESSONS, getLsfLesson } from "@/lib/data/lsf";
import { getTranslator } from "@/lib/i18n/server";
import { getUser } from "@/lib/auth";

export async function generateMetadata() {
  const t = await getTranslator();
  return {
    title: t("Apprendre la LSF, ensemble"),
    description: t(
      "Découvrez la langue des signes française avec des ateliers vidéo, des activités à partager et des repères pour les parents. Gratuit, en français et en anglais.",
    ),
  };
}
const featured = ["lsf-bonjour", "lsf-couleurs", "lsf-alphabet"].map((id) =>
  getLsfLesson(id)!,
);
const questions = [
  [
    "Est-ce adapté si nous débutons complètement ?",
    "Oui. Choisissez un thème familier, observez la démonstration et essayez une seule activité. Aucun prérequis n’est demandé pour explorer les ateliers.",
  ],
  [
    "Les leçons sont-elles gratuites ?",
    "Oui. Les huit ateliers actuels sont accessibles librement. Vous pouvez créer un compte gratuit pour garder une trace de votre pratique, sans carte bancaire.",
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
          className="pointer-events-none absolute inset-y-0 right-0 hidden w-[44%] bg-[#f0f3fa]/70 lg:block"
        />
        <div className="container relative grid items-center gap-14 pb-14 pt-12 sm:pb-20 sm:pt-16 lg:grid-cols-[1.06fr_1fr] lg:gap-16 lg:py-24">
          <div className="max-w-xl">
            <p className="flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[.16em] text-primary">
              <span className="h-px w-7 bg-primary/50" aria-hidden />
              <T text="LA LANGUE DES SIGNES, À PARTAGER" />
            </p>
            <h1 className="mt-6 text-[clamp(2.65rem,5vw,4.5rem)] font-semibold leading-[1.08] tracking-[-.055em]">
              <T text="Apprenez la LSF." />
              <br />
              <span className="text-primary">
                <T text="Un signe." />
                <br />
                <T text="Un lien de plus." />
              </span>
            </h1>
            <p className="mt-7 max-w-md text-base leading-[1.8] text-muted-foreground sm:text-lg">
              <T text="Des ateliers visuels pour découvrir la langue des signes française. Des activités simples pour apprendre avec votre enfant, un proche ou à votre rythme." />
            </p>
            <div className="mt-8 flex flex-col items-stretch gap-3 min-[400px]:flex-row min-[400px]:items-center">
              <Link
                href="/courses"
                className="inline-flex min-h-[3.25rem] items-center justify-center gap-3 rounded-xl bg-primary px-6 py-4 text-sm font-semibold text-white shadow-[0_6px_16px_-6px_rgba(44,74,180,.5)] transition-colors hover:bg-primary/90"
              >
                <T text="Commencer gratuitement" />
                <ArrowRight aria-hidden className="size-4" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-foreground hover:bg-white"
              >
                <T text="Comment ça marche" />
                <ArrowUpRight aria-hidden className="size-4" />
              </a>
            </div>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Check aria-hidden className="size-3.5 text-[#3b765c]" />
                <T text="Sans carte bancaire" />
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check aria-hidden className="size-3.5 text-[#3b765c]" />
                <T text="À votre rythme" />
              </span>
            </div>
          </div>
          <div className="px-3 pb-1 pt-2 sm:px-5 lg:pl-3">
            <LessonPreview />
          </div>
        </div>
      </section>

      <section
        aria-label="EduSign"
        className="border-b border-border/70 bg-white"
      >
        <div className="container grid divide-y divide-border/70 py-3 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:py-7">
          {[
            {
              value: String(LSF_LESSONS.length),
              label: "ateliers LSF à explorer",
              Icon: BookOpen,
            },
            {
              value: "FR / EN",
              label: "des explications dans votre langue",
              Icon: Globe2,
            },
            {
              value: "À deux ou en solo",
              label: "un espace pour tous les débutants",
              Icon: Users,
            },
          ].map(({ value, label, Icon }) => (
            <div
              key={label}
              className="flex items-center gap-4 py-5 sm:justify-center sm:px-5 sm:py-1"
            >
              <Icon
                aria-hidden
                className="size-5 shrink-0 text-primary/70"
                strokeWidth={1.5}
              />
              <div>
                <p className="text-lg font-semibold tracking-tight">
                  <T text={value} />
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  <T text={label} />
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container py-16 sm:py-24">
        <div className="mb-9 flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <p className="eyebrow">
              <T text="LE PREMIER PAS" />
            </p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              <T text="Une petite découverte." />
              <br />
              <T text="Une nouvelle façon d’échanger." />
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              <T text="Des sujets du quotidien, une démonstration en LSF et une activité concrète pour essayer." />
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
        <div className="grid gap-6 md:grid-cols-3">
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
          <div className="mt-10 grid gap-8 md:grid-cols-3 md:gap-10">
            {[
              {
                number: "01",
                Icon: Play,
                title: "Choisissez votre découverte",
                text: "Une salutation, une couleur, les lettres d’un prénom. Commencez par ce qui vous parle.",
              },
              {
                number: "02",
                Icon: Heart,
                title: "Observez, puis essayez",
                text: "Regardez les mains, le visage et le mouvement. Faites pause, essayez à deux et revenez à la vidéo.",
              },
              {
                number: "03",
                Icon: Sprout,
                title: "Gardez une trace du chemin",
                text: "Avec un compte gratuit, notez les activités que vous avez pratiquées et retrouvez-les dans votre carnet.",
              },
            ].map(({ number, Icon, title, text }) => (
              <article key={number} className="border-t border-border pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold tracking-wider text-muted-foreground">
                    {number}
                  </span>
                  <Icon
                    aria-hidden
                    className="size-5 text-primary"
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
            <T text="Chacun son rythme." />
            <br />
            <T text="Toujours un point de départ." />
          </h2>
        </div>
        <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
          <article className="flex flex-col rounded-[1.5rem] bg-[#eaf0fa] p-7 sm:p-10">
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
                <T text="Choisissez trois objets colorés, regardez la leçon sur les couleurs, puis cherchez leurs signes ensemble." />
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
            <article className="rounded-[1.5rem] bg-[#f3eee4] p-7 sm:p-8">
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
        <div className="relative overflow-hidden rounded-[1.5rem] bg-[#20335e] px-7 py-12 text-white sm:px-12 lg:px-14">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-36 size-[28rem] rounded-full border-[60px] border-white/[.035]"
          />
          <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
            <div className="max-w-xl">
              <p className="text-[10px] font-semibold uppercase tracking-[.16em] text-[#b9caef]">
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
                className="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-[#20335e] hover:bg-[#edf2ff]"
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
