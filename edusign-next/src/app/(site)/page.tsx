import { T } from "@/components/i18n/locale-provider";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Heart,
  Play,
  Sparkles,
  Hand,
  BookOpen,
  Users,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CourseCard } from "@/components/courses/course-card";
import { LSF_LESSONS } from "@/lib/data/lsf";
export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="container grid items-center gap-12 pb-16 pt-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pb-24 lg:pt-20">
          <div>
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white px-4 py-2 text-xs font-bold text-primary">
              <span className="size-2 rounded-full bg-[#ea8d58]" />{" "}
              <T text={"LA LSF, UNE DÉCOUVERTE À PARTAGER"} />{" "}
            </p>
            <h1 className="max-w-xl text-5xl font-extrabold leading-[1.08] tracking-[-.045em] sm:text-6xl xl:text-7xl">
              <T text={"De petites mains."} /> <br />
              <T text={"De grandes"} /> <br />
              <span className="relative inline-block text-primary">
                <T text={"connexions."} />{" "}
                <svg
                  aria-hidden
                  viewBox="0 0 400 18"
                  className="absolute -bottom-3 left-0 h-4 w-full fill-none stroke-[#ef9b68] stroke-[5]"
                >
                  <path d="M4 12 Q170 -3 396 10" />
                </svg>
              </span>
            </h1>
            <p className="mt-9 max-w-md text-lg leading-relaxed text-muted-foreground">
              <T
                text={
                  "Apprendre la langue des signes française, ensemble. Des vidéos à observer, des activités à essayer et de beaux moments à partager."
                }
              />{" "}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="h-14 rounded-full px-7">
                <Link href="/courses">
                  <T text={"Explorer les leçons"} />{" "}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-14 rounded-full bg-white px-6"
              >
                <Link href="/parents">
                  <Heart className="size-4" />{" "}
                  <T text={"Le coin des parents"} />{" "}
                </Link>
              </Button>
            </div>
            <div className="mt-7 flex flex-wrap gap-5 text-xs font-medium text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Check className="size-4 text-primary" />{" "}
                <T text={"Accès libre aux leçons"} />{" "}
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="size-4 text-primary" />{" "}
                <T text={"À votre rythme"} />{" "}
              </span>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-lg py-5">
            <div
              aria-hidden
              className="absolute -right-5 top-0 size-32 rounded-full bg-[#fff0b5]"
            />
            <div className="relative rotate-[2deg] rounded-[2rem] border-2 border-[#24366b] bg-[#dceaff] p-5 shadow-[10px_12px_0_0_#24366b] sm:p-7">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="rounded-full bg-white px-3 py-2">
                  <T text={"LE PETIT ATELIER DU JOUR"} />{" "}
                </span>
                <Sparkles className="size-5 text-primary" />
              </div>
              <div className="my-6 flex items-center justify-center gap-4">
                <div className="flex size-24 -rotate-12 items-center justify-center rounded-[1.5rem] bg-[#ffdfc8] shadow-sm sm:size-28">
                  <Hand className="size-14 text-[#ac572a]" strokeWidth={1.5} />
                </div>
                <div className="text-4xl font-extrabold text-primary">+</div>
                <div className="flex size-24 rotate-12 items-center justify-center rounded-[1.5rem] bg-[#d9efdf] shadow-sm sm:size-28">
                  <Heart className="size-14 text-[#3c7254]" strokeWidth={1.5} />
                </div>
              </div>
              <div className="rounded-2xl bg-white p-6">
                <p className="text-xs font-bold uppercase tracking-wider text-primary">
                  <T text={"Votre première découverte"} />{" "}
                </p>
                <h2 className="mt-2 text-3xl font-extrabold">
                  <T text={"Et si on se disait"} /> <br />
                  <T text={"bonjour autrement ?"} />{" "}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  <T
                    text={
                      "Une vidéo LSF, un proche et quelques minutes pour commencer."
                    }
                  />{" "}
                </p>
                <Link
                  href="/learn/lsf-bonjour"
                  className="mt-5 flex items-center justify-between rounded-xl bg-primary px-4 py-3.5 font-bold text-white"
                >
                  <T text={"C’est parti !"} />{" "}
                  <Play className="size-4" fill="currentColor" />
                </Link>
              </div>
            </div>
            <div className="absolute -bottom-2 -left-3 flex -rotate-6 items-center gap-2 rounded-xl border border-[#24366b] bg-[#fff0b5] px-4 py-3 text-sm font-bold shadow-[3px_3px_0_0_#24366b]">
              <Users className="size-5" />{" "}
              <T text={"Encore mieux à deux."} />{" "}
            </div>
          </div>
        </div>
      </section>
      <section className="border-y border-border bg-white">
        <div className="container grid gap-6 py-7 sm:grid-cols-3">
          {[
            {
              Icon: Play,
              title: "Regarder pour comprendre",
              text: "Des démonstrations en LSF, avec leur source.",
            },
            {
              Icon: Hand,
              title: "Essayer pour apprendre",
              text: "Des activités simples, sans pression.",
            },
            {
              Icon: Heart,
              title: "Partager pour grandir",
              text: "Des idées pour apprendre en famille.",
            },
          ].map((x) => (
            <div key={x.title} className="flex items-center gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-secondary">
                <x.Icon className="size-5 text-primary" />
              </span>
              <div>
                <h2 className="text-sm font-bold">
                  <T text={x.title} />
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  <T text={x.text} />
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="container py-16 sm:py-20">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="eyebrow">
              <T text={"UNE ENVIE, UNE DÉCOUVERTE"} />
            </p>
            <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">
              <T text={"Par quoi commence-t-on ?"} />{" "}
            </h2>
            <p className="mt-3 text-muted-foreground">
              <T
                text={
                  "Choisissez un sujet qui vous parle. Le reste vient petit à petit."
                }
              />{" "}
            </p>
          </div>
          <Link
            href="/courses"
            className="flex items-center gap-2 text-sm font-bold text-primary"
          >
            <T text={"Toutes les leçons"} /> <ArrowUpRight className="size-4" />
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {LSF_LESSONS.slice(0, 3).map((l, i) => (
            <CourseCard key={l.id} lesson={l} index={i} />
          ))}
        </div>
      </section>
      <section className="container pb-20">
        <div className="grid gap-10 rounded-[2rem] bg-[#24366b] p-8 text-white sm:p-12 md:grid-cols-[1.3fr_1fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#ffd7b8]">
              <T text={"POUR LES PARENTS, AUSSI"} />{" "}
            </p>
            <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">
              <T text={"Pas besoin de tout savoir"} /> <br />
              <T text={"pour apprendre ensemble."} />{" "}
            </h2>
            <p className="mt-5 max-w-md leading-relaxed text-white/75">
              <T
                text={
                  "Installez-vous à côté de votre enfant. Observez, essayez, recommencez. Votre présence compte plus que la perfection."
                }
              />{" "}
            </p>
            <Button
              asChild
              variant="secondary"
              className="mt-7 h-12 rounded-full bg-[#fff0b5] px-6 text-[#24366b] hover:bg-[#ffe89a]"
            >
              <Link href="/parents">
                <T text={"Trouver des idées pour l’accompagner"} />
                <T text={" "} />
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
          <div className="flex flex-col justify-center gap-4">
            {[
              "Choisir un seul thème à la fois",
              "Faire une pause et réessayer",
              "Célébrer chaque petite découverte",
            ].map((x, i) => (
              <div
                className="flex items-center gap-4 rounded-2xl border border-white/15 bg-white/5 p-4"
                key={x}
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/10 font-bold text-[#ffd7b8]">
                  0{i + 1}
                </span>
                <span className="font-medium">
                  <T text={x} />
                </span>
              </div>
            ))}
            <Link
              href="/resources"
              className="mt-2 inline-flex items-center gap-2 text-sm text-white/80"
            >
              <BookOpen className="size-4" />{" "}
              <T text={"Découvrir nos ressources LSF"} />
              <T text={" "} />
              <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
