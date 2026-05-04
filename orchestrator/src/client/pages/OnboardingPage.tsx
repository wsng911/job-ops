import { PageHeader, PageMain } from "@client/components/layout";
import { useOnboardingRequirement } from "@client/hooks/useOnboardingRequirement";
import { isOnboardingComplete } from "@client/lib/onboarding";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import type React from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  Card描述,
  CardHeader,
  Card标题,
} from "@/components/ui/card";
import { OnboardingStepContent } from "./onboarding/components/OnboardingStepContent";
import { OnboardingStepRail } from "./onboarding/components/OnboardingStepRail";
import { useOnboardingFlow } from "./onboarding/useOnboardingFlow";

export const OnboardingPage: React.FC = () => {
  const flow = useOnboardingFlow();
  const onboardingRequirement = useOnboardingRequirement();
  const navigate = useNavigate();

  if (flow.demoMode) {
    return <Navigate to="/jobs/ready" replace />;
  }

  if (!onboardingRequirement.checking && onboardingRequirement.complete) {
    return <Navigate to="/jobs/ready" replace />;
  }

  return (
    <>
      <PageHeader
        icon={Sparkles}
        title="Onboarding"
        subtitle="Connect your workspace before the pipeline starts running."
      />

      <PageMain class名称="space-y-4">
        <div class名称="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
          <Card class名称="border-border/60 bg-card/40 shadow-none">
            <CardHeader class名称="space-y-3">
              <Card标题>Getting started</Card标题>
            </CardHeader>
            <CardContent class名称="space-y-4">
              <OnboardingStepRail
                currentStep={flow.currentStep}
                onStepSelect={flow.setCurrentStep}
                progressValue={flow.progressValue}
                steps={flow.steps}
              />
            </CardContent>
          </Card>

          <Card class名称="border-border/60 bg-card/40 shadow-none">
            {flow.settingsLoading || !flow.currentStep ? (
              <CardContent class名称="flex min-h-[24rem] items-center justify-center text-sm text-muted-foreground">
                Loading onboarding...
              </CardContent>
            ) : (
              <form
                class名称="flex min-h-[32rem] flex-col"
                on提交={async (event) => {
                  event.preventDefault();
                  const saved设置 = await flow.handlePrimaryAction();

                  if (
                    saved设置 &&
                    isOnboardingComplete({
                      demoMode: flow.demoMode,
                      settings: saved设置,
                      llmValid: flow.llmValidated,
                      baseResumeValid: flow.baseResumeValidation.valid,
                      searchTermsValid: flow.searchTermsComplete,
                      completedStepId: flow.currentStep,
                    })
                  ) {
                    navigate("/jobs/ready", { replace: true });
                  }
                }}
              >
                <CardHeader class名称="space-y-4 border-b border-border/60">
                  <div class名称="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="secondary">
                      {flow.currentCopy.eyebrow}
                    </Badge>
                    <span>
                      {flow.steps.filter((step) => step.complete).length} of{" "}
                      {flow.steps.length} complete
                    </span>
                  </div>
                  <div class名称="space-y-2">
                    <Card标题 class名称="text-2xl leading-tight sm:text-3xl">
                      {flow.currentCopy.title}
                    </Card标题>
                    <Card描述 class名称="max-w-2xl leading-6">
                      {flow.currentCopy.description}
                    </Card描述>
                  </div>
                </CardHeader>

                <CardContent class名称="flex flex-1 flex-col gap-6 pt-6">
                  <OnboardingStepContent
                    baseResumeValidation={flow.baseResumeValidation}
                    baseResumeValue={flow.baseResumeValue}
                    basicAuthChoice={flow.basicAuthChoice}
                    basicAuth密码={flow.watch("basicAuth密码")}
                    basicAuthUser={flow.watch("basicAuthUser")}
                    control={flow.control}
                    currentStep={flow.currentStep}
                    has保存d搜索TermsInSession={
                      flow.has保存d搜索TermsInSession
                    }
                    isBusy={flow.isBusy}
                    isGenerating搜索Terms={flow.isGenerating搜索Terms}
                    isImportingResume={flow.isImportingResume}
                    isResumeReady={flow.baseResumeValidation.valid}
                    isRxResumeSelfHosted={flow.isRxResumeSelfHosted}
                    llmKeyHint={flow.llmKeyHint}
                    llmValidation={flow.llmValidation}
                    resumeSetupMode={flow.resumeSetupMode}
                    rxresumeApiKey={flow.watch("rxresumeApiKey")}
                    rxresumeApiKeyHint={flow.settings?.rxresumeApiKeyHint}
                    rxresumeUrl={flow.watch("rxresumeUrl")}
                    rxresumeValidation={flow.rxresumeValidation}
                    searchTermDraft={flow.watch("searchTermDraft")}
                    searchTerms={flow.watch("searchTerms")}
                    searchTermsSource={flow.searchTermsSource}
                    searchTermsStale={flow.searchTermsStale}
                    selectedProvider={flow.selectedProvider}
                    onBasicAuthChoiceChange={flow.setBasicAuthChoice}
                    onBasicAuth密码Change={(value) =>
                      flow.setValue("basicAuth密码", value)
                    }
                    onBasicAuthUserChange={(value) =>
                      flow.setValue("basicAuthUser", value)
                    }
                    onImportResumeFile={flow.handleImportResumeFile}
                    onRegenerate搜索Terms={flow.handleRegenerate搜索Terms}
                    onResumeSetupModeChange={flow.setResumeSetupMode}
                    onRxresumeApiKeyChange={(value) =>
                      flow.setValue("rxresumeApiKey", value)
                    }
                    onRxresumeSelfHostedChange={
                      flow.handleRxresumeSelfHostedChange
                    }
                    onRxresumeUrlChange={(value) =>
                      flow.setValue("rxresumeUrl", value)
                    }
                    on搜索TermDraftChange={(value) =>
                      flow.setValue("searchTermDraft", value)
                    }
                    on搜索TermsChange={(values) =>
                      flow.setValue("searchTerms", values, {
                        shouldDirty: true,
                      })
                    }
                    onTemplateResumeChange={flow.handleTemplateResumeChange}
                  />
                </CardContent>

                <div class名称="flex flex-col gap-3 border-t border-border/60 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={flow.handle返回}
                    disabled={!flow.canGo返回 || flow.isBusy}
                  >
                    <ArrowLeft class名称="h-4 w-4" />
                    返回
                  </Button>

                  <div class名称="flex flex-col items-start gap-2 sm:items-end">
                    <Button type="submit" disabled={flow.isBusy}>
                      {flow.primaryLabel}
                      <ArrowRight class名称="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </Card>
        </div>
      </PageMain>
    </>
  );
};
