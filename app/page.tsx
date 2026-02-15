"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn, useSession } from "next-auth/react"
import { ArrowUpRight, Github } from "lucide-react"

export default function HomePage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const login = session?.user && "login" in session.user ? (session.user as { login?: string }).login : undefined

  const handleGetStarted = () => {
    if (login) {
      router.push("/streak")
    } else {
      signIn("github", { callbackUrl: "/streak" })
    }
  }

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-[#0f0f1a] overflow-hidden">
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />

      <main className="relative flex-1 min-h-0 flex flex-col items-center justify-center px-4 py-8 overflow-auto -translate-y-12">
        <div className="mx-auto max-w-2xl text-center">
          <img src="/logo.png" alt="GitStrength" className="mx-auto h-16 sm:h-20 md:h-28 mb-8" />
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 dark:border-emerald-500/30 bg-emerald-50/80 dark:bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300 mb-6">
            <span>✨</span>
            <span>New Stable 3.1 Release</span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl md:text-5xl">
            GitHub README Widgets &amp; Profile Tools
          </h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
            Make your GitHub profile beautiful and attractive with streak cards, stats, and widgets. Discover who&apos;s not following you back. Open source. Free forever.
          </p>

          <section className="mt-12 max-w-xl mx-auto" aria-label="Features">
            <h2 className="sr-only">GitHub tools</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
              GitHub README widgets · Beautiful GitHub profile · Contribution streak card · Unfollow checker ·
              Who unfollowed me · GitHub stats. Free, open source.
            </p>
          </section>

          <div className="mt-10">
            <button
              type="button"
              onClick={handleGetStarted}
              className="inline-flex items-center justify-center gap-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-600 dark:hover:bg-emerald-500 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all"
            >
              {status === "loading" ? (
                <span className="animate-pulse">Loading...</span>
              ) : login ? (
                <>
                  {session?.user?.image ? (
                    <img
                      src={session.user.image}
                      alt=""
                      className="h-6 w-6 rounded-full ring-2 ring-white/50"
                    />
                  ) : (
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                      <Github className="h-4 w-4" />
                    </span>
                  )}
                  <span>Continue as @{login}</span>
                  <ArrowUpRight className="h-5 w-5" />
                </>
              ) : (
                <>
                  <Github className="h-5 w-5" />
                  <span>Continue with GitHub</span>
                  <ArrowUpRight className="h-5 w-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
