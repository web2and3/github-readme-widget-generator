"use client"

import type { ReactNode } from "react"

interface MainContentProps {
  children: ReactNode
}

export function MainContent({ children }: MainContentProps) {
  return (
    <main className="flex-1 overflow-auto p-4 sm:p-6 bg-slate-50/50 dark:bg-slate-950/50">
      <div className="mx-auto max-w-5xl space-y-6">
        {children}
      </div>
    </main>
  )
}
