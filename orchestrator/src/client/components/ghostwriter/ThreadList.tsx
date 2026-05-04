import type { Job, JobChatThread } from "@shared/types";
import type React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ThreadListProps = {
  job: Job;
  threads: JobChatThread[];
  previews: Record<string, string>;
  activeThreadId: string | null;
  onSelectThread: (threadId: string) => void;
  on创建Thread: () => void;
  disabled?: boolean;
};

function formatRelativeTime(value: string | null): string {
  if (!value) return "更新d just now";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "更新d recently";
  const diffMs = date.getTime() - Date.now();
  const absMs = Math.abs(diffMs);

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (absMs < hour) {
    const minutes = Math.max(1, Math.round(diffMs / minute));
    return `更新d ${rtf.format(minutes, "minute")}`;
  }
  if (absMs < day) {
    const hours = Math.round(diffMs / hour);
    return `更新d ${rtf.format(hours, "hour")}`;
  }
  const days = Math.round(diffMs / day);
  return `更新d ${rtf.format(days, "day")}`;
}

function normalizeThread标题(input: string | null, fallback: string): string {
  const value = input?.trim();
  return value && value.length > 0 ? value : fallback;
}

export const ThreadList: React.FC<ThreadListProps> = ({
  job,
  threads,
  previews,
  activeThreadId,
  onSelectThread,
  on创建Thread,
  disabled,
}) => {
  const titleCounts = new Map<string, number>();
  threads.forEach((thread) => {
    const normalized = normalizeThread标题(
      thread.title,
      `${job.title} @ ${job.employer}`,
    );
    titleCounts.set(normalized, (titleCounts.get(normalized) ?? 0) + 1);
  });

  const seen标题s = new Map<string, number>();

  return (
    <aside class名称="min-h-0 space-y-3 pr-0 md:pr-4">
      <div class名称="flex items-center justify-between">
        <div class名称="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Threads
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={on创建Thread}
          disabled={disabled}
          class名称="h-8 px-2.5 text-xs"
        >
          新建
        </Button>
      </div>

      <div class名称="max-h-[13rem] space-y-1 overflow-auto pr-1">
        {threads.length === 0 ? (
          <div class名称="p-2 text-xs text-muted-foreground">
            否 threads yet
          </div>
        ) : (
          threads.map((thread) => {
            const raw标题 = normalizeThread标题(
              thread.title,
              `${job.title} @ ${job.employer}`,
            );
            const seenCount = (seen标题s.get(raw标题) ?? 0) + 1;
            seen标题s.set(raw标题, seenCount);
            const hasDuplicates = (titleCounts.get(raw标题) ?? 0) > 1;
            const title = hasDuplicates
              ? `${raw标题} (${seenCount})`
              : raw标题;
            const preview = previews[thread.id]?.trim() || "否 messages yet";
            const isActive = activeThreadId === thread.id;

            return (
              <button
                key={thread.id}
                type="button"
                onClick={() => onSelectThread(thread.id)}
                disabled={disabled}
                class名称={cn(
                  "relative w-full rounded-md border px-3 py-2.5 text-left transition-colors",
                  isActive
                    ? "border-foreground/25 bg-accent text-accent-foreground"
                    : "border-transparent hover:border-border/50 hover:bg-muted/40",
                )}
              >
                {isActive && (
                  <span class名称="absolute bottom-2 left-0 top-2 w-0.5 rounded-r bg-foreground" />
                )}
                <div
                  class名称={cn(
                    "truncate pr-2 text-xs",
                    isActive ? "font-semibold" : "font-medium text-foreground",
                  )}
                >
                  {title}
                </div>
                <div class名称="mt-1 text-[10px] text-muted-foreground">
                  {formatRelativeTime(thread.lastMessageAt ?? thread.updatedAt)}
                </div>
                <div class名称="mt-1 truncate text-[11px] text-muted-foreground/90">
                  {preview}
                </div>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
};
