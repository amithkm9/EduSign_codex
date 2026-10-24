"use client";
import { useLocale as useInterfaceLocale } from "@/components/i18n/locale-provider";

import { T } from "@/components/i18n/locale-provider";

import { useActionState } from "react";
import { Loader2, Mail } from "lucide-react";
import { requestPasswordReset, type AuthState } from "@/server/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormFeedback } from "@/components/auth/form-feedback";
const initialState: AuthState = { error: null };
export function ResetRequestForm() {
  const { t: _t } = useInterfaceLocale();

  const [state, formAction, pending] = useActionState(
    requestPasswordReset,
    initialState,
  );
  if (state.message) return <FormFeedback message={state.message} />;
  return (
    <form action={formAction} className="space-y-5" aria-busy={pending}>
      <div className="space-y-2">
        <Label htmlFor="email">
          <T text={"Adresse e-mail"} />
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder={_t("vous@exemple.fr")}
          required
        />
      </div>
      <FormFeedback error message={state.error} />
      <Button
        type="submit"
        className="h-12 w-full rounded-xl"
        disabled={pending}
      >
        {pending ? (
          <>
            <Loader2 className="animate-spin" />{" "}
            <T text={"Envoi en cours…"} />{" "}
          </>
        ) : (
          <>
            <Mail /> <T text={"Recevoir le lien"} />{" "}
          </>
        )}
      </Button>
    </form>
  );
}
