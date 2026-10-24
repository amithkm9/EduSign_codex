"use client";
import { createContext, useContext, useEffect, type ReactNode } from "react";
import { translate, type Locale } from "@/lib/i18n/translate";
const Context = createContext<Locale>("fr");
export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return <Context.Provider value={locale}>{children}</Context.Provider>;
}
export function useLocale() {
  const locale = useContext(Context);
  return { locale, t: (text: string) => translate(text, locale) };
}
export function T({ text }: { text: string | number | null | undefined }) {
  const { t } = useLocale();
  return typeof text === "string" ? t(text) : text;
}
