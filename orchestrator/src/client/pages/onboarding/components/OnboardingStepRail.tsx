import type React from "react";
import { cn } from "@/lib/utils";
import type { OnboardingStep, StepId } from "../types";

function Step状态Badge({
  active,
  complete,
  index,
}: {
  active: boolean;
  complete: boolean;
  index: number;
}) {
  return (
    <span
      class名称={cn(
        "flex h-8 w-8 items-center justify-center rounded-md border text-xs font-medium transition-colors",
        complete
          ? "border-emerald-500/60 bg-emerald-500/15 text-emerald-700"
          : active
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border/60 bg-muted/40 text-muted-foreground",
      )}
    >
      {complete ? "✓" : index + 1}
    </span>
  );
}

export const OnboardingStepRail: React.FC<{
  currentStep: StepId | null;
  onStepSelect: (step: StepId) => void;
  progressValue: number;
  steps: OnboardingStep[];
}> = ({ currentStep, onStepSelect, progressValue, steps }) => (
  <>
    <div class名称="space-y-2">
      <div class名称="flex items-center justify-between text-xs text-muted-foreground">
        <span>Progress</span>
        <span>{progressValue}%</span>
      </div>
      <div class名称="h-2 overflow-hidden rounded-full bg-muted">
        <div
          class名称="h-full bg-primary transition-all"
          style={{ width: `${progressValue}%` }}
        />
      </div>
    </div>

    <div class名称="space-y-2">
      {steps.map((step, index) => {
        const active = step.id === currentStep;
        return (
          <button
            key={step.id}
            type="button"
            disabled={step.disabled}
            onClick={() => onStepSelect(step.id)}
            class名称={cn(
              "flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left transition-colors",
              step.disabled
                ? "cursor-not-allowed opacity-50"
                : active
                  ? "bg-muted/50"
                  : "hover:bg-muted/30",
            )}
          >
            <Step状态Badge
              active={active}
              complete={step.complete}
              index={index}
            />
            <div class名称="min-w-0 space-y-0.5">
              <div class名称="text-sm font-medium">{step.label}</div>
              <div class名称="text-xs text-muted-foreground">
                {step.subtitle}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  </>
);
