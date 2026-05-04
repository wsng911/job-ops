import { TokenizedInput } from "@client/pages/orchestrator/TokenizedInput";
import { 设置Input } from "@client/pages/settings/components/设置Input";
import { 设置SectionFrame } from "@client/pages/settings/components/设置SectionFrame";
import type { ScoringValues } from "@client/pages/settings/types";
import type { 更新设置Input } from "@shared/settings-schema.js";
import type React from "react";
import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

type Scoring设置SectionProps = {
  values: ScoringValues;
  isLoading: boolean;
  isSaving: boolean;
  layoutMode?: "accordion" | "panel";
};

function parseTokenizedKeywordInput(input: string): string[] {
  return input
    .split(/[\n,]/g)
    .map((value) => value.trim())
    .filter(Boolean);
}

export const Scoring设置Section: React.FC<Scoring设置SectionProps> = ({
  values,
  isLoading,
  isSaving,
  layoutMode,
}) => {
  const {
    penalizeMissingSalary,
    missingSalaryPenalty,
    autoSkipScoreThreshold,
    blocked公司Keywords,
    scoringInstructions,
  } = values;
  const { control, watch, setValue } = useFormContext<更新设置Input>();
  const [blocked公司KeywordDraft, setBlocked公司KeywordDraft] =
    useState("");

  // Watch the current form value to conditionally show/hide penalty input
  const currentPenalizeEnabled =
    watch("penalizeMissingSalary") ?? penalizeMissingSalary.default;

  // Watch auto-skip threshold to show current value
  const currentAutoSkipThreshold = watch("autoSkipScoreThreshold");
  const blocked公司KeywordValues =
    watch("blocked公司Keywords") ?? blocked公司Keywords.default;

  return (
    <设置SectionFrame
      mode={layoutMode}
      title="Scoring 设置"
      value="scoring"
    >
      <div class名称="space-y-4">
        {/* Enable penalty toggle */}
        <div class名称="flex items-start space-x-3">
          <Controller
            name="penalizeMissingSalary"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="penalizeMissingSalary"
                checked={field.value ?? penalizeMissingSalary.default}
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
              htmlFor="penalizeMissingSalary"
              class名称="text-sm font-medium leading-none cursor-pointer"
            >
              Penalize Missing Salary
            </label>
            <p class名称="text-xs text-muted-foreground">
              Reduce suitability scores for jobs that do not include salary
              information. Jobs with any salary text (including "Competitive")
              are not penalized.
            </p>
          </div>
        </div>

        {/* Penalty amount input - only shown when enabled */}
        {currentPenalizeEnabled && (
          <div class名称="pl-7">
            <Controller
              name="missingSalaryPenalty"
              control={control}
              render={({ field }) => (
                <设置Input
                  label="Penalty Amount"
                  type="number"
                  inputProps={{
                    ...field,
                    inputMode: "numeric",
                    min: 0,
                    max: 100,
                    step: 1,
                    value: field.value ?? missingSalaryPenalty.default,
                    onChange: (event) => {
                      const value = parseInt(event.target.value, 10);
                      if (Number.isNaN(value)) {
                        field.onChange(null);
                      } else {
                        field.onChange(Math.min(100, Math.max(0, value)));
                      }
                    },
                  }}
                  disabled={isLoading || isSaving}
                  helper={`Points to subtract from suitability score (0-100). Default: ${missingSalaryPenalty.default}.`}
                  current={`Effective: ${missingSalaryPenalty.effective} | Default: ${missingSalaryPenalty.default}`}
                />
              )}
            />
          </div>
        )}

        <Separator />

        {/* Auto-skip threshold input */}
        <div class名称="space-y-3">
          <Controller
            name="autoSkipScoreThreshold"
            control={control}
            render={({ field }) => (
              <设置Input
                label="Auto-skip Score Threshold"
                type="number"
                inputProps={{
                  ...field,
                  inputMode: "numeric",
                  min: 0,
                  max: 100,
                  step: 1,
                  value: field.value ?? "",
                  onChange: (event) => {
                    const value = event.target.value;
                    if (value === "" || value === null) {
                      field.onChange(null);
                    } else {
                      const parsed = parseInt(value, 10);
                      if (Number.isNaN(parsed)) {
                        field.onChange(null);
                      } else {
                        field.onChange(Math.min(100, Math.max(0, parsed)));
                      }
                    }
                  },
                  placeholder: "Disabled",
                }}
                disabled={isLoading || isSaving}
                helper="Jobs scoring below this threshold will be automatically skipped during scoring. Leave empty to disable auto-skip. (0-100)"
                current={`Effective: ${currentAutoSkipThreshold === null || currentAutoSkipThreshold === undefined ? "Disabled" : currentAutoSkipThreshold} | Default: ${autoSkipScoreThreshold.default ?? "Disabled"}`}
              />
            )}
          />
        </div>

        <Separator />

        <div class名称="space-y-3">
          <label
            htmlFor="scoringInstructions"
            class名称="text-sm font-medium leading-none"
          >
            Scoring Instructions
          </label>
          <Controller
            name="scoringInstructions"
            control={control}
            render={({ field }) => (
              <div class名称="space-y-2">
                <Textarea
                  id="scoringInstructions"
                  value={field.value ?? scoringInstructions.default}
                  onChange={(event) => field.onChange(event.target.value)}
                  placeholder="Example: Open to relocating, so do not mark down for location discrepancies. Prioritize visa sponsorship and backend API work."
                  disabled={isLoading || isSaving}
                  maxLength={4000}
                />
                <div class名称="text-xs text-muted-foreground">
                  Optional guidance for the AI scorer about what to weigh more
                  or less. This only changes scoring, not Ghostwriter or
                  tailoring.
                </div>
                <div class名称="text-xs text-muted-foreground">
                  Current:{" "}
                  <span class名称="font-mono">
                    {scoringInstructions.effective || "—"}
                  </span>
                </div>
              </div>
            )}
          />
        </div>

        <Separator />

        <div class名称="space-y-3">
          <label
            htmlFor="blocked-company-keywords"
            class名称="text-sm font-medium leading-none"
          >
            Blocked 公司 Keywords
          </label>
          <TokenizedInput
            id="blocked-company-keywords"
            values={blocked公司KeywordValues}
            draft={blocked公司KeywordDraft}
            parseInput={parseTokenizedKeywordInput}
            onDraftChange={setBlocked公司KeywordDraft}
            onValuesChange={(value) =>
              setValue("blocked公司Keywords", value, { shouldDirty: true })
            }
            placeholder='e.g. "recruitment", "staffing"'
            helperText="Jobs whose company name contains one of these keywords will be dropped during discovery."
            removeLabelPrefix="移除 blocked keyword"
            disabled={isLoading || isSaving}
          />
          <div class名称="break-words font-mono text-xs text-muted-foreground">
            Effective:{" "}
            {blocked公司KeywordValues.length > 0
              ? blocked公司KeywordValues.join(", ")
              : "否ne"}{" "}
            | Default:{" "}
            {blocked公司Keywords.default.length > 0
              ? blocked公司Keywords.default.join(", ")
              : "否ne"}
          </div>
        </div>

        <Separator />

        {/* Effective/Default values display */}
        <div class名称="grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <div class名称="text-xs text-muted-foreground">Penalty Enabled</div>
            <div class名称="break-words font-mono text-xs">
              Effective: {penalizeMissingSalary.effective ? "是" : "否"} |
              Default: {penalizeMissingSalary.default ? "是" : "否"}
            </div>
          </div>
          <div>
            <div class名称="text-xs text-muted-foreground">Penalty Amount</div>
            <div class名称="break-words font-mono text-xs">
              Effective: {missingSalaryPenalty.effective} | Default:{" "}
              {missingSalaryPenalty.default}
            </div>
          </div>
          <div>
            <div class名称="text-xs text-muted-foreground">
              Auto-skip Threshold
            </div>
            <div class名称="break-words font-mono text-xs">
              Effective: {autoSkipScoreThreshold.effective ?? "Disabled"} |
              Default: {autoSkipScoreThreshold.default ?? "Disabled"}
            </div>
          </div>
          <div>
            <div class名称="text-xs text-muted-foreground">
              Scoring Instructions
            </div>
            <div class名称="break-words font-mono text-xs">
              Effective: {scoringInstructions.effective || "—"} | Default:{" "}
              {scoringInstructions.default || "—"}
            </div>
          </div>
        </div>
      </div>
    </设置SectionFrame>
  );
};
