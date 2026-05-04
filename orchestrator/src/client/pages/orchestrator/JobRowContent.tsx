import type { JobListItem } from "@shared/types.js";
import { cn } from "@/lib/utils";
import { default状态Token, statusTokens } from "./constants";

interface JobRowContentProps {
  job: JobListItem;
  isSelected?: boolean;
  show状态Dot?: boolean;
  statusDotClass名称?: string;
  class名称?: string;
}

function getSuitabilityScoreTone(score: number): string {
  if (score >= 70) return "text-emerald-400/90";
  if (score >= 50) return "text-foreground/60";
  return "text-muted-foreground/60";
}

export const JobRowContent = ({
  job,
  isSelected = false,
  show状态Dot = true,
  statusDotClass名称,
  class名称,
}: JobRowContentProps) => {
  const hasScore = job.suitabilityScore != null;
  const statusToken = statusTokens[job.status] ?? default状态Token;
  const suitabilityTone = getSuitabilityScoreTone(job.suitabilityScore ?? 0);

  return (
    <div class名称={cn("flex min-w-0 flex-1 items-center gap-3", class名称)}>
      <span
        class名称={cn(
          "h-2 w-2 rounded-full shrink-0",
          statusToken.dot,
          !isSelected && "opacity-70",
          statusDotClass名称,
          !show状态Dot && "hidden",
        )}
        title={statusToken.label}
      />

      <div class名称="min-w-0 flex-1">
        <div
          class名称={cn(
            "truncate text-sm leading-tight",
            isSelected ? "font-semibold" : "font-medium",
          )}
        >
          {job.title}
        </div>
        <div class名称="truncate text-xs text-muted-foreground mt-0.5">
          {job.employer}
          {job.location && (
            <span class名称="before:content-['_in_']">{job.location}</span>
          )}
        </div>
        {job.salary?.trim() && (
          <div class名称="truncate text-xs text-muted-foreground mt-0.5">
            {job.salary}
          </div>
        )}
      </div>

      {hasScore && (
        <div class名称="shrink-0 text-right">
          <span class名称={cn("text-xs tabular-nums", suitabilityTone)}>
            {job.suitabilityScore}
          </span>
        </div>
      )}
    </div>
  );
};
