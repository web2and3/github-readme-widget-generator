import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { authOptions } from "@/lib/auth"

const GITHUB_API = "https://api.github.com"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function POST(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: authOptions.secret,
  })
  const accessToken = (token as { accessToken?: string } | null)?.accessToken

  if (!token || !accessToken) {
    return NextResponse.json({ error: "Sign in with GitHub to use this feature." }, { status: 401 })
  }

  let body: { username?: string; action?: "follow" | "unfollow" }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  const { username, action } = body
  if (!username || typeof username !== "string" || !action || !["follow", "unfollow"].includes(action)) {
    return NextResponse.json(
      { error: "Body must include username (string) and action ('follow' | 'unfollow')." },
      { status: 400 },
    )
  }

  const method = action === "follow" ? "PUT" : "DELETE"
  const cleanUsername = username.trim()
  const url = `${GITHUB_API}/user/following/${encodeURIComponent(cleanUsername)}`

  try {
    const res = await fetch(url, {
      method,
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${accessToken}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    })
    if (!res.ok) {
      const text = await res.text()
      // 404 on DELETE = already not following (e.g. stale list); treat as success
      if (method === "DELETE" && res.status === 404) {
        return NextResponse.json({ ok: true, action: "unfollow" })
      }
      let errMessage = text
      try {
        const json = JSON.parse(text) as { message?: string }
        if (json.message) errMessage = json.message
      } catch {
        // use text as-is
      }
      return NextResponse.json(
        { error: errMessage || `GitHub API ${res.status}` },
        { status: res.status === 404 ? 404 : 502 },
      )
    }
    return NextResponse.json({ ok: true, action })
  } catch (err) {
    console.error("[FOLLOWERS-CHECK follow]", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Request failed." },
      { status: 500 },
    )
  }
}
