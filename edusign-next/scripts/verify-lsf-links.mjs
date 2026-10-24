import { readFile } from "node:fs/promises";
const lessons = JSON.parse(
  await readFile(
    new URL("../src/lib/data/lsf-catalog.json", import.meta.url),
    "utf8",
  ),
);
const results = await Promise.allSettled(
  lessons.map(async (l) => {
    const url = `https://www.youtube.com/oembed?url=${encodeURIComponent("https://www.youtube.com/watch?v=" + l.youtubeId)}&format=json`;
    const r = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!r.ok) throw new Error(`${l.id}: HTTP ${r.status}`);
    const d = await r.json();
    console.log("PASS", l.id, "—", d.title, "—", d.author_name);
  }),
);
for (const r of results)
  if (r.status === "rejected") {
    console.error(String(r.reason));
    process.exitCode = 1;
  }
