"use client";
import { useLocale as useInterfaceLocale } from "@/components/i18n/locale-provider";

import { T } from "@/components/i18n/locale-provider";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
export function MainNav({ isAuthed }: { isAuthed: boolean }) {
  const { t: _t } = useInterfaceLocale();

  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const links = [
    { href: "/courses", label: "Apprendre" },
    { href: "/tutor", label: "Mon assistant" },
    { href: "/packages", label: "Formules" },
    { href: "/community", label: "Communauté" },
    { href: "/about", label: "À propos" },
    ...(isAuthed ? [{ href: "/dashboard", label: "Mes progrès" }] : []),
  ];
  useEffect(() => {
    if (!open) return;
    function key(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
      }
    }
    function outside(event: PointerEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("keydown", key);
    document.addEventListener("pointerdown", outside);
    return () => {
      document.removeEventListener("keydown", key);
      document.removeEventListener("pointerdown", outside);
    };
  }, [open]);
  const active = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");
  return (
    <div ref={root}>
      <nav
        aria-label={_t("Navigation principale")}
        className="hidden items-center gap-5 xl:flex"
      >
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active(l.href) ? "page" : undefined}
            className={cn(
              "py-3 text-sm transition-colors hover:text-primary",
              active(l.href)
                ? "font-semibold text-primary underline decoration-2 underline-offset-8"
                : "text-muted-foreground",
            )}
          >
            <T text={l.label} />
          </Link>
        ))}
      </nav>
      <button
        ref={toggle}
        type="button"
        aria-label={_t(open ? "Fermer le menu" : "Ouvrir le menu")}
        aria-expanded={open}
        aria-controls="mobile-navigation"
        onClick={() => setOpen(!open)}
        className="grid size-11 place-items-center rounded-full hover:bg-secondary xl:hidden"
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>
      {open && (
        <nav
          id="mobile-navigation"
          aria-label={_t("Navigation mobile")}
          className="absolute inset-x-0 top-full flex flex-col gap-1 border-b border-border bg-background p-5 shadow-lg xl:hidden"
        >
          {[
            ...links,
            { href: "/quiz", label: "Pratiquer" },
            { href: "/parents", label: "Parents" },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              aria-current={active(l.href) ? "page" : undefined}
              className={cn(
                "rounded-xl px-4 py-3 text-sm",
                active(l.href)
                  ? "bg-secondary font-semibold text-primary"
                  : "hover:bg-secondary",
              )}
            >
              <T text={l.label} />
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
