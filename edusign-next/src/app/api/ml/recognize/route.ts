import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
/** The historical six-label classifier has no verified LSF label mapping.
 * Keep it off the public assessment path until a validated LSF model is installed. */
export async function POST() {
  const user = await getUser();
  if (!user)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  return NextResponse.json(
    { error: "LSF_MODEL_NOT_CONFIGURED", assessed: false, correct: null },
    { status: 503 },
  );
}
export async function GET() {
  return NextResponse.json({
    ready: false,
    signLanguage: "LSF",
    reason: "LSF_MODEL_NOT_CONFIGURED",
    assessed: false,
  });
}
