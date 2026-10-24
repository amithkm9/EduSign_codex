export function mergeRanges(ranges, durationMs) {
  const sorted = ranges
    .map(([a, b]) => [
      Math.max(0, Math.round(a)),
      Math.min(durationMs, Math.round(b)),
    ])
    .filter(([a, b]) => b > a)
    .sort((a, b) => a[0] - b[0]);
  const merged = [];
  for (const [a, b] of sorted) {
    const last = merged.at(-1);
    if (last && a <= last[1]) last[1] = Math.max(last[1], b);
    else merged.push([a, b]);
  }
  return merged;
}
export function summarizeVideo(events) {
  const durationMs = events.reduce(
    (max, e) => Math.max(max, e.durationMs ?? 0),
    0,
  );
  const ranges = mergeRanges(
    events.flatMap((e) => e.ranges ?? []),
    durationMs,
  );
  const watchedMs = ranges.reduce((sum, [a, b]) => sum + b - a, 0);
  const latest = [...events].sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
  )[0];
  return {
    activeMs: events.reduce((sum, e) => sum + e.activeMs, 0),
    durationMs,
    watchedMs,
    ranges,
    coverage: durationMs
      ? Math.min(100, Math.floor((watchedMs / durationMs) * 100))
      : 0,
    positionMs: latest?.positionMs ?? 0,
    lastWatchedAt: latest?.at ?? null,
  };
}
/** A sample counts only continuous visible playback; seeking is excluded. */
export function playbackDelta(previous, current) {
  const wall = current.at - previous.at;
  const media = current.positionMs - previous.positionMs;
  if (
    !previous.playing ||
    !previous.visible ||
    !current.visible ||
    wall <= 0 ||
    wall > 2500 ||
    media <= 0 ||
    media > wall * previous.rate + 400
  )
    return { activeMs: 0, ranges: [] };
  return {
    activeMs: Math.round(Math.min(wall, media / previous.rate)),
    ranges: [[previous.positionMs, current.positionMs]],
  };
}
