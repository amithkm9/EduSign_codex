"use client";

import Link from "next/link";
import { ArrowUpRight, Heart } from "lucide-react";
import { Brand } from "./brand";
import { useLocale } from "@/components/i18n/locale-provider";
const groups = [
  {
    title: "Apprendre",
    links: [
      ["Les ateliers LSF", "/courses"],
      ["Pratiquer", "/quiz"],
      ["L’assistant IA", "/tutor"],
      ["Nos formules", "/packages"],
    ],
  },
  {
    title: "Ensemble",
    links: [
      ["Le coin des parents", "/parents"],
      ["La communauté", "/community"],
      ["Ressources LSF", "/resources"],
    ],
  },
  {
    title: "EduSign",
    links: [
      ["À propos de nous", "/about"],
      ["Mon espace", "/dashboard"],
      ["Créer un compte", "/register"],
    ],
  },
];
export function SiteFooter() {
  const { t } = useLocale();
  return (
    <footer className="border-t border-border bg-white">
      <div className="container grid gap-10 py-12 sm:py-16 lg:grid-cols-[1.1fr_1.5fr] lg:gap-20">
        <div>
          <Brand />
          <p className="mt-5 max-w-xs text-sm leading-[1.8] text-muted-foreground">
            {t(
              "Découvrir la langue des signes française. Apprendre à son rythme. Se rapprocher, ensemble.",
            )}
          </p>
          <span className="mt-5 inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-[11px] font-medium text-muted-foreground">
            <span aria-hidden className="size-1.5 rounded-full bg-primary" />
            {t("Langue enseignée : LSF · Interface : FR / EN")}
          </span>
        </div>
        <nav
          aria-label={t("Liens utiles")}
          className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3"
        >
          {groups.map((group) => (
            <div key={group.title}>
              <p className="mb-4 text-xs font-semibold text-foreground">
                {t(group.title)}
              </p>
              <ul className="space-y-1">
                {group.links.map(([label, href]) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="inline-flex min-h-10 items-center gap-1.5 py-1 text-xs leading-relaxed text-muted-foreground transition-colors hover:text-primary"
                    >
                      {t(label)}
                      {href === "/resources" && (
                        <ArrowUpRight aria-hidden className="size-3" />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
      <div className="container flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-border py-6 text-[11px] leading-relaxed text-muted-foreground">
        <span>EduSign · {t("Un signe. Un lien de plus.")}</span>
        <span className="inline-flex items-center gap-1.5">
          <Heart aria-hidden className="size-3" />
          {t("Pour les élèves et ceux qui les accompagnent.")}
        </span>
      </div>
    </footer>
  );
}
