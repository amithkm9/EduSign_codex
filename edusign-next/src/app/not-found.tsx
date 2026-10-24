import { T } from "@/components/i18n/locale-provider";
import Link from "next/link";
import { Compass } from "lucide-react";
export default function NotFound() {
  return (
    <main
      id="main-content"
      className="container flex min-h-[65vh] max-w-2xl flex-col items-center justify-center py-16 text-center"
    >
      <Compass className="mb-5 size-14 text-primary" strokeWidth={1.5} />
      <p className="eyebrow">
        <T text={"UNE PETITE ERREUR DE CHEMIN"} />
      </p>
      <h1 className="mt-4 text-4xl font-extrabold">
        <T text={"Cette page est introuvable."} />{" "}
      </h1>
      <p className="mt-4 text-muted-foreground">
        <T text={"Revenons aux découvertes : une leçon vous attend."} />{" "}
      </p>
      <Link
        href="/courses"
        className="mt-7 rounded-full bg-primary px-6 py-3 font-bold text-white"
      >
        <T text={"Explorer les leçons"} />{" "}
      </Link>
    </main>
  );
}
