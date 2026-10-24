import { getTranslator } from "@/lib/i18n/server";

import { T } from "@/components/i18n/locale-provider";
import Link from "next/link";
import {
  Heart,
  Eye,
  Hand,
  MessageCircle,
  ArrowRight,
  BookOpen,
} from "lucide-react";
export async function generateMetadata() {
  const t = await getTranslator();
  return {
    title: t("Le coin des parents"),
    description: t(
      "Des idées simples pour accompagner votre enfant dans la découverte de la LSF.",
    ),
  };
}
export default function Parents() {
  return (
    <div className="container py-12 sm:py-16">
      <div className="grid items-center gap-8 rounded-[2rem] bg-[#fff0b5] p-8 sm:p-12 md:grid-cols-[1.5fr_1fr]">
        <div>
          <p className="eyebrow">
            <T text={"LE COIN DES PARENTS"} />
          </p>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight sm:text-5xl">
            <T text={"Le plus beau rôle ?"} />
            <br />
            <T text={"Apprendre à ses côtés."} />{" "}
          </h1>
          <p className="mt-5 max-w-lg leading-relaxed">
            <T
              text={
                "Vous n’avez pas besoin de connaître la LSF pour commencer. Regardez ensemble une démonstration, prenez votre temps et laissez la curiosité guider la suite."
              }
            />{" "}
          </p>
          <Link
            href="/courses"
            className="mt-6 inline-flex min-h-12 items-center gap-3 rounded-full bg-primary px-6 font-bold text-white"
          >
            <T text={"Choisir notre première leçon"} />{" "}
            <ArrowRight className="size-4" />
          </Link>
        </div>
        <div
          aria-hidden
          className="mx-auto flex size-44 rotate-6 items-center justify-center rounded-[2.5rem] bg-white/70 shadow-[8px_8px_0_0_#e4c562]"
        >
          <Heart className="size-24 text-primary" strokeWidth={1.3} />
        </div>
      </div>
      <div className="py-14">
        <p className="eyebrow">
          <T text={"UN PETIT RITUEL, À VOTRE FAÇON"} />
        </p>
        <h2 className="mt-3 text-3xl font-extrabold">
          <T text={"Dix minutes pour se retrouver."} />{" "}
        </h2>
        <div className="mt-7 grid gap-5 md:grid-cols-3">
          {[
            {
              Icon: Eye,
              t: "On observe",
              d: "Choisissez une vidéo. Regardez les mains, mais aussi le visage et le mouvement du corps.",
              c: "bg-[#dceaff]",
            },
            {
              Icon: Hand,
              t: "On essaie",
              d: "Mettez en pause. Chacun tente à son rythme. Revenez au modèle quand vous en avez envie.",
              c: "bg-[#ffdfc8]",
            },
            {
              Icon: MessageCircle,
              t: "On partage",
              d: "Rejouez une petite situation ou choisissez ensemble ce que vous aimeriez découvrir demain.",
              c: "bg-[#d9efdf]",
            },
          ].map((x, i) => (
            <div
              key={x.t}
              className="rounded-3xl border border-border bg-white p-7"
            >
              <span
                className={`flex size-12 items-center justify-center rounded-2xl ${x.c}`}
              >
                <x.Icon className="size-6" />
              </span>
              <h3 className="mt-5 text-xl font-bold">
                {i + 1}. <T text={x.t} />
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                <T text={x.d} />
              </p>
            </div>
          ))}
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl bg-[#dceaff] p-8">
          <BookOpen className="size-7 text-primary" />
          <h2 className="mt-4 text-2xl font-bold">
            <T text={"Un carnet pour encourager."} />{" "}
          </h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            <T
              text={
                "Retrouvez les activités déclarées sur ce compte et ouvrez le bilan ensemble. Il ne s’agit pas d’une note ni d’un suivi séparé pour chaque enfant."
              }
            />{" "}
          </p>
          <Link
            href="/report"
            className="mt-5 inline-flex min-h-11 items-center gap-2 font-bold text-primary"
          >
            <T text={"Ouvrir le bilan"} /> <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="rounded-3xl border border-border bg-white p-8">
          <h2 className="text-2xl font-bold">
            <T text={"La LSF est une langue à part entière."} />{" "}
          </h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            <T
              text={
                "Elle possède sa propre grammaire. Les expressions du visage et l’espace participent au sens. Les vidéos proposées sont une porte d’entrée ; un enseignant de LSF pourra vous accompagner plus loin."
              }
            />{" "}
          </p>
          <Link
            href="/resources"
            className="mt-5 inline-flex min-h-11 items-center gap-2 font-bold text-primary"
          >
            <T text={"Les ressources pour continuer"} />{" "}
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
