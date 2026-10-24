// Read-only check. Prints provider capabilities, never keys or OAuth secrets.
import { supabaseConfig, safeError } from "./env.mjs";
try {
  const { url, key } = supabaseConfig();
  const response = await fetch(`${url}/auth/v1/settings`, {
    headers: { apikey: key },
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok)
    throw new Error(`Auth settings returned ${response.status}`);
  const settings = await response.json();
  console.log(
    JSON.stringify(
      {
        googleEnabled: settings.external?.google === true,
        emailEnabled: settings.external?.email === true,
        signupDisabled: settings.disable_signup === true,
        emailConfirmationRequired: settings.mailer_autoconfirm !== true,
      },
      null,
      2,
    ),
  );
  if (settings.disable_signup || !settings.external?.email)
    process.exitCode = 1;
  if (!settings.external?.google)
    console.log(
      "ACTION: Enable Google OAuth in the Supabase dashboard. See docs/AUTH_SETUP.md.",
    );
} catch (error) {
  console.error("Provider check failed:", safeError(error));
  process.exitCode = 1;
}
