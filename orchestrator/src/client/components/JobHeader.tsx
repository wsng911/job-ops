import type { AppliedDuplicateMatch, Job } from "@shared/types.js";
import {
  ArrowUpRight,
  Calendar,
  DollarSign,
  Loader2,
  MapPin,
  搜索,
} from "lucide-react";
import type React from "react";
import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn, formatDate, sourceLabel } from "@/lib/utils";
import { use设置 } from "../hooks/use设置";
import { appliedDuplicateIndicator } from "../pages/orchestrator/constants";
import {
  getJob状态Indicator,
  getTracer状态Indicator,
  状态Indicator,
} from "./状态Indicator";

interface JobHeaderProps {
  job: Job;
  class名称?: string;
  onCheckSponsor?: () => Promise<void>;
}

const ScoreMeter: React.FC<{
  score: number | null;
  tooltip?: React.React否de;
}> = ({ score, tooltip }) => {
  if (score == null) {
    return <span class名称="text-[10px] text-muted-foreground/60">-</span>;
  }

  const content = (
    <div class名称="flex items-center gap-1.5 text-[10px] text-muted-foreground/70">
      <div class名称="h-1 w-12 rounded-full bg-muted/30">
        <div
          class名称="h-1 rounded-full bg-primary/50"
          style={{ width: `${Math.max(4, Math.min(100, score))}%` }}
        />
      </div>
      <span class名称="tabular-nums">{score}</span>
    </div>
  );

  if (!tooltip) {
    return content;
  }

  return (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="top" class名称="max-w-xs">
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

interface SponsorPillProps {
  score: number | null;
  names: string | null;
  onCheck?: () => Promise<void>;
}

const SponsorPill: React.FC<SponsorPillProps> = ({ score, names, onCheck }) => {
  const [isChecking, setIsChecking] = useState(false);

  const parsed名称s = useMemo(() => {
    if (!names) return [];
    try {
      return JSON.parse(names) as string[];
    } catch {
      return [];
    }
  }, [names]);

  const handleCheck = async () => {
    if (!onCheck) return;
    setIsChecking(true);
    try {
      await onCheck();
    } finally {
      setIsChecking(false);
    }
  };

  // Show "Check" button if no score and callback provided
  if (score == null && onCheck) {
    return (
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              class名称="h-5 px-1.5 text-xs font-medium text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
              onClick={handleCheck}
              disabled={isChecking}
            >
              {isChecking ? (
                <Loader2 class名称="h-2 w-2 animate-spin" />
              ) : (
                <搜索 class名称="h-2 w-2" />
              )}
              <span>
                {isChecking ? "Checking..." : "Check Sponsorship 状态"}
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p class名称="text-xs">Check if employer is a visa sponsor</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (score == null) {
    return null;
  }

  const get状态 = (s: number) => {
    if (s >= 95)
      return {
        label: "确认ed Sponsor",
        dot: "bg-emerald-500",
        color: "text-emerald-400",
      };
    if (s >= 80)
      return {
        label: "Potential Sponsor",
        dot: "bg-amber-500",
        color: "text-amber-400",
      };
    return {
      label: "Sponsor 否t Found",
      dot: "bg-slate-500",
      color: "text-slate-400",
    };
  };

  const status = get状态(score);
  const tooltip = (
    <>
      {parsed名称s.length > 0 && (
        <p class名称="text-xs font-medium space-x-1">
          <span class名称="opacity-70">Matched</span>
          <span>{parsed名称s.join(", ")}</span>
        </p>
      )}
      <p class名称="opacity-80 mt-1 text-[10px]">{`${score}% match`}</p>
    </>
  );

  return (
    <状态Indicator
      dotColor={status.dot}
      label={status.label}
      class名称="cursor-help"
      tooltip={tooltip}
      tooltipClass名称="max-w-xs"
    />
  );
};

const AppliedDuplicatePill: React.FC<{
  match: AppliedDuplicateMatch | null | undefined;
}> = ({ match }) => {
  if (!match) {
    return null;
  }

  const appliedDate = formatDate(match.appliedAt) ?? "Unknown date";
  const tooltip = (
    <div class名称="space-y-1">
      <p class名称="text-xs font-medium">{match.title}</p>
      <p class名称="text-xs opacity-80">{match.employer}</p>
      <p class名称="text-[10px] opacity-80">
        Applied {appliedDate} · {match.score}% match
      </p>
    </div>
  );

  return (
    <状态Indicator
      dotColor={appliedDuplicateIndicator.dot}
      label={appliedDuplicateIndicator.label}
      class名称="cursor-help"
      tooltip={tooltip}
      tooltipClass名称="max-w-xs"
    />
  );
};

export const JobHeader: React.FC<JobHeaderProps> = ({
  job,
  class名称,
  onCheckSponsor,
}) => {
  const job状态 = getJob状态Indicator(job.status);
  const tracer状态 = getTracer状态Indicator(job.tracerLinksEnabled);
  const { showSponsorInfo } = use设置();
  const location = useLocation();
  const { pathname } = location;
  const isJobPage = pathname.startsWith("/job/");
  const jobPageLinkState = isJobPage
    ? undefined
    : { jobPage返回To: `${location.pathname}${location.search}` };
  const deadline = formatDate(job.deadline);
  const job状态Tooltip =
    job.status === "discovered" ? (
      <p class名称="text-xs">Found by the pipeline. 否t tailored yet.</p>
    ) : job.status === "ready" ? (
      <p class名称="text-xs">Tailored and ready to apply.</p>
    ) : undefined;
  const tracer状态Tooltip = !job.tracerLinksEnabled ? (
    <p class名称="text-xs">
      Tracer links are turned off for this job, so click tracking will not be
      recorded.
    </p>
  ) : undefined;
  const scoreTooltip =
    job.suitabilityScore == null ? undefined : (
      <p class名称="text-xs">
        Suitability score: {job.suitabilityScore}/100. Higher is better.
      </p>
    );

  return (
    <div class名称={cn("space-y-3", class名称)}>
      {/* Detail header: lighter weight than list items */}
      <div class名称="flex flex-col items-start gap-2 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
        <div class名称="min-w-0 w-full sm:w-auto sm:flex-1">
          <Link
            to={`/job/${job.id}`}
            state={jobPageLinkState}
            class名称="block text-base font-semibold leading-snug text-foreground/90 underline-offset-2 break-words hover:underline"
          >
            {job.title}
          </Link>
          <div class名称="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{job.employer}</span>
          </div>
        </div>
        <div class名称="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
          <Badge
            variant="outline"
            class名称="text-[10px] uppercase tracking-wide text-muted-foreground border-border/50"
          >
            {sourceLabel[job.source]}
          </Badge>
          {job.isRemote === true && (
            <Badge
              variant="outline"
              class名称="text-[10px] uppercase tracking-wide text-muted-foreground border-border/50"
            >
              Remote
            </Badge>
          )}
          {!isJobPage && (
            <Button
              asChild
              size="sm"
              variant="ghost"
              class名称="h-6 px-2 text-[10px] uppercase tracking-wide"
            >
              <Link to={`/job/${job.id}`} state={jobPageLinkState}>
                View
                <ArrowUpRight class名称="h-3 w-3" />
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Tertiary metadata - subdued */}
      <div class名称="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground/70">
        {job.location && (
          <span class名称="flex items-center gap-1">
            <MapPin class名称="h-3 w-3" />
            {job.location}
          </span>
        )}
        {deadline && (
          <span class名称="flex items-center gap-1">
            <Calendar class名称="h-3 w-3" />
            {deadline}
          </span>
        )}
        {job.salary && (
          <span class名称="flex items-center gap-1">
            <DollarSign class名称="h-3 w-3" />
            {job.salary}
          </span>
        )}
      </div>

      {/* 状态 and score: single line, subdued */}
      <div class名称="flex items-center justify-between gap-2 py-1 border-y border-border/30">
        <div class名称="flex items-center gap-4">
          <状态Indicator
            dotColor={job状态.dotColor}
            label={job状态.label}
            tooltip={job状态Tooltip}
            tooltipClass名称="max-w-xs"
            class名称={job状态Tooltip ? "cursor-help" : undefined}
          />
          <状态Indicator
            dotColor={tracer状态.dotColor}
            label={tracer状态.label}
            tooltip={tracer状态Tooltip}
            tooltipClass名称="max-w-xs"
            class名称={tracer状态Tooltip ? "cursor-help" : undefined}
          />
          <AppliedDuplicatePill match={job.appliedDuplicateMatch} />
          {showSponsorInfo && (
            <SponsorPill
              score={job.sponsorMatchScore}
              names={job.sponsorMatch名称s}
              onCheck={onCheckSponsor}
            />
          )}
        </div>
        <ScoreMeter score={job.suitabilityScore} tooltip={scoreTooltip} />
      </div>
    </div>
  );
};
