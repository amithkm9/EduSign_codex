import { safeRedirectPath } from "./safe-redirect.mjs";

export async function beginGoogleOAuth(
  client,
  { origin, redirectTo, enabled },
) {
  if (!enabled) {
    return {
      error:
        "La connexion Google n’est pas encore disponible. Vous pouvez créer un compte ou vous connecter par e-mail.",
    };
  }
  const callback = new URL("/auth/callback", origin);
  callback.searchParams.set("next", safeRedirectPath(redirectTo));
  try {
    const { data, error } = await client.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callback.toString(), skipBrowserRedirect: true },
    });
    if (!error && data.url) return { url: data.url, error: null };
  } catch {
    // Never expose provider responses or credential details to the UI.
  }
  return {
    error:
      "Impossible de démarrer la connexion Google. Réessayez ou utilisez votre adresse e-mail.",
  };
}
