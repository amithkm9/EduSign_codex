"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Camera,
  Square,
  RotateCcw,
  ArrowRight,
  CircleCheck,
  CircleHelp,
  CircleAlert,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/i18n/locale-provider";

export function CameraPractice({
  courseId,
  onReplay,
  track,
}: {
  courseId: string;
  onReplay(): void;
  track: boolean;
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
  const [analysing, setAnalysing] = useState(false);
  const [result, setResult] = useState<{
    verdict: "match" | "different" | "uncertain";
    detected_sign: string;
    confidence: number;
  } | null>(null);
  const frames = useRef<string[]>([]);
  const frameTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const analysis = useRef<AbortController | null>(null);
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
    if (frameTimer.current) clearInterval(frameTimer.current);
  }, []);
  const stop = useCallback(() => {
    generation.current++;
    analysis.current?.abort();
    setAnalysing(false);
    frames.current = [];
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
      analysis.current?.abort();
      frames.current = [];
      if (frameTimer.current) clearInterval(frameTimer.current);
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
  async function analyse(capturedFrames: string[], version: number) {
    if (!track) return;
    setError("");
    setResult(null);
    setAnalysing(true);
    const controller = new AbortController();
    analysis.current = controller;
    const limit = setTimeout(() => controller.abort(), 50000);
    try {
      const response = await fetch("/api/ml/recognize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target: targets[index],
          frames: capturedFrames,
        }),
        signal: controller.signal,
      });
      if (!response.ok) throw new Error();
      const data = await response.json();
      if (version === generation.current) setResult(data);
    } catch {
      if (version === generation.current)
        setError(
          "L’analyse est indisponible. Reprenez une capture pour réessayer.",
        );
    } finally {
      clearTimeout(limit);
      if (version === generation.current) setAnalysing(false);
    }
  }
  function capture() {
    if (!stream.current) return;
    const version = generation.current;
    setResult(null);
    setError("");
    frames.current = [];
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
        const images = frames.current;
        frames.current = [];
        if (track) void analyse(images, version);
      };
      recording.onerror = () => {
        stop();
        setError("La capture a échoué. Réessayez.");
      };
      const canvas = document.createElement("canvas");
      canvas.width = 384;
      canvas.height = Math.round(
        384 * (preview.current!.videoHeight / preview.current!.videoWidth),
      );
      const context = canvas.getContext("2d");
      if (!context || !canvas.height) throw new Error("Camera not ready");
      function sampleFrame() {
        if (frames.current.length >= 30 || !preview.current) return;
        context!.drawImage(preview.current, 0, 0, canvas.width, canvas.height);
        frames.current.push(canvas.toDataURL("image/jpeg", 0.7));
      }
      recording.start();
      sampleFrame();
      frameTimer.current = setInterval(sampleFrame, 100);
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
    setResult(null);
    if (next) setIndex((index + 1) % targets.length);
  }
  return (
    <section className="rounded-3xl border border-primary/20 bg-secondary/50 p-5 sm:p-7">
      <p className="eyebrow">{t("LE DÉFI CAMÉRA")}</p>
      <h2 className="mt-3 text-2xl font-bold">{t("À vous de signer !")}</h2>
      <p className="mt-3 text-sm leading-relaxed">
        {t(
          "Placez une main dans le cadre et gardez le signe visible pendant les trois secondes de capture. Le modèle de démonstration reconnaît uniquement A, B, C, 1, 2 et 3.",
        )}
      </p>
      <p className="mt-4 rounded-xl bg-warning-subtle text-warning-foreground p-3 text-sm leading-relaxed">
        {t(
          "Mode démo expérimental : le modèle historique et l’ordre de ses classes ne sont pas validés pour la LSF. Le résultat compare une prédiction au signe demandé ; il n’est pas enregistré comme note de maîtrise.",
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
      <div
        className={`relative mt-5 aspect-[4/3] overflow-hidden rounded-2xl bg-media ${
          state === "captured" && result?.verdict === "match"
            ? "ring-4 ring-success"
            : ""
        }`}
      >
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
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="pointer-events-none absolute inset-x-3 bottom-16 sm:inset-x-4"
        >
          {state === "captured" && (analysing || result) && (
            <div
              key={analysing ? "analysing" : result?.verdict}
              className={`flex items-start gap-3 rounded-xl border-2 p-3 shadow-lg animate-in fade-in zoom-in-95 duration-300 motion-reduce:animate-none sm:p-4 ${
                analysing
                  ? "border-white bg-white text-foreground"
                  : result?.verdict === "match"
                    ? "border-success bg-success-subtle text-success-foreground"
                    : result?.verdict === "different"
                      ? "border-warning bg-warning-subtle text-warning-foreground"
                      : "border-border bg-muted text-foreground"
              }`}
            >
              {analysing ? (
                <Loader2
                  aria-hidden
                  className="mt-0.5 size-6 shrink-0 animate-spin motion-reduce:animate-none"
                />
              ) : result?.verdict === "match" ? (
                <CircleCheck
                  aria-hidden
                  className="mt-0.5 size-7 shrink-0 text-success"
                />
              ) : result?.verdict === "different" ? (
                <CircleAlert
                  aria-hidden
                  className="mt-0.5 size-7 shrink-0 text-warning"
                />
              ) : (
                <CircleHelp aria-hidden className="mt-0.5 size-7 shrink-0" />
              )}
              <div>
                <p className="text-base font-bold sm:text-lg">
                  {t(
                    analysing
                      ? "Analyse de votre signe…"
                      : result?.verdict === "match"
                        ? "Bravo ! Le signe correspond."
                        : result?.verdict === "different"
                          ? "Un autre signe a été détecté — réessayez"
                          : "Résultat incertain — montrez bien votre main",
                  )}
                </p>
                {!analysing && result && (
                  <>
                    {result.verdict === "match" && (
                      <p className="mt-1 text-sm">
                        {t("Correspondance détectée — démo")} · {targets[index]}
                      </p>
                    )}
                    {result.detected_sign !== "unknown" && (
                      <p className="mt-1 text-xs leading-relaxed">
                        {t("Prédiction du modèle :")}{" "}
                        {(
                          {
                            one: "1",
                            two: "2",
                            three: "3",
                            a: "A",
                            b: "B",
                            c: "C",
                          } as Record<string, string>
                        )[result.detected_sign] ?? "—"}
                        {" · "}
                        {Math.round(result.confidence * 100)}%{" "}
                        {t("de confiance du modèle (non calibrée)")}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        {t(
          "En mode connecté, des images de votre capture sont envoyées au service de reconnaissance pour l’analyse. Aucun son n’est capturé et les images ne sont pas conservées sur le serveur.",
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
            {t(track ? "Capturer et analyser" : "Capturer mon signe")}
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
      {state === "captured" && !track && (
        <div
          role="status"
          aria-live="polite"
          className="mt-5 rounded-2xl bg-white p-4 text-sm"
        >
          <Link
            href={`/login?redirectTo=/learn/${courseId}`}
            className="font-semibold text-primary underline"
          >
            {t("Connectez-vous pour analyser vos signes avec le modèle démo.")}
          </Link>
        </div>
      )}
      {error && (
        <p role="alert" className="mt-4 text-sm text-destructive">
          {t(error)}
        </p>
      )}
    </section>
  );
}
