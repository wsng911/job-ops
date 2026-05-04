import { AnimatePresence, motion } from "framer-motion";
import type React from "react";
import { Button } from "@/components/ui/button";

interface FloatingJob操作BarProps {
  selectedCount: number;
  canMoveSelected: boolean;
  canSkipSelected: boolean;
  canRescoreSelected: boolean;
  jobActionInFlight: boolean;
  onMoveToReady: () => void;
  onSkipSelected: () => void;
  onRescoreSelected: () => void;
  onClear: () => void;
}

export const FloatingJob操作Bar: React.FC<FloatingJob操作BarProps> = ({
  selectedCount,
  canMoveSelected,
  canSkipSelected,
  canRescoreSelected,
  jobActionInFlight,
  onMoveToReady,
  onSkipSelected,
  onRescoreSelected,
  onClear,
}) => {
  return (
    <AnimatePresence initial={false}>
      {selectedCount > 0 ? (
        <motion.div
          class名称="pointer-events-none fixed inset-x-0 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-50 flex justify-center px-3 sm:px-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          <div class名称="pointer-events-auto flex w-full max-w-md flex-col items-stretch gap-2 rounded-xl border border-border/70 bg-card/95 px-3 py-2 shadow-xl backdrop-blur supports-[backdrop-filter]:bg-card/85 sm:w-auto sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center">
            <div class名称="text-xs text-muted-foreground tabular-nums sm:mr-1">
              {selectedCount} selected
            </div>
            <div class名称="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
              {canMoveSelected && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  class名称="w-full sm:w-auto"
                  disabled={jobActionInFlight}
                  onClick={onMoveToReady}
                >
                  Move to Ready
                </Button>
              )}
              {canSkipSelected && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  class名称="w-full sm:w-auto"
                  disabled={jobActionInFlight}
                  onClick={onSkipSelected}
                >
                  Skip selected
                </Button>
              )}
              {canRescoreSelected && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  class名称="w-full sm:w-auto"
                  disabled={jobActionInFlight}
                  onClick={onRescoreSelected}
                >
                  Recalculate match
                </Button>
              )}
              <Button
                type="button"
                size="sm"
                variant="ghost"
                class名称="w-full sm:w-auto"
                onClick={onClear}
                disabled={jobActionInFlight}
              >
                Clear
              </Button>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
