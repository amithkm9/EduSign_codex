import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes safely (shadcn/ui convention). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Resolve a media path (sign/course videos) to its hosted URL. In production the
 * ~340 MB of videos are served from object storage / a CDN via
 * NEXT_PUBLIC_MEDIA_BASE_URL; locally it's empty so paths stay relative to /public.
 * Pass an already-absolute URL through untouched.
 */
export function mediaUrl(path: string): string {
  if (!path || /^https?:\/\//.test(path)) return path;
  const base = process.env.NEXT_PUBLIC_MEDIA_BASE_URL ?? "";
  return base ? `${base.replace(/\/$/, "")}${path}` : path;
}

export { safeRedirectPath } from "./safe-redirect.mjs";
