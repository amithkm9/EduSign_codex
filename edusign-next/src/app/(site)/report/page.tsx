import { getTranslator } from "@/lib/i18n/server";
import { ReportView } from "@/components/report/report-view";

export async function generateMetadata() {
  const t = await getTranslator();
  return {
    title: t("Mon bilan de découvertes"),
    description: t(
      "Les activités déclarées de votre compte et des idées pour apprendre en famille.",
    ),
  };
}

export default function ReportPage() {
  return (
    <div className="container py-10">
      <div className="mx-auto max-w-4xl">
        <ReportView />
      </div>
    </div>
  );
}
