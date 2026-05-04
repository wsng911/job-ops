import { CodexAuthPanel } from "@client/components/CodexAuthPanel";
import { GeminiCliSetupHint } from "@client/components/GeminiCliSetupHint";
import { 设置Input } from "@client/pages/settings/components/设置Input";
import {
  getLlmProviderConfig,
  LLM_PROVIDER_LABELS,
  LLM_PROVIDERS,
  type LlmProviderId,
} from "@client/pages/settings/utils";
import type React from "react";
import { type Control, Controller } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { OnboardingFormData, ValidationState } from "../types";
import { InlineValidation } from "./InlineValidation";

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

export const LlmConnectionStep: React.FC<{
  control: Control<OnboardingFormData>;
  isBusy: boolean;
  llmKeyHint: string | null;
  selectedProvider: LlmProviderId;
  validation: ValidationState;
}> = ({ control, isBusy, llmKeyHint, selectedProvider, validation }) => {
  const providerConfig = getLlmProviderConfig(selectedProvider);
  const { showApiKey, showBaseUrl } = providerConfig;
  const isCodexProvider = providerConfig.normalizedProvider === "codex";
  const isGeminiCliProvider =
    providerConfig.normalizedProvider === "gemini_cli";

  return (
    <div class名称="space-y-6">
      <div class名称="grid gap-5 lg:grid-cols-2">
        <div class名称="space-y-2">
          <label htmlFor="llmProvider" class名称="text-sm font-medium">
            Provider
          </label>
          <Controller
            name="llmProvider"
            control={control}
            render={({ field }) => (
              <Select
                value={selectedProvider}
                onValueChange={(value) => field.onChange(value)}
                disabled={isBusy}
              >
                <SelectTrigger id="llmProvider" class名称="h-10">
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
          <p class名称="text-sm text-muted-foreground">
            {providerConfig.providerHint}
          </p>
          {isCodexProvider ? <CodexAuthPanel isBusy={isBusy} /> : null}
          {isGeminiCliProvider ? <GeminiCliSetupHint /> : null}
        </div>

        {showBaseUrl ? (
          <Controller
            name="llmBaseUrl"
            control={control}
            render={({ field }) => (
              <设置Input
                label="Base URL"
                inputProps={{
                  name: "llmBaseUrl",
                  value: field.value,
                  onChange: field.onChange,
                }}
                placeholder={providerConfig.baseUrlPlaceholder}
                helper={providerConfig.baseUrlHelper}
                disabled={isBusy}
              />
            )}
          />
        ) : null}
      </div>

      <div class名称="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
        {showApiKey ? (
          <Controller
            name="llmApiKey"
            control={control}
            render={({ field }) => (
              <设置Input
                label="API key"
                inputProps={{
                  name: "llmApiKey",
                  value: field.value,
                  onChange: field.onChange,
                }}
                type="password"
                placeholder="Paste a new key"
                helper={renderKeyHelper(
                  providerConfig.keyHelperText,
                  providerConfig.keyHelperHref,
                  Boolean(llmKeyHint),
                )}
                disabled={isBusy}
              />
            )}
          />
        ) : (
          <div class名称="rounded-lg border border-dashed border-border/60 bg-muted/20 px-4 py-4 text-sm text-muted-foreground">
            否 API key is required for this provider.
          </div>
        )}
      </div>

      <InlineValidation
        state={validation}
        successMessage={`${providerConfig.label} connection verified.`}
      />
    </div>
  );
};
