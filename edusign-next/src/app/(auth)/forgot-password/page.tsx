import { getTranslator } from "@/lib/i18n/server";

import { T } from "@/components/i18n/locale-provider";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ResetRequestForm } from "./reset-request-form";
export async function generateMetadata() {
  const t = await getTranslator();
  return { title: t("Mot de passe oublié") };
}
export default function ForgotPasswordPage() {
  return (
    <>
      <p className="eyebrow">
        <T text={"Retrouver votre espace"} />
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">
        <T text={"Ça arrive à tout le monde."} />{" "}
      </h1>
      <p className="mb-8 mt-3 leading-relaxed text-muted-foreground">
        <T
          text={
            "Indiquez votre adresse e-mail. Nous vous enverrons un lien pour choisir un nouveau mot de passe."
          }
        />{" "}
      </p>
      <ResetRequestForm />
      <Link
        href="/login"
        className="mt-8 flex min-h-11 items-center justify-center gap-2 text-sm font-medium text-primary"
      >
        <ArrowLeft className="size-4" />{" "}
        <T text={"Retour à la connexion"} />{" "}
      </Link>
    </>
  );
}
