"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signIn, signOut, useSession } from "next-auth/react"
import { useTheme } from "next-themes"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Activity, Github, LayoutGrid, UserMinus, LogOut, Moon, Sun } from "lucide-react"

export function AppHeader() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const { theme, setTheme } = useTheme()
  const isWidgetsArea = pathname?.startsWith("/streak") || pathname?.startsWith("/skill-set") || pathname?.startsWith("/followers-check")
  const isLanding = pathname === "/"

  return (
    <header className="shrink-0 border-b border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/95">
      <div className="mx-auto flex h-14 items-center justify-between px-4 sm:px-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold tracking-tight text-slate-800 dark:text-white hover:text-slate-900 dark:hover:text-slate-100"
        >
          <img src="/logo.png" alt="GitStrength" className="h-12" />
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-lg p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Toggle theme"
          >
            <Sun className="h-5 w-5 dark:hidden" />
            <Moon className="h-5 w-5 hidden dark:block" />
          </button>
          <a
            href="https://github.com/web2and3/github-readme-widgets-generator"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="View on GitHub"
          >
            <Github className="h-5 w-5" />
          </a>
          {status === "loading" ? (
            <div className="h-9 w-24 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
          ) : session?.user ? (
            <>
              {isLanding && (
                <Link
                  href="/streak"
                  className="hidden sm:inline-flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-sm font-medium text-white"
                >
                  Continue as @{(session.user as { login?: string }).login ?? (session.user.name ?? session.user.email ?? "user")}
                </Link>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    aria-label="Open user menu"
                  >
                    {session.user.image ? (
                      <img
                        src={session.user.image}
                        alt=""
                        className="h-8 w-8 rounded-full"
                      />
                    ) : (
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium">
                        {(session.user.name ?? session.user.email ?? "?")[0]}
                      </span>
                    )}
                    <span className="max-w-[120px] truncate hidden sm:inline text-slate-800 dark:text-slate-200">
                      {session.user.name ?? session.user.email}
                    </span>
                    <svg className="h-4 w-4 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg">
                <DropdownMenuItem asChild>
                  <Link href="/streak" className="flex items-center gap-2 cursor-pointer">
                    <LayoutGrid className="h-4 w-4" />
                    Widgets generator
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/followers-check" className="flex items-center gap-2 cursor-pointer">
                    <UserMinus className="h-4 w-4" />
                    Followers check
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a
                    href="https://github.com/web2and3/github-readme-widgets-generator"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Github className="h-4 w-4" />
                    View on GitHub
                  </a>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => signOut()}
                  className="flex items-center gap-2 text-red-600 focus:text-red-700 focus:bg-red-50 dark:focus:bg-red-950/50 cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              {!isWidgetsArea && (
                <Link
                  href="/streak"
                  className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                >
                  Skip login
                </Link>
              )}
              <button
                type="button"
                onClick={() => signIn("github", { callbackUrl: "/streak" })}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-900 dark:bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:hover:bg-emerald-500"
              >
                <Github className="h-4 w-4" />
                Sign in with GitHub
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
