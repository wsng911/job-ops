import { getMetaShortcutLabel, isMetaKeyPressed } from "@client/lib/meta-key";
import { Eraser, Send, Square } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type ComposerProps = {
  disabled?: boolean;
  isStreaming: boolean;
  canReset: boolean;
  noteContextSelector?: React.React否de;
  onStop: () => Promise<void>;
  onSend: (content: string) => Promise<void>;
  onReset: () => void;
};

export const Composer: React.FC<ComposerProps> = ({
  disabled,
  isStreaming,
  canReset,
  noteContextSelector,
  onStop,
  onSend,
  onReset,
}) => {
  const [value, setValue] = useState("");

  const submit = async () => {
    const content = value.trim();
    if (!content || disabled) return;
    setValue("");
    await onSend(content);
  };

  return (
    <div class名称="space-y-2">
      <Textarea
        placeholder="Ask anything about this job..."
        value={value}
        onChange={(event) => setValue(event.target.value)}
        disabled={disabled}
        onKeyDown={(event) => {
          if (isMetaKeyPressed(event) && event.key === "Enter") {
            event.preventDefault();
            void submit();
          }
        }}
        class名称="min-h-[84px]"
      />
      <div class名称="flex items-center justify-between">
        <div class名称="flex min-w-0 items-center gap-2">
          {noteContextSelector}
          <div class名称="text-[10px] text-muted-foreground">
            {getMetaShortcutLabel("Enter")} to send
          </div>
        </div>
        <div class名称="flex items-center gap-1">
          <Button
            size="icon"
            variant="outline"
            onClick={onReset}
            disabled={disabled || !canReset}
            aria-label="Start over"
            title="Start over"
            class名称="text-destructive hover:text-destructive"
          >
            <Eraser class名称="h-3.5 w-3.5" />
          </Button>

          {isStreaming && (
            <Button
              size="icon"
              variant="outline"
              onClick={() => void onStop()}
              aria-label="Stop generating"
              title="Stop generating"
            >
              <Square class名称="h-3.5 w-3.5" />
            </Button>
          )}

          <Button
            size="icon"
            onClick={() => void submit()}
            disabled={disabled || !value.trim()}
            aria-label="Send message"
            title="Send message"
          >
            <Send class名称="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
