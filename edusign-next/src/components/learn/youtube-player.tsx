"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { useLocale } from "@/components/i18n/locale-provider";
import type { LsfLesson } from "@/lib/data/lsf";

export type YouTubeControls = { pause(): void };
type Player = { destroy(): void; pauseVideo(): void };
type YouTubeApi = {
  Player: new (
    iframe: HTMLIFrameElement,
    options: {
      events: {
        onStateChange(event: { data: number }): void;
        onError(): void;
        onReady(event: { target: Player }): void;
      };
    },
  ) => Player;
};
declare global {
  interface Window {
    YT?: YouTubeApi;
    onYouTubeIframeAPIReady?: () => void;
  }
}
let pendingApi: Promise<YouTubeApi> | undefined;
function loadApi(): Promise<YouTubeApi> {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (pendingApi) return pendingApi;
  pendingApi = new Promise<YouTubeApi>((resolve, reject) => {
    const script = document.createElement("script");
    const previous = window.onYouTubeIframeAPIReady;
    const timer = window.setTimeout(failed, 15000);
    function failed() {
      window.clearTimeout(timer);
      window.onYouTubeIframeAPIReady = previous;
      script.remove();
      pendingApi = undefined;
      reject(new Error("YouTube unavailable"));
    }
    window.onYouTubeIframeAPIReady = () => {
      window.clearTimeout(timer);
      window.onYouTubeIframeAPIReady = previous;
      previous?.();
      if (window.YT?.Player) resolve(window.YT);
      else failed();
    };
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    script.onerror = failed;
    document.head.appendChild(script);
  });
  return pendingApi;
}

// Mounted only after the learner chooses to load the external video.
export function YouTubePlayer({
  lesson,
  onEnded,
  controls,
}: {
  lesson: LsfLesson;
  onEnded(): void;
  controls: RefObject<YouTubeControls | null>;
}) {
  const { t, locale } = useLocale();
  const container = useRef<HTMLDivElement>(null);
  const ended = useRef(onEnded);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    ended.current = onEnded;
  }, [onEnded]);
  useEffect(() => {
    let cancelled = false;
    let player: Player | undefined;
    const host = container.current!;
    setFailed(false);
    loadApi()
      .then((api) => {
        if (cancelled) return;
        const iframe = document.createElement("iframe");
        iframe.src = `https://www.youtube-nocookie.com/embed/${lesson.youtubeId}?enablejsapi=1&rel=0&autoplay=1&hl=${locale}&origin=${encodeURIComponent(window.location.origin)}`;
        iframe.title = `${lesson.sourceTitle} — ${lesson.creator} — LSF`;
        iframe.className = "h-full w-full";
        iframe.allow =
          "autoplay; encrypted-media; picture-in-picture; fullscreen";
        iframe.allowFullscreen = true;
        iframe.referrerPolicy = "strict-origin-when-cross-origin";
        host.appendChild(iframe);
        player = new api.Player(iframe, {
          events: {
            onReady: ({ target }) => {
              if (!cancelled)
                controls.current = { pause: () => target.pauseVideo() };
            },
            onStateChange: ({ data }) => {
              if (!cancelled && data === 0) ended.current();
            },
            onError: () => {
              if (!cancelled) setFailed(true);
            },
          },
        });
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
      controls.current = null;
      player?.destroy();
      host.replaceChildren();
    };
  }, [lesson.youtubeId, lesson.sourceTitle, lesson.creator, locale, controls]);
  return (
    <div className="relative h-full w-full">
      <div ref={container} className="h-full w-full" />
      {failed && (
        <p
          role="alert"
          className="absolute inset-x-3 bottom-3 rounded-xl bg-white p-4 text-center text-sm text-foreground"
        >
          {t(
            "La vidéo ne se charge pas. Utilisez le lien YouTube ci-dessous, puis ouvrez le quiz.",
          )}
        </p>
      )}
    </div>
  );
}
