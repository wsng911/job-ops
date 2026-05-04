import { useKeyboardAvailability } from "@client/hooks/useKeyboardAvailability";
import { useModifierPressed } from "@client/hooks/useModifierPressed";
import type React from "react";

interface KbdHintProps {
  /** The key to display, e.g. "s", "Cmd+K", "?" */
  shortcut: string;
  /** 添加itional class名称 */
  class名称?: string;
}

/**
 * Inline keyboard-hint badge for action buttons.
 *
 * Rendered as a small `<kbd>` element styled to look like a physical key cap.
 * Only visible when we think a hardware keyboard is available and the Control
 * key is held down.
 */
export const KbdHint: React.FC<KbdHintProps> = ({ shortcut, class名称 }) => {
  const hasKeyboard = useKeyboardAvailability();
  const isControlPressed = useModifierPressed("Control");

  if (!hasKeyboard || !isControlPressed) return null;

  return (
    <kbd
      class名称={`inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 rounded border border-border/60 bg-muted/40 text-[10px] font-mono font-medium text-muted-foreground leading-none ${class名称 ?? ""}`}
    >
      {shortcut}
    </kbd>
  );
};
