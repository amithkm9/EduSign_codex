import { getTranslator } from "@/lib/i18n/server";

import { T } from "@/components/i18n/locale-provider";
import Link from "next/link";
import { GoogleSignIn } from "@/components/auth/google-sign-in";
import { safeRedirectPath } from "@/lib/safe-redirect.mjs";
import { LoginForm } from "./login-form";
import { FormFeedback } from "@/components/auth/form-feedback";
export async function generateMetadata() {
  const t = await getTranslator();
  return { title: t("Connexion") };
}
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string; notice?: string }>;
}) {
  const { redirectTo, notice } = await searchParams;
  return (
    <>
      <p className="eyebrow">
        <T text={"Votre espace d’apprentissage"} />
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">
        <T text={"Heureux de vous revoir."} />{" "}
      </h1>
      <p className="mb-8 mt-3 leading-relaxed text-muted-foreground">
        <T
          text={
            "Connectez-vous pour retrouver votre parcours et continuer à votre rythme."
          }
        />{" "}
      </p>
      {notice === "link_expired" && (
        <div className="mb-5">
          <FormFeedback
            error
            message="Ce lien est invalide ou a expiré. Reconnectez-vous ou demandez un nouveau lien."
          />
        </div>
      )}
      {notice === "oauth_cancelled" && (
        <div className="mb-5">
          <FormFeedback message="Connexion Google annulée. Vous pouvez réessayer ou continuer par e-mail." />
        </div>
      )}
      {notice === "oauth_failed" && (
        <div className="mb-5">
          <FormFeedback
            error
            message="La connexion Google a échoué. Réessayez ou utilisez votre adresse e-mail."
          />
        </div>
      )}
      <GoogleSignIn redirectTo={redirectTo} />
      <LoginForm redirectTo={redirectTo} />
      <p className="mt-8 text-center text-sm text-muted-foreground">
        <T text={"Vous découvrez EduSign ?"} />
        <T text={" "} />
        <Link
          href={`/register?redirectTo=${encodeURIComponent(safeRedirectPath(redirectTo))}`}
          className="font-semibold text-primary underline-offset-4 hover:underline"
        >
          <T text={"Créer un compte"} />{" "}
        </Link>
      </p>
    </>
  );
}
