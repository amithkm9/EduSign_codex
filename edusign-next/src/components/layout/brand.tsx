"use client";
import { useLocale as useInterfaceLocale } from "@/components/i18n/locale-provider";

import { T } from "@/components/i18n/locale-provider";
import Link from "next/link";
import { Hand } from "lucide-react";
import { cn } from "@/lib/utils";

export function Brand({ light = false }: { light?: boolean }) {
  const { t: _t } = useInterfaceLocale();

  return (
    <Link
      href="/"
      aria-label={_t("EduSign — accueil")}
      className={cn(
        "inline-flex items-center gap-2.5 text-xl font-semibold tracking-tight",
        light && "text-white",
      )}
    >
      <span
        className={cn(
          "grid size-9 place-items-center rounded-xl bg-primary text-white",
          light && "bg-white/15",
        )}
      >
        <Hand aria-hidden className="size-5" />
      </span>
      <T text={"EduSign"} />{" "}
      <span className="mb-3 size-1.5 rounded-full bg-[#df8b62]" aria-hidden />
    </Link>
  );
}
