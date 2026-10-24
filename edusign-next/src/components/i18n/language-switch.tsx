"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Languages } from "lucide-react";
import { useLocale } from "./locale-provider";
export function LanguageSwitch() {
  const { locale } = useLocale();
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <label className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-border bg-white px-3 text-xs font-bold text-foreground">
      <Languages aria-hidden className="hidden size-4 sm:block" />
      <span className="sr-only">
        {locale === "fr" ? "Langue de l’interface" : "Interface language"}
      </span>
      <select
        aria-label={
          locale === "fr" ? "Langue de l’interface" : "Interface language"
        }
        value={locale}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.value;
          if (next !== "fr" && next !== "en") return;
          document.cookie = `edusign_locale=${next}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
          start(() => router.refresh());
        }}
        className="min-h-10 bg-transparent outline-none"
      >
        <option value="fr">FR</option>
        <option value="en">EN</option>
      </select>
    </label>
  );
}
