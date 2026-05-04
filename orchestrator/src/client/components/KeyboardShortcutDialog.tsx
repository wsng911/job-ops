/**
 * KeyboardShortcutDialog - Help dialog triggered by the "?" shortcut.
 *
 * Displays all available keyboard shortcuts grouped by category,
 * rendered as a clean three-column layout.
 */

import { useKeyboardAvailability } from "@client/hooks/useKeyboardAvailability";
import {
  dedupeShortcuts,
  getShortcutsForTab,
  groupShortcuts,
  type ShortcutGroup,
} from "@client/lib/shortcut-map";
import type { FilterTab } from "@client/pages/orchestrator/constants";
import type React from "react";
import {
  Dialog,
  DialogContent,
  Dialog描述,
  DialogHeader,
  Dialog标题,
} from "@/components/ui/dialog";

const groupLabel: Record<ShortcutGroup, string> = {
  navigation: "Navigation",
  tabs: "Tabs",
  actions: "操作",
  meta: "General",
};

const groupOrder: ShortcutGroup[] = ["navigation", "actions", "tabs", "meta"];

interface KeyboardShortcutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeTab: FilterTab;
}

export const KeyboardShortcutDialog: React.FC<KeyboardShortcutDialogProps> = ({
  open,
  onOpenChange,
  activeTab,
}) => {
  const hasKeyboard = useKeyboardAvailability();

  if (!hasKeyboard) return null;

  const all = getShortcutsForTab(activeTab);
  const grouped = groupShortcuts(all);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent class名称="max-w-lg">
        <DialogHeader>
          <Dialog标题>Keyboard Shortcuts</Dialog标题>
          <Dialog描述>
            Available shortcuts for the current view. Press{" "}
            <kbd class名称="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 rounded border border-border/60 bg-muted/40 text-[10px] font-mono font-medium leading-none">
              ?
            </kbd>{" "}
            to toggle this dialog.
          </Dialog描述>
        </DialogHeader>
        <div class名称="grid gap-4 sm:grid-cols-2 pt-2">
          {groupOrder.map((group) => {
            const defs = grouped[group];
            if (defs.length === 0) return null;
            const deduped = dedupeShortcuts(defs);
            return (
              <div key={group}>
                <div class名称="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  {groupLabel[group]}
                </div>
                <div class名称="space-y-1.5">
                  {deduped.map((item) => (
                    <div
                      key={item.label}
                      class名称="flex items-center justify-between text-sm"
                    >
                      <span class名称="text-muted-foreground">
                        {item.label}
                      </span>
                      <span class名称="flex items-center gap-1 ml-3">
                        {item.displayKeys.map((dk, i) => (
                          <span key={dk} class名称="flex items-center gap-1">
                            {i > 0 && (
                              <span class名称="text-muted-foreground/40 text-[10px]">
                                /
                              </span>
                            )}
                            <kbd class名称="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded border border-border/60 bg-muted/40 text-[10px] font-mono font-medium leading-none">
                              {dk}
                            </kbd>
                          </span>
                        ))}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};
