"use client";
import { T } from "@/components/i18n/locale-provider";

import { useActionState } from "react";
import { Loader2, ArrowRight } from "lucide-react";
import { updatePassword, type AuthState } from "@/server/auth-actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/ui/field-error";
import { PasswordInput } from "@/components/auth/password-input";
import { FormFeedback } from "@/components/auth/form-feedback";
const initialState: AuthState = { error: null };
export function UpdatePasswordForm() {
  const [state, formAction, pending] = useActionState(
    updatePassword,
    initialState,
  );
  return (
    <form action={formAction} className="space-y-5" aria-busy={pending}>
      <div className="space-y-2">
        <Label htmlFor="password">
          <T text={"Nouveau mot de passe"} />
        </Label>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="new-password"
          minLength={8}
          required
          aria-invalid={!!state.fieldErrors?.password}
          aria-describedby="password-hint password-error"
        />
        <p id="password-hint" className="text-xs text-muted-foreground">
          <T
            text={
              "8 caractères minimum, une majuscule, une minuscule et un chiffre."
            }
          />{" "}
        </p>
        <FieldError id="password-error" errors={state.fieldErrors?.password} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">
          <T text={"Confirmer le mot de passe"} />
        </Label>
        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          autoComplete="new-password"
          required
          aria-invalid={!!state.fieldErrors?.confirmPassword}
          aria-describedby={
            state.fieldErrors?.confirmPassword ? "confirm-error" : undefined
          }
        />
        <FieldError
          id="confirm-error"
          errors={state.fieldErrors?.confirmPassword}
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
            <T text={"Enregistrement…"} />{" "}
          </>
        ) : (
          <>
            <T text={"Enregistrer"} /> <ArrowRight />
          </>
        )}
      </Button>
    </form>
  );
}
