import path from "path";
import { fileURLToPath } from "url";
import type { NextConfig } from "next";
import { publicSupabaseConfig } from "./src/lib/config/supabase-env.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Support the dashboard's SUPABASE_* names, exposing only public credentials.
  env: (() => {
    const { url, key } = publicSupabaseConfig(process.env);
    return {
      NEXT_PUBLIC_SUPABASE_URL: url,
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: key,
    };
  })(),
  reactStrictMode: true,
  // Scope file tracing to this app (the repo root also has a package-lock.json
  // from the legacy app, which would otherwise confuse Next's root inference).
  outputFileTracingRoot: __dirname,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "i.ytimg.com", pathname: "/vi/**" }],
  },
};

export default nextConfig;
