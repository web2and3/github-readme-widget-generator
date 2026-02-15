"use client"

import { useCallback, useEffect } from "react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { defaultSkillSetTheme, WIDGET_STEPS, presetSkillSetThemes } from "@/lib/widgets-types"
import type { SkillSetTheme } from "@/lib/widgets-types"
import { useWidgets } from "@/contexts/widgets-context"
import { HeaderBar } from "@/components/layout/header-bar"
import { MainContent } from "@/components/layout/main-content"
import { StepFooter } from "@/components/layout/step-footer"
import { SkillSetFlow } from "@/components/widgets/skill-set-flow"

export default function SkillSetPage() {
  const { data: session } = useSession()
  const { skillSet } = useWidgets()
  const {
    skillSetActiveTab,
    setSkillSetActiveTab,
    skillsInput,
    setSkillsInput,
    skillSetGenerated,
    setSkillSetGenerated,
    skillSetTheme,
    setSkillSetTheme,
    skillSetCardKey,
    setSkillSetCardKey,
    skillSetUsername,
    setSkillSetUsername,
  } = skillSet

  const skillsForUrl = skillsInput
    .trim()
    .split(/[\n,;]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .join(",")
  const usernameParam =
    skillSetUsername.trim() ? `&username=${encodeURIComponent(skillSetUsername.trim())}` : ""
  const skillSetCardUrl =
    skillSetGenerated && skillsForUrl
      ? `/api/skill-set-card?skills=${encodeURIComponent(skillsForUrl)}&theme=${encodeURIComponent(JSON.stringify(skillSetTheme))}&t=${skillSetCardKey}${usernameParam}`
      : ""

  const updateSkillSetThemeColor = useCallback(
    (property: keyof SkillSetTheme, color: string) => {
      setSkillSetTheme((prev) => ({ ...prev, [property]: color }))
      setSkillSetCardKey((prev) => prev + 1)
    },
    [setSkillSetTheme, setSkillSetCardKey]
  )

  const applySkillSetPreset = useCallback(
    (presetName: string) => {
      setSkillSetTheme(presetSkillSetThemes[presetName] ?? defaultSkillSetTheme)
      setSkillSetCardKey((prev) => prev + 1)
    },
    [setSkillSetTheme, setSkillSetCardKey]
  )

  const generateSkillSetReadme = useCallback(() => {
    if (!skillSetGenerated || !skillsForUrl) return ""
    const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
    const u = skillSetUsername.trim() ? `&username=${encodeURIComponent(skillSetUsername.trim())}` : ""
    const url = `${baseUrl}/api/skill-set-card?skills=${encodeURIComponent(skillsForUrl)}&theme=${encodeURIComponent(JSON.stringify(skillSetTheme))}${u}`
    return `<div align="center">

![Skills](${url})

</div>`
  }, [skillSetGenerated, skillsForUrl, skillSetTheme, skillSetUsername])

  const copySkillSetReadme = useCallback(() => {
    const readme = generateSkillSetReadme()
    if (readme) {
      navigator.clipboard.writeText(readme)
      toast.success("README copied")
    }
  }, [generateSkillSetReadme])

  const steps = WIDGET_STEPS
  const skillSetStepIndex = steps.findIndex((s) => s.id === skillSetActiveTab)
  const skillSetCanGoNext = skillSetStepIndex < steps.length - 1
  const skillSetCanGoBack = skillSetStepIndex > 0
  const skillSetCanAdvance = skillSetGenerated
  const skillSetGoNext = () => {
    if (skillSetCanGoNext && skillSetCanAdvance) setSkillSetActiveTab(steps[skillSetStepIndex + 1].id)
  }
  const skillSetGoBack = () => {
    if (skillSetCanGoBack) setSkillSetActiveTab(steps[skillSetStepIndex - 1].id)
  }

  const githubLogin = session?.user && "login" in session.user ? (session.user as { login?: string }).login : undefined
  useEffect(() => {
    if (githubLogin) setSkillSetUsername(githubLogin)
  }, [githubLogin, setSkillSetUsername])

  return (
    <>
      <HeaderBar
        currentTab={skillSetActiveTab}
        stepIndex={skillSetStepIndex}
        canAdvance={skillSetCanAdvance}
        onStepClick={setSkillSetActiveTab}
      />
      <MainContent>
        <SkillSetFlow
          activeTab={skillSetActiveTab}
          onTabChange={setSkillSetActiveTab}
          skillsInput={skillsInput}
          setSkillsInput={setSkillsInput}
          skillSetGenerated={skillSetGenerated}
          setSkillSetGenerated={setSkillSetGenerated}
          skillSetTheme={skillSetTheme}
          skillSetCardKey={skillSetCardKey}
          skillSetCardUrl={skillSetCardUrl}
          updateSkillSetThemeColor={updateSkillSetThemeColor}
          applySkillSetPreset={applySkillSetPreset}
          generateSkillSetReadme={generateSkillSetReadme}
          copySkillSetReadme={copySkillSetReadme}
          onGenerateSuccess={() => toast.success("Skill set generated")}
          onGenerateError={() => toast.error("Please enter at least one skill")}
        />
      </MainContent>
      <StepFooter
        currentStepIndex={skillSetStepIndex}
        canGoBack={skillSetCanGoBack}
        canGoNext={skillSetCanGoNext}
        canAdvance={skillSetCanAdvance}
        onBack={skillSetGoBack}
        onNext={skillSetGoNext}
      />
    </>
  )
}
