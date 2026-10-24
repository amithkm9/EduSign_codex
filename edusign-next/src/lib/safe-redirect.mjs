export function safeRedirectPath(path, fallback = "/dashboard") {
  if (
    typeof path !== "string" ||
    !path.startsWith("/") ||
    path.startsWith("//") ||
    /[\\\x00-\x20]/.test(path)
  )
    return fallback;
  try {
    const decoded = decodeURIComponent(path);
    if (decoded.startsWith("//") || /[\\\x00-\x1f]/.test(decoded))
      return fallback;
  } catch {
    return fallback;
  }
  return path;
}
