import type { ManualImportResult } from "@client/components/ManualImportFlow";
import { ManualImportFlow } from "@client/components/ManualImportFlow";
import type { App设置, JobSource } from "@shared/types";
import type React from "react";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  Sheet描述,
  SheetHeader,
  Sheet标题,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AutomaticRunTab } from "./AutomaticRunTab";
import type { AutomaticRunValues } from "./automatic-run";
import type { RunMode } from "./run-mode";

interface RunModeModalProps {
  open: boolean;
  mode: RunMode;
  settings: App设置 | null;
  enabledSources: JobSource[];
  pipelineSources: JobSource[];
  onToggleSource: (source: JobSource, checked: boolean) => void;
  onSetPipelineSources: (sources: JobSource[]) => void;
  isPipelineRunning: boolean;
  onOpenChange: (open: boolean) => void;
  onModeChange: (mode: RunMode) => void;
  on保存AndRunAutomatic: (values: AutomaticRunValues) => Promise<void>;
  onManualImported: (result: ManualImportResult) => Promise<void>;
}

export const RunModeModal: React.FC<RunModeModalProps> = ({
  open,
  mode,
  settings,
  enabledSources,
  pipelineSources,
  onToggleSource,
  onSetPipelineSources,
  isPipelineRunning,
  onOpenChange,
  onModeChange,
  on保存AndRunAutomatic,
  onManualImported,
}) => {
  const isManualMode = mode === "manual";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" class名称="w-full sm:max-w-2xl">
        <div class名称="flex h-full flex-col">
          <SheetHeader>
            <Sheet标题 class名称="flex items-center gap-2">
              {isManualMode ? "Review job details" : "Run jobs"}
            </Sheet标题>
            <Sheet描述>
              {isManualMode
                ? "添加 a job description, review the extracted details, then import."
                : "Configure an automatic pipeline run."}
            </Sheet描述>
          </SheetHeader>

          <Separator class名称="my-4" />

          <Tabs
            value={mode}
            onValueChange={(value) => onModeChange(value as RunMode)}
            class名称="flex min-h-0 flex-1 flex-col"
          >
            <TabsList class名称="grid w-full grid-cols-2">
              <TabsTrigger value="automatic">Automatic</TabsTrigger>
              <TabsTrigger value="manual">Manual</TabsTrigger>
            </TabsList>

            <TabsContent value="automatic" class名称="min-h-0 flex-1">
              <AutomaticRunTab
                open={open}
                settings={settings}
                enabledSources={enabledSources}
                pipelineSources={pipelineSources}
                onToggleSource={onToggleSource}
                onSetPipelineSources={onSetPipelineSources}
                isPipelineRunning={isPipelineRunning}
                on保存AndRun={on保存AndRunAutomatic}
              />
            </TabsContent>

            <TabsContent value="manual" class名称="min-h-0 flex-1">
              <ManualImportFlow
                active={open && mode === "manual"}
                onImported={onManualImported}
                on关闭={() => onOpenChange(false)}
                showReviewIntro={false}
              />
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
};
