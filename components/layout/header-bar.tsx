"use client"

import { Check } from "lucide-react"
import { WIDGET_STEPS, type StepId } from "@/lib/widgets-types"

interface HeaderBarProps {
  currentTab: StepId
  stepIndex: number
  canAdvance: boolean
  onStepClick: (stepId: StepId) => void
}

export function HeaderBar({ currentTab, stepIndex, canAdvance, onStepClick }: HeaderBarProps) {
  const steps = WIDGET_STEPS

  return (
    <div className="shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-4 py-4 sm:px-6 flex items-center justify-center gap-6">
      <div className="flex items-center justify-between w-full md:w-1/2">
        {steps.map((step, index) => {
          const isActive = currentTab === step.id
          const isCompleted = stepIndex > index
          const stepDisabled = index > 0 && !canAdvance
          const Icon = step.icon
          return (
            <div key={step.id} className="flex flex-1 items-center last:flex-none">
              <button
                type="button"
                onClick={() => !stepDisabled && onStepClick(step.id)}
                disabled={stepDisabled}
                className={`flex flex-col items-center gap-1.5 sm:flex-row sm:gap-2 ${
                  stepDisabled ? "cursor-not-allowed opacity-60" : ""
                }`}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors ${
                    isActive
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : isCompleted
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : index + 1}
                </span>
                <span
                  className={`text-xs font-medium hidden sm:block sm:text-sm ${
                    isActive ? "text-emerald-700 dark:text-emerald-400" : isCompleted ? "text-slate-600 dark:text-slate-300" : "text-slate-400 dark:text-slate-500"
                  }`}
                >
                  {step.label}
                </span>
              </button>
              {index < steps.length - 1 && (
                <div
                  className={`mx-2 h-0.5 flex-1 rounded sm:mx-4 ${
                    stepIndex > index ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-700"
                  }`}
                  aria-hidden
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
