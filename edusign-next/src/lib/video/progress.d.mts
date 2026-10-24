export type Range = [number, number];
export type VideoEvent = {
  activeMs: number;
  durationMs: number;
  positionMs: number;
  ranges: Range[];
  at: string;
};
export type VideoSummary = {
  activeMs: number;
  durationMs: number;
  watchedMs: number;
  ranges: Range[];
  coverage: number;
  positionMs: number;
  lastWatchedAt: string | null;
};
export type PlaybackSample = {
  at: number;
  positionMs: number;
  playing: boolean;
  visible: boolean;
  rate: number;
};
export function mergeRanges(ranges: Range[], durationMs: number): Range[];
export function summarizeVideo(events: VideoEvent[]): VideoSummary;
export function playbackDelta(
  previous: PlaybackSample,
  current: PlaybackSample,
): { activeMs: number; ranges: Range[] };
