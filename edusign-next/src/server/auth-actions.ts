"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { safeRedirectPath } from "@/lib/utils";
import { authErrorMessage } from "@/lib/auth-feedback.mjs";
import { beginGoogleOAuth } from "@/lib/google-oauth.mjs";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { getLocale } from "@/lib/i18n/server";
import {
  loginSchema,
  registerSchema,
  emailSchema,
  newPasswordSchema,
} from "@/lib/validations/auth";

export type AuthState = {
  error: string | null;
  fieldErrors?: Record<string, string[] | undefined>;
  message?: string;
};

async function getOrigin() {
  // Require the canonical deployment URL in production. Request headers are
  // convenient for local development only.
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/$/, "");
  const h = await headers();
  const origin = h.get("origin");
  if (origin && process.env.NODE_ENV !== "production") return origin;
  const host = h.get("host");
  if (host && process.env.NODE_ENV !== "production") return `http://${host}`;
  if (process.env.NODE_ENV === "production")
    throw new Error("NEXT_PUBLIC_SITE_URL is required in production.");
  return "http://localhost:3100";
}

export async function signIn(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return {
      error: "Vérifiez les informations saisies.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth
    .signInWithPassword(parsed.data)
    .catch(() => ({ error: { code: "unavailable" } }));
  if (error) return { error: authErrorMessage(error) };

  revalidatePath("/", "layout");
  redirect(
    safeRedirectPath(formData.get("redirectTo") as string | null, "/dashboard"),
  );
}

export async function signInWithGoogle(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  let enabled = false;
  try {
    const { url, key } = getSupabaseConfig();
    const response = await fetch(`${url}/auth/v1/settings`, {
      headers: { apikey: key },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error("Auth settings unavailable");
    enabled = (await response.json()).external?.google === true;
  } catch {
    return {
      error:
        "Impossible de démarrer la connexion Google. Réessayez ou utilisez votre adresse e-mail.",
    };
  }
  if (!enabled)
    return {
      error:
        "La connexion Google n’est pas encore disponible. Vous pouvez créer un compte ou vous connecter par e-mail.",
    };
  const origin = await getOrigin().catch(() => null);
  if (!origin)
    return {
      error:
        "Le service est momentanément indisponible. Réessayez dans quelques instants.",
    };
  const result = await beginGoogleOAuth(await createClient(), {
    origin,
    redirectTo: formData.get("redirectTo"),
    enabled,
  });
  if (result.url) redirect(result.url);
  return { error: result.error };
}

export async function signUp(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || "",
    userType: formData.get("userType") || "parent",
    ageGroup: formData.get("ageGroup") || "",
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return {
      error: "Vérifiez les champs indiqués ci-dessous.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { name, email, phone, userType, ageGroup, password } = parsed.data;
  const supabase = await createClient();
  const origin = await getOrigin().catch(() => null);
  if (!origin)
    return {
      error:
        "Le service est momentanément indisponible. Réessayez dans quelques instants.",
    };
  const locale = await getLocale();
  const destination = safeRedirectPath(formData.get("redirectTo"));
  const callback = new URL("/auth/callback", origin);
  callback.searchParams.set("next", destination);

  const { data, error } = await supabase.auth
    .signUp({
      email,
      password,
      options: {
        emailRedirectTo: callback.toString(),
        // Consumed by the handle_new_user() trigger to populate `profiles`.
        data: {
          name,
          phone: phone || null,
          user_type: userType,
          age_group: ageGroup || null,
          locale: locale === "en" ? "en-GB" : "fr-FR",
          timezone: "Europe/Paris",
        },
      },
    })
    .catch(() => ({
      data: { user: null, session: null },
      error: { code: "unavailable" },
    }));
  if (error) return { error: authErrorMessage(error) };

  // Email confirmation on → no session yet.
  if (data.user && !data.session) {
    return {
      error: null,
      message:
        "Consultez votre boîte e-mail. Si votre inscription peut être finalisée, vous recevrez un lien de confirmation. Vérifiez aussi les courriers indésirables.",
    };
  }

  revalidatePath("/", "layout");
  redirect(destination);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function requestPasswordReset(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = emailSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { error: "Saisissez une adresse e-mail valide." };
  }

  const supabase = await createClient();
  const origin = await getOrigin().catch(() => null);
  if (!origin)
    return {
      error:
        "Le service est momentanément indisponible. Réessayez dans quelques instants.",
    };
  const { error } = await supabase.auth
    .resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${origin}/auth/callback?next=/auth/update-password`,
    })
    .catch(() => ({ error: { code: "unavailable" } }));
  if (error) return { error: authErrorMessage(error) };

  return {
    error: null,
    message:
      "Si un compte correspond à cette adresse, vous recevrez un lien pour choisir un nouveau mot de passe.",
  };
}

export async function updatePassword(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = newPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return {
      error: "Vérifiez les champs indiqués ci-dessous.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth
    .updateUser({
      password: parsed.data.password,
    })
    .catch(() => ({ error: { code: "unavailable" } }));
  if (error) return { error: authErrorMessage(error) };

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
