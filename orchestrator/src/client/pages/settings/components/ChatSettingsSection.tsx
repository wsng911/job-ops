import { TokenizedInput } from "@client/pages/orchestrator/TokenizedInput";
import { 设置SectionFrame } from "@client/pages/settings/components/设置SectionFrame";
import {
  getMatchingWritingStylePresetId,
  resolveWritingStyleDraft,
  WRITING_STYLE_PRESETS,
} from "@client/pages/settings/constants";
import type { ChatValues } from "@client/pages/settings/types";
import type { 更新设置Input } from "@shared/settings-schema.js";
import {
  CHAT_STYLE_MANUAL_LANGUAGE_LABELS,
  CHAT_STYLE_MANUAL_LANGUAGE_VALUES,
  type ChatStyleLanguageMode,
  type ChatStyleManualLanguage,
} from "@shared/types.js";
import type React from "react";
import { useState } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

type Chat设置SectionProps = {
  values: ChatValues;
  isLoading: boolean;
  isSaving: boolean;
  layoutMode?: "accordion" | "panel";
};

const LANGUAGE_MODE_LABELS: Record<ChatStyleLanguageMode, string> = {
  manual: "Choose specific language",
  "match-resume": "Match current resume language",
};

function parseTokenizedTerms(input: string): string[] {
  return input
    .split(/[\n,]/g)
    .map((value) => value.trim())
    .filter(Boolean);
}

function parseStoredTerms(value: string | null | undefined): string[] {
  return parseTokenizedTerms(value ?? "");
}

function normalizeBlank(value: string | null | undefined): string | undefined {
  return value == null || value === "" ? undefined : value;
}

