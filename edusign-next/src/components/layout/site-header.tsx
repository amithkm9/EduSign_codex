import { getTranslator } from "@/lib/i18n/server";
import { ArrowRight } from "lucide-react";
import { LanguageSwitch } from "@/components/i18n/language-switch";

import { T } from "@/components/i18n/locale-provider";
import Link from "next/link";
import { getUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { MainNav } from "./main-nav";
import { UserMenu } from "./user-menu";
import { Brand } from "./brand";
export async function SiteHeader() {
  const user = await getUser();
  const t = await getTranslator();
  const name =
    typeof user?.user_metadata?.name === "string"
      ? user.user_metadata.name
      : t("Mon espace");
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-white/95 backdrop-blur">
      <div className="container relative flex h-[4.5rem] items-center justify-between gap-2 sm:gap-3">
        <Brand compactOnMobile={!!user} />
        <MainNav isAuthed={!!user} />
        <div className="ml-auto flex items-center gap-2 xl:ml-0">
          <LanguageSwitch />
          {user ? (
            <UserMenu name={name} email={user.email ?? ""} />
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
                className="hidden rounded-xl px-3 text-sm sm:inline-flex"
              >
                <Link href="/login">
                  <T text="Connexion" />
                </Link>
              </Button>
              <Button
                asChild
                className="hidden rounded-xl px-4 text-xs md:inline-flex"
              >
                <Link href="/register">
                  <T text="Commencer" />
                  <ArrowRight aria-hidden className="size-3.5" />
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
