import type { NextRequest } from "next/server"

/**
 * Get the public origin (base URL) for the current request.
 * On Netlify, Vercel, and other proxies, request.url may be internal;
 * use X-Forwarded-Host and X-Forwarded-Proto so server-to-server fetches
 * hit the correct public URL (fixes customization/API calls on deploy).
 */
export function getRequestOrigin(request: NextRequest): string {
  const forwardedHost = request.headers.get("x-forwarded-host")
  const forwardedProto = request.headers.get("x-forwarded-proto")
  if (forwardedHost) {
    const proto = forwardedProto === "https" || forwardedProto === "http" ? forwardedProto : "https"
    return `${proto}://${forwardedHost}`
  }
  try {
    return new URL(request.url).origin
  } catch {
    return "https://localhost:3000"
  }
}
