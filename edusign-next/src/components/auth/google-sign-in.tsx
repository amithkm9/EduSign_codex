"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { signInWithGoogle, type AuthState } from "@/server/auth-actions";
import { Button } from "@/components/ui/button";
import { T } from "@/components/i18n/locale-provider";
import { FormFeedback } from "./form-feedback";

export function GoogleSignIn({ redirectTo }: { redirectTo?: string }) {
  const [state, action, pending] = useActionState(signInWithGoogle, {
    error: null,
  } as AuthState);
  return (
    <div className="mb-6">
      <form action={action} aria-busy={pending} className="space-y-3">
        <input
          type="hidden"
          name="redirectTo"
          value={redirectTo ?? "/dashboard"}
        />
        <Button
          type="submit"
          variant="outline"
          disabled={pending}
          className="h-12 w-full gap-3 rounded-xl bg-white font-semibold"
        >
          {pending ? (
            <Loader2 aria-hidden className="size-5 animate-spin" />
          ) : (
            <svg aria-hidden viewBox="0 0 24 24" className="size-5 shrink-0">
              <path
                fill="#4285F4"
                d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.9-1.75 2.98-4.33 2.98-7.36Z"
              />
              <path
                fill="#34A853"
                d="M12 22c2.7 0 4.96-.9 6.61-2.41l-3.24-2.51c-.9.6-2.04.96-3.37.96-2.6 0-4.8-1.76-5.59-4.12H3.06v2.59A10 10 0 0 0 12 22Z"
              />
              <path
                fill="#FBBC05"
                d="M6.41 13.92a6 6 0 0 1 0-3.84V7.49H3.06a10 10 0 0 0 0 9.02l3.35-2.59Z"
              />
              <path
                fill="#EA4335"
                d="M12 5.96c1.47 0 2.79.51 3.83 1.51l2.87-2.87A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.94 5.49l3.35 2.59C7.2 7.72 9.4 5.96 12 5.96Z"
              />
            </svg>
          )}
          <T
            text={
              pending ? "Redirection vers Google…" : "Continuer avec Google"
            }
          />
        </Button>
        <FormFeedback error message={state.error} />
      </form>
      <div className="mt-6 flex items-center gap-4 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        <T text="ou avec votre adresse e-mail" />
        <span className="h-px flex-1 bg-border" />
      </div>
    </div>
  );
}
