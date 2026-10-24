import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { gatherReportData } from "@/lib/data/report";
import { rateLimit, tooMany } from "@/lib/rate-limit";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL ?? "http://localhost:8100";
const TTL = 5 * 60 * 1000; // 5 minutes
const cache = new Map<
  string,
  { t: number; data: unknown; signature: string }
>();

// The AI narrative (gpt-4o-mini) can take a while; bound the upstream wait below
// the function limit so a slow/hung Python service can't pin the request.
const AI_TIMEOUT_MS = 25_000;
export const maxDuration = 30;

/**
 * GET /api/report  → the signed-in user's parent report.
 * Gathers DATA in TS, gets the AI NARRATIVE from the Python service, caches 5m.
 * `?refresh=1` bypasses the cache.
 */
export async function GET(req: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const rl = rateLimit(`report:${user.id}`, 10);
  if (!rl.ok) return tooMany(rl.retryAfter);

  const language =
    new URL(req.url).searchParams.get("language") === "en" ? "en" : "fr";
  const cacheKey = `${user.id}:${language}`;
  const refresh = new URL(req.url).searchParams.get("refresh") === "1";
  // Always read current learner data; cached narratives must match those data.
  const data = await gatherReportData(user.id);
  const signature = JSON.stringify(data);
  const cached = cache.get(cacheKey);
  if (
    !refresh &&
    cached &&
    cached.signature === signature &&
    Date.now() - cached.t < TTL
  ) {
    return NextResponse.json(cached.data);
  }

  let aiInsights: unknown = null;
  try {
    const upstream = await fetch(`${AI_SERVICE_URL}/report/insights`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.INTERNAL_API_TOKEN
          ? { "X-Internal-Token": process.env.INTERNAL_API_TOKEN }
          : {}),
      },
      body: JSON.stringify({ ...data, language }),
      signal: AbortSignal.timeout(AI_TIMEOUT_MS),
    });
    if (upstream.ok) {
      aiInsights = (await upstream.json()).insights;
    }
  } catch {
    aiInsights = null; // report still renders with data + charts
  }

  const payload = { success: true, report: { ...data, aiInsights } };
  cache.set(cacheKey, { t: Date.now(), data: payload, signature });
  return NextResponse.json(payload);
}
