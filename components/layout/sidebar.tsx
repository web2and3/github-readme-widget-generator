"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Activity, Github, LayoutGrid, UserMinus } from "lucide-react"

export function Sidebar() {
  const pathname = usePathname()
  const isStreak = pathname === "/streak" || pathname.startsWith("/streak")
  const isSkillSet = pathname === "/skill-set" || pathname.startsWith("/skill-set")
  const isFollowersCheck = pathname === "/followers-check" || pathname.startsWith("/followers-check")

  return (
    <aside className="w-56 shrink-0 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex flex-col justify-between">
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 h-[69px] flex items-center justify-center">
        <a
          href="https://github.com/web2and3"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
        >
          <span className="font-medium text-slate-700 dark:text-slate-300">Made by web2and3</span>
        </a>
      </div>
      <div className="flex-1">
        <nav className="p-2 flex flex-col gap-1">
          <Link
            href="/streak"
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
              isStreak
                ? "bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Activity className="h-5 w-5 shrink-0" />
            GitHub Streak Card
          </Link>
          <Link
            href="/skill-set"
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
              isSkillSet
                ? "bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <LayoutGrid className="h-5 w-5 shrink-0" />
            Skill Set Widget
          </Link>
          <Link
            href="/followers-check"
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
              isFollowersCheck
                ? "bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <UserMinus className="h-5 w-5 shrink-0" />
            Followers Check
          </Link>
        </nav>
      </div>
      <div className="p-4 border-t border-slate-200 dark:border-slate-700 h-[69px] flex items-center">
        <a
          href="https://github.com/web2and3/github-readme-widgets-generator"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
        >
          <Github className="h-5 w-5 shrink-0" />
          <span className="font-medium text-slate-700 dark:text-slate-300">View on GitHub</span>
        </a>
      </div>
    </aside>
  )
}
