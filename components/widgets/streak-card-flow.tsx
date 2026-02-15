"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Activity, Copy, Download, Palette, Code, RefreshCw, TrendingUp } from "lucide-react"
import { WIDGET_STEPS, presetThemes, defaultTheme } from "@/lib/widgets-types"
import type { StreakData, CardTheme, StepId } from "@/lib/widgets-types"

interface StreakCardFlowProps {
  activeTab: StepId
  onTabChange: (value: StepId) => void
  username: string
  setUsername: (v: string) => void
  streakData: StreakData | null
  loading: boolean
  theme: CardTheme
  cardKey: number
  useEmbeddedAvatar: boolean
  setUseEmbeddedAvatar: (v: boolean) => void
  setCardKey: (fn: (prev: number) => number) => void
  setCardImageError: (v: boolean) => void
  setCardImageLoaded: (v: boolean) => void
  cardUrl: string
  onFetchStreak: () => void
  onCopyReadme: () => void
  onDownloadCard: () => void
  updateThemeColor: (key: keyof CardTheme, color: string) => void
  applyPresetTheme: (name: string) => void
  generateReadme: () => string
  handleSubmit: (e: React.FormEvent) => void
  /** When true, username is taken from logged-in user and input is disabled */
  usernameDisabled?: boolean
}

