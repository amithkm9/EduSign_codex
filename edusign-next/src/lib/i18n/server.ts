import { cookies } from "next/headers";
import { normalizeLocale, translate } from "./translate";
export async function getLocale() {
  return normalizeLocale((await cookies()).get("edusign_locale")?.value);
}
export async function getTranslator() {
  const locale = await getLocale();
  return (text: string) => translate(text, locale);
}
