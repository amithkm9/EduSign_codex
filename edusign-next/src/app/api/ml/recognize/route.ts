import { NextResponse } from "next/server";
import { z } from "zod";
import { getUser } from "@/lib/auth";
import { rateLimit, tooMany } from "@/lib/rate-limit";
const endpoint = process.env.AI_SERVICE_URL ?? "http://localhost:8100";
const headers = {
  "Content-Type": "application/json",
  ...(process.env.INTERNAL_API_TOKEN
    ? { "X-Internal-Token": process.env.INTERNAL_API_TOKEN }
    : {}),
};
const requestSchema = z.object({
  target: z.enum(["A", "B", "C", "1", "2", "3"]),
  frames: z
    .array(
      z
        .string()
        .max(180000)
        .regex(/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/),
    )
    .min(10)
    .max(30),
});
const resultSchema = z.object({
  mode: z.literal("legacy_demo"),
  lsf_validated: z.literal(false),
  target: z.enum(["A", "B", "C", "1", "2", "3"]),
  detected_sign: z.string().max(30),
  confidence: z.number().min(0).max(1),
  verdict: z.enum(["match", "different", "uncertain"]),
  correct: z.boolean().nullable(),
  saved_to_report: z.literal(false),
});
export const maxDuration = 60;
export async function POST(req: Request) {
  const user = await getUser();
  if (!user)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const limit = rateLimit(`recognition:${user.id}`, 12);
  if (!limit.ok) return tooMany(limit.retryAfter);
  if (Number(req.headers.get("content-length")) > 4_000_000)
    return NextResponse.json({ error: "Capture too large" }, { status: 413 });
  let body;
  try {
    const raw = await req.text();
    if (raw.length > 4_000_000)
      return NextResponse.json({ error: "Capture too large" }, { status: 413 });
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid capture" }, { status: 400 });
  }
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { error: "Invalid capture or unsupported target" },
      { status: 400 },
    );
  try {
    const upstream = await fetch(`${endpoint}/recognize`, {
      method: "POST",
      headers,
      body: JSON.stringify(parsed.data),
      signal: AbortSignal.timeout(45000),
    });
    if (!upstream.ok) throw new Error();
    const result = resultSchema.safeParse(await upstream.json());
    if (!result.success || result.data.target !== parsed.data.target)
      throw new Error();
    return NextResponse.json(result.data, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json(
      { error: "Recognition temporarily unavailable" },
      { status: 503 },
    );
  }
}
export async function GET() {
  if (!(await getUser()))
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  try {
    const upstream = await fetch(`${endpoint}/recognize/status`, {
      headers,
      signal: AbortSignal.timeout(45000),
      cache: "no-store",
    });
    const data = await upstream.json();
    if (!upstream.ok || data.ready !== true) throw new Error();
    return NextResponse.json(
      {
        ready: true,
        mode: "legacy_demo",
        lsf_validated: false,
        targets: ["A", "B", "C", "1", "2", "3"],
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { ready: false, mode: "legacy_demo", lsf_validated: false },
      { status: 503 },
    );
  }
}
