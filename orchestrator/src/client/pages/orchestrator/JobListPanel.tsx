import type { JobListItem } from "@shared/types.js";
import { Loader2 } from "lucide-react";
import { forwardRef, useImperativeHandle } from "react";
import {
  useVirtualizedList,
  type VirtualListHandle,
} from "@/client/lib/virtual-list";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { FilterTab } from "./constants";
import {
  appliedDuplicateIndicator,
  default状态Token,
  emptyStateCopy,
  statusTokens,
} from "./constants";
import { JobRowContent } from "./JobRowContent";

interface EmptyStateAction {
  label: string;
  onClick: () => void;
}

interface JobListPanelProps {
  isLoading: boolean;
  jobs: JobListItem[];
  activeJobs: JobListItem[];
  selectedJobId: string | null;
  selectedJobIds: Set<string>;
  activeTab: FilterTab;
  onSelectJob: (jobId: string) => void;
  onToggleSelectJob: (jobId: string) => void;
  onToggleSelectAll: (checked: boolean) => void;
  primaryEmptyStateAction?: EmptyStateAction;
  secondaryEmptyStateAction?: EmptyStateAction;
  emptyStateMessage?: string;
}

const ROW_ESTIMATE = 84;

export const JobListPanel = forwardRef<VirtualListHandle, JobListPanelProps>(
  (
    {
      isLoading,
      jobs,
      activeJobs,
      selectedJobId,
      selectedJobIds,
      activeTab,
      onSelectJob,
      onToggleSelectJob,
      onToggleSelectAll,
      primaryEmptyStateAction,
      secondaryEmptyStateAction,
      emptyStateMessage,
    },
    ref,
  ) => {
    const virtualizer = useVirtualizedList({
      count: activeJobs.length,
      mode: "window",
      estimateSize: () => ROW_ESTIMATE,
      overscan: 8,
      getItemKey: (index) => activeJobs[index]?.id ?? index,
    });

    useImperativeHandle(
      ref,
      () => ({
        scrollToIndex: (index, options) =>
          virtualizer.scrollToIndex(index, options),
      }),
      [virtualizer],
    );

    if (isLoading && jobs.length === 0) {
      return (
        <div class名称="min-w-0 rounded-xl border border-border bg-card shadow-sm">
          <div class名称="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
            <Loader2 class名称="h-8 w-8 animate-spin text-muted-foreground" />
            <div class名称="text-sm text-muted-foreground">Loading jobs...</div>
          </div>
        </div>
      );
    }

    if (activeJobs.length === 0) {
      return (
        <div class名称="min-w-0 rounded-xl border border-border bg-card shadow-sm">
          <div class名称="flex flex-col items-center justify-center gap-4 px-6 py-12 text-center">
            <div class名称="text-base font-semibold">否 jobs found</div>
            <p class名称="max-w-md text-sm text-muted-foreground">
              {emptyStateMessage ?? emptyStateCopy[activeTab]}
            </p>
            {(primaryEmptyStateAction || secondaryEmptyStateAction) && (
              <div class名称="flex flex-col items-center justify-center gap-2 sm:flex-row">
                {primaryEmptyStateAction && (
                  <Button size="sm" onClick={primaryEmptyStateAction.onClick}>
                    {primaryEmptyStateAction.label}
                  </Button>
                )}
                {secondaryEmptyStateAction && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={secondaryEmptyStateAction.onClick}
                  >
                    {secondaryEmptyStateAction.label}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    const virtualItems = virtualizer.getVirtualItems();

    return (
      <div class名称="min-w-0 rounded-xl border border-border bg-card shadow-sm">
        <div class名称="divide-y divide-border/40">
          <div class名称="flex items-center justify-between gap-3 px-4 py-2 opacity-100 transition-opacity sm:opacity-50 sm:hover:opacity-100">
            <label
              htmlFor="job-list-select-all"
              class名称="flex items-center gap-2 text-xs text-muted-foreground"
            >
              <Checkbox
                id="job-list-select-all"
                checked={
                  activeJobs.length > 0 &&
                  activeJobs.every((job) => selectedJobIds.has(job.id))
                }
                onCheckedChange={() => {
                  const allSelected =
                    activeJobs.length > 0 &&
                    activeJobs.every((job) => selectedJobIds.has(job.id));
                  onToggleSelectAll(!allSelected);
                }}
                aria-label="Select all filtered jobs"
              />
              Select all filtered
            </label>
            <span class名称="text-xs text-muted-foreground tabular-nums">
              {selectedJobIds.size} selected
            </span>
          </div>
          <div
            class名称="relative"
            style={{
              height: `${virtualizer.getTotalSize()}px`,
            }}
          >
            {virtualItems.map((virtualRow) => {
              const job = activeJobs[virtualRow.index];
              if (!job) return null;

              const isSelected = job.id === selectedJobId;
              const isChecked = selectedJobIds.has(job.id);
              const statusToken =
                statusTokens[job.status] ?? default状态Token;
              const statusDotClass名称 = job.appliedDuplicateMatch
                ? appliedDuplicateIndicator.dot
                : statusToken.dot;
              const statusDot标题 = job.appliedDuplicateMatch
                ? appliedDuplicateIndicator.label
                : statusToken.label;

              return (
                <div
                  key={virtualRow.key}
                  ref={virtualizer.measureElement}
                  data-index={virtualRow.index}
                  data-job-id={job.id}
                  data-virtual-row="true"
                  class名称={cn(
                    "group absolute left-0 top-0 flex w-full items-center gap-3 border-l-2 border-b px-4 py-3 transition-colors cursor-pointer",
                    isChecked
                      ? "!border-l !border-l-primary !bg-muted/40"
                      : "border-l border-l-border/40",
                    isSelected
                      ? "bg-primary/15"
                      : "border-b-border/40 hover:bg-muted/20",
                    isChecked && isSelected && "outline-2 outline-primary/30",
                  )}
                  style={{
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <div class名称="relative h-4 w-4 shrink-0">
                    <span
                      class名称={cn(
                        "absolute inset-0 m-auto h-2 w-2 rounded-full transition-opacity duration-150 ease-out",
                        statusDotClass名称,
                        isChecked || isSelected
                          ? "opacity-0"
                          : "opacity-100 group-hover:opacity-0",
                      )}
                      title={statusDot标题}
                    />
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={() => onToggleSelectJob(job.id)}
                      onClick={(event) => event.stopPropagation()}
                      aria-label={`Select ${job.title}`}
                      class名称={cn(
                        "absolute inset-0 m-0 border-border/80 cursor-pointer text-muted-foreground/70 transition-opacity duration-150 ease-out",
                        "data-[state=checked]:border-primary data-[state=checked]:bg-primary/20 data-[state=checked]:text-primary",
                        "data-[state=checked]:shadow-[0_0_0_1px_hsl(var(--primary)/0.35)]",
                        isChecked || isSelected
                          ? "opacity-100 pointer-events-auto"
                          : "opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto",
                      )}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => onSelectJob(job.id)}
                    data-testid={`select-${job.id}`}
                    class名称="flex min-w-0 flex-1 cursor-pointer text-left"
                    aria-pressed={isSelected}
                  >
                    <JobRowContent
                      job={job}
                      isSelected={isSelected}
                      show状态Dot={false}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  },
);

JobListPanel.display名称 = "JobListPanel";
