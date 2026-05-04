import { 设置SectionFrame } from "@client/pages/settings/components/设置SectionFrame";
import type { PromptTemplatesValues } from "@client/pages/settings/types";
import {
  PROMPT_TEMPLATE_DEFINITIONS,
  PROMPT_TEMPLATE_SETTING_KEYS,
  type PromptTemplateSettingKey,
} from "@shared/prompt-template-definitions.js";
import type { 更新设置Input } from "@shared/settings-schema.js";
import { AlertTriangle, RotateCcw } from "lucide-react";
import type React from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Alert, Alert描述, Alert标题 } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type PromptTemplatesSectionProps = {
  values: PromptTemplatesValues;
  isLoading: boolean;
  isSaving: boolean;
  layoutMode?: "accordion" | "panel";
};

const TEMPLATE_FIELD_NAMES =
  PROMPT_TEMPLATE_SETTING_KEYS as PromptTemplateSettingKey[];

export const PromptTemplatesSection: React.FC<PromptTemplatesSectionProps> = ({
  values,
  isLoading,
  isSaving,
  layoutMode,
}) => {
  const { control, setValue } = useFormContext<更新设置Input>();

  const handleResetOne = (key: PromptTemplateSettingKey) => {
    setValue(key, values[key].default, { shouldDirty: true });
  };

  const handleResetAll = () => {
    for (const key of TEMPLATE_FIELD_NAMES) {
      setValue(key, values[key].default, { shouldDirty: true });
    }
  };

  return (
    <设置SectionFrame
      mode={layoutMode}
      title="Prompt Templates"
      value="prompt-templates"
    >
      <div class名称="space-y-4">
        <p class名称="text-sm text-muted-foreground">
          编辑 the base AI instructions used by Ghostwriter, resume tailoring,
          and scoring.
        </p>

        <Alert variant="warning">
          <AlertTriangle class名称="h-4 w-4" />
          <Alert标题>Advanced setting</Alert标题>
          <Alert描述>
            Changing these templates can degrade or break AI behavior. Removing
            important instructions or placeholders may produce poor results. Use
            reset to restore the default templates.
          </Alert描述>
        </Alert>

        <div class名称="flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleResetAll}
            disabled={isLoading || isSaving}
          >
            <RotateCcw class名称="h-4 w-4" />
            Reset all prompts
          </Button>
        </div>

        {TEMPLATE_FIELD_NAMES.map((key) => {
          const definition = PROMPT_TEMPLATE_DEFINITIONS[key];

          return (
            <div key={key} class名称="space-y-3 rounded-lg border p-4">
              <div class名称="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div class名称="space-y-1">
                  <label htmlFor={key} class名称="text-sm font-medium">
                    {definition.label}
                  </label>
                  <p class名称="text-xs text-muted-foreground">
                    {definition.description}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleResetOne(key)}
                  disabled={isLoading || isSaving}
                >
                  Reset
                </Button>
              </div>

              <Controller
                name={key}
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    id={key}
                    value={field.value ?? values[key].effective}
                    onChange={(event) => field.onChange(event.target.value)}
                    disabled={isLoading || isSaving}
                    maxLength={12000}
                    class名称="min-h-[220px] font-mono text-xs"
                  />
                )}
              />

              <div class名称="space-y-2">
                <div class名称="text-xs font-medium text-muted-foreground">
                  Supported placeholders
                </div>
                <div class名称="flex flex-wrap gap-2">
                  {definition.placeholders.map((placeholder) => (
                    <span
                      key={placeholder}
                      class名称="rounded bg-muted px-2 py-1 font-mono text-xs text-muted-foreground"
                    >
                      {`{{${placeholder}}}`}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </设置SectionFrame>
  );
};
