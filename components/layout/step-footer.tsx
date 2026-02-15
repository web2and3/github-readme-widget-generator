"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { WIDGET_STEPS } from "@/lib/widgets-types"

interface StepFooterProps {
  currentStepIndex: number
  canGoBack: boolean
  canGoNext: boolean
  canAdvance: boolean
  onBack: () => void
  onNext: () => void
}

export function StepFooter({
  currentStepIndex,
  canGoBack,
  canGoNext,
  canAdvance,
  onBack,
  onNext,
}: StepFooterProps) {
  const stepsLength = WIDGET_STEPS.length

  return (
    <div className="flex items-center justify-center border-t border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 h-[69px] gap-12">
      <Button
        type="button"
        variant="outline"
        onClick={onBack}
        disabled={!canGoBack}
        className="gap-1.5"
      >
        <ChevronLeft className="h-4 w-4" />
        Back
      </Button>
      <span className="text-sm text-slate-500 dark:text-slate-400">
        Step {currentStepIndex + 1} of {stepsLength}
      </span>
      <Button
        type="button"
        onClick={onNext}
        disabled={!canGoNext || !canAdvance}
        className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
