"use client";
import { useLocale as useInterfaceLocale } from "@/components/i18n/locale-provider";

import { T } from "@/components/i18n/locale-provider";

import { useActionState } from "react";
import { ArrowRight, Loader2, MailCheck } from "lucide-react";
import { signUp, type AuthState } from "@/server/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/ui/field-error";
import { PasswordInput } from "@/components/auth/password-input";
import { FormFeedback } from "@/components/auth/form-feedback";
const initialState: AuthState = { error: null };
export function RegisterForm({ redirectTo }: { redirectTo?: string }) {
  const { t: _t } = useInterfaceLocale();

  const [state, formAction, pending] = useActionState(signUp, initialState);
  if (state.message)
    return (
      <div
        role="status"
        className="rounded-2xl border border-primary/15 bg-secondary p-6"
      >
        <MailCheck aria-hidden className="mb-4 size-8 text-primary" />
        <h2 className="text-xl font-semibold">
          <T text={"Un dernier petit geste."} />
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-secondary-foreground">
          <T text={state.message} />
        </p>
      </div>
    );
  return (
    <form action={formAction} className="space-y-5" aria-busy={pending}>
      <input
        type="hidden"
        name="redirectTo"
        value={redirectTo ?? "/dashboard"}
      />
      <div className="space-y-2">
        <Label htmlFor="userType">
          <T text={"Je découvre la LSF…"} />
        </Label>
        <select
          id="userType"
          name="userType"
          defaultValue="parent"
          className="h-12 w-full rounded-xl border border-input bg-white px-3 text-sm"
        >
          <option value="parent">
            <T text={"Avec mon enfant"} />
          </option>
          <option value="student">
            <T text={"Pour moi"} />
          </option>
          <option value="educator">
            <T text={"Avec mes élèves"} />
          </option>
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="name">
          <T text={"Votre prénom"} />
        </Label>
        <Input
          id="name"
          name="name"
          autoComplete="given-name"
          placeholder={_t("Comment vous appeler ?")}
          minLength={2}
          maxLength={100}
          required
          aria-invalid={!!state.fieldErrors?.name}
          aria-describedby={state.fieldErrors?.name ? "name-error" : undefined}
        />
        <FieldError id="name-error" errors={state.fieldErrors?.name} />
      </div>
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
          aria-invalid={!!state.fieldErrors?.email}
          aria-describedby={
            state.fieldErrors?.email ? "email-error" : undefined
          }
        />
        <FieldError id="email-error" errors={state.fieldErrors?.email} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">
          <T text={"Mot de passe"} />
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
        <p
          id="password-hint"
          className="text-xs leading-relaxed text-muted-foreground"
        >
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
            <T text={"Création en cours…"} />{" "}
          </>
        ) : (
          <>
            <T text={"Créer mon compte"} /> <ArrowRight />
          </>
        )}
      </Button>
    </form>
  );
}
