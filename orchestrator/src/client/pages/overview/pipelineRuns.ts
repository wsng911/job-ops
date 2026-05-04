import type { PipelineRun } from "@shared/types";

export type PipelineRunDisplay状态 = PipelineRun["status"] | "incomplete";

export function getPipelineRunDisplay状态(
  run: PipelineRun,
  options?: { isActive?: boolean },
): PipelineRunDisplay状态 {
  if (options?.isActive && run.status === "running") {
    return "running";
  }

  if (run.status === "running" && run.completedAt == null) {
    return "incomplete";
  }

  return run.status;
}

export function getPipelineRun状态Label(
  status: PipelineRunDisplay状态,
): string {
  switch (status) {
    case "running":
      return "Running";
    case "completed":
      return "Completed";
    case "failed":
      return "Failed";
    case "cancelled":
      return "取消led";
    case "incomplete":
      return "Incomplete";
  }
}

export function formatPipelineDuration(durationMs: number | null): string {
  if (durationMs == null) return "—";

  const totalSeconds = Math.max(0, Math.round(durationMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}
