import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/site-config"

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE_URL.replace(/\/$/, "")
  return [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/streak`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/followers-check`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/skill-set`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
  ]
}
