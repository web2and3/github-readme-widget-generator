import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const GITHUB_API = "https://api.github.com"

async function fetchAll<T>(url: string, token: string): Promise<T[]> {
  const results: T[] = []
  let page = 1
  const perPage = 100
  while (true) {
    const res = await fetch(`${url}?per_page=${perPage}&page=${page}`, {
      headers: {
        Accept: "application/vnd.github.v3+json",
        Authorization: `Bearer ${token}`,
      },
    })
    if (!res.ok) throw new Error(`GitHub API ${res.status}: ${await res.text()}`)
    const data = (await res.json()) as T[]
    results.push(...data)
    if (data.length < perPage) break
    page++
  }
  return results
}

interface GhUser {
  login: string
  id: number
  avatar_url: string
  html_url: string
}

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  const accessToken = (session as { accessToken?: string } | null)?.accessToken

  if (!session?.user || !accessToken) {
    return NextResponse.json({ error: "Sign in with GitHub to use this feature." }, { status: 401 })
  }

  try {
    const [followers, following] = await Promise.all([
      fetchAll<GhUser>(`${GITHUB_API}/user/followers`, accessToken),
      fetchAll<GhUser>(`${GITHUB_API}/user/following`, accessToken),
    ])

    const followerLogins = new Set(followers.map((u) => u.login.toLowerCase()))
    const followingLogins = new Set(following.map((u) => u.login.toLowerCase()))

    // People you follow who don't follow you back
    const notFollowedBack = following.filter((u) => !followerLogins.has(u.login.toLowerCase()))
    // People who follow you but you don't follow
    const youDontFollowBack = followers.filter((u) => !followingLogins.has(u.login.toLowerCase()))

    const toEntry = (u: GhUser) => ({
      login: u.login,
      avatarUrl: u.avatar_url,
      profileUrl: u.html_url,
    })

    return NextResponse.json({
      followersCount: followers.length,
      followingCount: following.length,
      followers: followers.map(toEntry),
      following: following.map(toEntry),
      notFollowedBack: notFollowedBack.map(toEntry),
      youDontFollowBack: youDontFollowBack.map(toEntry),
    })
  } catch (err) {
    console.error("[FOLLOWERS-CHECK]", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch followers." },
      { status: 500 },
    )
  }
}
