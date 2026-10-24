import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const lessons = JSON.parse(
  await readFile(
    new URL("../src/lib/data/lsf-catalog.json", import.meta.url),
    "utf8",
  ),
);
test("LSF lessons use distinct identifiers rather than reusing legacy learner progress", () => {
  assert.equal(new Set(lessons.map((l) => l.id)).size, lessons.length);
  for (const l of lessons) assert.match(l.id, /^lsf-[a-z]+$/);
});
test("every LSF workshop includes a YouTube source, creator credit and family activity", () => {
  for (const l of lessons) {
    assert.match(l.youtubeId, /^[\w-]{11}$/);
    assert.equal(new URL(l.sourceUrl).protocol, "https:");
    assert.ok(l.creator);
    assert.ok(l.parentTip);
    assert.ok(l.challenge);
    assert.ok(l.objectives.length);
  }
});
test("YouTube sources are not duplicated under unrelated lesson topics", () => {
  assert.equal(new Set(lessons.map((l) => l.youtubeId)).size, lessons.length);
});
