"use client";
import { useEffect, useRef, useState } from "react";
import { ExternalLink, RotateCcw } from "lucide-react";
import { translate, type Locale } from "@/lib/i18n/translate";
import { useLocale } from "@/components/i18n/locale-provider";
import lsfCatalog from "@/lib/data/sign-videos.json";
import projectCatalog from "@/lib/data/project-sign-videos.json";
const catalog = [...projectCatalog, ...lsfCatalog];

export function SignVideoCard({
  id,
  active,
  language,
}: {
  id: string;
  active: boolean;
  language?: Locale;
}) {
  const { locale: interfaceLocale } = useLocale();
  const locale = language ?? interfaceLocale;
  const t = (text: string) => translate(text, locale);
  const sign = catalog.find((item) => item.id === id);
  const video = useRef<HTMLVideoElement>(null);
  const [speed, setSpeed] = useState(1);
  const [loop, setLoop] = useState(false);
  const [failed, setFailed] = useState(false);
  const [playError, setPlayError] = useState(false);
  useEffect(() => {
    const node = video.current;
    if (!node) return;
    if (
      active &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      void node.play().catch(() => {
        /* Native play control remains available. */
      });
    } else node.pause();
    const hide = () => {
      if (document.hidden) node.pause();
    };
    const stopOther = (event: Event) => {
      if ((event as CustomEvent).detail !== node) node.pause();
    };
    document.addEventListener("visibilitychange", hide);
    document.addEventListener("edusign-sign-play", stopOther);
    return () => {
      node.pause();
      document.removeEventListener("visibilitychange", hide);
      document.removeEventListener("edusign-sign-play", stopOther);
    };
  }, [active, id]);
  if (!sign) return null;
  async function replay() {
    const node = video.current;
    if (!node) return;
    setPlayError(false);
    node.currentTime = 0;
    try {
      await node.play();
    } catch {
      setPlayError(true);
    }
  }
  return (
    <section
      lang={locale}
      aria-label={`${t("Démonstration du signe")} ${sign.label[locale]}`}
      className="overflow-hidden rounded-2xl bg-white shadow-sm"
    >
      <div className="flex items-center justify-between gap-3 bg-navy px-5 py-4 text-white">
        <div>
          <p className="text-[9px] font-medium uppercase tracking-[0.16em] text-white/70">
            {t("REGARDEZ LE SIGNE")}
          </p>
          <h3 className="mt-1 text-2xl font-medium">
            {sign.label[locale]}
            {locale === "en" && sign.language === "LSF" && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                · {sign.label.fr}
              </span>
            )}
          </h3>
        </div>
        <span className="max-w-[140px] rounded-full border border-white/20 px-2.5 py-1 text-center text-[10px] text-white/85">
          {sign.language === "LSF" ? "LSF" : t("Langue non vérifiée")}
        </span>
      </div>
      <div className="bg-media">
        <video
          ref={video}
          controls
          playsInline
          muted
          loop={loop}
          preload="metadata"
          aria-label={`${t("Démonstration du signe")} ${sign.label[locale]}`}
          className="mx-auto h-[250px] w-full object-contain sm:h-[300px]"
          onError={() => setFailed(true)}
          onPlay={() =>
            document.dispatchEvent(
              new CustomEvent("edusign-sign-play", { detail: video.current }),
            )
          }
        >
          <source src={sign.src} type="video/mp4" />
          <source src={sign.originalSrc} type="video/webm" />
          {t(
            "Votre navigateur ne peut pas lire cette vidéo. Ouvrez la source ci-dessous.",
          )}
        </video>
      </div>
      <div className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => void replay()}
            disabled={failed}
            className="flex min-h-10 items-center gap-2 rounded-full bg-primary px-3 py-2 text-xs font-medium text-white disabled:opacity-50"
          >
            <RotateCcw size={15} />
            {t("Revoir le signe")}
          </button>
          <div
            className="flex items-center gap-1 rounded-full bg-muted p-1"
            role="group"
            aria-label={t("Vitesse de la démonstration")}
          >
            {[0.5, 1].map((value) => (
              <button
                key={value}
                aria-pressed={speed === value}
                onClick={() => {
                  setSpeed(value);
                  if (video.current) video.current.playbackRate = value;
                }}
                className={`min-h-9 rounded-full px-2.5 text-[11px] font-medium ${speed === value ? "bg-white shadow-sm" : "text-muted-foreground"}`}
              >
                {value === 0.5 ? t("Au ralenti · 0,5×") : t("Normal · 1×")}
              </button>
            ))}
          </div>
          <label className="flex min-h-9 cursor-pointer items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={loop}
              onChange={(event) => setLoop(event.target.checked)}
              className="accent-primary"
            />
            {t("En boucle")}
          </label>
        </div>
        {(failed || playError) && (
          <p
            role="alert"
            className="mt-3 rounded-xl bg-warning-subtle p-3 text-sm text-warning-foreground"
          >
            {t(
              "La vidéo ne démarre pas. Essayez le bouton de lecture ou ouvrez la source ci-dessous.",
            )}
          </p>
        )}
        <details className="mt-3 border-t pt-3 text-xs text-muted-foreground">
          <summary className="cursor-pointer font-medium">
            {t("À essayer ensemble")}
          </summary>
          <p className="mt-2 leading-6">{sign.parentTip[locale]}</p>
        </details>
        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] leading-5 text-muted-foreground">
          <a
            href={sign.sourceUrl || sign.originalSrc}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 underline underline-offset-2"
          >
            {sign.language === "LSF"
              ? sign.creator
              : t("Bibliothèque du projet")}{" "}
            · {t("Voir la source")}
            <ExternalLink size={11} />
            <span className="sr-only">{t("Ouvre un nouvel onglet")}</span>
          </a>
          {sign.licenseUrl && (
            <>
              <span>·</span>
              <a
                href={sign.licenseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2"
              >
                {sign.license}
                <span className="sr-only">{t("Ouvre un nouvel onglet")}</span>
              </a>
            </>
          )}
          {sign.language === "LSF" && <span>· {sign.changes[locale]}</span>}
        </div>
      </div>
    </section>
  );
}