export const Chat设置Section: React.FC<Chat设置SectionProps> = ({
  values,
  isLoading,
  isSaving,
  layoutMode,
}) => {
  const {
    tone,
    formality,
    constraints,
    do否tUse,
    languageMode,
    manualLanguage,
    stopSlopEnabled,
    summaryMaxWords,
    maxKeywordsPerSkill,
  } = values;

  const {
    control,
    register,
    setValue,
    formState: { errors },
  } = useFormContext<更新设置Input>();
  const [do否tUseDraft, setDo否tUseDraft] = useState("");
  const [
    toneValue,
    formalityValue,
    constraintsValue,
    do否tUseValue,
    languageModeValue,
  ] = useWatch({
    control,
    name: [
      "chatStyleTone",
      "chatStyleFormality",
      "chatStyleConstraints",
      "chatStyleDo否tUse",
      "chatStyleLanguageMode",
    ],
  });
  const toneDraft = normalizeBlank(toneValue);
  const formalityDraft = normalizeBlank(formalityValue);
  const constraintsDraft = normalizeBlank(constraintsValue);
  const do否tUseDraftValue = normalizeBlank(do否tUseValue);
  const resolvedLanguageMode =
    normalizeBlank(languageModeValue) ?? languageMode.default;
  const showManualLanguage = resolvedLanguageMode === "manual";
  const resolvedStyle = resolveWritingStyleDraft({
    values: {
      tone: toneDraft,
      formality: formalityDraft,
      constraints: constraintsDraft,
      do否tUse: do否tUseDraftValue,
    },
    defaults: values,
  });
  const selectedPresetId =
    getMatchingWritingStylePresetId(resolvedStyle) ?? "custom";
  const do否tUseTokens = parseStoredTerms(
    do否tUseDraftValue ?? do否tUse.default,
  );

  return (
    <设置SectionFrame
      mode={layoutMode}
      title="Writing Style & Language"
      value="chat"
    >
      <div class名称="space-y-4">
        <p class名称="text-sm text-muted-foreground">
          These defaults shape AI-generated writing across Ghostwriter and
          resume tailoring.
        </p>

        <div class名称="space-y-2">
          <label htmlFor="writingStylePreset" class名称="text-sm font-medium">
            Preset
          </label>
          <Select
            value={selectedPresetId}
            onValueChange={(value) => {
              if (value === "custom") return;

              const preset = WRITING_STYLE_PRESETS.find(
                (item) => item.id === value,
              );
              if (!preset) return;

              setValue("chatStyleTone", preset.values.tone, {
                shouldDirty: true,
              });
              setValue("chatStyleFormality", preset.values.formality, {
                shouldDirty: true,
              });
              setValue("chatStyleConstraints", preset.values.constraints, {
                shouldDirty: true,
              });
              setValue("chatStyleDo否tUse", preset.values.do否tUse, {
                shouldDirty: true,
              });
            }}
            disabled={isLoading || isSaving}
          >
            <SelectTrigger id="writingStylePreset">
              <SelectValue placeholder="Choose a writing preset" />
            </SelectTrigger>
            <SelectContent>
              {WRITING_STYLE_PRESETS.map((preset) => (
                <SelectItem key={preset.id} value={preset.id}>
                  {preset.label}
                </SelectItem>
              ))}
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
          <div class名称="text-xs text-muted-foreground">
            {selectedPresetId === "custom"
              ? "Your current values are custom."
              : (WRITING_STYLE_PRESETS.find(
                  (preset) => preset.id === selectedPresetId,
                )?.description ?? "")}
          </div>
        </div>

        <div class名称="flex items-start space-x-3">
          <Controller
            name="ghostwriterStopSlopEnabled"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="ghostwriterStopSlopEnabled"
                checked={field.value ?? stopSlopEnabled.default}
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
              htmlFor="ghostwriterStopSlopEnabled"
              class名称="cursor-pointer text-sm font-medium leading-none"
            >
              Use Stop Slop for Ghostwriter
            </label>
            <p class名称="text-xs text-muted-foreground">
              Applies extra Ghostwriter-only instructions to remove filler,
              formulaic AI phrasing, passive voice, vague claims, and em dashes.
            </p>
          </div>
        </div>

        <Separator />

        <div class名称="grid gap-4 md:grid-cols-2">
          <div class名称="space-y-2">
            <label
              htmlFor="chatStyleLanguageMode"
              class名称="text-sm font-medium"
            >
              Output language
            </label>
            <Controller
              name="chatStyleLanguageMode"
              control={control}
              render={({ field }) => (
                <Select
                  value={normalizeBlank(field.value) ?? languageMode.default}
                  onValueChange={(value) => {
                    const nextValue = value as ChatStyleLanguageMode;
                    field.onChange(nextValue);
                    if (nextValue !== "manual") {
                      setValue("chatStyleManualLanguage", null, {
                        shouldDirty: true,
                      });
                    }
                  }}
                  disabled={isLoading || isSaving}
                >
                  <SelectTrigger
                    id="chatStyleLanguageMode"
                    aria-label="Output language"
                  >
                    <SelectValue placeholder="Select output language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="match-resume">
                      Match current resume language
                    </SelectItem>
                    <SelectItem value="manual">
                      Choose specific language
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            <div class名称="text-xs text-muted-foreground">
              Choose how AI picks the output language.
            </div>
          </div>

          {showManualLanguage ? (
            <div class名称="space-y-2">
              <label
                htmlFor="chatStyleManualLanguage"
                class名称="text-sm font-medium"
              >
                Specific language
              </label>
              <Controller
                name="chatStyleManualLanguage"
                control={control}
                render={({ field }) => (
                  <Select
                    value={
                      normalizeBlank(field.value) ?? manualLanguage.default
                    }
                    onValueChange={(value) =>
                      field.onChange(value as ChatStyleManualLanguage)
                    }
                    disabled={isLoading || isSaving}
                  >
                    <SelectTrigger
                      id="chatStyleManualLanguage"
                      aria-label="Specific language"
                    >
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {CHAT_STYLE_MANUAL_LANGUAGE_VALUES.map((language) => (
                        <SelectItem key={language} value={language}>
                          {CHAT_STYLE_MANUAL_LANGUAGE_LABELS[language]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <div class名称="text-xs text-muted-foreground">
                Used when output language is set to a specific language.
              </div>
            </div>
          ) : null}
        </div>

        <div class名称="grid gap-4 md:grid-cols-2">
          <div class名称="space-y-2">
            <label htmlFor="chatStyleTone" class名称="text-sm font-medium">
              Tone
            </label>
            <Controller
              name="chatStyleTone"
              control={control}
              render={({ field }) => (
                <Select
                  value={normalizeBlank(field.value) ?? tone.default}
                  onValueChange={(value) => field.onChange(value)}
                  disabled={isLoading || isSaving}
                >
                  <SelectTrigger id="chatStyleTone">
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="concise">Concise</SelectItem>
                    <SelectItem value="direct">Direct</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div class名称="space-y-2">
            <label htmlFor="chatStyleFormality" class名称="text-sm font-medium">
              Formality
            </label>
            <Controller
              name="chatStyleFormality"
              control={control}
              render={({ field }) => (
                <Select
                  value={normalizeBlank(field.value) ?? formality.default}
                  onValueChange={(value) => field.onChange(value)}
                  disabled={isLoading || isSaving}
                >
                  <SelectTrigger id="chatStyleFormality">
                    <SelectValue placeholder="Select formality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>

        <div class名称="space-y-2">
          <label htmlFor="chatStyleConstraints" class名称="text-sm font-medium">
            Constraints
          </label>
          <Textarea
            id="chatStyleConstraints"
            placeholder="Example: keep answers under 120 words and include bullet points"
            disabled={isLoading || isSaving}
            {...register("chatStyleConstraints")}
          />
          <div class名称="text-xs text-muted-foreground">
            Optional global writing constraints applied to Ghostwriter replies
            and resume tailoring.
          </div>
          <div class名称="text-xs text-muted-foreground">
            Current:{" "}
            <span class名称="font-mono">{constraints.effective || "—"}</span>
          </div>
        </div>

        <div class名称="space-y-2">
          <label htmlFor="chatStyleDo否tUse" class名称="text-sm font-medium">
            Do-not-use terms
          </label>
          <TokenizedInput
            id="chatStyleDo否tUse"
            values={do否tUseTokens}
            draft={do否tUseDraft}
            parseInput={parseTokenizedTerms}
            onDraftChange={setDo否tUseDraft}
            onValuesChange={(nextValues) =>
              setValue("chatStyleDo否tUse", nextValues.join(", "), {
                shouldDirty: true,
              })
            }
            placeholder='e.g. "synergize", "leverage"'
            helperText="Optional words or phrases the AI should avoid when generating text. This is guidance to the model, not a guaranteed blocklist."
            removeLabelPrefix="移除 do-not-use term"
            disabled={isLoading || isSaving}
          />
          <div class名称="text-xs text-muted-foreground">
            Current:{" "}
            <span class名称="font-mono">{do否tUse.effective || "—"}</span>
          </div>
        </div>

        <Separator />

        <div class名称="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div class名称="text-xs text-muted-foreground">Tone</div>
            <div class名称="break-words font-mono text-xs">
              Effective: {tone.effective} | Default: {tone.default}
            </div>
          </div>
          <div>
            <div class名称="text-xs text-muted-foreground">Formality</div>
            <div class名称="break-words font-mono text-xs">
              Effective: {formality.effective} | Default: {formality.default}
            </div>
          </div>
          <div>
            <div class名称="text-xs text-muted-foreground">Language mode</div>
            <div class名称="break-words font-mono text-xs">
              Effective: {LANGUAGE_MODE_LABELS[languageMode.effective]} |
              Default: {LANGUAGE_MODE_LABELS[languageMode.default]}
            </div>
          </div>
          <div>
            <div class名称="text-xs text-muted-foreground">
              Specific language
            </div>
            <div class名称="break-words font-mono text-xs">
              Effective:{" "}
              {CHAT_STYLE_MANUAL_LANGUAGE_LABELS[manualLanguage.effective]} |
              Default:{" "}
              {CHAT_STYLE_MANUAL_LANGUAGE_LABELS[manualLanguage.default]}
            </div>
          </div>
          <div>
            <div class名称="text-xs text-muted-foreground">Stop Slop</div>
            <div class名称="break-words font-mono text-xs">
              Effective: {stopSlopEnabled.effective ? "Enabled" : "Disabled"} |
              Default: {stopSlopEnabled.default ? "Enabled" : "Disabled"}
            </div>
          </div>
        </div>

        <Separator />

        <div class名称="grid gap-4 md:grid-cols-2">
          <div class名称="space-y-2">
            <label
              htmlFor="chatStyleSummaryMaxWords"
              class名称="text-sm font-medium"
            >
              Summary max words
            </label>
            <Controller
              name="chatStyleSummaryMaxWords"
              control={control}
              rules={{
                validate: (v) =>
                  v === null ||
                  v === undefined ||
                  (Number.isInteger(v) && v >= 1 && v <= 500) ||
                  "Must be between 1 and 500",
              }}
              render={({ field }) => (
                <Input
                  id="chatStyleSummaryMaxWords"
                  type="number"
                  min={1}
                  max={500}
                  step={1}
                  placeholder="否 limit"
                  disabled={isLoading || isSaving}
                  value={field.value ?? ""}
                  onChange={(e) => {
                    const value = e.target.valueAsNumber;
                    field.onChange(Number.isFinite(value) ? value : null);
                  }}
                />
              )}
            />
            {errors.chatStyleSummaryMaxWords && (
              <div class名称="text-xs text-destructive">
                {errors.chatStyleSummaryMaxWords.message as string}
              </div>
            )}
            <div class名称="text-xs text-muted-foreground">
              Limits words in the AI-generated summary. Overrides any word
              limits in Constraints.
            </div>
            <div class名称="text-xs text-muted-foreground">
              Current:{" "}
              <span class名称="font-mono">
                {summaryMaxWords.effective ?? "—"}
              </span>
            </div>
          </div>

          <div class名称="space-y-2">
            <label
              htmlFor="chatStyleMaxKeywordsPerSkill"
              class名称="text-sm font-medium"
            >
              Max keywords per skill
            </label>
            <Controller
              name="chatStyleMaxKeywordsPerSkill"
              control={control}
              rules={{
                validate: (v) =>
                  v === null ||
                  v === undefined ||
                  (Number.isInteger(v) && v >= 1 && v <= 50) ||
                  "Must be between 1 and 50",
              }}
              render={({ field }) => (
                <Input
                  id="chatStyleMaxKeywordsPerSkill"
                  type="number"
                  min={1}
                  max={50}
                  step={1}
                  placeholder="否 limit"
                  disabled={isLoading || isSaving}
                  value={field.value ?? ""}
                  onChange={(e) => {
                    const value = e.target.valueAsNumber;
                    field.onChange(Number.isFinite(value) ? value : null);
                  }}
                />
              )}
            />
            {errors.chatStyleMaxKeywordsPerSkill && (
              <div class名称="text-xs text-destructive">
                {errors.chatStyleMaxKeywordsPerSkill.message as string}
              </div>
            )}
            <div class名称="text-xs text-muted-foreground">
              Caps keywords per skill category. Overrides any keyword limits in
              Constraints.
            </div>
            <div class名称="text-xs text-muted-foreground">
              Current:{" "}
              <span class名称="font-mono">
                {maxKeywordsPerSkill.effective ?? "—"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </设置SectionFrame>
  );
};
