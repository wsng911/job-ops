import type { Job } from "@shared/types.js";
import type React from "react";
import { cn } from "@/lib/utils";

interface TailoredSummaryProps {
  job: Job;
  class名称?: string;
}

export const TailoredSummary: React.FC<TailoredSummaryProps> = ({
  job,
  class名称,
}) => {
  if (!job.tailoredSummary) return null;

  return (
    <div
      class名称={cn(
        "rounded-lg border border-border/40 bg-muted/10 px-3 py-2.5",
        class名称,
      )}
    >
      <div class名称="text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-1.5">
        Tailored Summary
      </div>
      <p class名称="text-xs text-foreground/80 leading-relaxed italic whitespace-pre-wrap">
        "{job.tailoredSummary}"
      </p>
    </div>
  );
};
