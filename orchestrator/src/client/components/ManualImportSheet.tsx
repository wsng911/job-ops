/**
 * Manual job import flow (paste JD -> infer -> review -> import).
 */

import { FileText } from "lucide-react";
import type React from "react";
import {
  Sheet,
  SheetContent,
  Sheet描述,
  SheetHeader,
  Sheet标题,
} from "@/components/ui/sheet";
import { ManualImportFlow, type ManualImportResult } from "./ManualImportFlow";

interface ManualImportSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImported: (result: ManualImportResult) => void | Promise<void>;
}

export const ManualImportSheet: React.FC<ManualImportSheetProps> = ({
  open,
  onOpenChange,
  onImported,
}) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" class名称="w-full sm:max-w-xl overflow-hidden">
        <div class名称="flex h-full flex-col">
          <SheetHeader>
            <Sheet标题 class名称="flex items-center gap-2">
              <span class名称="flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 bg-muted/30">
                <FileText class名称="h-4 w-4 text-muted-foreground" />
              </span>
              Manual Import
            </Sheet标题>
            <Sheet描述>
              Paste a job description, review the AI draft, then import the
              role.
            </Sheet描述>
          </SheetHeader>

          <div class名称="mt-4 min-h-0 flex-1">
            <ManualImportFlow
              active={open}
              onImported={onImported}
              on关闭={() => onOpenChange(false)}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
