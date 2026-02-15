"use client"

import { useCallback, useEffect } from "react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { WIDGET_STEPS, presetThemes } from "@/lib/widgets-types"
import type { StepId, CardTheme } from "@/lib/widgets-types"
import { useWidgets } from "@/contexts/widgets-context"
import { REPO_URL } from "@/lib/site-config"
import { HeaderBar } from "@/components/layout/header-bar"
import { MainContent } from "@/components/layout/main-content"
import { StepFooter } from "@/components/layout/step-footer"
import { StreakCardFlow } from "@/components/widgets/streak-card-flow"

export default function StreakPage() {
  const { data: session } = useSession()
  const { streak } = useWidgets()
  const {
    username,
    setUsername,
    streakData,
    setStreakData,
    loading,
    setLoading,
    theme,
    setTheme,
    activeTab,
    setActiveTab,
    setCardImageError,
    setCardImageLoaded,
    cardKey,
    setCardKey,
    useEmbeddedAvatar,
    setUseEmbeddedAvatar,
  } = streak

  const fetchStreakData = useCallback(async () => {
    if (!username.trim()) {
      toast.error("Please enter a GitHub username")
      return
    }
    setLoading(true)
    setCardImageError(false)
    setCardImageLoaded(false)
    try {
      const response = await fetch(`/api/streak?username=${encodeURIComponent(username.trim())}`)
      const data = await response.json()
      if (!response.ok || data.error) {
        setStreakData(null)
        if (response.status === 404 || data.error === "User not found") {
          toast.error("User not exist")
        } else {
          toast.error("Can't fetch user data")
        }
        return
      }
      if (data.username) {
        setStreakData(data)
        setCardKey((prev) => prev + 1)
      }
    } catch {
      setStreakData(null)
      toast.error("Can't fetch user data")
    } finally {
      setLoading(false)
    }
  }, [username, setLoading, setCardImageError, setCardImageLoaded, setStreakData, setCardKey])

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      fetchStreakData()
    },
    [fetchStreakData]
  )

  const generateReadme = useCallback(() => {
    if (!streakData) return ""
    const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
    const cardEndpoint = useEmbeddedAvatar ? "card-with-avatar" : "card"
    const cardUrl = `${baseUrl}/api/${cardEndpoint}?username=${streakData.username}&theme=${encodeURIComponent(JSON.stringify(theme))}`
    return `<div align="center">

[![GitHub Streak](${cardUrl})](${REPO_URL})

</div>`
  }, [streakData, theme, useEmbeddedAvatar])

  const copyReadme = useCallback(() => {
    const readme = generateReadme()
    if (readme) navigator.clipboard.writeText(readme)
  }, [generateReadme])

  const downloadCard = useCallback(() => {
    if (!streakData) return
    const cardEndpoint = useEmbeddedAvatar ? "card-with-avatar" : "card"
    const cardUrl = `/api/${cardEndpoint}?username=${streakData.username}&theme=${encodeURIComponent(JSON.stringify(theme))}&v=${Date.now()}`
    window.open(cardUrl, "_blank")
  }, [streakData, theme, useEmbeddedAvatar])

  const updateThemeColor = useCallback(
    (property: keyof CardTheme, color: string) => {
      setTheme((prev) => ({ ...prev, [property]: color }))
      setCardKey((prev) => prev + 1)
    },
    [setTheme, setCardKey]
  )

  const applyPresetTheme = useCallback(
    (presetName: string) => {
      setTheme(presetThemes[presetName])
      setCardKey((prev) => prev + 1)
    },
    [setTheme, setCardKey]
  )

  const cardEndpoint = useEmbeddedAvatar ? "card-with-avatar" : "card"
  const cardUrl = streakData
    ? `/api/${cardEndpoint}?username=${streakData.username}&theme=${encodeURIComponent(JSON.stringify(theme))}&t=${cardKey}`
    : ""

  const steps = WIDGET_STEPS
  const currentStepIndex = steps.findIndex((s) => s.id === activeTab)
  const canGoNext = currentStepIndex < steps.length - 1
  const canGoBack = currentStepIndex > 0
  const canAdvance = !!streakData
  const goNext = () => {
    if (canGoNext && canAdvance) setActiveTab(steps[currentStepIndex + 1].id)
  }
  const goBack = () => {
    if (canGoBack) setActiveTab(steps[currentStepIndex - 1].id)
  }

  const githubLogin = session?.user && "login" in session.user ? (session.user as { login?: string }).login : undefined
  useEffect(() => {
    if (githubLogin) setUsername(githubLogin)
  }, [githubLogin, setUsername])

  return (
    <>
      <HeaderBar
        currentTab={activeTab}
        stepIndex={currentStepIndex}
        canAdvance={canAdvance}
        onStepClick={setActiveTab}
      />
      <MainContent>
        <StreakCardFlow
          activeTab={activeTab}
          onTabChange={setActiveTab}
          username={username}
          setUsername={setUsername}
          streakData={streakData}
          loading={loading}
          theme={theme}
          cardKey={cardKey}
          useEmbeddedAvatar={useEmbeddedAvatar}
          setUseEmbeddedAvatar={setUseEmbeddedAvatar}
          setCardKey={setCardKey}
          setCardImageError={setCardImageError}
          setCardImageLoaded={setCardImageLoaded}
          cardUrl={cardUrl}
          onFetchStreak={fetchStreakData}
          onCopyReadme={copyReadme}
          onDownloadCard={downloadCard}
          updateThemeColor={updateThemeColor}
          applyPresetTheme={applyPresetTheme}
          generateReadme={generateReadme}
          handleSubmit={handleSubmit}
          usernameDisabled={!!githubLogin}
        />
      </MainContent>
      <StepFooter
        currentStepIndex={currentStepIndex}
        canGoBack={canGoBack}
        canGoNext={canGoNext}
        canAdvance={canAdvance}
        onBack={goBack}
        onNext={goNext}
      />
    </>
  )
}
