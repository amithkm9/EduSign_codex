import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { getUserTutorProfile } from "@/lib/data/tutor-profile";
import { proxyToAiService } from "@/lib/ai-proxy";
import { rateLimit, tooMany } from "@/lib/rate-limit";
import { voiceChatSchema } from "@/lib/tutor-validation.mjs";
export const maxDuration = 60;
export async function POST(req: Request) {
  const user = await getUser();
  if (!user)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const rl = rateLimit(`voice:${user.id}`, 10);
  if (!rl.ok) return tooMany(rl.retryAfter);
  const parsed = voiceChatSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json(
      { error: "Invalid voice request" },
      { status: 400 },
    );
  const body = parsed.data;
  const profile = await getUserTutorProfile(user.id).catch(() => null);
  return proxyToAiService("/voice/chat", {
    audio: body.audio,
    mime_type: body.mimeType,
    language: body.language,
    intent: body.intent,
    collection: body.collection,
    conversation_history: body.conversationHistory,
    voice_enabled: body.voiceEnabled,
    profile,
  });
}
