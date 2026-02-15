"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Copy, LayoutGrid, Palette, Code } from "lucide-react"
import { WIDGET_STEPS, presetSkillSetThemes, defaultSkillSetTheme } from "@/lib/widgets-types"
import type { SkillSetTheme, StepId } from "@/lib/widgets-types"
import { SKILL_SUGGESTIONS } from "@/lib/skill-suggestions"

/** Current word being typed (last segment after comma/semicolon/newline). */
function getCurrentToken(value: string): string {
  const segments = value.split(/[\n,;]+/)
  const last = segments[segments.length - 1]?.trim() ?? ""
  return last
}

interface SkillSetFlowProps {
  activeTab: StepId
  onTabChange: (value: StepId) => void
  skillsInput: string
  setSkillsInput: (v: string) => void
  skillSetGenerated: boolean
  setSkillSetGenerated: (v: boolean) => void
  skillSetTheme: SkillSetTheme
  skillSetCardKey: number
  skillSetCardUrl: string
  updateSkillSetThemeColor: (key: keyof SkillSetTheme, color: string) => void
  applySkillSetPreset: (name: string) => void
  generateSkillSetReadme: () => string
  copySkillSetReadme: () => void
  onGenerateSuccess: () => void
  onGenerateError: () => void
}

export function SkillSetFlow({
  activeTab,
  onTabChange,
  skillsInput,
  setSkillsInput,
  skillSetGenerated,
  setSkillSetGenerated,
  skillSetTheme,
  skillSetCardKey,
  skillSetCardUrl,
  updateSkillSetThemeColor,
  applySkillSetPreset,
  generateSkillSetReadme,
  copySkillSetReadme,
  onGenerateSuccess,
  onGenerateError,
}: SkillSetFlowProps) {
  const steps = WIDGET_STEPS
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const [allSkills, setAllSkills] = useState<string[]>(SKILL_SUGGESTIONS)

  useEffect(() => {
    fetch("/api/skills")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data: { skills?: string[] }) => {
        if (Array.isArray(data.skills) && data.skills.length > 0) {
          setAllSkills(data.skills)
        }
      })
      .catch(() => {})
  }, [])

  const currentToken = useMemo(() => getCurrentToken(skillsInput), [skillsInput])
  const showMenu = currentToken.length >= 1

  const filteredSkills = useMemo(() => {
    const q = currentToken.toLowerCase()
    return allSkills.filter((s) => s.toLowerCase().includes(q)).slice(0, 50)
  }, [currentToken, allSkills])

  useEffect(() => {
    setHighlightedIndex(0)
  }, [currentToken])

  const replaceCurrentTokenWith = (skill: string) => {
    const segments = skillsInput.split(/[\n,;]+/).map((s) => s.trim()).filter(Boolean)
    const lastSegment = segments[segments.length - 1] ?? ""
    const isTypingPartial = segments.length > 0 && currentToken.length > 0 && lastSegment === currentToken
    const newParts = isTypingPartial ? segments.slice(0, -1).concat(skill) : segments.concat(skill)
    setSkillsInput(newParts.join(", ") + ", ")
    textareaRef.current?.focus()
  }

  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showMenu || filteredSkills.length === 0) return
    if (e.key === "," || e.key === ";" || e.key === "\n") {
      setHighlightedIndex(0)
      return
    }
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setHighlightedIndex((i) => (i + 1) % filteredSkills.length)
      return
    }
    if (e.key === "ArrowUp") {
      e.preventDefault()
      setHighlightedIndex((i) => (i - 1 + filteredSkills.length) % filteredSkills.length)
      return
    }
    if (e.key === "Enter") {
      e.preventDefault()
      replaceCurrentTokenWith(filteredSkills[highlightedIndex] ?? "")
      return
    }
    if (e.key === "Escape") {
      setHighlightedIndex(0)
    }
  }

  const handleGenerate = () => {
    if (skillsInput.trim()) {
      setSkillSetGenerated(true)
      onGenerateSuccess()
    } else {
      onGenerateError()
    }
  }

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => {
        const idx = steps.findIndex((s) => s.id === value)
        if (idx <= 0 || skillSetGenerated) onTabChange(value as StepId)
      }}
      className="w-full"
    >
      <TabsContent value="generator" className="space-y-6 mt-0">
        <Card className="shadow-lg border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LayoutGrid className="h-5 w-5 text-green-600" />
              Enter your skills
            </CardTitle>
            <CardDescription>
              Add skills (e.g. comma-separated) to generate your Skill Set widget.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-2">
              <Label>Skills</Label>
              <div className="relative">
                <Textarea
                  ref={textareaRef}
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  onKeyDown={handleTextareaKeyDown}
                  placeholder="Type a skill (e.g. react) — menu appears below until you select one or press ,"
                  className="min-h-[100px]"
                />
                {showMenu && (
                  <ul
                    className="absolute left-0 top-full z-50 mt-1 w-full max-h-[240px] overflow-auto rounded-md border bg-popover py-1 text-popover-foreground shadow-md"
                  >
                    {filteredSkills.length === 0 ? (
                      <li className="px-3 py-2 text-sm text-muted-foreground">No skill found. Keep typing or press , to skip.</li>
                    ) : (
                      filteredSkills.map((skill, i) => (
                        <li
                          key={skill}
                          role="option"
                          aria-selected={i === highlightedIndex}
                          className={`cursor-pointer px-3 py-2 text-sm outline-none ${
                            i === highlightedIndex ? "bg-accent text-accent-foreground" : ""
                          }`}
                          onMouseEnter={() => setHighlightedIndex(i)}
                          onMouseDown={(e) => {
                            e.preventDefault()
                            replaceCurrentTokenWith(skill)
                          }}
                        >
                          {skill}
                        </li>
                      ))
                    )}
                  </ul>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Type to see suggestions; select with click or Enter, or press comma to finish and type next skill.
              </p>
            </div>
            <Button onClick={handleGenerate} className="bg-green-600 hover:bg-green-700">
              Generate
            </Button>
          </CardContent>
        </Card>

        {skillSetGenerated && skillSetCardUrl && (
          <Card className="shadow-lg overflow-hidden border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LayoutGrid className="h-5 w-5 text-green-600" />
                Your Skill Set Card
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                <Button
                  onClick={() => navigator.clipboard.writeText(skillSetCardUrl)}
                  size="sm"
                  variant="outline"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy URL
                </Button>
                <Button
                  onClick={() => window.open(skillSetCardUrl, "_blank")}
                  size="sm"
                  variant="outline"
                >
                  View / Open
                </Button>
              </div>
              <div className="flex justify-center">
                <img
                  key={skillSetCardKey}
                  src={skillSetCardUrl}
                  alt="Skill Set Card"
                  width={774}
                  className="rounded-lg border shadow-md max-h-[320px] w-auto object-left-top"
                />
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
                {Object.entries(presetSkillSetThemes).map(([name, preset]) => (
                  <Button
                    key={name}
                    variant="outline"
                    size="sm"
                    onClick={() => applySkillSetPreset(name)}
                    className="capitalize"
                    style={{
                      backgroundColor: preset.backgroundColor,
                      color: preset.textColor,
                      borderColor: preset.borderColor,
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
                        value={skillSetTheme[key as keyof SkillSetTheme]}
                        onChange={(e) => updateSkillSetThemeColor(key as keyof SkillSetTheme, e.target.value)}
                        className="w-16 h-10"
                      />
                      <Input
                        value={skillSetTheme[key as keyof SkillSetTheme]}
                        onChange={(e) => updateSkillSetThemeColor(key as keyof SkillSetTheme, e.target.value)}
                        placeholder={defaultSkillSetTheme[key as keyof SkillSetTheme]}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="borderColor">Border Color</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="borderColor"
                      type="color"
                      value={skillSetTheme.borderColor}
                      onChange={(e) => updateSkillSetThemeColor("borderColor", e.target.value)}
                      className="w-16 h-10"
                    />
                    <Input
                      value={skillSetTheme.borderColor}
                      onChange={(e) => updateSkillSetThemeColor("borderColor", e.target.value)}
                      placeholder={defaultSkillSetTheme.borderColor}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="badgeColor1">Badge Color 1</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="badgeColor1"
                      type="color"
                      value={skillSetTheme.badgeColor1}
                      onChange={(e) => updateSkillSetThemeColor("badgeColor1", e.target.value)}
                      className="w-16 h-10"
                    />
                    <Input
                      value={skillSetTheme.badgeColor1}
                      onChange={(e) => updateSkillSetThemeColor("badgeColor1", e.target.value)}
                      placeholder={defaultSkillSetTheme.badgeColor1}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="badgeColor2">Badge Color 2</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="badgeColor2"
                      type="color"
                      value={skillSetTheme.badgeColor2}
                      onChange={(e) => updateSkillSetThemeColor("badgeColor2", e.target.value)}
                      className="w-16 h-10"
                    />
                    <Input
                      value={skillSetTheme.badgeColor2}
                      onChange={(e) => updateSkillSetThemeColor("badgeColor2", e.target.value)}
                      placeholder={defaultSkillSetTheme.badgeColor2}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="badgeColor3">Badge Color 3</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="badgeColor3"
                      type="color"
                      value={skillSetTheme.badgeColor3}
                      onChange={(e) => updateSkillSetThemeColor("badgeColor3", e.target.value)}
                      className="w-16 h-10"
                    />
                    <Input
                      value={skillSetTheme.badgeColor3}
                      onChange={(e) => updateSkillSetThemeColor("badgeColor3", e.target.value)}
                      placeholder={defaultSkillSetTheme.badgeColor3}
                    />
                  </div>
                </div>
              </div>
            </div>
            {skillSetGenerated && skillSetCardUrl && (
              <div className="border-t pt-6">
                <Label className="text-base font-medium">Live Preview</Label>
                <div className="flex gap-2 flex-wrap items-center justify-center mt-4">
                  <img
                    key={skillSetCardKey}
                    src={skillSetCardUrl}
                    alt="Skill Set Card"
                    width={774}
                    className="rounded-lg border shadow-md max-h-[320px] w-auto object-left-top"
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
            <div className="flex gap-2 flex-wrap">
              <Button onClick={copySkillSetReadme} size="sm" className="bg-green-600 hover:bg-green-700">
                <Copy className="h-4 w-4 mr-2" />
                Copy README
              </Button>
              {skillSetCardUrl && (
                <Button onClick={() => window.open(skillSetCardUrl, "_blank")} size="sm" variant="outline">
                  Test Card URL
                </Button>
              )}
            </div>
            <Textarea
              value={generateSkillSetReadme()}
              readOnly
              className="min-h-[400px] font-mono text-sm"
              placeholder="Generate your skill set first to see the embed code."
            />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
