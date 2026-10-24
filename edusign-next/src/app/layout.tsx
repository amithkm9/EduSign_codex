import { getTranslator } from "@/lib/i18n/server";

import { T } from "@/components/i18n/locale-provider";
import { LocaleProvider } from "@/components/i18n/locale-provider";
import { getLocale } from "@/lib/i18n/server";

import "./globals.css";
export async function generateMetadata() {
  const t = await getTranslator();
  return {
    title: {
      default: t("EduSign — Un geste à la fois"),
      template: "%s · EduSign",
    },
    description: t(
      "Observez, pratiquez et progressez à votre rythme. Une expérience d’apprentissage des signes, accompagnée en français.",
    ),
  };
}
export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  return (
    <html lang={locale}>
      <body className="font-sans antialiased">
        <LocaleProvider locale={locale}>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:p-3 focus:text-white"
          >
            <T text={"Aller au contenu"} />{" "}
          </a>
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}
