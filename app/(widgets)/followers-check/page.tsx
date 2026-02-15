"use client"

import { useEffect, useMemo, useState } from "react"
import { useSession, signIn } from "next-auth/react"
import {
  UserMinus,
  Loader2,
  Search,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  UserCheck,
  MoreVertical,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface FollowerEntry {
  login: string
  avatarUrl: string
  profileUrl: string
}

interface FollowersCheckData {
  followersCount: number
  followingCount: number
  followers: FollowerEntry[]
  following: FollowerEntry[]
  notFollowedBack: FollowerEntry[]
  youDontFollowBack: FollowerEntry[]
}

type TabId = "unfollowers" | "not-mutuals" | "followers" | "following" | "whitelist"

const TABS: { id: TabId; label: string; description: string }[] = [
  { id: "unfollowers", label: "Unfollowers", description: "People you follow who don’t follow you back." },
  { id: "not-mutuals", label: "Not Mutuals", description: "People who follow you but you don’t follow back." },
  { id: "followers", label: "Followers", description: "Everyone who follows you on GitHub." },
  { id: "following", label: "Following", description: "Everyone you follow on GitHub." },
  { id: "whitelist", label: "Whitelist", description: "Users you’ve excluded from unfollower suggestions." },
]

const ROWS_PER_PAGE_OPTIONS = [10, 15, 25, 50] as const
const ROWS_PER_PAGE_ALL = -1
const WHITELIST_STORAGE_KEY = "followers-check-whitelist"

function loadWhitelist(): FollowerEntry[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(WHITELIST_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as { login: string; avatarUrl?: string; profileUrl?: string }[]
    return Array.isArray(parsed)
      ? parsed.map((e) => ({
          login: e.login,
          avatarUrl: e.avatarUrl ?? "",
          profileUrl: e.profileUrl ?? `https://github.com/${e.login}`,
        }))
      : []
  } catch {
    return []
  }
}

function saveWhitelist(entries: FollowerEntry[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(
    WHITELIST_STORAGE_KEY,
    JSON.stringify(entries.map((e) => ({ login: e.login, avatarUrl: e.avatarUrl, profileUrl: e.profileUrl }))),
  )
}

export default function FollowersCheckPage() {
  const { data: session, status } = useSession()
  const [data, setData] = useState<FollowersCheckData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabId>("unfollowers")
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [rowsPerPage, setRowsPerPage] = useState(15)
  const [page, setPage] = useState(1)
  const [whitelist, setWhitelist] = useState<FollowerEntry[]>([])
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [bulkLoading, setBulkLoading] = useState(false)

  useEffect(() => {
    setWhitelist(loadWhitelist())
  }, [])

  const fetchData = () => {
    setLoading(true)
    setError(null)
    fetch("/api/followers-check")
      .then((res) => {
        if (!res.ok) return res.json().then((e) => Promise.reject(e?.error ?? res.statusText))
        return res.json()
      })
      .then((d: FollowersCheckData) => ({
        ...d,
        followers: d.followers ?? [],
        following: d.following ?? [],
      }))
      .then(setData)
      .catch((err) => setError(String(err)))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (status !== "authenticated") return
    fetchData()
  }, [status])

  const whitelistLogins = useMemo(() => new Set(whitelist.map((e) => e.login.toLowerCase())), [whitelist])

  const getTabList = (): FollowerEntry[] => {
    if (!data) return []
    switch (activeTab) {
      case "unfollowers":
        return data.notFollowedBack.filter((u) => !whitelistLogins.has(u.login.toLowerCase()))
      case "not-mutuals":
        return data.youDontFollowBack
      case "followers":
        return data.followers
      case "following":
        return data.following
      case "whitelist":
        return whitelist
      default:
        return []
    }
  }

  const removeFromList = (login: string, fromTab: TabId) => {
    if (!data) return
    if (fromTab === "not-mutuals" || fromTab === "followers") {
      setData((prev) => prev ? { ...prev, youDontFollowBack: prev.youDontFollowBack.filter((x) => x.login !== login) } : prev)
    } else if (fromTab === "unfollowers") {
      setData((prev) => prev ? { ...prev, notFollowedBack: prev.notFollowedBack.filter((x) => x.login !== login) } : prev)
    } else if (fromTab === "following") {
      setData((prev) => prev ? { ...prev, following: prev.following.filter((x) => x.login !== login) } : prev)
    }
  }

  const addToFollowingList = (entry: FollowerEntry) => {
    setData((prev) => {
      if (!prev) return prev
      if (prev.following.some((x) => x.login.toLowerCase() === entry.login.toLowerCase())) return prev
      return { ...prev, following: [...prev.following, entry] }
    })
  }

  const followUser = async (entry: FollowerEntry) => {
    const login = entry.login
    setActionLoading(login)
    setError(null)
    try {
      const res = await fetch("/api/followers-check/follow", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: login, action: "follow" }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error ?? res.statusText)
      removeFromList(login, activeTab)
      addToFollowingList(entry)
      setSelected((prev) => {
        const next = new Set(prev)
        next.delete(login)
        return next
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to follow")
    } finally {
      setActionLoading(null)
    }
  }

  const unfollowUser = async (entry: FollowerEntry) => {
    const login = entry.login
    setActionLoading(login)
    setError(null)
    try {
      const res = await fetch("/api/followers-check/follow", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: login, action: "unfollow" }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error ?? res.statusText)
      removeFromList(login, activeTab)
      setSelected((prev) => {
        const next = new Set(prev)
        next.delete(login)
        return next
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to unfollow")
    } finally {
      setActionLoading(null)
    }
  }

  const addToWhitelist = (entry: FollowerEntry) => {
    if (whitelistLogins.has(entry.login.toLowerCase())) return
    const next = [...whitelist, entry]
    setWhitelist(next)
    saveWhitelist(next)
  }

  const removeFromWhitelist = (login: string) => {
    const next = whitelist.filter((e) => e.login.toLowerCase() !== login.toLowerCase())
    setWhitelist(next)
    saveWhitelist(next)
  }

  const showFollowInMenu = activeTab === "not-mutuals" || activeTab === "followers"
  const showUnfollowInMenu = activeTab === "unfollowers" || activeTab === "following"
  const showFollowSelectedInBar = activeTab === "not-mutuals" || activeTab === "followers"
  const showUnfollowSelectedInBar = activeTab === "unfollowers" || activeTab === "following"

  const list = getTabList()
  const filtered = useMemo(() => {
    if (!search.trim()) return list
    const q = search.trim().toLowerCase()
    return list.filter((u) => u.login.toLowerCase().includes(q))
  }, [list, search])

  const totalRows = filtered.length
  const effectiveRowsPerPage = rowsPerPage === ROWS_PER_PAGE_ALL ? totalRows : rowsPerPage
  const totalPages = rowsPerPage === ROWS_PER_PAGE_ALL ? 1 : Math.max(1, Math.ceil(totalRows / rowsPerPage))
  const currentPage = Math.min(page, totalPages)
  const start = (currentPage - 1) * effectiveRowsPerPage
  const pageRows = filtered.slice(start, start + (effectiveRowsPerPage || 1))

  const emptyMessage =
    activeTab === "unfollowers"
      ? "No unfollowers found. Very nice! ✨"
      : activeTab === "not-mutuals"
        ? "No non-mutuals found. Very nice! ✨"
        : activeTab === "whitelist"
          ? "No whitelist entries yet."
          : `No ${activeTab} to show.`

  const selectAll = () => {
    if (selected.size === pageRows.length) {
      setSelected((s) => {
        const next = new Set(s)
        pageRows.forEach((r) => next.delete(r.login))
        return next
      })
    } else {
      setSelected((s) => {
        const next = new Set(s)
        pageRows.forEach((r) => next.add(r.login))
        return next
      })
    }
  }

  const toggleRow = (login: string) => {
    setSelected((s) => {
      const next = new Set(s)
      if (next.has(login)) next.delete(login)
      else next.add(login)
      return next
    })
  }

  const selectedEntries = useMemo(
    () => filtered.filter((u) => selected.has(u.login)),
    [filtered, selected],
  )

  const handleBulkFollow = async () => {
    if (selectedEntries.length === 0) return
    setBulkLoading(true)
    setError(null)
    try {
      for (const entry of selectedEntries) {
        await followUser(entry)
      }
    } finally {
      setBulkLoading(false)
    }
  }

  const handleBulkUnfollow = async () => {
    if (selectedEntries.length === 0) return
    setBulkLoading(true)
    setError(null)
    try {
      for (const entry of selectedEntries) {
        await unfollowUser(entry)
      }
    } finally {
      setBulkLoading(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="flex flex-1 items-center justify-center p-8 bg-slate-50/80 dark:bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-slate-500 dark:text-slate-400" />
      </div>
    )
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-8 text-center max-w-md shadow-sm">
          <UserMinus className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500" />
          <h2 className="mt-4 text-lg font-semibold text-slate-800 dark:text-white">Followers check</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Sign in with GitHub to see who you follow that doesn’t follow you back, and who follows you but you don’t follow.
          </p>
          <button
            type="button"
            onClick={() => signIn("github", { callbackUrl: "/followers-check" })}
            className="mt-6 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-500"
          >
            Sign in with GitHub
          </button>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-6 text-center max-w-md shadow-sm">
          <p className="text-sm font-medium text-red-600 dark:text-red-400">Something went wrong</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col min-h-0 p-4 md:p-6 bg-slate-50/80 dark:bg-slate-950">
      <div className="mx-auto w-full max-w-4xl flex flex-col min-h-0 gap-4">
        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id)
                setPage(1)
                setSelected(new Set())
              }}
              className={`shrink-0 rounded-md px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700/80 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search + Filter (search bar with filter icon on right) */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
          <input
            type="search"
            placeholder="Search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800/80 pl-9 pr-10 py-2.5 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
          />
          <button
            type="button"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1.5 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700/80 hover:text-slate-600 dark:hover:text-slate-300"
            aria-label="Filter"
          >
            <Filter className="h-4 w-4" />
          </button>
        </div>

        {/* Tab description + total count above table */}
        <div className="space-y-0.5">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {TABS.find((t) => t.id === activeTab)?.description}
          </p>
          {!loading && (
            <p className="text-sm text-slate-500 dark:text-slate-500">
              {search.trim()
                ? `${filtered.length} of ${list.length} ${TABS.find((t) => t.id === activeTab)?.label.toLowerCase()}`
                : `${list.length} ${TABS.find((t) => t.id === activeTab)?.label.toLowerCase()} total`}
            </p>
          )}
        </div>

        {/* Main content area */}
        <div className="flex-1 min-h-0 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 flex flex-col shadow-sm">
          {/* Bulk actions bar: Select all X, Whitelist selected, Unfollow selected, Refresh */}
          <div className="flex flex-wrap h-[60px] items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 px-6 py-3">
            <div className="flex items-center gap-6 flex-wrap">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pageRows.length > 0 && selected.size === pageRows.length}
                  onChange={selectAll}
                  className="h-4 w-4 rounded border-slate-400 dark:border-slate-600 bg-white dark:bg-slate-800 text-emerald-600 focus:ring-2 focus:ring-emerald-500/30 focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-sm text-slate-600 dark:text-slate-300">
                  Select all {pageRows.length}{rowsPerPage === ROWS_PER_PAGE_ALL ? ` (${totalRows})` : ""}
                </span>
              </label>
              {selected.size > 0 && (
                <>
                  <button
                    type="button"
                    className="rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-700/80 px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600/80"
                  >
                    Whitelist selected
                  </button>
                  {showFollowSelectedInBar && (
                    <button
                      type="button"
                      onClick={handleBulkFollow}
                      disabled={actionLoading !== null || bulkLoading}
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-60 inline-flex items-center gap-2"
                    >
                      {bulkLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                          Following…
                        </>
                      ) : (
                        "Follow selected"
                      )}
                    </button>
                  )}
                  {showUnfollowSelectedInBar && (
                    <button
                      type="button"
                      onClick={handleBulkUnfollow}
                      disabled={actionLoading !== null || bulkLoading}
                      className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-60 inline-flex items-center gap-2"
                    >
                      {bulkLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                          Unfollowing…
                        </>
                      ) : (
                        "Unfollow selected"
                      )}
                    </button>
                  )}
                </>
              )}
            </div>
            <button
              type="button"
              onClick={fetchData}
              disabled={loading}
              className="rounded-full p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/80 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-50"
              aria-label="Refresh"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
          <div className="flex-1 min-h-0 overflow-auto px-3 py-4 min-h-[200px]">
            {loading ? (
              <div className="flex items-center justify-center min-h-[180px]">
                <Loader2 className="h-8 w-8 animate-spin text-slate-500 dark:text-slate-400" />
              </div>
            ) : pageRows.length === 0 ? (
              <p className="text-center py-12 text-slate-500 dark:text-slate-400 text-sm">
                {filtered.length === 0 && search.trim() ? "No matches for your search." : emptyMessage}
              </p>
            ) : (
              <ul className="space-y-0.5 w-full">
                {pageRows.map((u) => (
                  <li
                    key={u.login}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-700/50"
                  >
                    <input
                      type="checkbox"
                      checked={selected.has(u.login)}
                      onChange={() => toggleRow(u.login)}
                      onClick={(e) => e.stopPropagation()}
                      className="h-4 w-4 shrink-0 rounded border-slate-400 dark:border-slate-500 bg-white dark:bg-slate-800 text-emerald-600 focus:ring-2 focus:ring-emerald-500/30 focus:ring-offset-0 cursor-pointer"
                    />
                    <a
                      href={u.profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex min-w-0 shrink-0 items-center gap-3 rounded-md outline-none ring-emerald-500/50 focus:ring-2 hover:opacity-90 [&:focus]:ring-2"
                      title={`View @${u.login} on GitHub`}
                    >
                      <img src={u.avatarUrl} alt="" className="h-8 w-8 shrink-0 rounded-full" />
                      <span className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">@{u.login}</span>
                    </a>
                    <div className="min-w-0 flex-1" aria-hidden />
                    <span className="shrink-0 rounded-md bg-slate-200 dark:bg-slate-700/80 px-2 py-0.5 text-xs text-slate-500 dark:text-slate-400">
                      User
                    </span>
                    {(activeTab === "unfollowers" || activeTab === "following") && (
                      <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 shrink-0">
                        <UserCheck className="h-3.5 w-3.5" />
                        Following
                      </span>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild disabled={actionLoading === u.login}>
                        <button
                          type="button"
                          className="rounded p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200 shrink-0 disabled:opacity-70 disabled:pointer-events-none"
                          aria-label="More actions"
                        >
                          {actionLoading === u.login ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <MoreVertical className="h-4 w-4" />
                          )}
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                        <DropdownMenuItem asChild>
                          <a href={u.profileUrl} target="_blank" rel="noopener noreferrer" className="cursor-pointer">
                            View profile
                          </a>
                        </DropdownMenuItem>
                        {activeTab === "whitelist" ? (
                          <DropdownMenuItem
                            className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-700 dark:focus:text-red-300"
                            onSelect={() => removeFromWhitelist(u.login)}
                          >
                            Remove from whitelist
                          </DropdownMenuItem>
                        ) : (
                          <>
                            {!whitelistLogins.has(u.login.toLowerCase()) && (
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onSelect={() => addToWhitelist(u)}
                              >
                                Add to whitelist
                              </DropdownMenuItem>
                            )}
                            {showFollowInMenu && (
                              <DropdownMenuItem
                                className="cursor-pointer text-emerald-600 dark:text-emerald-400"
                                onSelect={() => followUser(u)}
                                disabled={actionLoading === u.login}
                              >
                                {actionLoading === u.login ? "Following…" : "Follow"}
                              </DropdownMenuItem>
                            )}
                            {showUnfollowInMenu && (
                              <DropdownMenuItem
                                className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-700 dark:focus:text-red-300"
                                onSelect={() => unfollowUser(u)}
                                disabled={actionLoading === u.login}
                              >
                                {actionLoading === u.login ? "Unfollowing…" : "Unfollow"}
                              </DropdownMenuItem>
                            )}
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Pagination */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-700 px-3 py-3">
            <p className="text-xs text-slate-500 dark:text-slate-500">
              {selected.size} of {totalRows} row(s) selected.
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 dark:text-slate-500">Rows per page</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value))
                    setPage(1)
                  }}
                  className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800/80 px-2 py-1.5 text-sm text-slate-700 dark:text-slate-200 focus:border-emerald-500/50 focus:outline-none"
                >
                  {ROWS_PER_PAGE_OPTIONS.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                  <option value={ROWS_PER_PAGE_ALL}>All</option>
                </select>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-500">
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => setPage(1)}
                  disabled={currentPage <= 1}
                  className="rounded p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-40 disabled:pointer-events-none"
                  aria-label="First page"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="rounded p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-40 disabled:pointer-events-none"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="rounded p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-40 disabled:pointer-events-none"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setPage(totalPages)}
                  disabled={currentPage >= totalPages}
                  className="rounded p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-40 disabled:pointer-events-none"
                  aria-label="Last page"
                >
                  <ChevronsRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
