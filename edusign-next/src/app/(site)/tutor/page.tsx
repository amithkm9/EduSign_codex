import { getTranslator } from "@/lib/i18n/server";
import { getLocale } from "@/lib/i18n/server";

import { T } from "@/components/i18n/locale-provider";
import { TutorChat } from "@/components/tutor/tutor-chat";
export async function generateMetadata() {
  const t = await getTranslator();
  return {
    title: t("Mon assistant"),
    description: t(
      "Un assistant en français pour accompagner vos découvertes en LSF.",
    ),
  };
}
export default async function Tutor() {
  const locale = await getLocale();
  return (
    <div className="container max-w-5xl py-10">
      <p className="eyebrow">
        <T text={"UN COUP DE POUCE POUR APPRENDRE"} />
      </p>
      <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl">
        <T text={"Une question ? On en parle."} />{" "}
      </h1>
      <p className="mb-7 mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        <T
          text={
            "Des idées pour pratiquer, des ressources LSF et des explications en français. L’assistant est une IA ; vérifiez toujours un signe dans sa source vidéo."
          }
        />{" "}
      </p>
      <TutorChat key={locale} />
    </div>
  );
}
