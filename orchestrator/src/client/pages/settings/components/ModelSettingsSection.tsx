import * as api from "@client/api";
import { CodexAuthPanel } from "@client/components/CodexAuthPanel";
import { GeminiCliSetupHint } from "@client/components/GeminiCliSetupHint";
import { 设置Input } from "@client/pages/settings/components/设置Input";
import { 设置SectionFrame } from "@client/pages/settings/components/设置SectionFrame";
import type { ModelValues } from "@client/pages/settings/types";
import {
  formatSecretHint,
  getLlmProviderConfig,
  LLM_PROVIDER_LABELS,
  LLM_PROVIDERS,
  supportsLlmModelSuggestions,
} from "@client/pages/settings/utils";
import { getDefaultModelForProvider } from "@shared/settings-registry";
import type { 更新设置Input } from "@shared/settings-schema.js";
import type React from "react";
import { useDeferredValue, useEffect, useRef, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { 搜索ableDropdown } from "@/components/ui/searchable-dropdown";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

type Model设置SectionProps = {
  values: ModelValues;
  isLoading: boolean;
  isSaving: boolean;
  layoutMode?: "accordion" | "panel";
};

function renderKeyHelper(
  helperText: string,
  helperHref: string | null,
  keep保存dKey: boolean,
) {
  return (
    <>
      {helperHref ? (
        <a
          href={helperHref}
          target="_blank"
          rel="noopener noreferrer"
          class名称="underline decoration-border underline-offset-4 transition-colors hover:text-foreground"
        >
          {helperText}
        </a>
      ) : (
        helperText
      )}
      {keep保存dKey ? ". Leave blank to keep the saved key." : null}
    </>
  );
}

export const Model设置Section: React.FC<Model设置SectionProps> = ({
  values,
  isLoading,
  isSaving,
  layoutMode,
}) => {
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [modelsError, setModelsError] = useState<string | null>(null);
  const {
    effective,
    default: defaultModel,
    llmProvider,
    llmBaseUrl,
    llmApiKeyHint,
  } = values;
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors, dirtyFields },
  } = useFormContext<更新设置Input>();

  const selectedProvider = watch("llmProvider") || llmProvider || "openrouter";
  const previousProviderRef = useRef(selectedProvider);
  const providerConfig = getLlmProviderConfig(selectedProvider);
  const { showApiKey, showBaseUrl } = providerConfig;
  const isCodexProvider = providerConfig.normalizedProvider === "codex";
  const isGeminiCliProvider =
    providerConfig.normalizedProvider === "gemini_cli";

  const llmBaseUrlValue = watch("llmBaseUrl");
  const llmApiKeyValue = watch("llmApiKey") ?? "";
  const modelValue = watch("model") ?? "";
  const modelScorerValue = watch("modelScorer") ?? "";
  const modelTailoringValue = watch("modelTailoring") ?? "";
  const modelProjectSelectionValue = watch("modelProjectSelection") ?? "";
  const providerDefaultModel = getDefaultModelForProvider(
    selectedProvider,
    selectedProvider === llmProvider ? defaultModel : undefined,
  );
  const deferredProvider = useDeferredValue(selectedProvider);
  const deferredBaseUrl = useDeferredValue(llmBaseUrlValue ?? "");
  const deferredApiKey = useDeferredValue(llmApiKeyValue);
  const supportsModelSuggestions =
    supportsLlmModelSuggestions(selectedProvider);
  const hasAvailableApiKey = showApiKey
    ? Boolean(deferredApiKey.trim() || llmApiKeyHint)
    : true;

  useEffect(() => {
    if (showBaseUrl) return;
    if (llmBaseUrlValue) {
      setValue("llmBaseUrl", "", { shouldDirty: true });
    }
  }, [setValue, showBaseUrl, llmBaseUrlValue]);

  useEffect(() => {
    if (previousProviderRef.current === selectedProvider) {
      return;
    }

    previousProviderRef.current = selectedProvider;
    if (!dirtyFields.llmProvider) {
      return;
    }

    setValue("model", "", { shouldDirty: true });
    setValue("modelScorer", "", { shouldDirty: true });
    setValue("modelTailoring", "", { shouldDirty: true });
    setValue("modelProjectSelection", "", { shouldDirty: true });
  }, [dirtyFields.llmProvider, selectedProvider, setValue]);

  useEffect(() => {
    if (!supportsModelSuggestions) {
      setAvailableModels([]);
      setModelsError(null);
      setIsLoadingModels(false);
      return;
    }

    if (!hasAvailableApiKey) {
      setAvailableModels([]);
      setModelsError(null);
      setIsLoadingModels(false);
      return;
    }

    let cancelled = false;
    setIsLoadingModels(true);
    setModelsError(null);

    void api
      .getLlmModels({
        provider: deferredProvider,
        baseUrl: showBaseUrl ? deferredBaseUrl.trim() || undefined : undefined,
        apiKey: showApiKey ? deferredApiKey.trim() || undefined : undefined,
      })
      .then((models) => {
        if (cancelled) return;
        setAvailableModels(models);
        setModelsError(null);
      })
      .catch((error) => {
        if (cancelled) return;
        setAvailableModels([]);
        setModelsError(
          error instanceof Error ? error.message : "Failed to load models.",
        );
      })
      .finally(() => {
        if (cancelled) return;
        setIsLoadingModels(false);
      });

    return () => {
      cancelled = true;
    };
  }, [
    deferredApiKey,
    deferredBaseUrl,
    deferredProvider,
    hasAvailableApiKey,
    showApiKey,
    showBaseUrl,
    supportsModelSuggestions,
  ]);

  const keyHint = formatSecretHint(llmApiKeyHint);
  const keyText = showApiKey ? keyHint || "否t set" : "否t required";
  const resolvedBaseUrl = llmBaseUrlValue?.trim() || llmBaseUrl || "-";
  const selectedDefaultModel = modelValue.trim();
  const previewDefaultModel =
    selectedDefaultModel || effective || providerDefaultModel || "-";
  const selectedScoringModel = modelScorerValue.trim();
  const selectedTailoringModel = modelTailoringValue.trim();
  const selectedProjectSelectionModel = modelProjectSelectionValue.trim();
  const scoringModel = selectedScoringModel || previewDefaultModel;
  const tailoringModel = selectedTailoringModel || previewDefaultModel;
  const projectSelectionModel =
    selectedProjectSelectionModel || previewDefaultModel;
  const modelHelper = supportsModelSuggestions
    ? !hasAvailableApiKey
      ? `添加 or save a ${providerConfig.label} API key to load available models.`
      : isLoadingModels
        ? "Loading available models..."
        : modelsError
          ? modelsError
          : availableModels.length > 0
            ? "Choose from the available text-generation models."
            : "否 text-generation models were returned."
    : `Type the exact model name manually, or leave blank to use the ${providerConfig.label} default model.`;
  const defaultModelOptions = buildModelOptions({
    models: availableModels,
    emptyLabel: `Use ${providerConfig.label} default`,
    emptyValue: "",
    fallbackValue: modelValue.trim(),
  });
  const scoringModelOptions = buildModelOptions({
    models: availableModels,
    emptyLabel: "Inherit default model",
    emptyValue: "",
    fallbackValue: modelScorerValue.trim(),
  });
  const tailoringModelOptions = buildModelOptions({
    models: availableModels,
    emptyLabel: "Inherit default model",
    emptyValue: "",
    fallbackValue: modelTailoringValue.trim(),
  });
  const projectSelectionModelOptions = buildModelOptions({
    models: availableModels,
    emptyLabel: "Inherit default model",
    emptyValue: "",
    fallbackValue: modelProjectSelectionValue.trim(),
  });

  return (
    <设置SectionFrame mode={layoutMode} title="Model" value="model">
      <div class名称="space-y-4">
        <div class名称="space-y-4">
          <div class名称="text-sm font-medium">LLM Provider</div>
          <div class名称="grid gap-4 md:grid-cols-2">
            <div class名称="space-y-2">
              <label htmlFor="llmProvider" class名称="text-sm font-medium">
                Provider
              </label>
              <Controller
                name="llmProvider"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value ?? ""}
                    onValueChange={(value) => field.onChange(value)}
                    disabled={isLoading || isSaving}
                  >
                    <SelectTrigger id="llmProvider">
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      {LLM_PROVIDERS.map((provider) => (
                        <SelectItem key={provider} value={provider}>
                          {LLM_PROVIDER_LABELS[provider]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.llmProvider?.message && (
                <p class名称="text-xs text-destructive">
                  {errors.llmProvider.message as string}
                </p>
              )}
              <p class名称="text-xs text-muted-foreground">
                Used for scoring, tailoring, and extraction.
              </p>
              <p class名称="text-xs text-muted-foreground">
                {providerConfig.providerHint}
              </p>
              {isCodexProvider ? (
                <CodexAuthPanel isBusy={isLoading || isSaving} />
              ) : null}
              {isGeminiCliProvider ? <GeminiCliSetupHint /> : null}
            </div>
            {showBaseUrl && (
              <设置Input
                label="LLM base URL"
                inputProps={register("llmBaseUrl")}
                placeholder={providerConfig.baseUrlPlaceholder}
                disabled={isLoading || isSaving}
                error={errors.llmBaseUrl?.message as string | undefined}
                helper={providerConfig.baseUrlHelper}
                current={resolvedBaseUrl}
              />
            )}
            {showApiKey && (
              <设置Input
                label="LLM API key"
                inputProps={register("llmApiKey")}
                type="password"
                placeholder="Enter new key"
                disabled={isLoading || isSaving}
                error={errors.llmApiKey?.message as string | undefined}
                helper={renderKeyHelper(
                  providerConfig.keyHelperText,
                  providerConfig.keyHelperHref,
                  Boolean(keyHint),
                )}
                current={keyHint}
              />
            )}
          </div>
        </div>

        <Separator />

        {supportsModelSuggestions ? (
          <div class名称="space-y-2">
            <label htmlFor="model" class名称="text-sm font-medium">
              Default model
            </label>
            <Controller
              name="model"
              control={control}
              render={({ field }) => (
                <搜索ableDropdown
                  inputId="model"
                  value={field.value ?? ""}
                  options={defaultModelOptions}
                  onValueChange={field.onChange}
                  placeholder={providerDefaultModel || "Select a model"}
                  searchPlaceholder="搜索 models..."
                  emptyText="否 models found."
                  ariaLabel="Default model"
                  disabled={isLoading || isSaving || isLoadingModels}
                  triggerClass名称="h-9 w-full justify-between rounded-md border border-input bg-transparent px-3 text-sm font-normal shadow-sm"
                  contentClass名称="w-[var(--radix-popover-trigger-width)] border-border bg-popover p-0"
                  listClass名称="max-h-64"
                />
              )}
            />
            {errors.model?.message && (
              <p class名称="text-xs text-destructive">
                {errors.model.message as string}
              </p>
            )}
            <div class名称="text-xs text-muted-foreground">{modelHelper}</div>
            <div class名称="text-xs text-muted-foreground">
              Current: <span class名称="font-mono">{previewDefaultModel}</span>
            </div>
          </div>
        ) : (
          <设置Input
            label="Default model"
            inputProps={register("model")}
            placeholder={providerDefaultModel}
            disabled={isLoading || isSaving}
            error={errors.model?.message as string | undefined}
            helper={modelHelper}
            current={previewDefaultModel}
          />
        )}

        <Separator />

        <div class名称="space-y-4">
          <div class名称="text-sm font-medium">Task-Specific Overrides</div>

          <div class名称="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {supportsModelSuggestions ? (
              <>
                <div class名称="space-y-2">
                  <label htmlFor="modelScorer" class名称="text-sm font-medium">
                    Scoring Model
                  </label>
                  <Controller
                    name="modelScorer"
                    control={control}
                    render={({ field }) => (
                      <搜索ableDropdown
                        inputId="modelScorer"
                        value={field.value ?? ""}
                        options={scoringModelOptions}
                        onValueChange={field.onChange}
                        placeholder={
                          previewDefaultModel || "Inherit default model"
                        }
                        searchPlaceholder="搜索 models..."
                        emptyText="否 models found."
                        ariaLabel="Scoring Model"
                        disabled={isLoading || isSaving || isLoadingModels}
                        triggerClass名称="h-9 w-full justify-between rounded-md border border-input bg-transparent px-3 text-sm font-normal shadow-sm"
                        contentClass名称="w-[var(--radix-popover-trigger-width)] border-border bg-popover p-0"
                        listClass名称="max-h-64"
                      />
                    )}
                  />
                  {errors.modelScorer?.message && (
                    <p class名称="text-xs text-destructive">
                      {errors.modelScorer.message as string}
                    </p>
                  )}
                  <div class名称="text-xs text-muted-foreground">
                    Current: <span class名称="font-mono">{scoringModel}</span>
                  </div>
                </div>

                <div class名称="space-y-2">
                  <label
                    htmlFor="modelTailoring"
                    class名称="text-sm font-medium"
                  >
                    Tailoring Model
                  </label>
                  <Controller
                    name="modelTailoring"
                    control={control}
                    render={({ field }) => (
                      <搜索ableDropdown
                        inputId="modelTailoring"
                        value={field.value ?? ""}
                        options={tailoringModelOptions}
                        onValueChange={field.onChange}
                        placeholder={
                          previewDefaultModel || "Inherit default model"
                        }
                        searchPlaceholder="搜索 models..."
                        emptyText="否 models found."
                        ariaLabel="Tailoring Model"
                        disabled={isLoading || isSaving || isLoadingModels}
                        triggerClass名称="h-9 w-full justify-between rounded-md border border-input bg-transparent px-3 text-sm font-normal shadow-sm"
                        contentClass名称="w-[var(--radix-popover-trigger-width)] border-border bg-popover p-0"
                        listClass名称="max-h-64"
                      />
                    )}
                  />
                  {errors.modelTailoring?.message && (
                    <p class名称="text-xs text-destructive">
                      {errors.modelTailoring.message as string}
                    </p>
                  )}
                  <div class名称="text-xs text-muted-foreground">
                    Current: <span class名称="font-mono">{tailoringModel}</span>
                  </div>
                </div>

                <div class名称="space-y-2">
                  <label
                    htmlFor="modelProjectSelection"
                    class名称="text-sm font-medium"
                  >
                    Project Selection Model
                  </label>
                  <Controller
                    name="modelProjectSelection"
                    control={control}
                    render={({ field }) => (
                      <搜索ableDropdown
                        inputId="modelProjectSelection"
                        value={field.value ?? ""}
                        options={projectSelectionModelOptions}
                        onValueChange={field.onChange}
                        placeholder={
                          previewDefaultModel || "Inherit default model"
                        }
                        searchPlaceholder="搜索 models..."
                        emptyText="否 models found."
                        ariaLabel="Project Selection Model"
                        disabled={isLoading || isSaving || isLoadingModels}
                        triggerClass名称="h-9 w-full justify-between rounded-md border border-input bg-transparent px-3 text-sm font-normal shadow-sm"
                        contentClass名称="w-[var(--radix-popover-trigger-width)] border-border bg-popover p-0"
                        listClass名称="max-h-64"
                      />
                    )}
                  />
                  {errors.modelProjectSelection?.message && (
                    <p class名称="text-xs text-destructive">
                      {errors.modelProjectSelection.message as string}
                    </p>
                  )}
                  <div class名称="text-xs text-muted-foreground">
                    Current:{" "}
                    <span class名称="font-mono">{projectSelectionModel}</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <设置Input
                  label="Scoring Model"
                  inputProps={register("modelScorer")}
                  placeholder={previewDefaultModel || "inherit"}
                  disabled={isLoading || isSaving}
                  error={errors.modelScorer?.message as string | undefined}
                  current={scoringModel}
                />

                <设置Input
                  label="Tailoring Model"
                  inputProps={register("modelTailoring")}
                  placeholder={previewDefaultModel || "inherit"}
                  disabled={isLoading || isSaving}
                  error={errors.modelTailoring?.message as string | undefined}
                  current={tailoringModel}
                />

                <设置Input
                  label="Project Selection Model"
                  inputProps={register("modelProjectSelection")}
                  placeholder={previewDefaultModel || "inherit"}
                  disabled={isLoading || isSaving}
                  error={
                    errors.modelProjectSelection?.message as string | undefined
                  }
                  current={projectSelectionModel}
                />
              </>
            )}
          </div>
        </div>

        <Separator />

        <div class名称="space-y-3 text-sm">
          <div class名称="text-xs text-muted-foreground">Resolved config</div>
          <div class名称="grid gap-x-4 gap-y-2 text-xs sm:grid-cols-[160px_1fr]">
            <div class名称="text-muted-foreground">Provider</div>
            <div class名称="font-mono">{selectedProvider || "-"}</div>

            <div class名称="text-muted-foreground">Base URL</div>
            <div class名称="font-mono">{resolvedBaseUrl}</div>

            <div class名称="text-muted-foreground">API key</div>
            <div class名称="font-mono">{keyText}</div>

            <div class名称="text-muted-foreground">Default model</div>
            <div class名称="font-mono">{previewDefaultModel}</div>

            <div class名称="text-muted-foreground">Scoring model</div>
            <div class名称="font-mono">
              {selectedScoringModel ? scoringModel : "inherits"}
            </div>

            <div class名称="text-muted-foreground">Tailoring model</div>
            <div class名称="font-mono">
              {selectedTailoringModel ? tailoringModel : "inherits"}
            </div>

            <div class名称="text-muted-foreground">Project selection</div>
            <div class名称="font-mono">
              {selectedProjectSelectionModel
                ? projectSelectionModel
                : "inherits"}
            </div>
          </div>
        </div>
      </div>
    </设置SectionFrame>
  );
};

function buildModelOptions(input: {
  models: string[];
  emptyLabel: string;
  emptyValue: string;
  fallbackValue?: string;
}) {
  const options = [
    {
      value: input.emptyValue,
      label: input.emptyLabel,
      searchText: input.emptyLabel,
    },
    ...input.models.map((model) => ({
      value: model,
      label: model,
      searchText: model,
    })),
  ];

  const fallbackValue = input.fallbackValue?.trim();
  if (
    fallbackValue &&
    !options.some((option) => option.value === fallbackValue)
  ) {
    options.unshift({
      value: fallbackValue,
      label: fallbackValue,
      searchText: `${fallbackValue} custom`,
    });
  }

  return options;
}
