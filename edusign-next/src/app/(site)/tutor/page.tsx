import { getTranslator } from "@/lib/i18n/server";
import { T } from "@/components/i18n/locale-provider";
import { TutorChat } from "@/components/tutor/tutor-chat";
export async function generateMetadata() {
  const t = await getTranslator();
  return {
    title: t("Mon assistant"),
    description: t(
      "Trouvez une démonstration vidéo et prenez le temps de la découvrir ensemble.",
    ),
  };
}
export default function Tutor() {
  return (
    <div className="container max-w-6xl py-6 sm:py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
            EDUSIGN STUDIO
          </p>
          <h1 className="mt-2 text-3xl font-medium tracking-tight sm:text-4xl">
            <T text="Apprenons un signe." />
          </h1>
        </div>
        <p className="max-w-xs text-sm leading-6 text-muted-foreground">
          <T text="Un espace pour regarder, comprendre et essayer ensemble." />
        </p>
      </div>
      <TutorChat />
    </div>
  );
}
