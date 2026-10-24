import { getTranslator } from "@/lib/i18n/server";

import { T } from "@/components/i18n/locale-provider";
import { LessonCatalog } from "@/components/courses/lesson-catalog";
import { LSF_LESSONS } from "@/lib/data/lsf";
import { getUser } from "@/lib/auth";
import { getUserProgressForCourses } from "@/lib/data/courses";
import Link from "next/link";
import { Heart, ArrowUpRight } from "lucide-react";
export async function generateMetadata() {
  const t = await getTranslator();
  return {
    title: t("Les leçons LSF"),
    description: t(
      "Découvrez la langue des signes française avec des vidéos et des activités à partager en famille.",
    ),
  };
}
export default async function CoursesPage() {
  const user = await getUser();
  const progress = user
    ? await getUserProgressForCourses(
        user.id,
        LSF_LESSONS.map((l) => l.id),
      )
    : {};
  return (
    <div className="container py-12 sm:py-16">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow">
            <T text={"LE PLAISIR D’APPRENDRE"} />
          </p>
          <h1 className="mt-4 text-4xl font-extrabold sm:text-5xl">
            <T text={"À chaque jour,"} /> <br />
            <T text={"sa petite découverte."} />{" "}
          </h1>
          <p className="mt-5 max-w-xl leading-relaxed text-muted-foreground">
            <T
              text={
                "Commencez par l’alphabet ou les nombres en LSF. Regardez la vidéo, puis jouez au mini-quiz avec votre enfant."
              }
            />{" "}
          </p>
        </div>
        <Link
          href="/parents"
          className="flex max-w-xs items-center gap-4 rounded-2xl bg-[#fff0b5] p-5"
        >
          <Heart className="size-8 shrink-0" />
          <span className="text-sm">
            <strong className="block">
              <T text={"On apprend ensemble ?"} />
            </strong>
            <T text={"Des idées pour accompagner votre enfant."} />{" "}
          </span>
          <ArrowUpRight className="size-5 shrink-0" />
        </Link>
      </div>
      <LessonCatalog lessons={LSF_LESSONS} progress={progress} />
      <p className="mt-10 text-sm text-muted-foreground">
        <T
          text={
            "Les vidéos appartiennent à leurs créateurs. Retrouvez les crédits et les liens directs dans chaque leçon. Les durées indiquées sont des suggestions d’atelier."
          }
        />{" "}
      </p>
    </div>
  );
}
