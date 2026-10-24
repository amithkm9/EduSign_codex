import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { proxyToAiService } from "@/lib/ai-proxy";
import { rateLimit, tooMany } from "@/lib/rate-limit";
import { transcriptionSchema } from "@/lib/tutor-validation.mjs";
export const maxDuration = 60;
export async function POST(req: Request) {
  const user = await getUser();
  if (!user)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const rl = rateLimit(`voice:${user.id}`, 10);
  if (!rl.ok) return tooMany(rl.retryAfter);
  const parsed = transcriptionSchema.safeParse(
    await req.json().catch(() => null),
  );
  if (!parsed.success)
    return NextResponse.json(
      { error: "Invalid audio request" },
      { status: 400 },
    );
  return proxyToAiService("/voice/transcribe", {
    audio: parsed.data.audio,
    mime_type: parsed.data.mimeType,
    language: parsed.data.language,
  });
}
