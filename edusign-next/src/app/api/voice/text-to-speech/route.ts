import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { proxyToAiService } from "@/lib/ai-proxy";
import { rateLimit, tooMany } from "@/lib/rate-limit";
import { speechSchema } from "@/lib/tutor-validation.mjs";
export const maxDuration = 30;
export async function POST(req: Request) {
  const user = await getUser();
  if (!user)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const rl = rateLimit(`tts:${user.id}`, 20);
  if (!rl.ok) return tooMany(rl.retryAfter);
  const parsed = speechSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json(
      { error: "Invalid speech request" },
      { status: 400 },
    );
  return proxyToAiService("/voice/tts", parsed.data);
}
