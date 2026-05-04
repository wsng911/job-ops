import {
  GHOSTWRITER_NOTE_CONTEXT_MAX_NOTE_CHARS,
  GHOSTWRITER_NOTE_CONTEXT_MAX_SELECTED,
  GHOSTWRITER_NOTE_CONTEXT_MAX_TOTAL_CHARS,
} from "@shared/ghostwriter-note-context.js";
import type { Job否te } from "@shared/types";
import { ChevronDown, FileText, Info } from "lucide-react";
import type React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn, formatDateTime } from "@/lib/utils";

type 否teContextSelectorProps = {
  notes: Job否te[];
  selected否teIds: string[];
  disabled?: boolean;
  isLoading?: boolean;
  isSaving?: boolean;
  onChange: (selected否teIds: string[]) => void;
};

function getSelected否tes(notes: Job否te[], selected否teIds: string[]) {
  const notesById = new Map(notes.map((note) => [note.id, note]));
  return selected否teIds
    .map((noteId) => notesById.get(noteId))
    .filter((note): note is Job否te => Boolean(note));
}

export const 否teContextSelector: React.FC<否teContextSelectorProps> = ({
  notes,
  selected否teIds,
  disabled,
  isLoading,
  isSaving,
  onChange,
}) => {
  const selected否tes = getSelected否tes(notes, selected否teIds);
  const selectedContentChars = selected否tes.reduce(
    (total, note) =>
      total +
      Math.min(
        note.content.trim().length,
        GHOSTWRITER_NOTE_CONTEXT_MAX_NOTE_CHARS,
      ),
    0,
  );
  const hasTotalOverflow =
    selectedContentChars > GHOSTWRITER_NOTE_CONTEXT_MAX_TOTAL_CHARS;
  const isAtSelectionLimit =
    selected否teIds.length >= GHOSTWRITER_NOTE_CONTEXT_MAX_SELECTED;

  const toggle否te = (noteId: string) => {
    if (disabled || isLoading || isSaving) return;
    if (selected否teIds.includes(noteId)) {
      onChange(selected否teIds.filter((id) => id !== noteId));
      return;
    }
    if (isAtSelectionLimit) return;
    onChange([...selected否teIds, noteId]);
  };

  const triggerLabel =
    selected否teIds.length > 0 ? `${selected否teIds.length} notes` : "否tes";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          class名称={cn(
            "h-8 gap-1.5 px-2.5 text-xs",
            selected否teIds.length > 0 && "border-primary/40 bg-primary/5",
          )}
        >
          <FileText class名称="h-3.5 w-3.5" />
          <span>{isSaving ? "Saving..." : triggerLabel}</span>
          <ChevronDown class名称="h-3 w-3 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" class名称="w-80 p-0">
        <div class名称="border-b px-3 py-2.5">
          <div class名称="flex items-center justify-between gap-3">
            <div class名称="text-sm font-medium">Ghostwriter notes</div>
            {selected否teIds.length > 0 && (
              <Badge variant="secondary" class名称="text-[10px]">
                {selected否teIds.length}/{GHOSTWRITER_NOTE_CONTEXT_MAX_SELECTED}
              </Badge>
            )}
          </div>
        </div>

        <div class名称="max-h-72 overflow-y-auto py-1">
          {isLoading ? (
            <div class名称="px-3 py-6 text-sm text-muted-foreground">
              Loading notes...
            </div>
          ) : notes.length === 0 ? (
            <div class名称="px-3 py-6 text-sm text-muted-foreground">
              否 job notes yet.
            </div>
          ) : (
            notes.map((note) => {
              const isSelected = selected否teIds.includes(note.id);
              const isTrimmed =
                note.content.trim().length >
                GHOSTWRITER_NOTE_CONTEXT_MAX_NOTE_CHARS;
              const isUnavailable = !isSelected && isAtSelectionLimit;
              const updatedAt =
                formatDateTime(note.updatedAt) ?? note.updatedAt;

              const checkboxId = `ghostwriter-note-context-${note.id}`;

              return (
                <div
                  key={note.id}
                  class名称={cn(
                    "flex w-full items-start gap-3 px-3 py-2.5 text-left transition hover:bg-muted/50",
                    isSelected && "bg-primary/5",
                    isUnavailable && "cursor-not-allowed opacity-55",
                  )}
                >
                  <Checkbox
                    id={checkboxId}
                    checked={isSelected}
                    disabled={
                      disabled || isLoading || isSaving || isUnavailable
                    }
                    class名称="mt-0.5"
                    onCheckedChange={() => toggle否te(note.id)}
                  />
                  <label
                    htmlFor={checkboxId}
                    class名称={cn(
                      "min-w-0 flex-1 cursor-pointer",
                      (disabled || isLoading || isSaving || isUnavailable) &&
                        "cursor-not-allowed",
                    )}
                  >
                    <span class名称="flex min-w-0 items-center gap-2">
                      <span class名称="truncate text-sm font-medium">
                        {note.title}
                      </span>
                      {isSelected && isTrimmed && (
                        <Badge
                          variant="outline"
                          class名称="shrink-0 text-[10px]"
                        >
                          Trimmed for AI
                        </Badge>
                      )}
                    </span>
                    <span class名称="mt-0.5 block text-xs text-muted-foreground">
                      更新d {updatedAt}
                    </span>
                  </label>
                </div>
              );
            })
          )}
        </div>

        {(isAtSelectionLimit || hasTotalOverflow) && (
          <div class名称="border-t bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
            {isAtSelectionLimit && (
              <div class名称="flex items-center gap-1.5">
                <Info class名称="h-3 w-3" />
                <span>{GHOSTWRITER_NOTE_CONTEXT_MAX_SELECTED} note limit</span>
              </div>
            )}
            {hasTotalOverflow && (
              <div class名称="mt-1 flex items-start gap-1.5">
                <Info class名称="mt-0.5 h-3 w-3" />
                <span>
                  Selected notes exceed the AI context budget; later notes will
                  be trimmed.
                </span>
              </div>
            )}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
