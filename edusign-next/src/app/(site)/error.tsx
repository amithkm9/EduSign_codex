"use client";
import { T } from "@/components/i18n/locale-provider";

import Link from "next/link";
import { RefreshCw, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
export default function SiteError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container grid min-h-[60vh] place-items-center py-16">
      <div className="max-w-md text-center">
        <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-secondary text-primary">
          <BookOpen className="size-7" />
        </div>
        <h1 className="mt-6 text-3xl font-semibold">
          <T text={"Une petite pause technique."} />{" "}
        </h1>
        <p className="mt-4 leading-relaxed text-muted-foreground">
          <T
            text={
              "Nous n’arrivons pas à charger cet espace pour le moment. Réessayez dans un instant."
            }
          />{" "}
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Button onClick={reset} className="rounded-full">
            <RefreshCw /> <T text={"Réessayer"} />{" "}
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/">
              <T text={"Retour à l’accueil"} />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
