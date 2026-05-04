import { Loader2, RefreshCcw, Square } from "lucide-react";
import type React from "react";
import { Button } from "@/components/ui/button";

type RunControlsProps = {
  isStreaming: boolean;
  canRegenerate: boolean;
  onStop: () => Promise<void>;
  onRegenerate: () => Promise<void>;
};

export const RunControls: React.FC<RunControlsProps> = ({
  isStreaming,
  canRegenerate,
  onStop,
  onRegenerate,
}) => {
  return (
    <div class名称="flex items-center justify-end gap-2">
      {isStreaming ? (
        <Button size="sm" variant="outline" onClick={() => void onStop()}>
          <Square class名称="mr-1 h-3.5 w-3.5" />
          Stop
        </Button>
      ) : (
        <Button
          size="sm"
          variant="outline"
          onClick={() => void onRegenerate()}
          disabled={!canRegenerate}
        >
          <RefreshCcw class名称="mr-1 h-3.5 w-3.5" />
          Regenerate
        </Button>
      )}

      {isStreaming && (
        <div class名称="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <Loader2 class名称="h-3.5 w-3.5 animate-spin" />
          Generating
        </div>
      )}
    </div>
  );
};
