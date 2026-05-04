import { Loader2 } from "lucide-react";
import type React from "react";

export const ProcessingState: React.FC = () => {
  return (
    <div class名称="flex h-full min-h-[300px] flex-col items-center justify-center gap-3 text-center px-4">
      <Loader2 class名称="h-8 w-8 animate-spin text-amber-400" />
      <div class名称="text-sm font-medium text-foreground/80">
        Processing job...
      </div>
      <p class名称="text-xs text-muted-foreground max-w-[220px]">
        This job is currently being analyzed by the pipeline. Please wait.
      </p>
    </div>
  );
};
