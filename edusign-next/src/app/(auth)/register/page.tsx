import { getTranslator } from "@/lib/i18n/server";

import { T } from "@/components/i18n/locale-provider";
import Link from "next/link";
import { GoogleSignIn } from "@/components/auth/google-sign-in";
import { safeRedirectPath } from "@/lib/safe-redirect.mjs";
import { RegisterForm } from "./register-form";
export async function generateMetadata() {
  const t = await getTranslator();
  return { title: t("Créer un compte") };
}
export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const redirectTo = safeRedirectPath((await searchParams).redirectTo);
  return (
    <>
      <p className="eyebrow">
        <T text={"Votre premier pas"} />
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">
        <T text={"Faisons connaissance."} />{" "}
      </h1>
      <p className="mb-8 mt-3 leading-relaxed text-muted-foreground">
        <T
          text={
            "Créez votre espace pour garder une trace de vos découvertes et de vos progrès."
          }
        />{" "}
      </p>
      <GoogleSignIn redirectTo={redirectTo} />
      <RegisterForm redirectTo={redirectTo} />
      <p className="mt-8 text-center text-sm text-muted-foreground">
        <T text={"Déjà un compte ?"} />
        <T text={" "} />
        <Link
          href={`/login?redirectTo=${encodeURIComponent(redirectTo)}`}
          className="font-semibold text-primary hover:underline"
        >
          <T text={"Se connecter"} />{" "}
        </Link>
      </p>
    </>
  );
}
