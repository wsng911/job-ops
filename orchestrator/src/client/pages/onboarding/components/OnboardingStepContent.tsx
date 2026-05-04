import type { LlmProviderId } from "@client/pages/settings/utils";
import type { 搜索TermsSuggestionResponse } from "@shared/types.js";
import type React from "react";
import type { Control } from "react-hook-form";
import type {
  BasicAuthChoice,
  OnboardingFormData,
  ResumeSetupMode,
  StepId,
  ValidationState,
} from "../types";
import { BaseResumeStep } from "./BaseResumeStep";
import { BasicAuthStep } from "./BasicAuthStep";
import { LlmConnectionStep } from "./LlmConnectionStep";
import { 搜索TermsStep } from "./搜索TermsStep";

export const OnboardingStepContent: React.FC<{
  baseResumeValidation: ValidationState;
  baseResumeValue: string | null;
  basicAuthChoice: BasicAuthChoice;
  basicAuth密码: string;
  basicAuthUser: string;
  control: Control<OnboardingFormData>;
  currentStep: StepId;
  isBusy: boolean;
  isImportingResume: boolean;
  isGenerating搜索Terms: boolean;
  isResumeReady: boolean;
  isRxResumeSelfHosted: boolean;
  has保存d搜索TermsInSession: boolean;
  llmKeyHint: string | null;
  llmValidation: ValidationState;
  resumeSetupMode: ResumeSetupMode;
  rxresumeApiKey: string;
  rxresumeApiKeyHint: string | null | undefined;
  rxresumeUrl: string;
  rxresumeValidation: ValidationState;
  searchTermDraft: string;
  searchTerms: string[];
  searchTermsSource: 搜索TermsSuggestionResponse["source"] | null;
  searchTermsStale: boolean;
  selectedProvider: LlmProviderId;
  onBasicAuthChoiceChange: (choice: BasicAuthChoice) => void;
  onBasicAuth密码Change: (value: string) => void;
  onBasicAuthUserChange: (value: string) => void;
  onImportResumeFile: (file: File) => Promise<void>;
  onRegenerate搜索Terms: () => Promise<void>;
  onRxresumeApiKeyChange: (value: string) => void;
  onRxresumeSelfHostedChange: (next: boolean) => void;
  onRxresumeUrlChange: (value: string) => void;
  onResumeSetupModeChange: (mode: ResumeSetupMode) => void;
  on搜索TermDraftChange: (value: string) => void;
  on搜索TermsChange: (values: string[]) => void;
  onTemplateResumeChange: (value: string | null) => void;
}> = (props) => {
  if (props.currentStep === "llm") {
    return (
      <LlmConnectionStep
        control={props.control}
        isBusy={props.isBusy}
        llmKeyHint={props.llmKeyHint}
        selectedProvider={props.selectedProvider}
        validation={props.llmValidation}
      />
    );
  }

  if (props.currentStep === "baseresume") {
    return (
      <BaseResumeStep
        baseResumeValidation={props.baseResumeValidation}
        baseResumeValue={props.baseResumeValue}
        hasRxResumeAccess={props.rxresumeValidation.valid}
        isBusy={props.isBusy}
        isImportingResume={props.isImportingResume}
        isResumeReady={props.isResumeReady}
        isRxResumeSelfHosted={props.isRxResumeSelfHosted}
        resumeSetupMode={props.resumeSetupMode}
        rxresumeApiKey={props.rxresumeApiKey}
        rxresumeApiKeyHint={props.rxresumeApiKeyHint}
        rxresumeUrl={props.rxresumeUrl}
        rxresumeValidation={props.rxresumeValidation}
        onImportResumeFile={props.onImportResumeFile}
        onResumeSetupModeChange={props.onResumeSetupModeChange}
        onRxresumeApiKeyChange={props.onRxresumeApiKeyChange}
        onRxresumeSelfHostedChange={props.onRxresumeSelfHostedChange}
        onRxresumeUrlChange={props.onRxresumeUrlChange}
        onTemplateResumeChange={props.onTemplateResumeChange}
      />
    );
  }

  if (props.currentStep === "searchterms") {
    return (
      <搜索TermsStep
        has保存d搜索TermsInSession={props.has保存d搜索TermsInSession}
        isBusy={props.isBusy}
        isGenerating搜索Terms={props.isGenerating搜索Terms}
        searchTermDraft={props.searchTermDraft}
        searchTerms={props.searchTerms}
        searchTermsSource={props.searchTermsSource}
        searchTermsStale={props.searchTermsStale}
        onRegenerate={props.onRegenerate搜索Terms}
        on搜索TermDraftChange={props.on搜索TermDraftChange}
        on搜索TermsChange={props.on搜索TermsChange}
      />
    );
  }

  return (
    <BasicAuthStep
      basicAuthChoice={props.basicAuthChoice}
      basicAuth密码={props.basicAuth密码}
      basicAuthUser={props.basicAuthUser}
      isBusy={props.isBusy}
      onBasicAuthChoiceChange={props.onBasicAuthChoiceChange}
      onBasicAuth密码Change={props.onBasicAuth密码Change}
      onBasicAuthUserChange={props.onBasicAuthUserChange}
    />
  );
};
