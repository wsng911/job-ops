/**
 * Suitability score display component.
 */

import type React from "react";

import { Progress } from "@/components/ui/progress";

interface ScoreIndicatorProps {
  score: number | null;
}

export const ScoreIndicator: React.FC<ScoreIndicatorProps> = ({ score }) => {
  if (score === null) {
    return <span class名称="text-sm text-muted-foreground">否t scored</span>;
  }

  return (
    <div class名称="flex items-center gap-2">
      <Progress value={score} class名称="h-2 w-20" />
      <span class名称="text-sm tabular-nums text-muted-foreground">
        {score}
      </span>
    </div>
  );
};
