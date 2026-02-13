import { type NextRequest, NextResponse } from "next/server"
import path from "path"
import { readFile } from "fs/promises"
import { getSkillToSlugMap } from "@/lib/simple-icons-cache"

const BACKGROUND_USERNAME = "web2and3"
const LOCAL_BACKGROUND_PATH = path.join(process.cwd(), "public", "background.jpg")
const FALLBACK_BACKGROUND_URL =
  "https://images.unsplash.com/photo-1557683316-973673baf926?w=774&h=170&fit=crop"

async function fetchBackgroundBase64(): Promise<{ data: string; mime: string }> {
  try {
    const buf = await readFile(LOCAL_BACKGROUND_PATH)
    return { data: (buf as Buffer).toString("base64"), mime: "image/jpeg" }
  } catch {
    try {
      const res = await fetch(FALLBACK_BACKGROUND_URL, {
        headers: { "User-Agent": "GitHub-Streak-Card-SkillSet/1.0" },
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

const CARD_WIDTH = 774
const CARD_HEIGHT = 170
const BADGE_PADDING = 10
const BADGE_GAP = 10
const BADGE_RX = 8
const ICON_SIZE = 36
const TITLE_Y = 32
const CONTENT_START_Y = 48
const BADGE_SIZE = ICON_SIZE + BADGE_PADDING * 2
const ROW_HEIGHT = BADGE_SIZE + BADGE_GAP

/** Same normalization as simple-icons-cache for lookup keys */
function normalizeSkillForLookup(skill: string): string {
  return skill
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/\./g, "dot")
    .replace(/\+/g, "plus")
    .replace(/#/g, "sharp")
    .replace(/&/g, "and")
    .replace(/'/g, "")
    .replace(/\//g, "")
}

function getSlugForSkill(skill: string, skillToSlug: Record<string, string>): string | null {
  const key = normalizeSkillForLookup(skill)
  return skillToSlug[key] ?? null
}

type SkillSetTheme = {
  backgroundColor: string
  textColor: string
  accentColor: string
  borderColor: string
  badgeColor: string
  badgeColor1: string
  badgeColor2: string
  badgeColor3: string
}

const defaultTheme: SkillSetTheme = {
  backgroundColor: "#1a1b27",
  textColor: "#e2e8f0",
  accentColor: "#22c55e",
  borderColor: "#30363d",
  badgeColor: "#334155",
  badgeColor1: "#DC5A42",
  badgeColor2: "#37A7D7",
  badgeColor3: "#3B72BC",
}

function parseSkills(skillsParam: string | null): string[] {
  if (!skillsParam || !skillsParam.trim()) return []
  const raw = decodeURIComponent(skillsParam.trim())
  const list = raw.split(/[\n,;]+/).map((s) => s.trim()).filter(Boolean)
  return list.slice(0, 100)
}

const FALLBACK_ICON_SLUG = "github"

/** Minimal inline icon when GitHub fetch fails. */
function getMinimalFallbackDataUri(hexColor: string): string {
  const c = hexColor.startsWith("#") ? hexColor : `#${hexColor}`
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="${c}"/></svg>`
  return `data:image/svg+xml;base64,${Buffer.from(svg, "utf-8").toString("base64")}`
}

/** Fetch icon SVG from Simple Icons CDN and return as data URI (embeddable in our SVG). */
async function fetchIconDataUri(slug: string, hexColor: string): Promise<string | null> {
  const color = hexColor.replace(/^#/, "")
  const url = `https://cdn.simpleicons.org/${slug}/${color}`
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 4000)
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "GitHub-Streak-Card-SkillSet/1.0" },
    })
    clearTimeout(timeout)
    if (!res.ok) return null
    const svg = await res.text()
    const base64 = Buffer.from(svg, "utf-8").toString("base64")
    return `data:image/svg+xml;base64,${base64}`
  } catch {
    return null
  }
}

function generateSkillSetSvg(
  skills: string[],
  theme: SkillSetTheme,
  iconDataUris: string[],
  backgroundBase64?: string,
  backgroundMime?: string
): string {
  const padding = 29
  const maxWidth = CARD_WIDTH - padding * 2
  let x = padding
  let y = CONTENT_START_Y

  const c1 = theme.badgeColor1 ?? theme.badgeColor
  const c2 = theme.badgeColor2 ?? theme.badgeColor
  const c3 = theme.badgeColor3 ?? theme.badgeColor
  const badgeGradients = `
    <linearGradient id="badgeGrad1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:${c1}"/><stop offset="100%" style="stop-color:${c2}"/></linearGradient>
    <linearGradient id="badgeGrad2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:${c2}"/><stop offset="100%" style="stop-color:${c3}"/></linearGradient>
    <linearGradient id="badgeGrad3" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:${c3}"/><stop offset="100%" style="stop-color:${c1}"/></linearGradient>`
  const badgeEls: string[] = []

  for (let i = 0; i < skills.length; i++) {
    if (x + BADGE_SIZE > CARD_WIDTH - padding) {
      x = padding
      y += ROW_HEIGHT
    }

    const bx = x
    const by = y
    x += BADGE_SIZE + BADGE_GAP

    const iconX = bx + (BADGE_SIZE - ICON_SIZE) / 2
    const iconY = by + (BADGE_SIZE - ICON_SIZE) / 2

    const gradId = `badgeGrad${(i % 3) + 1}`
    const iconEl = `<image href="${iconDataUris[i]}" x="${iconX}" y="${iconY}" width="${ICON_SIZE}" height="${ICON_SIZE}" preserveAspectRatio="xMidYMid meet"/>`

    badgeEls.push(`
    <g>
      <rect x="${bx}" y="${by}" width="${BADGE_SIZE}" height="${BADGE_SIZE}" rx="${BADGE_RX}" ry="${BADGE_RX}"
        fill="url(#${gradId})" stroke="${theme.borderColor}" stroke-width="1"/>
      ${iconEl}
    </g>`)
  }

  const contentBottom = y + BADGE_SIZE + padding
  const height = Math.max(CARD_HEIGHT, Math.min(contentBottom, 500))

  const bgDataUri =
    backgroundBase64 && backgroundMime
      ? `data:${backgroundMime};base64,${backgroundBase64}`
      : ""
  const bgSection = bgDataUri
    ? `<clipPath id="skillSetCardClip"><rect width="${CARD_WIDTH}" height="${height}" rx="12" ry="12"/></clipPath>`
    : ""
  const bgFill = bgDataUri
    ? `<image href="${bgDataUri}" x="0" y="0" width="${CARD_WIDTH}" height="${height}" preserveAspectRatio="xMidYMid slice" clip-path="url(#skillSetCardClip)"/>
  <rect width="${CARD_WIDTH}" height="${height}" rx="12" ry="12" fill="${theme.backgroundColor}" fill-opacity="0.9"/>`
    : `<rect width="${CARD_WIDTH}" height="${height}" rx="12" ry="12" fill="${theme.backgroundColor}"/>`

  return `<svg width="${CARD_WIDTH}" height="${height}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    ${bgSection}
    ${badgeGradients}
  </defs>
  ${bgFill}
  <rect width="${CARD_WIDTH}" height="${height}" rx="12" ry="12" fill="none" stroke="${theme.borderColor}" stroke-width="2"/>
  <text x="${CARD_WIDTH / 2}" y="${TITLE_Y}" text-anchor="middle" fill="${theme.accentColor}" font-size="16" font-weight="bold" font-family="Arial, sans-serif">My Skills</text>
  ${badgeEls.join("")}
</svg>`
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

function errorSvg(message: string): NextResponse {
  const svg = `<svg width="${CARD_WIDTH}" height="${CARD_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" rx="12" fill="#1a1b27" stroke="#ef4444" stroke-width="2"/>
  <text x="${CARD_WIDTH / 2}" y="80" text-anchor="middle" fill="#ffffff" font-size="14" font-family="Arial, sans-serif">${escapeXml(message)}</text>
</svg>`
  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  })
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const skillsParam = searchParams.get("skills")
    const themeParam = searchParams.get("theme")
    const usernameParam = searchParams.get("username")

    const skills = parseSkills(skillsParam)
    if (skills.length === 0) {
      return errorSvg("Add at least one skill")
    }

    const skillToSlug = await getSkillToSlugMap()

    let theme: SkillSetTheme = { ...defaultTheme }
    if (themeParam) {
      try {
        const parsed = JSON.parse(decodeURIComponent(themeParam))
        theme = { ...defaultTheme, ...parsed }
      } catch {
        // use default
      }
    }

    const useBackground =
      usernameParam?.trim().toLowerCase() === BACKGROUND_USERNAME.toLowerCase()
    const { data: backgroundBase64, mime: backgroundMime } = useBackground
      ? await fetchBackgroundBase64()
      : { data: "", mime: "image/jpeg" }

    const hexColor = theme.textColor.replace(/^#/, "")
    const githubUri = await fetchIconDataUri(FALLBACK_ICON_SLUG, hexColor)
    const fallbackUri = githubUri ?? getMinimalFallbackDataUri(theme.textColor)
    const iconDataUris = await Promise.all(
      skills.map(async (skill) => {
        const slug = getSlugForSkill(skill, skillToSlug)
        const uri = slug ? await fetchIconDataUri(slug, hexColor) : null
        return uri ?? fallbackUri
      })
    )

    const svg = generateSkillSetSvg(
      skills,
      theme,
      iconDataUris,
      backgroundBase64 || undefined,
      backgroundMime || undefined
    )

    return new NextResponse(svg, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Cache-Control": "public, max-age=300",
        "Access-Control-Allow-Origin": "*",
      },
    })
  } catch (err) {
    console.error("[SKILL-SET-CARD]", err)
    return errorSvg("Card generation failed")
  }
}
