"use client"

import type { ReactNode } from "react"
import { Sidebar } from "./sidebar"

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="h-full flex flex-1 min-h-0 bg-slate-50/80 dark:bg-slate-950">
      <Sidebar />
      <div className="flex-1 min-h-0 min-w-0 flex flex-col overflow-auto">
        {children}
      </div>
    </div>
  )
}
