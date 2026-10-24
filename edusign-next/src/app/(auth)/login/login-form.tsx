"use client";
import { useLocale as useInterfaceLocale } from "@/components/i18n/locale-provider";

import { T } from "@/components/i18n/locale-provider";

import Link from "next/link";
import { useActionState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { signIn, type AuthState } from "@/server/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/ui/field-error";
import { PasswordInput } from "@/components/auth/password-input";
import { FormFeedback } from "@/components/auth/form-feedback";
const initialState: AuthState = { error: null };
export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const { t: _t } = useInterfaceLocale();

  const [state, formAction, pending] = useActionState(signIn, initialState);
  return (
    <form action={formAction} className="space-y-5" aria-busy={pending}>
      {redirectTo && (
        <input type="hidden" name="redirectTo" value={redirectTo} />
      )}
      <div className="space-y-2">
        <Label htmlFor="email">
          <T text={"Adresse e-mail"} />
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder={_t("vous@exemple.fr")}
          autoComplete="email"
          required
          aria-invalid={!!state.fieldErrors?.email}
          aria-describedby={
            state.fieldErrors?.email ? "email-error" : undefined
          }
        />
        <FieldError id="email-error" errors={state.fieldErrors?.email} />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="password">
            <T text={"Mot de passe"} />
          </Label>
          <Link
            href="/forgot-password"
            className="text-xs font-medium text-primary hover:underline"
          >
            <T text={"Mot de passe oublié ?"} />{" "}
          </Link>
        </div>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="current-password"
          required
          aria-invalid={!!state.fieldErrors?.password}
          aria-describedby={
            state.fieldErrors?.password ? "password-error" : undefined
          }
        />
        <FieldError id="password-error" errors={state.fieldErrors?.password} />
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
            <T text={"Connexion en cours…"} />{" "}
          </>
        ) : (
          <>
            <T text={"Se connecter"} /> <ArrowRight />
          </>
        )}
      </Button>
    </form>
  );
}