export function StreakCardFlow({
  activeTab,
  onTabChange,
  username,
  setUsername,
  streakData,
  loading,
  theme,
  cardKey,
  useEmbeddedAvatar,
  setUseEmbeddedAvatar,
  setCardKey,
  setCardImageError,
  setCardImageLoaded,
  cardUrl,
  onFetchStreak,
  onCopyReadme,
  onDownloadCard,
  updateThemeColor,
  applyPresetTheme,
  generateReadme,
  handleSubmit,
  usernameDisabled = false,
}: StreakCardFlowProps) {
  const steps = WIDGET_STEPS
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  // Radix Tabs generate different IDs on server vs client; render only after mount to avoid hydration mismatch.
  if (!mounted) {
    return (
      <div className="w-full space-y-6" aria-hidden>
        <div className="inline-flex h-10 w-full items-center justify-center rounded-md bg-muted p-1" />
        <div className="min-h-[320px] rounded-md bg-muted/50" />
      </div>
    )
  }

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => {
        const idx = steps.findIndex((s) => s.id === value)
        if (idx <= 0 || streakData) onTabChange(value as StepId)
      }}
      className="w-full"
    >
      <TabsContent value="generator" className="space-y-6 mt-0">
        <Card className="shadow-lg border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              {usernameDisabled ? "Your GitHub card" : "Enter GitHub Username"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {usernameDisabled && (
                <p className="text-sm text-slate-500">Using your account: <strong>{username}</strong></p>
              )}
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="e.g., torvalds, gaearon, sindresorhus"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="flex-1"
                  disabled={loading || usernameDisabled}
                />
                <Button
                  type="submit"
                  disabled={loading || !username.trim()}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Activity className="h-4 w-4 mr-2" />
                      Generate
                    </>
                  )}
                </Button>
              </div>
            </form>
            <div className="flex items-center gap-4 p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg border border-emerald-200 dark:border-emerald-500/30">
              <Label className="text-sm font-medium">Avatar Display:</Label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="useEmbeddedAvatar"
                  checked={useEmbeddedAvatar}
                  onChange={(e) => {
                    setUseEmbeddedAvatar(e.target.checked)
                    setCardKey((prev) => prev + 1)
                  }}
                  className="rounded"
                />
                <Label htmlFor="useEmbeddedAvatar" className="text-sm text-emerald-700 dark:text-emerald-300">
                  Use embedded avatar (better for README.md)
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {streakData && (
          <Card className="shadow-lg overflow-hidden border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-600" />
                Your GitHub Card
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                <Button onClick={onDownloadCard} size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  View/Download
                </Button>
                <Button onClick={onFetchStreak} size="sm" variant="outline" className="border-green-200 bg-transparent">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Real Data
                </Button>
                <Button
                  onClick={() => navigator.clipboard.writeText(cardUrl)}
                  size="sm"
                  variant="outline"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy URL
                </Button>
              </div>
              <div className="flex justify-center mb-4">
                <img
                  key={cardKey}
                  src={cardUrl || "/placeholder.svg"}
                  alt="GitHub Streak Card"
                  width={510}
                  height={170}
                  className="rounded-lg border shadow-md"
                  onError={() => {
                    setCardImageError(true)
                    setCardImageLoaded(false)
                  }}
                  onLoad={() => {
                    setCardImageError(false)
                    setCardImageLoaded(true)
                  }}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center mb-4">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg border border-emerald-200 dark:border-emerald-500/30">
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{streakData.currentStreak}</div>
                  <div className="text-sm text-emerald-800 dark:text-emerald-300">Current Streak</div>
                </div>
                <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg border border-emerald-200 dark:border-emerald-500/30">
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{streakData.longestStreak}</div>
                  <div className="text-sm text-emerald-800 dark:text-emerald-300">Longest Streak</div>
                </div>
                <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg border border-emerald-200 dark:border-emerald-500/30">
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {streakData.totalContributions.toLocaleString()}
                  </div>
                  <div className="text-sm text-emerald-800 dark:text-emerald-300">Total Contributions</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="customize" className="space-y-6 mt-0">
        <Card className="shadow-lg border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-green-600" />
              Customize Your Card
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-base font-medium">Preset Themes</Label>
              <div className="grid grid-cols-5 gap-2 mt-2">
                {Object.entries(presetThemes).map(([name, presetTheme]) => (
                  <Button
                    key={name}
                    variant="outline"
                    size="sm"
                    onClick={() => applyPresetTheme(name)}
                    className="capitalize"
                    style={{
                      backgroundColor: presetTheme.backgroundColor,
                      color: presetTheme.textColor,
                      borderColor: presetTheme.borderColor,
                    }}
                  >
                    {name}
                  </Button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {Object.entries({
                  backgroundColor: "Background Color",
                  textColor: "Text Color",
                  accentColor: "Accent Color",
                }).map(([key, label]) => (
                  <div key={key}>
                    <Label htmlFor={key}>{label}</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id={key}
                        type="color"
                        value={theme[key as keyof CardTheme]}
                        onChange={(e) => updateThemeColor(key as keyof CardTheme, e.target.value)}
                        className="w-16 h-10"
                      />
                      <Input
                        value={theme[key as keyof CardTheme]}
                        onChange={(e) => updateThemeColor(key as keyof CardTheme, e.target.value)}
                        placeholder={defaultTheme[key as keyof CardTheme]}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                {Object.entries({
                  borderColor: "Border Color",
                  waterColor: "Water Animation Color",
                  streakColor: "Streak Color",
                }).map(([key, label]) => (
                  <div key={key}>
                    <Label htmlFor={key}>{label}</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id={key}
                        type="color"
                        value={theme[key as keyof CardTheme]}
                        onChange={(e) => updateThemeColor(key as keyof CardTheme, e.target.value)}
                        className="w-16 h-10"
                      />
                      <Input
                        value={theme[key as keyof CardTheme]}
                        onChange={(e) => updateThemeColor(key as keyof CardTheme, e.target.value)}
                        placeholder={defaultTheme[key as keyof CardTheme]}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {streakData && (
              <div className="border-t pt-6">
                <Label className="text-base font-medium">Live Preview</Label>
                <div className="flex gap-2 flex-wrap items-center justify-center mt-4">
                  <img
                    key={`preview-${cardKey}`}
                    src={cardUrl || "/placeholder.svg"}
                    alt="Live Preview"
                    width={510}
                    height={170}
                    className="rounded-lg border shadow-md"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="readme" className="space-y-6 mt-0">
        <Card className="shadow-lg border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5 text-green-600" />
              Embed / Check
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={onCopyReadme} size="sm" className="bg-green-600 hover:bg-green-700">
                <Copy className="h-4 w-4 mr-2" />
                Copy README
              </Button>
              {streakData && (
                <Button onClick={() => window.open(cardUrl, "_blank")} size="sm" variant="outline">
                  Test Card URL
                </Button>
              )}
            </div>
            <Textarea
              value={generateReadme()}
              readOnly
              className="min-h-[400px] font-mono text-sm"
              placeholder="Generate a card with real data first to see the README content..."
            />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
