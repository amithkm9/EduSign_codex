import english from "./en.json";
export type Locale = "fr" | "en";
export const normalizeLocale = (value: unknown): Locale =>
  value === "en" ? "en" : "fr";
export function translate(text: string, locale: Locale): string {
  if (locale === "fr") return text;
  const dictionary = english as Record<string, string>;
  const clean = text.replace(/\s+/g, " ").trim();
  if (dictionary[clean]) return dictionary[clean];
  return text
    .replace(/^Charger la vidéo :/, "Load video:")
    .replace(/^(\d+) jours$/, "$1 days")
    .replace(/^Essai (\d+)$/, "Attempt $1")
    .replace(/^ · Groupe /, " · Group ");
}
