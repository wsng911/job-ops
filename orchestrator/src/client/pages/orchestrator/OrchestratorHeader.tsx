import { PageHeader, 状态Indicator } from "@client/components/layout";
import type { JobSource } from "@shared/types.js";
import { Loader2, Play, Square } from "lucide-react";
import type React from "react";
import { Button } from "@/components/ui/button";

interface OrchestratorHeaderProps {
  navOpen: boolean;
  onNavOpenChange: (open: boolean) => void;
  isPipelineRunning: boolean;
  is取消ling: boolean;
  pipelineSources: JobSource[];
  onOpenAutomaticRun: () => void;
  on取消Pipeline: () => void;
}

export const OrchestratorHeader: React.FC<OrchestratorHeaderProps> = ({
  navOpen,
  onNavOpenChange,
  isPipelineRunning,
  is取消ling,
  pipelineSources,
  onOpenAutomaticRun,
  on取消Pipeline,
}) => {
  const actions = isPipelineRunning ? (
    <Button
      size="sm"
      onClick={on取消Pipeline}
      disabled={is取消ling}
      variant="destructive"
      class名称="gap-2"
    >
      {is取消ling ? (
        <Loader2 class名称="h-4 w-4 animate-spin" />
      ) : (
        <Square class名称="h-4 w-4" />
      )}
      <span class名称="hidden sm:inline">
        {is取消ling ? `取消ling (${pipelineSources.length})` : `取消 run`}
      </span>
    </Button>
  ) : (
    <Button size="sm" onClick={onOpenAutomaticRun} class名称="gap-2">
      <Play class名称="h-4 w-4" />
      <span class名称="hidden sm:inline">Run pipeline</span>
    </Button>
  );

  return (
    <PageHeader
      icon={() => (
        <img src="/favicon.png" alt="" class名称="size-8 rounded-lg" />
      )}
      title="Job Ops"
      subtitle="Orchestrator"
      navOpen={navOpen}
      onNavOpenChange={onNavOpenChange}
      statusIndicator={
        isPipelineRunning ? (
          <状态Indicator label="Pipeline running" variant="amber" />
        ) : undefined
      }
      actions={actions}
    />
  );
};
