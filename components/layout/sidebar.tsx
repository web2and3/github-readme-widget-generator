"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Activity, Github, LayoutGrid } from "lucide-react"

export function Sidebar() {
  const pathname = usePathname()
  const isStreak = pathname === "/streak" || pathname === "/" || pathname.startsWith("/streak")
  const isSkillSet = pathname === "/skill-set" || pathname.startsWith("/skill-set")

  return (
    <aside className="w-56 shrink-0 border-r border-slate-200 bg-white flex flex-col justify-between">
      <div>
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600">
              <Activity className="h-5 w-5" />
            </div>
            <span className="font-semibold tracking-tight text-slate-800 hidden md:block">
              Card of GitHub
            </span>
          </div>
        </div>
        <nav className="p-2 flex flex-col gap-1">
          <Link
            href="/streak"
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
              isStreak ? "bg-emerald-500/15 text-emerald-700" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Activity className="h-5 w-5 shrink-0" />
            GitHub Streak Card
          </Link>
          <Link
            href="/skill-set"
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
              isSkillSet ? "bg-emerald-500/15 text-emerald-700" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <LayoutGrid className="h-5 w-5 shrink-0" />
            Skill Set Widget
          </Link>
        </nav>
      </div>
      <div className="p-4 border-t border-slate-200">
        <a
          href="https://github.com/web2and3/github-readme-widgets-generator"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600">
            <Github className="h-5 w-5" />
          </div>
          <span className="font-semibold tracking-tight text-slate-800 hidden md:block">
            View on GitHub
          </span>
        </a>
      </div>
    </aside>
  )
}
