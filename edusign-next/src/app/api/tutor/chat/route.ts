import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { getUserTutorProfile } from "@/lib/data/tutor-profile";
import { proxyToAiService } from "@/lib/ai-proxy";
import { rateLimit, tooMany } from "@/lib/rate-limit";
import { tutorChatSchema } from "@/lib/tutor-validation.mjs";

export const maxDuration = 60;
export async function POST(req: Request) {
  const user = await getUser();
  if (!user)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const rl = rateLimit(`tutor:${user.id}`, 30);
  if (!rl.ok) return tooMany(rl.retryAfter);
  const parsed = tutorChatSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json(
      { error: "Invalid chat request" },
      { status: 400 },
    );
  const body = parsed.data;
  const profile = body.action
    ? null
    : await getUserTutorProfile(user.id).catch(() => null);
  return proxyToAiService("/tutor/chat", {
    message: body.message,
    language: body.language,
    conversation_history: body.conversationHistory,
    action: body.action,
    profile,
  });
}
