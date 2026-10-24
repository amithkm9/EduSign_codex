import { getTranslator } from "@/lib/i18n/server";

import { T } from "@/components/i18n/locale-provider";
import { AuthShell } from "@/components/auth/auth-shell";
import { UpdatePasswordForm } from "./update-password-form";
export async function generateMetadata() {
  const t = await getTranslator();
  return { title: t("Nouveau mot de passe") };
}
export default function UpdatePasswordPage() {
  return (
    <AuthShell>
      <p className="eyebrow">
        <T text={"Un nouveau départ"} />
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">
        <T text={"Votre nouveau mot de passe."} />{" "}
      </h1>
      <p className="mb-8 mt-3 text-muted-foreground">
        <T
          text={
            "Choisissez un mot de passe unique pour retrouver votre parcours."
          }
        />{" "}
      </p>
      <UpdatePasswordForm />
    </AuthShell>
  );
}
