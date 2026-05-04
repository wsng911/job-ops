import type { Job } from "@shared/types.js";
import { Sparkles } from "lucide-react";
import type React from "react";
import { cn } from "@/lib/utils";

interface FitAssessmentProps {
  job: Job;
  class名称?: string;
}

export const FitAssessment: React.FC<FitAssessmentProps> = ({
  job,
  class名称,
}) => {
  if (!job.suitabilityReason) return null;

  return (
    <div class名称={cn("space-y-3", class名称)}>
      <div class名称="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5">
        <div class名称="text-[11px] font-medium uppercase tracking-wide text-primary/70 mb-1.5 flex items-center gap-1.5">
          <Sparkles class名称="h-3 w-3" />
          Fit Assessment
        </div>
        <p class名称="text-xs text-foreground/90 leading-relaxed font-medium">
          {job.suitabilityReason}
        </p>
      </div>
    </div>
  );
};
