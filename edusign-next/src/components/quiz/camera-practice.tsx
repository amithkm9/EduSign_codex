"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, Square, RotateCcw, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/i18n/locale-provider";

export function CameraPractice({
  courseId,
  onReplay,
}: {
  courseId: string;
  onReplay(): void;
}) {
  const { t } = useLocale();
  const targets =
    courseId === "lsf-alphabet" ? ["A", "B", "C"] : ["1", "2", "3"];
  const [index, setIndex] = useState(0);
  const [state, setState] = useState<
    "off" | "requesting" | "ready" | "recording" | "captured"
  >("off");
  const [error, setError] = useState("");
  const [url, setUrl] = useState("");
  const [remaining, setRemaining] = useState(3);
  const preview = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const objectUrl = useRef("");
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const interval = useRef<ReturnType<typeof setInterval> | null>(null);
  const generation = useRef(0);
  const clearTimers = useCallback(() => {
    if (timeout.current) clearTimeout(timeout.current);
    if (interval.current) clearInterval(interval.current);
  }, []);
  const stop = useCallback(() => {
    generation.current++;
    clearTimers();
    if (recorder.current?.state === "recording") {
      recorder.current.onstop = null;
      recorder.current.stop();
    }
    stream.current?.getTracks().forEach((track) => track.stop());
    stream.current = null;
    recorder.current = null;
    setState("off");
  }, [clearTimers]);
  useEffect(
    () => () => {
      generation.current++;
      if (timeout.current) clearTimeout(timeout.current);
      if (interval.current) clearInterval(interval.current);
      if (recorder.current?.state === "recording") {
        recorder.current.onstop = null;
        recorder.current.stop();
      }
      stream.current?.getTracks().forEach((track) => track.stop());
      if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    },
    [],
  );
  useEffect(() => {
    function hidden() {
      if (document.hidden) stop();
    }
    document.addEventListener("visibilitychange", hidden);
    return () => document.removeEventListener("visibilitychange", hidden);
  }, [stop]);
  async function enable() {
    const version = ++generation.current;
    setError("");
    setState("requesting");
    if (
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === "undefined"
    ) {
      setError(
        "La caméra nécessite un navigateur compatible et une connexion HTTPS (ou localhost).",
      );
      setState("off");
      return;
    }
    try {
      const media = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
        audio: false,
      });
      if (version !== generation.current) {
        media.getTracks().forEach((track) => track.stop());
        return;
      }
      stream.current = media;
      if (preview.current) {
        preview.current.srcObject = media;
        await preview.current.play();
      }
      if (version === generation.current) setState("ready");
    } catch {
      if (version === generation.current) {
        stop();
        setError(
          "La caméra est indisponible ou son accès a été refusé. Autorisez-la dans votre navigateur pour réessayer.",
        );
      }
    }
  }
  function capture() {
    if (!stream.current) return;
    const version = generation.current;
    try {
      const type = ["video/webm;codecs=vp8", "video/webm", "video/mp4"].find(
        (value) => MediaRecorder.isTypeSupported(value),
      );
      const recording = new MediaRecorder(
        stream.current,
        type ? { mimeType: type } : undefined,
      );
      const chunks: Blob[] = [];
      recorder.current = recording;
      recording.ondataavailable = (event) => {
        if (event.data.size) chunks.push(event.data);
      };
      recording.onstop = () => {
        clearTimers();
        if (version !== generation.current) return;
        stream.current?.getTracks().forEach((track) => track.stop());
        stream.current = null;
        if (!chunks.length) {
          setError("La capture a échoué. Réessayez.");
          setState("off");
          return;
        }
        if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
        objectUrl.current = URL.createObjectURL(
          new Blob(chunks, { type: recording.mimeType }),
        );
        setUrl(objectUrl.current);
        setState("captured");
      };
      recording.onerror = () => {
        stop();
        setError("La capture a échoué. Réessayez.");
      };
      recording.start();
      setState("recording");
      setRemaining(3);
      interval.current = setInterval(
        () => setRemaining((value) => Math.max(0, value - 1)),
        1000,
      );
      timeout.current = setTimeout(() => {
        if (recording.state === "recording") recording.stop();
      }, 3000);
    } catch {
      stop();
      setError("La capture a échoué. Réessayez.");
    }
  }
  function reset(next = false) {
    stop();
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    objectUrl.current = "";
    setUrl("");
    setError("");
    if (next) setIndex((index + 1) % targets.length);
  }
  return (
    <section className="rounded-3xl border border-primary/20 bg-[#f4f7ff] p-5 sm:p-7">
      <p className="eyebrow">{t("LE DÉFI CAMÉRA")}</p>
      <h2 className="mt-3 text-2xl font-bold">{t("À vous de signer !")}</h2>
      <p className="mt-3 text-sm leading-relaxed">
        {t(
          "Regardez le modèle LSF, placez vos mains dans le cadre, puis capturez votre essai pendant trois secondes.",
        )}
      </p>
      <p className="mt-4 rounded-xl bg-[#fff0b5] p-3 text-sm leading-relaxed">
        {t(
          "Mode entraînement : la correction automatique LSF n’est pas encore disponible. Aucun verdict correct/incorrect ni score de geste ne sera attribué.",
        )}
      </p>
      <div className="mt-5 flex items-center justify-between gap-3">
        <p className="font-semibold">
          {t(
            courseId === "lsf-alphabet"
              ? "Signez la lettre"
              : "Signez le nombre",
          )}{" "}
          <span className="ml-2 text-4xl text-primary">{targets[index]}</span>
        </p>
        <span className="text-sm">
          {index + 1} / {targets.length}
        </span>
      </div>
      <div className="relative mt-5 aspect-[4/3] overflow-hidden rounded-2xl bg-[#182342]">
        <video
          ref={preview}
          autoPlay
          muted
          playsInline
          className={`h-full w-full object-contain ${state === "captured" ? "hidden" : ""}`}
          aria-label={t("Aperçu de votre caméra")}
        />
        {state === "captured" && url && (
          <video
            src={url}
            controls
            playsInline
            className="h-full w-full object-contain"
            aria-label={t("Revoir votre essai")}
          />
        )}
        {state === "off" && (
          <div className="absolute inset-0 grid place-items-center text-sm text-white">
            {t("La caméra est éteinte")}
          </div>
        )}
        {state === "recording" && (
          <p
            role="status"
            className="absolute right-3 top-3 rounded-full bg-destructive px-4 py-2 text-sm font-bold text-white"
          >
            {t("Capture")} · {remaining} s
          </p>
        )}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        {t(
          "Votre capture reste dans ce navigateur. Aucun son n’est enregistré et aucune vidéo n’est envoyée ni conservée sur nos serveurs.",
        )}
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        {state === "off" && (
          <Button onClick={() => void enable()}>
            <Camera className="size-4" />
            {t("Activer la caméra")}
          </Button>
        )}
        {state === "requesting" && (
          <Button onClick={stop} variant="outline">
            {t("Annuler la demande")}
          </Button>
        )}
        {state === "ready" && (
          <Button onClick={capture}>
            <Camera className="size-4" />
            {t("Capturer mon signe")}
          </Button>
        )}
        {(state === "ready" || state === "recording") && (
          <Button onClick={stop} variant="outline">
            <Square className="size-4" />
            {t("Éteindre la caméra")}
          </Button>
        )}
        {state === "captured" && (
          <>
            <Button onClick={() => reset()} variant="outline">
              <RotateCcw className="size-4" />
              {t("Réessayer")}
            </Button>
            <Button onClick={() => reset(true)}>
              {t("Défi suivant")}
              <ArrowRight className="size-4" />
            </Button>
          </>
        )}
        <Button
          onClick={() => {
            stop();
            onReplay();
          }}
          variant="outline"
        >
          {t("Revoir le modèle LSF")}
        </Button>
      </div>
      {state === "captured" && (
        <p role="status" className="mt-4 font-semibold text-primary">
          {t(
            "Essai capturé, non évalué. Comparez-le à la démonstration LSF avec votre parent ou votre enseignant.",
          )}
        </p>
      )}
      {error && (
        <p role="alert" className="mt-4 text-sm text-destructive">
          {t(error)}
        </p>
      )}
    </section>
  );
}
