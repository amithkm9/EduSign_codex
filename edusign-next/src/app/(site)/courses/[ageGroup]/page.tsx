import { T } from "@/components/i18n/locale-provider";
import { notFound } from "next/navigation";
import Link from "next/link";
import { LSF_LESSONS } from "@/lib/data/lsf";
import { CATEGORY_META, isAgeGroup } from "@/lib/data/categories";
import { LessonCatalog } from "@/components/courses/lesson-catalog";
export default async function Category({
  params,
}: {
  params: Promise<{ ageGroup: string }>;
}) {
  const { ageGroup } = await params;
  if (!isAgeGroup(ageGroup)) notFound();
  return (
    <div className="container py-12">
      <Link href="/courses" className="text-sm font-semibold text-primary">
        <T text={"← Toutes les leçons"} />{" "}
      </Link>
      <h1 className="mb-4 mt-6 text-4xl font-extrabold">
        <T text={CATEGORY_META[ageGroup].title} />
      </h1>
      <p className="mb-8 text-muted-foreground">
        <T text={CATEGORY_META[ageGroup].description} />
      </p>
      <LessonCatalog
        lessons={LSF_LESSONS.filter((l) => l.ageGroup === ageGroup)}
      />
    </div>
  );
}
