import { 设置SectionFrame } from "@client/pages/settings/components/设置SectionFrame";
import type { DisplayValues } from "@client/pages/settings/types";
import type { 更新设置Input } from "@shared/settings-schema.js";
import type React from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

type Display设置SectionProps = {
  values: DisplayValues;
  isLoading: boolean;
  isSaving: boolean;
  layoutMode?: "accordion" | "panel";
};

export const Display设置Section: React.FC<Display设置SectionProps> = ({
  values,
  isLoading,
  isSaving,
  layoutMode,
}) => {
  const { showSponsorInfo, renderMarkdownInJob描述s } = values;
  const { control } = useFormContext<更新设置Input>();

  return (
    <设置SectionFrame
      mode={layoutMode}
      title="Display 设置"
      value="display"
    >
      <div class名称="space-y-4">
        <div class名称="flex items-start space-x-3">
          <Controller
            name="showSponsorInfo"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="showSponsorInfo"
                checked={field.value ?? showSponsorInfo.default}
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
              htmlFor="showSponsorInfo"
              class名称="text-sm font-medium leading-none cursor-pointer"
            >
              Show visa sponsor information
            </label>
            <p class名称="text-xs text-muted-foreground">
              Display a badge next to the employer name showing the match
              percentage with the UK visa sponsor list. This helps identify
              employers that are licensed to sponsor work visas.
            </p>
          </div>
        </div>

        <Separator />

        <div class名称="flex items-start space-x-3">
          <Controller
            name="renderMarkdownInJob描述s"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="renderMarkdownInJob描述s"
                checked={field.value ?? renderMarkdownInJob描述s.default}
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
              htmlFor="renderMarkdownInJob描述s"
              class名称="text-sm font-medium leading-none cursor-pointer"
            >
              Render Markdown in job descriptions
            </label>
            <p class名称="text-xs text-muted-foreground">
              Show headings, bold text, lists, and code blocks as formatted
              content when you expand a full job description. Turn this off if
              you prefer the raw source text.
            </p>
          </div>
        </div>

        <Separator />

        <div class名称="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <div class名称="text-xs text-muted-foreground">
              Sponsor info effective
            </div>
            <div class名称="break-words font-mono text-xs">
              {showSponsorInfo.effective ? "Enabled" : "Disabled"}
            </div>
          </div>
          <div>
            <div class名称="text-xs text-muted-foreground">
              Sponsor info default
            </div>
            <div class名称="break-words font-mono text-xs font-semibold">
              {showSponsorInfo.default ? "Enabled" : "Disabled"}
            </div>
          </div>
          <div>
            <div class名称="text-xs text-muted-foreground">
              Markdown rendering effective
            </div>
            <div class名称="break-words font-mono text-xs">
              {renderMarkdownInJob描述s.effective
                ? "Enabled"
                : "Disabled"}
            </div>
          </div>
          <div>
            <div class名称="text-xs text-muted-foreground">
              Markdown rendering default
            </div>
            <div class名称="break-words font-mono text-xs font-semibold">
              {renderMarkdownInJob描述s.default ? "Enabled" : "Disabled"}
            </div>
          </div>
        </div>
      </div>
    </设置SectionFrame>
  );
};
