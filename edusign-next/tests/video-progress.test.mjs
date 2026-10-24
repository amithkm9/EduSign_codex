import test from "node:test";
import assert from "node:assert/strict";
import {
  playbackDelta,
  mergeRanges,
  summarizeVideo,
} from "../src/lib/video/progress.mjs";
const sample = {
  at: 1000,
  positionMs: 1000,
  playing: true,
  visible: true,
  rate: 1,
};
test("counts continuous playback in milliseconds, including playback speed", () => {
  assert.equal(
    playbackDelta(sample, { ...sample, at: 2000, positionMs: 2000 }).activeMs,
    1000,
  );
  assert.equal(
    playbackDelta(
      { ...sample, rate: 2 },
      { ...sample, at: 2000, positionMs: 3000 },
    ).activeMs,
    1000,
  );
  assert.equal(
    playbackDelta(
      { ...sample, rate: 0.5 },
      { ...sample, at: 2000, positionMs: 1500 },
    ).activeMs,
    1000,
  );
});
test("ignores paused, buffering, hidden, skipped, rewound and suspended samples", () => {
  for (const [previous, next] of [
    [
      { ...sample, playing: false },
      { ...sample, at: 2000, positionMs: 2000 },
    ],
    [sample, { ...sample, at: 2000 }],
    [
      { ...sample, visible: false },
      { ...sample, at: 2000, positionMs: 2000 },
    ],
    [sample, { ...sample, at: 2000, positionMs: 2000, visible: false }],
    [sample, { ...sample, at: 2000, positionMs: 100000 }],
    [sample, { ...sample, at: 2000, positionMs: 0 }],
    [sample, { ...sample, at: 10000, positionMs: 10000 }],
  ])
    assert.equal(playbackDelta(previous, next).activeMs, 0);
});
test("rewatching adds time while unique coverage excludes overlaps and skipped ranges", () => {
  const summary = summarizeVideo([
    {
      activeMs: 10000,
      durationMs: 100000,
      positionMs: 10000,
      ranges: [[0, 10000]],
      at: "2026-10-24T10:00:00Z",
    },
    {
      activeMs: 10000,
      durationMs: 100000,
      positionMs: 10000,
      ranges: [[0, 10000]],
      at: "2026-10-24T10:01:00Z",
    },
    {
      activeMs: 10000,
      durationMs: 100000,
      positionMs: 90000,
      ranges: [[80000, 90000]],
      at: "2026-10-24T10:02:00Z",
    },
  ]);
  assert.equal(summary.activeMs, 30000);
  assert.equal(summary.watchedMs, 20000);
  assert.equal(summary.coverage, 20);
  assert.equal(summary.positionMs, 90000);
  assert.deepEqual(
    mergeRanges(
      [
        [5000, 9000],
        [0, 6000],
        [9500, 15000],
      ],
      10000,
    ),
    [
      [0, 9000],
      [9500, 10000],
    ],
  );
});
