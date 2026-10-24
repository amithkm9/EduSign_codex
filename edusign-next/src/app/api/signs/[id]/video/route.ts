import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getUser } from "@/lib/auth";
import { getSupabaseConfig } from "@/lib/supabase/config";
import catalog from "@/lib/data/project-sign-videos.json";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await getUser()))
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const { id } = await params;
  const sign = catalog.find((item) => item.id === id);
  if (!sign)
    return NextResponse.json({ error: "Unknown sign" }, { status: 404 });
  const secret =
    process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret)
    return NextResponse.json(
      { error: "Video storage unavailable" },
      { status: 503 },
    );
  try {
    const client = createClient(getSupabaseConfig().url, secret, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const path =
      new URL(req.url).searchParams.get("original") === "1"
        ? sign.storage.originalPath
        : sign.storage.path;
    const { data, error } = await client.storage
      .from(sign.storage.bucket)
      .createSignedUrl(path, 3600);
    if (error || !data?.signedUrl) throw new Error();
    return NextResponse.redirect(data.signedUrl, {
      status: 307,
      headers: {
        "Cache-Control": "private, no-store",
        "Referrer-Policy": "no-referrer",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Video storage unavailable" },
      { status: 503 },
    );
  }
}
