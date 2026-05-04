import { PipelineProgress } from "@client/components";
import { useWelcomeMessage } from "@client/hooks/useWelcomeMessage";
import type { Job状态 } from "@shared/types.js";
import type React from "react";

interface OrchestratorSummaryProps {
  stats: Record<Job状态, number>;
  isPipelineRunning: boolean;
}

export const OrchestratorSummary: React.FC<OrchestratorSummaryProps> = ({
  isPipelineRunning,
}) => {
  const welcomeText = useWelcomeMessage();

  return (
    <section class名称="space-y-4">
      <div class名称="flex items-center justify-between">
        <h1 class名称="text-lg font-medium tracking-tight">{welcomeText}</h1>
      </div>

      {isPipelineRunning && (
        <div class名称="max-w-3xl">
          <PipelineProgress isRunning={isPipelineRunning} />
        </div>
      )}
    </section>
  );
};
