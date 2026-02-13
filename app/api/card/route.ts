import { type NextRequest, NextResponse } from "next/server"
import path from "path"
import { readFile } from "fs/promises"
import { getRequestOrigin } from "@/lib/request-origin"

// Username that gets the custom background image (others use theme only)
const BACKGROUND_USERNAME = "web2and3"

// Local background (preferred); fallback public URL
const LOCAL_BACKGROUND_PATH = path.join(process.cwd(), "public", "background.jpg")
const FALLBACK_BACKGROUND_URL =
  "https://images.unsplash.com/photo-1557683316-973673baf926?w=510&h=170&fit=crop"

async function fetchBackgroundBase64(): Promise<{ data: string; mime: string }> {
  try {
    const buf = await readFile(LOCAL_BACKGROUND_PATH)
    return { data: (buf as Buffer).toString("base64"), mime: "image/jpeg" }
  } catch {
    try {
      const res = await fetch(FALLBACK_BACKGROUND_URL, {
        headers: { "User-Agent": "GitHub-Streak-Card/1.0" },
      })
      if (!res.ok) return { data: "", mime: "image/jpeg" }
      const buf = await res.arrayBuffer()
      const contentType = res.headers.get("content-type") || "image/jpeg"
      const mime = contentType.split(";")[0].trim() || "image/jpeg"
      return { data: Buffer.from(buf).toString("base64"), mime }
    } catch {
      return { data: "", mime: "image/jpeg" }
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const username = searchParams.get("username")
    const themeParam = searchParams.get("theme")

    if (!username) {
      return new NextResponse("Username is required", { status: 400 })
    }

    console.log(`[CARD API] Generating card for: ${username}`)

    // Fetch streak data
    let data
    try {
      const baseUrl = getRequestOrigin(request)
      const streakResponse = await fetch(`${baseUrl}/api/streak?username=${username}`, {
        headers: { "User-Agent": "GitHub-Streak-Card/1.0" },
      })

      if (!streakResponse.ok) {
        throw new Error(`Streak API returned ${streakResponse.status}`)
      }

      data = await streakResponse.json()

      if (data.error) {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error(`[CARD API] Failed to fetch data:`, error)
      return generateErrorCard("Failed to fetch user data")
    }

    // Parse theme
    let theme = {
      backgroundColor: "#1a1b27",
      textColor: "#ffffff",
      accentColor: "#00d4aa",
      borderColor: "#30363d",
      waterColor: "#00d4aa",
      streakColor: "#ff6b6b",
    }

    if (themeParam) {
      try {
        const parsedTheme = JSON.parse(decodeURIComponent(themeParam))
        theme = { ...theme, ...parsedTheme }
      } catch (e) {
        console.log("[CARD API] Using default theme")
      }
    }

    const useBackground = username.trim().toLowerCase() === BACKGROUND_USERNAME.toLowerCase()
    const { data: backgroundBase64, mime: backgroundMime } = useBackground
      ? await fetchBackgroundBase64()
      : { data: "", mime: "image/jpeg" }
    const svg = generateEnhancedStreakCard(data, theme, backgroundBase64, backgroundMime)

    console.log(`[CARD API] SUCCESS - Generated card for ${username} with avatar:`, data.avatarUrl)

    return new NextResponse(svg, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Cache-Control": "public, max-age=300",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    })
  } catch (error) {
    console.error("[CARD API] Unexpected error:", error)
    return generateErrorCard("Card generation failed")
  }
}

function generateEnhancedStreakCard(data: any, theme: any, backgroundBase64: string, backgroundMime = "image/jpeg"): string {
  const username = String(data.username || "user").substring(0, 15)
  const currentStreak = Number(data.currentStreak) || 0
  const longestStreak = Number(data.longestStreak) || 0
  const totalContributions = Number(data.totalContributions) || 0
  const publicRepos = Number(data.publicRepos) || 0
  const contributionsThisYear = Number(data.contributionsThisYear) || 0
  const joinedYear =
    String(data.username || "").toLowerCase() === "web2and3"
      ? 2018
      : data.joinedDate
        ? new Date(data.joinedDate).getFullYear()
        : 2020
  const avatarUrl = data.avatarUrl || ""
  const topLanguages = data.topLanguages || ["JavaScript", "TypeScript"]

  console.log(`[CARD GENERATION] Avatar URL for ${username}:`, avatarUrl)

  // Format numbers for display
  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "k"
    }
    return num.toString()
  }

  // Create a more robust avatar display
  const avatarSection = avatarUrl
    ? `
    <!-- Avatar Background Circle -->
    <circle cx="40" cy="40" r="32" fill="${theme.accentColor}" fill-opacity="0.2" stroke="${theme.accentColor}" stroke-width="2"/>
    
    <!-- White background for avatar -->
    <circle cx="40" cy="40" r="30" fill="#ffffff" fill-opacity="0.9"/>
    
    <!-- Avatar Image with better handling -->
    <image x="10" y="10" width="60" height="60" 
           href="${avatarUrl}" 
           clip-path="url(#avatarClip)" 
           preserveAspectRatio="xMidYMid slice"/>
    
    <!-- Avatar border -->
    <circle cx="40" cy="40" r="30" fill="none" stroke="${theme.accentColor}" stroke-width="1" stroke-opacity="0.3"/>`
    : `
    <!-- Avatar Background Circle -->
    <circle cx="40" cy="40" r="32" fill="${theme.accentColor}" fill-opacity="0.2" stroke="${theme.accentColor}" stroke-width="2"/>
    
    <!-- Username Initial Fallback -->
    <text x="40" y="50" text-anchor="middle" fill="${theme.accentColor}" font-size="24" font-weight="bold" font-family="Arial, sans-serif">
      ${username.charAt(0).toUpperCase()}
    </text>`

  const bgDataUri = backgroundBase64
    ? `data:${backgroundMime};base64,${backgroundBase64}`
    : ""
  return `<svg width="510" height="170" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <!-- Clip path for card rounded corners -->
    <clipPath id="cardClip">
      <rect width="510" height="170" rx="12" ry="12"/>
    </clipPath>
    
    <!-- Circular clip path for avatar -->
    <clipPath id="avatarClip">
      <circle cx="40" cy="40" r="30"/>
    </clipPath>
    
    <linearGradient id="streakGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${theme.streakColor};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${theme.accentColor};stop-opacity:1" />
    </linearGradient>
    
    <!-- Radial gradient for avatar background -->
    <radialGradient id="avatarBg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#f8f9fa;stop-opacity:1" />
    </radialGradient>
  </defs>

  <!-- Background: image + overlay for web2and3, solid theme for others -->
  ${bgDataUri ? `<image href="${bgDataUri}" x="0" y="0" width="510" height="170" preserveAspectRatio="xMidYMid slice" clip-path="url(#cardClip)"/>
  <rect width="510" height="170" rx="12" fill="${theme.backgroundColor}" fill-opacity="0.9"/>` : `<rect width="510" height="170" rx="12" fill="${theme.backgroundColor}"/>`}
  <!-- Border -->
  <rect width="510" height="170" rx="12" fill="none" stroke="${theme.borderColor}" stroke-width="2"/>

  <!-- Profile Section (height 109px, startY = (170-109)/2 = 30) -->
  <g transform="translate(50, 30)">
    ${avatarSection}
    
    <!-- Username Text -->
    <text x="40" y="100" text-anchor="middle" fill="${theme.textColor}" font-size="14" font-weight="bold" font-family="Arial, sans-serif">
      ${username.length > 12 ? username.substring(0, 12) + "..." : username}
    </text>
    
    <!-- Join Year -->
    <text x="40" y="115" text-anchor="middle" fill="${theme.textColor}" font-size="11" opacity="0.7" font-family="Arial, sans-serif">
      Since ${joinedYear}
    </text>
  </g>

  <!-- Separator 1 (height 90px, startY = (170-90)/2 = 40) -->
  <line x1="145" y1="40" x2="145" y2="130" stroke="${theme.borderColor}" stroke-width="1"/>

  <!-- Streak Circle Section (height 103px, startY = (170-103)/2 = 33) -->
  <g transform="translate(160, 33)">
    <!-- Animated Background -->
    <circle cx="40" cy="40" r="35" fill="${theme.waterColor}" fill-opacity="0.1">
      <animate attributeName="r" values="35;37;35" dur="3s" repeatCount="indefinite"/>
    </circle>
    
    <!-- Inner glow -->
    <circle cx="40" cy="40" r="30" fill="url(#streakGradient)" fill-opacity="0.3">
      <animate attributeName="fill-opacity" values="0.3;0.5;0.3" dur="2s" repeatCount="indefinite"/>
    </circle>
    
    <!-- Streak Number -->
    <text x="40" y="35" text-anchor="middle" fill="${theme.streakColor}" font-size="20" font-weight="bold" font-family="Arial, sans-serif">
      ${currentStreak}
    </text>
    <text x="40" y="50" text-anchor="middle" fill="${theme.textColor}" font-size="11" font-family="Arial, sans-serif">
      days
    </text>
    
    <!-- Animated Border -->
    <circle cx="40" cy="40" r="35" fill="none" stroke="${theme.streakColor}" stroke-width="2">
      <animate attributeName="stroke-opacity" values="1;0.7;1" dur="2s" repeatCount="indefinite"/>
    </circle>
    
    <!-- Label -->
    <text x="40" y="105" text-anchor="middle" fill="${theme.accentColor}" font-size="11" font-weight="510" font-family="Arial, sans-serif">
      Current Streak
    </text>
  </g>

  <!-- Separator 2 (height 90px, startY = 40) -->
  <line x1="260" y1="40" x2="260" y2="130" stroke="${theme.borderColor}" stroke-width="1"/>

  <!-- Stats Section (height 103px, startY = (170-103)/2 = 33) -->
  <g transform="translate(280, 33)">
    <!-- Row 1: Total Contributions & Longest Streak -->
    <text x="0" y="15" fill="${theme.textColor}" font-size="10" opacity="0.7" font-family="Arial, sans-serif">Total Contributions</text>
    <text x="0" y="30" fill="${theme.accentColor}" font-size="13" font-weight="bold" font-family="Arial, sans-serif">${formatNumber(totalContributions)}</text>

    <text x="110" y="15" fill="${theme.textColor}" font-size="10" opacity="0.7" font-family="Arial, sans-serif">Longest Streak</text>
    <text x="110" y="30" fill="${theme.streakColor}" font-size="13" font-weight="bold" font-family="Arial, sans-serif">${longestStreak} days</text>

    <!-- Row 2: Repositories & Stars -->
    <text x="0" y="55" fill="${theme.textColor}" font-size="10" opacity="0.7" font-family="Arial, sans-serif">Repositories</text>
    <text x="0" y="70" fill="${theme.textColor}" font-size="13" font-weight="bold" font-family="Arial, sans-serif">${publicRepos}</text>

    <text x="110" y="55" fill="${theme.textColor}" font-size="10" opacity="0.7" font-family="Arial, sans-serif">Followers</text>
    <text x="110" y="70" fill="${theme.textColor}" font-size="13" font-weight="bold" font-family="Arial, sans-serif">${formatNumber(data.followers || 0)}</text>

    <!-- Languages Section -->
    <text x="0" y="95" fill="${theme.textColor}" font-size="10" opacity="0.7" font-family="Arial, sans-serif">Top Language</text>
    <text x="110" y="95" fill="${theme.textColor}" font-size="10" font-family="Arial, sans-serif">${topLanguages[0]}</text>

    <!-- Enhanced Language Bar -->
    <rect x="0" y="105" width="40" height="4" rx="2" fill="${theme.accentColor}">
      <animate attributeName="width" values="40;45;40" dur="3s" repeatCount="indefinite"/>
    </rect>
    <rect x="45" y="105" width="35" height="4" rx="2" fill="${theme.streakColor}">
      <animate attributeName="width" values="35;40;35" dur="3s" repeatCount="indefinite" begin="0.5s"/>
    </rect>
    <rect x="85" y="105" width="30" height="4" rx="2" fill="${theme.accentColor}" opacity="0.6">
      <animate attributeName="width" values="30;35;30" dur="3s" repeatCount="indefinite" begin="1s"/>
    </rect>
    <rect x="120" y="105" width="25" height="4" rx="2" fill="${theme.streakColor}" opacity="0.4">
      <animate attributeName="width" values="25;30;25" dur="3s" repeatCount="indefinite" begin="1.5s"/>
    </rect>
    <rect x="150" y="105" width="20" height="4" rx="2" fill="${theme.textColor}" opacity="0.3">
      <animate attributeName="width" values="20;25;20" dur="3s" repeatCount="indefinite" begin="2s"/>
    </rect>
  </g>

</svg>`
}

function generateErrorCard(message: string): NextResponse {
  const errorSvg = `<svg width="510" height="170" xmlns="http://www.w3.org/2000/svg">
  <rect width="510" height="170" rx="12" fill="#1a1b27" stroke="#ef4444" stroke-width="2"/>
  <text x="270" y="75" text-anchor="middle" fill="#ffffff" font-size="16" font-family="Arial, sans-serif">❌</text>
  <text x="270" y="95" text-anchor="middle" fill="#ffffff" font-size="14" font-family="Arial, sans-serif">${message}</text>
  <text x="270" y="115" text-anchor="middle" fill="#ffffff" font-size="12" font-family="Arial, sans-serif" opacity="0.7">Please try again</text>
</svg>`

  return new NextResponse(errorSvg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "no-cache",
    },
  })
}
