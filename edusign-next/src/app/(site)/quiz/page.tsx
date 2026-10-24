import { getUser } from "@/lib/auth";
import { getTranslator } from "@/lib/i18n/server";
import { QuizPlayer } from "@/components/quiz/quiz-player";
export async function generateMetadata() {
  const t = await getTranslator();
  return {
    title: t("Vidéo et quiz LSF"),
    description: t(
      "L’alphabet et les nombres en LSF : une vidéo, trois questions et des explications pour progresser ensemble.",
    ),
  };
}
export default async function Practice() {
  const user = await getUser();
  return (
    <div className="container py-12">
      <QuizPlayer track={!!user} />
    </div>
  );
}
