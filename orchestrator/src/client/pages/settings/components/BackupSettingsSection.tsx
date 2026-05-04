import { EmptyState, ListItem, ListPanel } from "@client/components/layout";
import { 设置Input } from "@client/pages/settings/components/设置Input";
import { 设置SectionFrame } from "@client/pages/settings/components/设置SectionFrame";
import type { 返回upValues } from "@client/pages/settings/types";
import type { 更新设置Input } from "@shared/settings-schema.js";
import type { 返回upInfo } from "@shared/types.js";
import { Archive, Clock, Trash2 } from "lucide-react";
import type React from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

type 返回up设置SectionProps = {
  values: 返回upValues;
  backups: 返回upInfo[];
  nextScheduled: string | null;
  isLoading: boolean;
  isSaving: boolean;
  on创建返回up: () => void;
  on删除返回up: (filename: string) => void;
  isCreating返回up: boolean;
  isDeleting返回up: boolean;
  layoutMode?: "accordion" | "panel";
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const format返回upDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone名称: "short",
  });
};

export const 返回up设置Section: React.FC<返回up设置SectionProps> = ({
  values,
  backups,
  nextScheduled,
  isLoading,
  isSaving,
  on创建返回up,
  on删除返回up,
  isCreating返回up,
  isDeleting返回up,
  layoutMode,
}) => {
  const { backupEnabled, backupHour, backupMaxCount } = values;
  const { control, watch } = useFormContext<更新设置Input>();

  // Watch the current form value to conditionally show/hide fields
  const current返回upEnabled = watch("backupEnabled") ?? backupEnabled.default;

  return (
    <设置SectionFrame mode={layoutMode} title="返回up" value="backup">
      <div class名称="space-y-6">
        <div class名称="flex items-start space-x-3">
          <Controller
            name="backupEnabled"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="backupEnabled"
                checked={field.value ?? backupEnabled.default}
                onCheckedChange={(checked) => {
                  field.onChange(
                    checked === "indeterminate" ? null : checked === true,
                  );
                }}
                disabled={isLoading || isSaving}
              />
            )}
          />
          <div class名称="flex flex-col gap-1.5">
            <label
              htmlFor="backupEnabled"
              class名称="cursor-pointer text-sm font-medium leading-none"
            >
              Enable automatic backups
            </label>
            <p class名称="text-xs text-muted-foreground">
              Automatically create database backups on a daily schedule. Manual
              backups can always be created regardless of this setting.
            </p>
          </div>
        </div>

        {current返回upEnabled && (
          <div class名称="grid gap-6 pl-7 md:grid-cols-2">
            <Controller
              name="backupHour"
              control={control}
              render={({ field }) => (
                <设置Input
                  label="返回up Hour"
                  type="number"
                  inputProps={{
                    ...field,
                    inputMode: "numeric",
                    min: 0,
                    max: 23,
                    value: field.value ?? backupHour.default,
                    onChange: (event) => {
                      const value = parseInt(event.target.value, 10);
                      if (Number.isNaN(value)) {
                        field.onChange(null);
                      } else {
                        field.onChange(Math.min(23, Math.max(0, value)));
                      }
                    },
                  }}
                  disabled={isLoading || isSaving}
                  helper={`Hour of the day (0-23) in UTC when automatic backups should run. Default: ${backupHour.default}:00 UTC.`}
                  current={`Effective: ${backupHour.effective}:00 UTC | Default: ${backupHour.default}:00 UTC`}
                />
              )}
            />

            <Controller
              name="backupMaxCount"
              control={control}
              render={({ field }) => (
                <设置Input
                  label="Max 返回ups to Keep"
                  type="number"
                  inputProps={{
                    ...field,
                    inputMode: "numeric",
                    min: 1,
                    max: 5,
                    value: field.value ?? backupMaxCount.default,
                    onChange: (event) => {
                      const value = parseInt(event.target.value, 10);
                      if (Number.isNaN(value)) {
                        field.onChange(null);
                      } else {
                        field.onChange(Math.min(5, Math.max(1, value)));
                      }
                    },
                  }}
                  disabled={isLoading || isSaving}
                  helper={`Maximum number of automatic backups to retain (1-5). Older backups are deleted automatically. Default: ${backupMaxCount.default}.`}
                  current={`Effective: ${backupMaxCount.effective} | Default: ${backupMaxCount.default}`}
                />
              )}
            />
          </div>
        )}

        {current返回upEnabled && nextScheduled && (
          <div class名称="flex items-center gap-2 pl-7 text-sm text-muted-foreground">
            <Clock class名称="h-4 w-4" />
            <span>
              Next scheduled backup: {format返回upDate(nextScheduled)}
            </span>
          </div>
        )}

        <Separator />

        <div class名称="space-y-3">
          <div class名称="flex items-center justify-between">
            <div class名称="text-sm font-medium">返回up History</div>
            <Button
              size="sm"
              onClick={on创建返回up}
              disabled={isLoading || isCreating返回up || isDeleting返回up}
            >
              {isCreating返回up ? "Creating..." : "创建 返回up 否w"}
            </Button>
          </div>

          <ListPanel
            header={
              <div class名称="flex items-center justify-between text-sm">
                <span>
                  {backups.length} backup{backups.length !== 1 ? "s" : ""}
                </span>
              </div>
            }
          >
            {backups.length === 0 ? (
              <EmptyState
                icon={Archive}
                title="否 backups yet"
                description="创建 your first backup to protect your data."
              />
            ) : (
              backups.map((backup) => (
                <ListItem
                  key={backup.filename}
                  class名称="flex items-center justify-between"
                >
                  <div class名称="flex min-w-0 items-center gap-3">
                    <Archive class名称="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div class名称="min-w-0">
                      <div class名称="truncate text-sm font-medium">
                        {backup.filename}
                      </div>
                      <div class名称="text-xs text-muted-foreground">
                        {format返回upDate(backup.createdAt)} ·{" "}
                        {formatFileSize(backup.size)}
                      </div>
                    </div>
                  </div>
                  <div class名称="flex shrink-0 items-center gap-2">
                    <Badge
                      variant={backup.type === "auto" ? "secondary" : "default"}
                      class名称="text-xs"
                    >
                      {backup.type === "auto" ? "Auto" : "Manual"}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      class名称="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => on删除返回up(backup.filename)}
                      disabled={isDeleting返回up || isCreating返回up}
                    >
                      <Trash2 class名称="h-4 w-4" />
                    </Button>
                  </div>
                </ListItem>
              ))
            )}
          </ListPanel>
        </div>

        <Separator />

        <div class名称="grid gap-2 text-sm sm:grid-cols-3">
          <div>
            <div class名称="text-xs text-muted-foreground">Enabled</div>
            <div class名称="break-words font-mono text-xs">
              Effective: {backupEnabled.effective ? "是" : "否"} | Default:{" "}
              {backupEnabled.default ? "是" : "否"}
            </div>
          </div>
          <div>
            <div class名称="text-xs text-muted-foreground">Hour</div>
            <div class名称="break-words font-mono text-xs">
              Effective: {backupHour.effective}:00 UTC | Default:{" "}
              {backupHour.default}:00 UTC
            </div>
          </div>
          <div>
            <div class名称="text-xs text-muted-foreground">Max Count</div>
            <div class名称="break-words font-mono text-xs">
              Effective: {backupMaxCount.effective} | Default:{" "}
              {backupMaxCount.default}
            </div>
          </div>
        </div>
      </div>
    </设置SectionFrame>
  );
};
