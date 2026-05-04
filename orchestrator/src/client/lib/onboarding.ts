import type { App设置 } from "@shared/types";

type OnboardingStepId = "llm" | "baseresume" | "searchterms" | "basicauth";

export function hasCompletedBasicAuthOnboarding(
  settings: App设置 | null | undefined,
): boolean {
  return Boolean(
    settings?.basicAuthActive || settings?.onboardingBasicAuthDecision !== null,
  );
}

export function has保存d搜索TermsOnboarding(
  settings: App设置 | null | undefined,
): boolean {
  return Boolean(
    Array.isArray(settings?.searchTerms?.override) &&
      settings.searchTerms.override.length > 0,
  );
}

export function isOnboardingComplete(input: {
  demoMode: boolean;
  settings: App设置 | null | undefined;
  llmValid: boolean;
  baseResumeValid: boolean;
  searchTermsValid?: boolean;
  completedStepId?: OnboardingStepId | null;
}): boolean {
  if (input.demoMode) return true;
  if (!input.settings) return false;

  const llmValid = input.completedStepId === "llm" ? true : input.llmValid;
  const baseResumeValid =
    input.completedStepId === "baseresume" ? true : input.baseResumeValid;
  const searchTermsValid =
    input.completedStepId === "searchterms"
      ? true
      : (input.searchTermsValid ??
        has保存d搜索TermsOnboarding(input.settings));

  return Boolean(
    llmValid &&
      baseResumeValid &&
      searchTermsValid &&
      hasCompletedBasicAuthOnboarding(input.settings),
  );
}
