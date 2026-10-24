import Link from "next/link";
import {
  ArrowRight,
  Heart,
  Users,
  Eye,
  MessagesSquare,
  Sparkles,
} from "lucide-react";
import { T } from "@/components/i18n/locale-provider";
import { getTranslator } from "@/lib/i18n/server";
import { ShareLesson } from "@/components/community/share-lesson";
export async function generateMetadata() {
  const t = await getTranslator();
  return {
    title: t("La communauté EduSign"),
    description: t(
      "Des idées et des découvertes LSF à partager en famille ou entre amis.",
    ),
  };
}
export default function Community() {
  return (
    <div className="container py-12 sm:py-16">
      <header className="relative overflow-hidden rounded-[2rem] bg-[#f7dbea]/60 p-7 sm:p-12 lg:p-16">
        <div
          aria-hidden
          className="absolute -right-16 -top-16 size-72 rounded-full border-[45px] border-white/40"
        />
        <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_.6fr]">
          <div>
            <p className="eyebrow">
              <T text="LA COMMUNAUTÉ EDUSIGN" />
            </p>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight sm:text-6xl">
              <T text="Les petits progrès" />
              <br />
              <T text="se vivent ensemble." />
            </h1>
            <p className="mt-5 max-w-xl leading-relaxed text-foreground/75">
              <T text="Un espace pour trouver une activité à partager, inviter un proche et faire une place à la LSF dans votre quotidien." />
            </p>
            <Link
              href="#share-discovery"
              className="mt-7 inline-flex min-h-12 items-center gap-3 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white"
            >
              <T text="Inviter quelqu’un à découvrir" />
              <ArrowRight aria-hidden className="size-4" />
            </Link>
          </div>
          <div className="relative mx-auto w-full max-w-xs rotate-3 rounded-[1.8rem] bg-white p-8 shadow-[8px_10px_0_0_rgba(36,54,107,.08)]">
            <span className="grid size-14 place-items-center rounded-2xl bg-[#fff0b5]">
              <Heart aria-hidden className="size-7 text-primary" />
            </span>
            <p className="mt-6 text-2xl font-extrabold leading-snug">
              <T text="Pas besoin de tout savoir pour commencer ensemble." />
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              <T text="Une vidéo. Un peu de curiosité. Une personne avec qui essayer." />
            </p>
          </div>
        </div>
      </header>
      <section className="mt-14">
        <p className="eyebrow">
          <T text="LE BON MOMENT, C’EST LE VÔTRE" />
        </p>
        <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">
          <T text="Trois idées pour se retrouver." />
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Users,
              title: "Le rendez-vous en famille",
              text: "Rassemblez quelques objets. Regardez la vidéo des nombres, puis comptez-les ensemble et essayez le quiz.",
              label: "Explorer les nombres",
              href: "/learn/lsf-nombres",
              tint: "bg-[#fff0b5]/60",
              tag: "À LA MAISON",
            },
            {
              icon: MessagesSquare,
              title: "Le duo de découverte",
              text: "Regardez une vidéo ensemble, puis répondez chacun à votre tour aux questions du quiz.",
              label: "Essayer un quiz ensemble",
              href: "/quiz",
              tint: "bg-[#dceaff]",
              tag: "ENTRE AMIS",
            },
            {
              icon: Sparkles,
              title: "Le prénom en partage",
              text: "Avec un camarade ou un proche, recherchez les premières lettres de vos prénoms dans l’alphabet manuel.",
              label: "Explorer l’alphabet",
              href: "/learn/lsf-alphabet",
              tint: "bg-[#d9efdf]",
              tag: "À DEUX OU EN PETIT GROUPE",
            },
          ].map(({ icon: Icon, title, text, label, href, tint, tag }) => (
            <article
              key={href}
              className={`flex flex-col rounded-3xl p-7 ${tint}`}
            >
              <Icon
                aria-hidden
                className="size-7 text-primary"
                strokeWidth={1.6}
              />
              <p className="mt-6 text-[10px] font-bold tracking-wider text-primary/70">
                <T text={tag} />
              </p>
              <h3 className="mt-2 text-xl font-bold">
                <T text={title} />
              </h3>
              <p className="mb-6 mt-3 flex-1 text-sm leading-relaxed text-foreground/75">
                <T text={text} />
              </p>
              <Link
                href={href}
                className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-primary"
              >
                <T text={label} />
                <ArrowRight aria-hidden className="size-4" />
              </Link>
            </article>
          ))}
        </div>
      </section>
      <section
        id="share-discovery"
        className="mt-16 scroll-mt-28 rounded-[2rem] bg-white/60 p-6 ring-1 ring-border sm:p-10"
      >
        <ShareLesson />
      </section>
      <section className="mt-14 grid gap-8 lg:grid-cols-[.7fr_1fr]">
        <div>
          <p className="eyebrow">
            <T text="L’ESPRIT DE CET ESPACE" />
          </p>
          <h2 className="mt-3 text-3xl font-extrabold">
            <T text="De la curiosité et de la bienveillance." />
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            <T text="Cette première version propose des activités à partager avec votre entourage. Les discussions publiques entre membres ne sont pas encore ouvertes." />
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            {
              icon: Heart,
              title: "Chacun à son rythme",
              text: "On encourage les essais, sans comparer les personnes ni leurs progrès.",
            },
            {
              icon: Eye,
              title: "La source avant le geste",
              text: "On revient à la démonstration LSF et on reste ouvert aux variantes et aux corrections.",
            },
          ].map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="rounded-3xl border border-border bg-white p-6"
            >
              <Icon aria-hidden className="size-6 text-primary" />
              <h3 className="mt-4 font-bold">
                <T text={title} />
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                <T text={text} />
              </p>
            </div>
          ))}
        </div>
      </section>
      <div className="mt-12 flex flex-wrap items-center justify-between gap-5 rounded-3xl bg-secondary p-7">
        <p className="max-w-xl text-sm leading-relaxed">
          <T text="Pour approfondir vos découvertes, retrouvez les créateurs et les organismes qui publient des ressources en LSF." />
        </p>
        <Link
          href="/resources"
          className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-primary"
        >
          <T text="Voir les ressources LSF" />
          <ArrowRight aria-hidden className="size-4" />
        </Link>
      </div>
    </div>
  );
}
