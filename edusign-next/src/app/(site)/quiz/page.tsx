import { getTranslator } from "@/lib/i18n/server";
import { QuizPlayer } from "@/components/quiz/quiz-player";
export async function generateMetadata() {
  const t = await getTranslator();
  return {
    title: t("L’atelier libre"),
    description: t(
      "Des activités de découverte de la LSF à pratiquer ensemble.",
    ),
  };
}
export default function Practice() {
  return (
    <div className="container py-12">
      <QuizPlayer />
    </div>
  );
}
