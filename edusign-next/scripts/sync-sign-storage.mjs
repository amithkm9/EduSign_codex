// Explicit upload, private bucket, content-addressed objects, originals preserved.
import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { supabaseConfig, safeError } from "./env.mjs";
const root = new URL("../../", import.meta.url);
const readJson = async (path) =>
  JSON.parse(await readFile(new URL(path, root), "utf8"));
const manifest = await readJson("ai-service/app/data/signs_manifest.json");
const labels = await readJson(
  "ai-service/app/data/project-sign-labels.fr.json",
);
const metadata = await readJson("edusign-next/.sign-media-cache/metadata.json");
const synonyms = await readJson("ai-service/app/data/sign_synonyms.json");
const bucket = "sign-demonstrations";
const sha = (data) => createHash("sha256").update(data).digest("hex");
const frenchAliases = {
  HI: ["salut", "coucou"],
  HELLO: ["bonjour"],
  BYE: ["au revoir", "a bientot"],
  MOTHER: ["maman", "mère", "mere"],
  FATHER: ["papa", "père", "pere"],
  WATER: ["eau"],
  EAT: ["manger"],
  DRINK: ["boire"],
  SLEEP: ["dormir"],
  CHILD: ["enfant", "enfants"],
  APPLE: ["pomme"],
  DOG: ["chien"],
  CAT: ["chat"],
  SHOES: ["chaussure", "chaussures"],
  FRIEND: ["ami", "amie"],
  SCHOOL: ["école", "ecole"],
};
const catalog = Object.entries(manifest).map(([key, localPath]) => {
  const id =
    "project-" +
    key
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/-$/, "");
  const en = key
    .replace(/_0A/g, "")
    .replace(/ \(1\)/, " (variant)")
    .toLowerCase()
    .replace(/^./, (s) => s.toUpperCase());
  const m = metadata[key];
  if (!m || !labels[key])
    throw new Error("Missing prepared metadata or translation");
  return {
    id,
    key,
    label: {
      en,
      fr: labels[key]
        .toLocaleLowerCase("fr")
        .replace(/^./, (s) => s.toUpperCase()),
    },
    aliases: [
      en,
      labels[key],
      key,
      ...Object.entries(synonyms)
        .filter(([alias, value]) => value === key && alias !== "_comment")
        .map(([alias]) => alias),
      ...(frenchAliases[key] || []),
    ],
    language: "unverified",
    collection: "project",
    src: `/api/signs/${id}/video`,
    originalSrc: `/api/signs/${id}/video?original=1`,
    localPath,
    creator: "EduSign project library",
    sourceUrl: "",
    license: "",
    licenseUrl: "",
    checkedAt: "2026-10-24",
    changes: {
      fr: "Copie MP4 compatible ; fichier original conservé.",
      en: "Compatible MP4 copy; original file preserved.",
    },
    parentTip: {
      fr: "Regardez le clip, faites pause et essayez chacun votre tour. Cette vidéo de la bibliothèque du projet n’a pas été validée comme démonstration LSF.",
      en: "Watch the clip, pause and take turns trying it. This project-library video has not been validated as an LSF demonstration.",
    },
    storage: {
      bucket,
      path: `project/${id}/${m.mp4sha256}.mp4`,
      originalPath: `originals/${id}/${m.sha256}.webm`,
    },
    ...m,
  };
});
if (new Set(catalog.map((x) => x.id)).size !== catalog.length)
  throw new Error("Duplicate ids");
const raw = JSON.stringify(catalog, null, 2) + "\n";
await writeFile(
  new URL("edusign-next/src/lib/data/project-sign-videos.json", root),
  raw,
);
await writeFile(
  new URL("ai-service/app/data/project-sign-videos.json", root),
  raw,
);
console.log(
  "Indexed",
  catalog.length,
  "videos; source bytes",
  catalog.reduce((n, x) => n + x.bytes, 0),
  "MP4 bytes",
  catalog.reduce((n, x) => n + x.mp4bytes, 0),
);
if (!process.argv.includes("--upload")) {
  console.log(
    "Preview only. Pass --upload to copy into private Supabase Storage.",
  );
  process.exit(0);
}
const { url, secret } = supabaseConfig();
if (!secret) throw new Error("Supabase server credential missing");
const client = createClient(url, secret, {
  auth: { persistSession: false, autoRefreshToken: false },
});
try {
  const { data: buckets, error } = await client.storage.listBuckets();
  if (error) throw error;
  const existing = buckets.find((x) => x.name === bucket);
  if (existing?.public)
    throw new Error(
      "Expected a private bucket; refusing to change existing permissions",
    );
  if (!existing) {
    const made = await client.storage.createBucket(bucket, {
      public: false,
      fileSizeLimit: 25 * 1024 * 1024,
      allowedMimeTypes: ["video/webm", "video/mp4"],
    });
    if (made.error) throw made.error;
  }
  const store = client.storage.from(bucket);
  let next = 0,
    complete = 0,
    failed = 0;
  async function upload(path, data, type, digest) {
    if (sha(data) !== digest) throw new Error("File changed after preparation");
    const result = await store.upload(path, data, {
      contentType: type,
      cacheControl: "31536000",
      upsert: false,
    });
    if (
      result.error &&
      !["409", "Duplicate"].includes(String(result.error.statusCode)) &&
      !String(result.error.message).includes("already exists")
    )
      throw result.error;
    const info = await store.info(path);
    if (info.error || info.data.size !== data.length)
      throw new Error("Uploaded size verification failed");
  }
  await Promise.all(
    Array.from({ length: 4 }, async () => {
      while (next < catalog.length) {
        const item = catalog[next++];
        try {
          const original = await readFile(
            new URL("edusign-next/public" + item.localPath, root),
          );
          const mp4 = await readFile(
            new URL(
              "edusign-next/.sign-media-cache/" + item.sha256 + ".mp4",
              root,
            ),
          );
          await upload(
            item.storage.originalPath,
            original,
            "video/webm",
            item.sha256,
          );
          await upload(item.storage.path, mp4, "video/mp4", item.mp4sha256);
          complete++;
          if (complete % 25 === 0)
            console.log("Uploaded and verified", complete, "/", catalog.length);
        } catch (error) {
          failed++;
          console.error("Upload failed", item.id, safeError(error));
        }
      }
    }),
  );
  console.log(
    "Storage sync complete:",
    complete,
    "videos verified,",
    failed,
    "failed. Bucket remains private.",
  );
  if (failed) process.exitCode = 1;
} catch (error) {
  console.error("Storage sync failed:", safeError(error));
  process.exitCode = 1;
}
