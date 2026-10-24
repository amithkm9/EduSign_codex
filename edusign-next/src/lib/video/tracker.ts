import {
  mergeRanges,
  playbackDelta,
  summarizeVideo,
  type PlaybackSample,
  type Range,
  type VideoSummary,
} from "./progress.mjs";
export type TrackedPlayer = {
  getCurrentTime(): number;
  getDuration(): number;
  getPlaybackRate(): number;
  getPlayerState(): number;
};
type Event = {
  id: string;
  courseId: string;
  sessionId: string;
  type: "start" | "heartbeat" | "pause" | "end";
  activeMs: number;
  durationMs: number;
  positionMs: number;
  ranges: Range[];
  at: string;
};
export function trackPlayback(
  player: TrackedPlayer,
  courseId: string,
  persist: boolean,
  update: (value: VideoSummary) => void,
  status: (value: "saving" | "saved" | "error") => void,
) {
  const sessionId = crypto.randomUUID();
  let previous: PlaybackSample | undefined;
  let activeMs = 0,
    pendingMs = 0,
    durationMs = 0,
    positionMs = 0;
  let ranges: Range[] = [],
    pendingRanges: Range[] = [];
  let baseline: VideoSummary = summarizeVideo([]);
  const queue: Event[] = [];
  let baselineReady = !persist;
  let sending = false,
    stopped = false;
  function render() {
    const summary = summarizeVideo([
      { ...baseline, at: new Date().toISOString() },
      {
        activeMs,
        durationMs,
        positionMs,
        ranges,
        at: new Date().toISOString(),
      },
    ]);
    update({ ...summary, positionMs });
  }
  if (persist)
    fetch("/api/learning/video", { signal: AbortSignal.timeout(10000) })
      .then(async (r) => {
        if (!r.ok) throw new Error();
        const data = await r.json();
        if (!stopped) {
          baseline =
            data.videos.find(
              (v: { courseId: string }) => v.courseId === courseId,
            ) ?? baseline;
          render();
        }
      })
      .catch(() => {
        if (!stopped) status("error");
      })
      .finally(() => {
        baselineReady = true;
        void drain();
      });
  function sample() {
    durationMs = Math.round(player.getDuration() * 1000);
    positionMs = Math.round(player.getCurrentTime() * 1000);
    if (!Number.isFinite(durationMs) || durationMs <= 0) return;
    const current = {
      at: performance.now(),
      positionMs,
      playing: player.getPlayerState() === 1,
      visible: document.visibilityState === "visible",
      rate: player.getPlaybackRate() || 1,
    };
    if (previous) {
      const delta = playbackDelta(previous, current);
      activeMs += delta.activeMs;
      pendingMs += delta.activeMs;
      ranges = mergeRanges([...ranges, ...delta.ranges], durationMs);
      pendingRanges = mergeRanges(
        [...pendingRanges, ...delta.ranges],
        durationMs,
      );
    }
    previous = current;
    render();
  }
  async function drain() {
    if (!baselineReady || sending || !queue.length) return;
    sending = true;
    status("saving");
    try {
      while (queue.length) {
        const r = await fetch("/api/learning/video", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(queue[0]),
          keepalive: true,
          signal: AbortSignal.timeout(12000),
        });
        if (!r.ok) throw new Error();
        queue.shift();
      }
      status("saved");
    } catch {
      status("error");
    } finally {
      sending = false;
    }
  }
  function flush(type: Event["type"] = "heartbeat") {
    sample();
    if (
      persist &&
      durationMs > 0 &&
      (pendingMs > 0 || type === "start" || type === "end")
    ) {
      queue.push({
        id: crypto.randomUUID(),
        courseId,
        sessionId,
        type,
        activeMs: pendingMs,
        durationMs,
        positionMs: Math.min(durationMs, positionMs),
        ranges: pendingRanges,
        at: new Date().toISOString(),
      });
      pendingMs = 0;
      pendingRanges = [];
    }
    void drain();
  }
  function hide() {
    flush("pause");
    if (document.visibilityState === "hidden")
      for (const event of queue)
        navigator.sendBeacon(
          "/api/learning/video",
          new Blob([JSON.stringify(event)], { type: "application/json" }),
        );
    previous = undefined;
  }
  function leave() {
    flush("pause");
    for (const event of queue)
      navigator.sendBeacon(
        "/api/learning/video",
        new Blob([JSON.stringify(event)], { type: "application/json" }),
      );
  }
  const sampleTimer = window.setInterval(sample, 1000);
  const saveTimer = window.setInterval(() => flush(), 15000);
  document.addEventListener("visibilitychange", hide);
  window.addEventListener("pagehide", leave);
  flush("start");
  return {
    change(state: number) {
      sample();
      if (state === 0) flush("end");
      else if (state === 2) flush("pause");
    },
    stop() {
      flush("pause");
      stopped = true;
      window.clearInterval(sampleTimer);
      window.clearInterval(saveTimer);
      document.removeEventListener("visibilitychange", hide);
      window.removeEventListener("pagehide", leave);
    },
  };
}
