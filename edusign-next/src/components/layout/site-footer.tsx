"use client";
import { useLocale as useInterfaceLocale } from "@/components/i18n/locale-provider";

import { T } from "@/components/i18n/locale-provider";
import Link from "next/link";
import { Brand } from "./brand";
import { Heart, ArrowUpRight } from "lucide-react";
export function SiteFooter() {
  const { t: _t } = useInterfaceLocale();

  return (
    <footer className="border-t border-border bg-white">
      <div className="container flex flex-wrap items-start justify-between gap-8 py-10">
        <div>
          <Brand />
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
            <T text={"De petites découvertes."} /> <br />
            <T text={"De grands moments ensemble."} />{" "}
          </p>
        </div>
        <nav
          aria-label={_t("Liens utiles")}
          className="flex flex-wrap gap-x-8 gap-y-4 text-sm font-semibold"
        >
          <Link href="/courses">
            <T text={"Les leçons"} />
          </Link>
          <Link href="/parents">
            <T text={"Parents"} />
          </Link>
          <Link href="/resources" className="flex items-center gap-1">
            <T text={"Ressources LSF"} /> <ArrowUpRight className="size-3" />
          </Link>
          <Link href="/packages">
            <T text="Formules" />
          </Link>
          <Link href="/community">
            <T text="Communauté" />
          </Link>
          <Link href="/about">
            <T text="À propos de nous" />
          </Link>
        </nav>
      </div>
      <div className="container flex flex-wrap justify-between gap-3 border-t border-border py-5 text-xs text-muted-foreground">
        <span>
          <T text={"EduSign · Un projet pour découvrir la LSF."} />
        </span>
        <span className="flex items-center gap-1.5">
          <T text={"Apprendre, essayer, partager"} />{" "}
          <Heart className="size-3" />
        </span>
      </div>
    </footer>
  );
}
