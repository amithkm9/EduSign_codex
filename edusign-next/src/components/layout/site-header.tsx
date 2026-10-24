import { getTranslator } from "@/lib/i18n/server";
import { LogIn } from "lucide-react";
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
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/95 backdrop-blur">
      <div className="container relative flex h-20 items-center justify-between gap-3">
        <Brand />
        <MainNav isAuthed={!!user} />
        <div className="flex items-center gap-2">
          <LanguageSwitch />
          {user ? (
            <UserMenu name={name} email={user.email ?? ""} />
          ) : (
            <Button
              asChild
              variant="outline"
              className="rounded-full border-primary/25 bg-transparent px-3 sm:px-5"
            >
              <Link href="/login">
                <LogIn className="size-4 sm:hidden" />
                <span className="sr-only sm:not-sr-only">
                  <T text={"Connexion"} />
                </span>
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
