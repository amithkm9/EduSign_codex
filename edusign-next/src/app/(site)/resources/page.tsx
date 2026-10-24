import { getTranslator } from "@/lib/i18n/server";

import { T } from "@/components/i18n/locale-provider";
import { ExternalLink, BookOpen } from "lucide-react";
export async function generateMetadata() {
  const t = await getTranslator();
  return { title: t("Ressources LSF") };
}
const resources = [
  {
    name: "MAE Langue des Signes",
    type: "Vidéothèque · LSF",
    text: "Des démonstrations thématiques et des dialogues, utilisés dans nos ateliers.",
    url: "https://www.maelanguedessignes.com/didactique-lsf",
  },
  {
    name: "Dico Plus LSF",
    type: "Association · Vidéos",
    text: "Des ressources pour découvrir la LSF, dont la vidéo sur les nombres proposée dans EduSign.",
    url: "https://karinevermot.wixsite.com/website-1/post/lsf-point-par-point-les-nombres",
  },
  {
    name: "Le Dico Elix",
    type: "Dictionnaire · Français / LSF",
    text: "Recherchez un mot et consultez ses signes et ses définitions en vidéo.",
    url: "https://dico.elix-lsf.fr/",
  },
  {
    name: "LSF DICO — INJS de Metz",
    type: "Dictionnaire · Équipe pédagogique sourde",
    text: "Un lexique pour chercher un signe par mot, par ordre alphabétique ou par configuration.",
    url: "https://lsfdico.injs-metz.fr/",
  },
  {
    name: "Fondation Voltaire",
    type: "Parcours · Initiation",
    text: "Un parcours d’initiation à la LSF pour approfondir ses découvertes. Inscription sur le site partenaire.",
    url: "https://lsf.fondation-voltaire.fr",
  },
];
export default function Resources() {
  return (
    <div className="container max-w-5xl py-14">
      <p className="eyebrow">
        <T text={"POUR ALLER PLUS LOIN"} />
      </p>
      <h1 className="mt-4 text-4xl font-extrabold sm:text-5xl">
        <T text={"De bonnes sources."} /> <br />
        <T text={"De nouvelles découvertes."} />{" "}
      </h1>
      <p className="mt-5 max-w-2xl leading-relaxed text-muted-foreground">
        <T
          text={
            "Voici les créateurs et organismes vers lesquels nous vous orientons. Les liens s’ouvrent dans un nouvel onglet, directement sur leur site."
          }
        />{" "}
      </p>
      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        {resources.map((r) => (
          <a
            key={r.name}
            href={r.url}
            target="_blank"
            rel="noopener noreferrer"
            className="lesson-card rounded-3xl border border-border bg-white p-7"
          >
            <div className="flex justify-between">
              <BookOpen className="size-6 text-primary" />
              <ExternalLink className="size-4 text-muted-foreground" />
            </div>
            <p className="mt-5 text-xs font-semibold text-primary">
              <T text={r.type} />
            </p>
            <h2 className="mt-2 text-xl font-bold">
              <T text={r.name} />
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              <T text={r.text} />
            </p>
            <span className="sr-only">
              {" "}
              <T text={"Ouvrir dans un nouvel onglet"} />
            </span>
          </a>
        ))}
      </div>
      <p className="mt-8 text-xs leading-relaxed text-muted-foreground">
        <T
          text={
            "Sources consultées le 24 octobre 2026. Les créateurs conservent leurs vidéos et leurs droits ; EduSign n’est pas affilié à ces organismes. La disponibilité des vidéos dépend de leurs éditeurs."
          }
        />{" "}
      </p>
    </div>
  );
}
