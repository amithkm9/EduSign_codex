import { getTranslator } from "@/lib/i18n/server";
import { T } from "@/components/i18n/locale-provider";
import { TutorChat } from "@/components/tutor/tutor-chat";
export async function generateMetadata() {
  const t = await getTranslator();
  return {
    title: t("Mon assistant"),
    description: t(
      "Votre coach en langue des signes française, à l’écrit et à l’oral.",
    ),
  };
}
export default function Tutor() {
  return (
    <div className="container max-w-6xl py-8 sm:py-12">
      <p className="eyebrow">
        <T text="VOTRE COMPAGNON D’APPRENTISSAGE" />
      </p>
      <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
        <T text="Un peu d’aide. Beaucoup de progrès." />
      </h1>
      <p className="mb-8 mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
        <T text="Votre coach en langue des signes française, à l’écrit et à l’oral." />
      </p>
      <TutorChat />
    </div>
  );
}
