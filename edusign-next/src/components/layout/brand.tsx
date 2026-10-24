"use client";
import { useLocale as useInterfaceLocale } from "@/components/i18n/locale-provider";

import { T } from "@/components/i18n/locale-provider";
import Link from "next/link";
import { Hand } from "lucide-react";
import { cn } from "@/lib/utils";

export function Brand({
  light = false,
  compactOnMobile = false,
}: {
  light?: boolean;
  compactOnMobile?: boolean;
}) {
  const { t: _t } = useInterfaceLocale();

  return (
    <Link
      href="/"
      aria-label={_t("EduSign — accueil")}
      className={cn(
        "inline-flex items-center gap-2 text-lg font-semibold sm:gap-2.5 sm:text-xl tracking-tight",
        light && "text-white",
      )}
    >
      <span
        className={cn(
          "grid size-8 place-items-center rounded-lg sm:size-9 sm:rounded-xl bg-navy text-white",
          light && "bg-white/15",
        )}
      >
        <Hand aria-hidden className="size-5" />
      </span>
      <span
        className={cn(
          "inline-flex items-start gap-1",
          compactOnMobile && "hidden min-[400px]:inline-flex",
        )}
      >
        <T text="EduSign" />
        <span className="mt-1 size-1.5 rounded-full bg-primary" aria-hidden />
      </span>
    </Link>
  );
}
