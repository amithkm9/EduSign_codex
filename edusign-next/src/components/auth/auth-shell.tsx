import { LanguageSwitch } from "@/components/i18n/language-switch";

import { T } from "@/components/i18n/locale-provider";
import Link from "next/link";
import { ArrowLeft, Eye, Hand, Repeat2 } from "lucide-react";
import { Brand } from "@/components/layout/brand";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[1fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-[#24366b] p-12 text-white lg:flex lg:flex-col xl:p-16">
        <Brand light />
        <div className="relative z-10 my-auto max-w-lg py-16">
          <p className="text-xs font-semibold uppercase tracking-[.22em] text-[#dceaff]">
            <T text={"Un geste à la fois"} />{" "}
          </p>
          <h1 className="mt-6 text-5xl font-medium leading-[1.12] tracking-[-.04em] xl:text-6xl">
            <T text={"Les petits gestes"} /> <br />
            <T text={"créent de"} />
            <T text={" "} />
            <em className="font-serif font-normal text-[#fff0b5]">
              <T text={"grands liens."} />{" "}
            </em>
          </h1>
          <p className="mt-7 max-w-sm text-base leading-relaxed text-white/70">
            <T
              text={
                "Un espace pour observer, essayer et progresser. À votre rythme, avec des explications en français."
              }
            />{" "}
          </p>
          <div className="mt-12 flex gap-3" aria-hidden>
            {[Eye, Hand, Repeat2].map((Icon, i) => (
              <div
                key={i}
                className="flex h-24 w-24 flex-col items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5"
              >
                <Icon className="size-7 text-[#fff0b5]" strokeWidth={1.5} />
                <span className="text-[11px] text-white/70">
                  <T text={["Observer", "Pratiquer", "Recommencer"][i]} />
                </span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-white/50">
          <T text={"EduSign · Apprendre et se rapprocher."} />{" "}
        </p>
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-40 -right-40 size-[480px] rounded-full border-[70px] border-white/[.025]"
        />
      </aside>
      <main
        id="main-content"
        className="flex min-h-dvh flex-col px-6 py-8 sm:px-12 lg:px-16"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <LanguageSwitch />
          <div className="lg:hidden">
            <Brand />
          </div>
          <Link
            href="/"
            className="ml-auto inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="size-4" />{" "}
            <T text={"Retour à l’accueil"} />{" "}
          </Link>
        </div>
        <div className="mx-auto my-auto w-full max-w-[400px] py-12">
          {children}
        </div>
        <p className="text-center text-xs text-muted-foreground">
          <T text={"Votre rythme. Votre parcours."} />{" "}
        </p>
      </main>
    </div>
  );
}
