import { Sparkles } from "lucide-react";
import type React from "react";

export const EmptyState: React.FC = () => {
  return (
    <div class名称="flex h-full min-h-[300px] flex-col items-center justify-center gap-2 text-center px-4">
      <div class名称="h-10 w-10 rounded-full border border-border/40 bg-muted/20 flex items-center justify-center">
        <Sparkles class名称="h-4 w-4 text-muted-foreground/50" />
      </div>
      <div class名称="text-sm font-medium text-muted-foreground">
        否 job selected
      </div>
      <p class名称="text-xs text-muted-foreground/70 max-w-[200px]">
        Select a job from the list to see details and decide whether to tailor.
      </p>
    </div>
  );
};
