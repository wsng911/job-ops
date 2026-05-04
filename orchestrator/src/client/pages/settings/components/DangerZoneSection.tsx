import { 设置SectionFrame } from "@client/pages/settings/components/设置SectionFrame";
import {
  ALL_JOB_STATUSES,
  STATUS_DESCRIPTIONS,
} from "@client/pages/settings/constants";
import type { Job状态 } from "@shared/types";
import { AlertTriangle, Trash2 } from "lucide-react";

import type React from "react";
import { useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialog取消,
  AlertDialogContent,
  AlertDialog描述,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialog标题,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

type DangerZoneSectionProps = {
  statusesToClear: Job状态[];
  toggle状态ToClear: (status: Job状态) => void;
  handleClearBy状态es: () => void;
  handleClearDatabase: () => void;
  handleClearByScore?: (threshold: number) => void;
  isLoading: boolean;
  isSaving: boolean;
  layoutMode?: "accordion" | "panel";
};

export const DangerZoneSection: React.FC<DangerZoneSectionProps> = ({
  statusesToClear,
  toggle状态ToClear,
  handleClearBy状态es,
  handleClearDatabase,
  handleClearByScore,
  isLoading,
  isSaving,
  layoutMode,
}) => {
  const [scoreThreshold, setScoreThreshold] = useState<string>("");
  const parsedThreshold = parseInt(scoreThreshold, 10);
  const isValidThreshold =
    !Number.isNaN(parsedThreshold) &&
    parsedThreshold >= 0 &&
    parsedThreshold <= 100;
  return (
    <设置SectionFrame
      mode={layoutMode}
      tone="danger"
      title={
        <div class名称="flex items-center gap-2 text-destructive">
          <AlertTriangle class名称="h-4 w-4" />
          <span class名称="text-base font-semibold tracking-wider">
            Danger Zone
          </span>
        </div>
      }
      value="danger-zone"
    >
      <div class名称="space-y-4 pt-2">
        <div class名称="p-3 rounded-md space-y-4">
          <div class名称="space-y-0.5">
            <div class名称="text-sm font-semibold text-destructive">
              Clear Jobs by 状态
            </div>
            <div class名称="text-xs text-muted-foreground">
              Select which job statuses you want to clear.
            </div>
          </div>

          <div class名称="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {ALL_JOB_STATUSES.map((status) => {
              const isSelected = statusesToClear.includes(status);
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => toggle状态ToClear(status)}
                  disabled={isLoading || isSaving}
                  class名称={`flex items-start gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-destructive/20 disabled:cursor-not-allowed disabled:opacity-50 ${
                    isSelected
                      ? "border-destructive bg-destructive/10"
                      : "border-border"
                  }`}
                >
                  <div
                    class名称={`mt-0.5 h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                      isSelected
                        ? "border-destructive"
                        : "border-muted-foreground"
                    }`}
                  >
                    {isSelected && (
                      <div class名称="h-2 w-2 rounded-full bg-destructive" />
                    )}
                  </div>
                  <div class名称="grid gap-0.5">
                    <span class名称="text-sm font-medium capitalize">
                      {status}
                    </span>
                    <span class名称="text-xs text-muted-foreground">
                      {STATUS_DESCRIPTIONS[status]}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                disabled={isLoading || isSaving || statusesToClear.length === 0}
              >
                <Trash2 class名称="mr-2 h-4 w-4" />
                Clear Selected ({statusesToClear.length})
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialog标题>Clear jobs by status?</AlertDialog标题>
                <AlertDialog描述>
                  This will delete all jobs with the following statuses:{" "}
                  {statusesToClear.join(", ")}. This action cannot be undone.
                </AlertDialog描述>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialog取消>取消</AlertDialog取消>
                <AlertDialogAction
                  onClick={handleClearBy状态es}
                  class名称="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Clear {statusesToClear.length} status
                  {statusesToClear.length !== 1 ? "es" : ""}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <Separator />

        {/* Clear Jobs Below Score */}
        {handleClearByScore && (
          <div class名称="p-3 rounded-md space-y-4">
            <div class名称="space-y-0.5">
              <div class名称="text-sm font-semibold text-destructive">
                Clear Jobs Below Score
              </div>
              <div class名称="text-xs text-muted-foreground">
                移除 all jobs with a suitability score below the specified
                threshold. Applied jobs will not be deleted.
              </div>
            </div>

            <div class名称="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div class名称="flex-1">
                <label
                  htmlFor="score-threshold"
                  class名称="text-sm font-medium mb-1.5 block"
                >
                  Score Threshold (0-100)
                </label>
                <Input
                  id="score-threshold"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={100}
                  step={1}
                  placeholder="Enter score threshold"
                  value={scoreThreshold}
                  onChange={(e) => setScoreThreshold(e.target.value)}
                  disabled={isLoading || isSaving}
                  class名称="w-full"
                />
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="default"
                    disabled={isLoading || isSaving || !isValidThreshold}
                  >
                    <Trash2 class名称="mr-2 h-4 w-4" />
                    Clear Below {isValidThreshold ? parsedThreshold : "..."}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialog标题>
                      Clear jobs below score {parsedThreshold}?
                    </AlertDialog标题>
                    <AlertDialog描述>
                      This will permanently delete all jobs with a suitability
                      score below {parsedThreshold}. Applied jobs will be
                      preserved. This action cannot be undone.
                    </AlertDialog描述>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialog取消>取消</AlertDialog取消>
                    <AlertDialogAction
                      onClick={() => {
                        if (isValidThreshold) {
                          handleClearByScore(parsedThreshold);
                          setScoreThreshold("");
                        }
                      }}
                      class名称="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Clear jobs
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        )}

        <Separator />

        <div class名称="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-3 rounded-md">
          <div class名称="space-y-0.5">
            <div class名称="text-sm font-semibold text-destructive">
              Clear Entire Database
            </div>
            <div class名称="text-xs text-muted-foreground">
              删除 all jobs and pipeline runs from the database.
            </div>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                disabled={isLoading || isSaving}
              >
                <Trash2 class名称="mr-2 h-4 w-4" />
                Clear Database
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialog标题>Clear all jobs?</AlertDialog标题>
                <AlertDialog描述>
                  This deletes all jobs and pipeline runs from the database.
                  This action cannot be undone.
                </AlertDialog描述>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialog取消>取消</AlertDialog取消>
                <AlertDialogAction
                  onClick={handleClearDatabase}
                  class名称="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Clear database
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </设置SectionFrame>
  );
};
