import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { proxyToAiService } from "@/lib/ai-proxy";
import { rateLimit, tooMany } from "@/lib/rate-limit";
export async function GET() {
  const user = await getUser();
  if (!user)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const rl = rateLimit(`tutor-status:${user.id}`, 20);
  if (!rl.ok) return tooMany(rl.retryAfter);
  return proxyToAiService("/tutor/status", undefined, "GET");
}
