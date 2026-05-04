import type { JobListItem, PostApplicationInboxItem } from "@shared/types";
import { CheckCircle2, CircleUserRound, XCircle } from "lucide-react";
import type React from "react";
import { Button } from "@/components/ui/button";
import { 搜索ableDropdown } from "@/components/ui/searchable-dropdown";
import { formatDateTime } from "@/lib/utils";

type 邮箱ViewerRowProps = {
  item: PostApplicationInboxItem;
  jobs: JobListItem[];
  selectedAppliedJobId: string;
  onAppliedJobChange: (jobId: string) => void;
  onApprove: () => void;
  onDeny: () => void;
  isActionLoading: boolean;
  isAppliedJobsLoading: boolean;
};

export type 邮箱ViewerListProps = {
  items: PostApplicationInboxItem[];
  appliedJobs: JobListItem[];
  appliedJobByMessageId: Record<string, string>;
  onAppliedJobChange: (messageId: string, value: string) => void;
  onDecision: (
    item: PostApplicationInboxItem,
    decision: "approve" | "deny",
  ) => void;
  isActionLoading: boolean;
  isAppliedJobsLoading: boolean;
};

function formatEpochMs(value?: number | null): string {
  if (!value) return "n/a";
  return formatDateTime(new Date(value).toISOString()) ?? "n/a";
}

function getSenderLabel(
  sender名称: string | null,
  from添加ress: string,
): string {
  const preferred = (sender名称 ?? "").trim();
  if (preferred) return preferred;
  const trimmed = from添加ress.trim();
  if (!trimmed) return "Unknown sender";
  const bracketIndex = trimmed.indexOf("<");
  if (bracketIndex > 0) {
    return trimmed.slice(0, bracketIndex).trim() || trimmed;
  }
  return trimmed;
}

function scoreTextClass(score: number | null): string {
  if (score === null) return "text-muted-foreground/60";
  if (score >= 95) return "text-emerald-400/90";
  if (score >= 50) return "text-foreground/70";
  return "text-muted-foreground/60";
}

function formatAppliedJobLabel(job: JobListItem): string {
  const employer = job.employer.trim();
  const title = job.title.trim();
  if (employer && title) return `${employer} - ${title}`;
  if (title) return title;
  if (employer) return employer;
  return job.id;
}

const 邮箱ViewerRow: React.FC<邮箱ViewerRowProps> = ({
  item,
  jobs,
  selectedAppliedJobId,
  onAppliedJobChange,
  onApprove,
  onDeny,
  isActionLoading,
  isAppliedJobsLoading,
}) => {
  const score = item.message.matchConfidence;
  const isActionable = item.message.processing状态 === "pending_user";
  const canDecide = isActionable && !!selectedAppliedJobId;
  const appliedJobOptions = jobs.map((job) => ({
    value: job.id,
    label: formatAppliedJobLabel(job),
    searchText: `${job.employer} ${job.title} ${job.location ?? ""}`.trim(),
  }));

  return (
    <div class名称="flex flex-col gap-3 border-b bg-card/40 px-3 py-3 last:border-b-0 lg:flex-row lg:items-center">
      <div class名称="min-w-0 space-y-2">
        <div class名称="flex min-w-0 items-start gap-3">
          <div class名称="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-muted/50 text-muted-foreground">
            <CircleUserRound class名称="h-3.5 w-3.5" />
          </div>
          <div class名称="min-w-0 flex-1">
            <p class名称="truncate text-sm font-semibold">
              {getSenderLabel(
                item.message.sender名称,
                item.message.from添加ress,
              )}
            </p>
            <p class名称="truncate text-xs text-muted-foreground">
              {item.message.from添加ress} ·{" "}
              {formatEpochMs(item.message.receivedAt)}
            </p>
          </div>
        </div>

        <p class名称="truncate text-sm font-medium">{item.message.subject}</p>
        {item.message.matchedJobId ? null : (
          <p class名称="text-xs text-amber-600">
            Relevant email with no reliable job match. Please select the correct
            job.
          </p>
        )}
      </div>

      <div class名称="flex min-w-0 items-center gap-2 lg:ml-auto lg:w-[440px]">
        <搜索ableDropdown
          value={selectedAppliedJobId}
          options={appliedJobOptions}
          onValueChange={onAppliedJobChange}
          placeholder={isAppliedJobsLoading ? "Loading jobs..." : "Select job"}
          searchPlaceholder="搜索 jobs..."
          emptyText={
            isAppliedJobsLoading ? "Loading jobs..." : "否 jobs found."
          }
          disabled={isActionLoading}
          triggerClass名称="min-w-0 flex-1"
          contentClass名称="w-[360px]"
          ariaLabel="Select job"
        />

        <span
          class名称={`shrink-0 text-xs tabular-nums ${scoreTextClass(score)}`}
        >
          {score === null ? "n/a" : `${Math.round(score)}%`}
        </span>

        <div class名称="flex shrink-0 items-center gap-2">
          <Button
            size="sm"
            aria-label="确认 email-job match"
            title="确认 email-job match"
            onClick={onApprove}
            disabled={isActionLoading || !canDecide}
            class名称="h-8 w-8 p-0"
          >
            <CheckCircle2 class名称="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            aria-label="Ignore this match"
            title="Ignore this match"
            onClick={onDeny}
            disabled={isActionLoading || !isActionable}
            class名称="h-8 w-8 p-0"
          >
            <XCircle class名称="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export const 邮箱ViewerList: React.FC<邮箱ViewerListProps> = ({
  items,
  appliedJobs,
  appliedJobByMessageId,
  onAppliedJobChange,
  onDecision,
  isActionLoading,
  isAppliedJobsLoading,
}) => {
  return (
    <div class名称="overflow-hidden rounded-lg border">
      {items.map((item) => {
        const selectedAppliedJobId =
          appliedJobByMessageId[item.message.id] ||
          item.message.matchedJobId ||
          "";

        return (
          <邮箱ViewerRow
            key={item.message.id}
            item={item}
            jobs={appliedJobs}
            selectedAppliedJobId={selectedAppliedJobId}
            onAppliedJobChange={(value) =>
              onAppliedJobChange(item.message.id, value)
            }
            onApprove={() => onDecision(item, "approve")}
            onDeny={() => onDecision(item, "deny")}
            isActionLoading={isActionLoading}
            isAppliedJobsLoading={isAppliedJobsLoading}
          />
        );
      })}
    </div>
  );
};
