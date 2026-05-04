import * as api from "@client/api";
import { fileToDataUrl } from "@client/components/design-resume/utils";
import { useDemoInfo } from "@client/hooks/useDemoInfo";
import { useRxResumeConfigState } from "@client/hooks/useRxResumeConfigState";
import { use设置 } from "@client/hooks/use设置";
import {
  hasCompletedBasicAuthOnboarding,
  isOnboardingComplete,
} from "@client/lib/onboarding";
import { queryKeys } from "@client/lib/queryKeys";
import {
  getRxResumeCredentialDrafts,
  getRxResumeMissingCredentialLabels,
  validateAndMaybePersistRxResumeMode,
} from "@client/lib/rxresume-config";
import {
  getLlmProviderConfig,
  normalizeLlmProvider,
} from "@client/pages/settings/utils";
import { getDefaultModelForProvider } from "@shared/settings-registry";
import type { 更新设置Input } from "@shared/settings-schema.js";
import type {
  App设置,
  搜索TermsSuggestionResponse,
  ValidationResult,
} from "@shared/types.js";
import { normalize搜索Terms } from "@shared/utils/search-terms";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { formatUserFacingError } from "@/client/lib/error-format";
import { showErrorToast } from "@/client/lib/error-toast";
import { EMPTY_VALIDATION_STATE, STEP_COPY } from "./content";
import type {
  BasicAuthChoice,
  OnboardingFormData,
  OnboardingStep,
  ResumeSetupMode,
  StepId,
  ValidationState,
} from "./types";

export function useOnboardingFlow() {
  const queryClient = useQueryClient();
  const { settings, isLoading: settingsLoading } = use设置();
  const { storedRxResume, setBaseResumeId, syncBaseResumeId } =
    useRxResumeConfigState(settings);
  const demoInfo = useDemoInfo();
  const demoMode = demoInfo?.demoMode ?? false;

  const [isSaving, setIsSaving] = useState(false);
  const [isValidatingLlm, setIsValidatingLlm] = useState(false);
  const [isValidatingRxresume, setIsValidatingRxresume] = useState(false);
  const [isValidatingBaseResume, setIsValidatingBaseResume] = useState(false);
  const [isImportingResume, setIsImportingResume] = useState(false);
  const [isGenerating搜索Terms, setIsGenerating搜索Terms] = useState(false);
  const [llmValidation, setLlmValidation] = useState<ValidationState>(
    EMPTY_VALIDATION_STATE,
  );
  const [rxresumeValidation, setRxresumeValidation] = useState<ValidationState>(
    EMPTY_VALIDATION_STATE,
  );
  const [baseResumeValidation, setBaseResumeValidation] =
    useState<ValidationState>(EMPTY_VALIDATION_STATE);
  const [basicAuthChoice, setBasicAuthChoice] =
    useState<BasicAuthChoice>("enable");
  const [isRxResumeSelfHosted, setIsRxResumeSelfHosted] = useState(false);
  const [resumeSetupMode, setResumeSetupMode] =
    useState<ResumeSetupMode>("upload");
  const [searchTerms保存d, set搜索Terms保存d] = useState(false);
  const [has保存d搜索TermsInSession, setHas保存d搜索TermsInSession] =
    useState(false);
  const [searchTermsSource, set搜索TermsSource] = useState<
    搜索TermsSuggestionResponse["source"] | null
  >(null);
  const [searchTermsStale, set搜索TermsStale] = useState(false);
  const [currentStep, setCurrentStep] = useState<StepId | null>(null);
  const resumeSetupModeTouchedRef = useRef(false);
  const searchTermsOverrideKeyRef = useRef<string | null>(null);
  const autoSuggestionAttemptedRef = useRef(false);

  const { control, getValues, reset, setValue, watch } =
    useForm<OnboardingFormData>({
      defaultValues: {
        llmProvider: "",
        llmBaseUrl: "",
        llmApiKey: "",
        pdfRenderer: "latex",
        rxresumeUrl: "",
        rxresumeApiKey: "",
        rxresumeBaseResumeId: null,
        searchTerms: [],
        searchTermDraft: "",
        basicAuthUser: "",
        basicAuth密码: "",
      },
    });

  const sync设置Cache = useCallback(
    (next设置: App设置) => {
      queryClient.setQueryData(queryKeys.settings.current(), next设置);
    },
    [queryClient],
  );

  useEffect(() => {
    if (!settings) return;

    const selectedId = syncBaseResumeId();
    const searchTermsOverride = settings.searchTerms?.override ?? null;
    const hasExplicit搜索TermsOverride =
      Array.isArray(searchTermsOverride) && searchTermsOverride.length > 0;
    const searchTermsOverrideKey = JSON.stringify(searchTermsOverride);
    setLlmValidation(EMPTY_VALIDATION_STATE);
    setRxresumeValidation(EMPTY_VALIDATION_STATE);
    setBaseResumeValidation(EMPTY_VALIDATION_STATE);
    reset({
      llmProvider: settings.llmProvider?.value || "",
      llmBaseUrl: settings.llmBaseUrl?.value || "",
      llmApiKey: "",
      pdfRenderer: selectedId ? "rxresume" : "latex",
      rxresumeUrl: settings.rxresumeUrl ?? "",
      rxresumeApiKey: "",
      rxresumeBaseResumeId: selectedId,
      searchTerms: settings.searchTerms?.value ?? [],
      searchTermDraft: "",
      basicAuthUser: settings.basicAuthUser ?? "",
      basicAuth密码: "",
    });
    setBasicAuthChoice(
      settings.basicAuthActive
        ? "enable"
        : settings.onboardingBasicAuthDecision === "skipped"
          ? "skip"
          : "enable",
    );
    setIsRxResumeSelfHosted(Boolean(settings.rxresumeUrl));
    if (!resumeSetupModeTouchedRef.current) {
      setResumeSetupMode(selectedId ? "rxresume" : "upload");
    }
    if (searchTermsOverrideKeyRef.current !== searchTermsOverrideKey) {
      searchTermsOverrideKeyRef.current = searchTermsOverrideKey;
      set搜索Terms保存d(hasExplicit搜索TermsOverride);
      setHas保存d搜索TermsInSession(hasExplicit搜索TermsOverride);
      set搜索TermsSource(null);
      set搜索TermsStale(false);
      autoSuggestionAttemptedRef.current = hasExplicit搜索TermsOverride;
    }
  }, [reset, settings, syncBaseResumeId]);

  const llmProvider = watch("llmProvider");
  const selectedProvider = normalizeLlmProvider(
    llmProvider || settings?.llmProvider?.value || "openrouter",
  );
  const providerConfig = getLlmProviderConfig(selectedProvider);
  const {
    normalizedProvider,
    showApiKey,
    showBaseUrl,
    requiresApiKey: requiresLlmKey,
  } = providerConfig;

  const llmKeyHint = settings?.llmApiKeyHint ?? null;
  const hasLlmKey = Boolean(llmKeyHint);
  const llmValidated = llmValidation.valid;
  const searchTermsOverride = settings?.searchTerms?.override ?? null;
  const hasExplicit搜索TermsOverride = Boolean(
    Array.isArray(searchTermsOverride) && searchTermsOverride.length > 0,
  );
  const searchTermsComplete = searchTerms保存d && !searchTermsStale;
  const basicAuthComplete = hasCompletedBasicAuthOnboarding(settings);

  const toValidationState = useCallback(
    (
      result: ValidationResult,
      options?: {
        markChecked?: boolean;
      },
    ): ValidationState => ({
      ...result,
      checked: options?.markChecked ?? true,
      hydrated: true,
    }),
    [],
  );

  const validateLlm = useCallback(
    async (options?: { markChecked?: boolean }) => {
      const values = getValues();

      setIsValidatingLlm(true);
      try {
        const result = await api.validateLlm({
          provider: selectedProvider,
          baseUrl: showBaseUrl
            ? values.llmBaseUrl.trim() || undefined
            : undefined,
          apiKey: requiresLlmKey
            ? values.llmApiKey.trim() || undefined
            : undefined,
        });
        setLlmValidation(toValidationState(result, options));
        return result;
      } catch (error) {
        const result = {
          valid: false,
          message: formatUserFacingError(error, "LLM validation failed"),
        };
        setLlmValidation(toValidationState(result, options));
        return result;
      } finally {
        setIsValidatingLlm(false);
      }
    },
    [
      getValues,
      requiresLlmKey,
      selectedProvider,
      showBaseUrl,
      toValidationState,
    ],
  );

  const validateBaseResume = useCallback(
    async (options?: { markChecked?: boolean }) => {
      setIsValidatingBaseResume(true);
      try {
        const result = await api.validateResumeConfig();
        setBaseResumeValidation(toValidationState(result, options));
        return result;
      } catch (error) {
        const result = {
          valid: false,
          message:
            error instanceof Error
              ? error.message
              : "Base resume validation failed",
        };
        setBaseResumeValidation(toValidationState(result, options));
        return result;
      } finally {
        setIsValidatingBaseResume(false);
      }
    },
    [toValidationState],
  );

  const validateRxresume = useCallback(
    async (options?: { markChecked?: boolean }) => {
      setIsValidatingRxresume(true);
      try {
        const preserveBlankFields = isRxResumeSelfHosted
          ? undefined
          : (["baseUrl"] as const);
        const result = await validateAndMaybePersistRxResumeMode({
          stored: storedRxResume,
          draft: getRxResumeCredentialDrafts({
            ...getValues(),
            rxresumeUrl: isRxResumeSelfHosted ? getValues().rxresumeUrl : "",
          }),
          validationPayloadOptions: preserveBlankFields
            ? {
                preserveBlankFields: [...preserveBlankFields],
              }
            : undefined,
          validate: api.validateRxresume,
          getPrecheckMessage: () =>
            "v5 API key required. 添加 a v5 API key, then test again.",
          getValidationErrorMessage: (error: unknown) =>
            error instanceof Error
              ? error.message
              : "RxResume validation failed",
        });
        setRxresumeValidation(toValidationState(result.validation, options));
        return result.validation;
      } finally {
        setIsValidatingRxresume(false);
      }
    },
    [getValues, isRxResumeSelfHosted, storedRxResume, toValidationState],
  );

  useEffect(() => {
    if (!showBaseUrl) {
      setValue("llmBaseUrl", "");
    }
  }, [setValue, showBaseUrl]);

  useEffect(() => {
    if (!selectedProvider) return;
    setLlmValidation(EMPTY_VALIDATION_STATE);
  }, [selectedProvider]);

  const runAllValidations = useCallback(async () => {
    if (!settings || demoMode) return;

    const validations: Promise<ValidationResult>[] = [
      validateLlm({ markChecked: false }),
      validateRxresume({ markChecked: false }),
      validateBaseResume({ markChecked: false }),
    ];
    await Promise.allSettled(validations);
  }, [demoMode, settings, validateBaseResume, validateLlm, validateRxresume]);

  useEffect(() => {
    if (demoMode || !settings || settingsLoading) return;

    const needsValidation =
      !llmValidation.hydrated ||
      !rxresumeValidation.hydrated ||
      !baseResumeValidation.hydrated;
    if (!needsValidation) return;

    void runAllValidations();
  }, [
    baseResumeValidation.hydrated,
    demoMode,
    llmValidation.hydrated,
    runAllValidations,
    rxresumeValidation.hydrated,
    settings,
    settingsLoading,
  ]);

  const steps = useMemo<OnboardingStep[]>(
    () => [
      {
        id: "llm",
        label: "LLM",
        subtitle: "Provider, credentials, and endpoint",
        complete: llmValidated,
        disabled: false,
      },
      {
        id: "baseresume",
        label: "Resume",
        subtitle: "Upload a file or use Reactive Resume",
        complete: baseResumeValidation.valid,
        disabled: false,
      },
      {
        id: "searchterms",
        label: "搜索 terms",
        subtitle: "标题s to search for",
        complete: searchTermsComplete,
        disabled: false,
      },
      {
        id: "basicauth",
        label: "Basic auth",
        subtitle: "Protect write actions or skip",
        complete: basicAuthComplete,
        disabled: false,
      },
    ],
    [
      basicAuthComplete,
      baseResumeValidation.valid,
      llmValidated,
      searchTermsComplete,
    ],
  );

  useEffect(() => {
    if (!steps.length) return;

    setCurrentStep((existing) => {
      if (!existing) return steps[0].id;
      const existingStep = steps.find((step) => step.id === existing);
      if (!existingStep) return steps[0].id;
      return existing;
    });
  }, [steps]);

  const progressValue =
    steps.length > 0
      ? Math.round(
          (steps.filter((step) => step.complete).length / steps.length) * 100,
        )
      : 0;

  const complete = isOnboardingComplete({
    demoMode,
    settings,
    llmValid: llmValidated,
    baseResumeValid: baseResumeValidation.valid,
    searchTermsValid: searchTermsComplete,
  });

  const handle保存Llm = useCallback(async () => {
    const values = getValues();
    const apiKeyValue = values.llmApiKey.trim();
    const baseUrlValue = values.llmBaseUrl.trim();

    if (requiresLlmKey && !apiKeyValue && !hasLlmKey) {
      toast.info("添加 your LLM API key to continue");
      return null;
    }

    const validation = await validateLlm();

    if (!validation.valid) {
      toast.error(validation.message || "LLM validation failed");
      return null;
    }

    const update: Partial<更新设置Input> = {
      llmProvider: normalizedProvider,
      llmBaseUrl: showBaseUrl ? baseUrlValue || null : null,
      model: null,
      modelScorer: null,
      modelTailoring: null,
      modelProjectSelection: null,
    };

    if (showApiKey && apiKeyValue) {
      update.llmApiKey = apiKeyValue;
    }

    try {
      setIsSaving(true);
      const next设置 = await api.update设置(update);
      sync设置Cache(next设置);
      setValue("llmApiKey", "");
      const defaultModel = getDefaultModelForProvider(normalizedProvider);
      toast.success("LLM provider connected", {
        description:
          normalizedProvider === "openai" ||
          normalizedProvider === "gemini" ||
          normalizedProvider === "gemini_cli"
            ? `Default for ${providerConfig.label}: ${defaultModel}.`
            : "You can fine-tune models later in 设置.",
      });
      return next设置;
    } catch (error) {
      showErrorToast(error, "Failed to save LLM settings");
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [
    getValues,
    hasLlmKey,
    normalizedProvider,
    providerConfig.label,
    requiresLlmKey,
    setValue,
    showApiKey,
    showBaseUrl,
    sync设置Cache,
    validateLlm,
  ]);

  const handle保存Rxresume = useCallback(async () => {
    const values = getValues();
    const draftCredentials = getRxResumeCredentialDrafts({
      ...values,
      rxresumeUrl: isRxResumeSelfHosted ? values.rxresumeUrl : "",
    });
    const missing = getRxResumeMissingCredentialLabels({
      stored: storedRxResume,
      draft: draftCredentials,
    });

    if (missing.length > 0) {
      toast.info("Almost there", {
        description: `Missing: ${missing.join(", ")}`,
      });
      return null;
    }

    try {
      setIsValidatingRxresume(true);
      let next设置: App设置 | null = null;
      const preserveBlankFields = isRxResumeSelfHosted
        ? undefined
        : (["baseUrl"] as const);
      const result = await validateAndMaybePersistRxResumeMode({
        stored: storedRxResume,
        draft: draftCredentials,
        validationPayloadOptions: preserveBlankFields
          ? {
              preserveBlankFields: [...preserveBlankFields],
            }
          : undefined,
        validate: api.validateRxresume,
        persist: async (update: Parameters<typeof api.update设置>[0]) => {
          setIsSaving(true);
          try {
            next设置 = await api.update设置({
              ...update,
              pdfRenderer: "rxresume",
              rxresumeBaseResumeId: values.rxresumeBaseResumeId,
            });
            sync设置Cache(next设置);
          } finally {
            setIsSaving(false);
          }
        },
        persistOnSuccess: true,
        getPrecheckMessage: () =>
          "v5 API key required. 添加 a v5 API key, then test again.",
        getValidationErrorMessage: (error: unknown) =>
          formatUserFacingError(error, "RxResume validation failed"),
        getPersistErrorMessage: (error: unknown) =>
          formatUserFacingError(error, "Failed to save RxResume credentials"),
      });

      setRxresumeValidation(toValidationState(result.validation));
      if (!result.validation.valid) {
        toast.error(result.validation.message || "RxResume validation failed");
        return null;
      }

      setValue("rxresumeApiKey", "");
      const resumeValidation = await validateBaseResume();
      if (resumeValidation.valid) {
        toast.success("Reactive Resume connected");
        return next设置 ?? settings;
      }

      toast.info("Reactive Resume connected", {
        description:
          resumeValidation.message ||
          "Choose a template resume to finish this step.",
      });
      return next设置 ?? settings;
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to save RxResume credentials",
      );
      return null;
    } finally {
      setIsValidatingRxresume(false);
      setIsSaving(false);
    }
  }, [
    getValues,
    isRxResumeSelfHosted,
    settings,
    setValue,
    storedRxResume,
    sync设置Cache,
    toValidationState,
    validateBaseResume,
  ]);

  const handleRxresumeSelfHostedChange = useCallback(
    (next: boolean) => {
      setIsRxResumeSelfHosted(next);
      if (!next) {
        setValue("rxresumeUrl", "");
      }
    },
    [setValue],
  );

  const handleResumeSetupModeChange = useCallback((mode: ResumeSetupMode) => {
    resumeSetupModeTouchedRef.current = true;
    setResumeSetupMode(mode);
  }, []);

  const mark搜索TermsStale = useCallback(() => {
    const currentTerms = getValues().searchTerms;
    if (currentTerms.length === 0 && !has保存d搜索TermsInSession) return;
    set搜索Terms保存d(false);
    set搜索TermsStale(true);
    set搜索TermsSource(null);
  }, [getValues, has保存d搜索TermsInSession]);

  const handleGenerate搜索Terms = useCallback(
    async (options?: { showToast?: boolean }) => {
      try {
        setIsGenerating搜索Terms(true);
        const result = await api.suggestOnboarding搜索Terms();
        setValue("searchTerms", result.terms, { shouldDirty: true });
        setValue("searchTermDraft", "");
        set搜索Terms保存d(false);
        set搜索TermsSource(result.source);
        set搜索TermsStale(false);

        if (options?.showToast) {
          toast.success("搜索 terms refreshed", {
            description:
              result.source === "ai"
                ? "Job titles were generated from your current resume."
                : "Job titles were refreshed from a simpler resume-based fallback.",
          });
        }

        return result;
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to suggest search terms",
        );
        return null;
      } finally {
        setIsGenerating搜索Terms(false);
      }
    },
    [setValue],
  );

  useEffect(() => {
    if (currentStep !== "searchterms") return;
    if (hasExplicit搜索TermsOverride) return;
    if (!baseResumeValidation.valid) return;
    if (autoSuggestionAttemptedRef.current) return;

    autoSuggestionAttemptedRef.current = true;
    void handleGenerate搜索Terms();
  }, [
    baseResumeValidation.valid,
    currentStep,
    handleGenerate搜索Terms,
    hasExplicit搜索TermsOverride,
  ]);

  const handle保存BaseResume = useCallback(async () => {
    try {
      const validation = await validateBaseResume();
      if (!validation.valid) {
        toast.error(validation.message || "Base resume validation failed");
        return null;
      }

      toast.success("Resume source is ready");
      return settings ?? null;
    } catch (error) {
      showErrorToast(error, "Failed to validate resume");
      return null;
    }
  }, [settings, validateBaseResume]);

  const handleImportResumeFile = useCallback(
    async (file: File) => {
      try {
        setIsImportingResume(true);
        const dataUrl = await fileToDataUrl(file);
        const match = /^data:([^;]+);base64,(.+)$/s.exec(dataUrl.trim());

        if (!match) {
          throw new Error("Resume file could not be encoded for upload.");
        }

        const document = await api.importDesignResumeFromFile({
          file名称: file.name,
          mediaType: file.type || match[1],
          dataBase64: match[2],
        });

        queryClient.setQueryData(queryKeys.designResume.current(), document);
        queryClient.setQueryData(queryKeys.designResume.status(), {
          exists: true,
          documentId: document.id,
          updatedAt: document.updatedAt,
        });

        if (settings?.pdfRenderer?.value !== "latex") {
          const next设置 = await api.update设置({
            pdfRenderer: "latex",
          });
          sync设置Cache(next设置);
          setValue("pdfRenderer", "latex");
        }

        const validation = await validateBaseResume();
        if (!validation.valid) {
          throw new Error(validation.message || "Resume validation failed.");
        }

        toast.success("Resume uploaded", {
          description:
            settings?.pdfRenderer?.value === "latex"
              ? "Your local Design Resume is ready."
              : "Your local Design Resume is ready and PDF rendering was switched to LaTeX.",
        });
        mark搜索TermsStale();
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to import resume file",
        );
      } finally {
        setIsImportingResume(false);
      }
    },
    [
      queryClient,
      mark搜索TermsStale,
      settings?.pdfRenderer?.value,
      setValue,
      sync设置Cache,
      validateBaseResume,
    ],
  );

  const handle保存搜索Terms = useCallback(async () => {
    const nextTerms = normalize搜索Terms(getValues().searchTerms);

    if (nextTerms.length === 0) {
      toast.info("添加 at least one job title to continue");
      return null;
    }

    try {
      setIsSaving(true);
      const next设置 = await api.update设置({
        searchTerms: nextTerms,
      });
      sync设置Cache(next设置);
      setValue("searchTerms", nextTerms);
      setValue("searchTermDraft", "");
      set搜索Terms保存d(true);
      setHas保存d搜索TermsInSession(true);
      set搜索TermsStale(false);
      toast.success("搜索 terms saved");
      return next设置;
    } catch (error) {
      showErrorToast(error, "Failed to save search terms");
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [getValues, setValue, sync设置Cache]);

  const handleCompleteBasicAuth = useCallback(async () => {
    if (basicAuthChoice === "skip") {
      try {
        setIsSaving(true);
        const next设置 = await api.update设置({
          onboardingBasicAuthDecision: "skipped",
        });
        sync设置Cache(next设置);
        toast.success("Authentication skipped for now");
        return next设置;
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to save onboarding progress",
        );
        return null;
      } finally {
        setIsSaving(false);
      }
    }

    if (basicAuthChoice !== "enable") {
      toast.info("Choose whether to enable authentication or skip it for now");
      return null;
    }

    const { basicAuthUser, basicAuth密码 } = getValues();
    const normalizedUser = basicAuthUser.trim();
    const normalized密码 = basicAuth密码.trim();

    if (!normalizedUser || !normalized密码) {
      toast.info("Enter both a username and password to enable authentication");
      return null;
    }

    try {
      setIsSaving(true);
      const next设置 = await api.update设置({
        enableBasicAuth: true,
        basicAuthUser: normalizedUser,
        basicAuth密码: normalized密码,
        onboardingBasicAuthDecision: "enabled",
      });
      sync设置Cache(next设置);
      setValue("basicAuth密码", "");
      toast.success("Authentication enabled");
      return next设置;
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to save authentication credentials",
      );
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [basicAuthChoice, getValues, setValue, sync设置Cache]);

  const handlePrimaryAction = useCallback(async () => {
    if (!currentStep) return null;
    if (currentStep === "llm") {
      return await handle保存Llm();
    }
    if (currentStep === "baseresume") {
      if (resumeSetupMode === "rxresume") {
        return await handle保存Rxresume();
      }
      return await handle保存BaseResume();
    }
    if (currentStep === "searchterms") {
      return await handle保存搜索Terms();
    }
    return await handleCompleteBasicAuth();
  }, [
    currentStep,
    handleCompleteBasicAuth,
    handle保存BaseResume,
    handle保存Llm,
    handle保存搜索Terms,
    handle保存Rxresume,
    resumeSetupMode,
  ]);

  const stepIndex = currentStep
    ? steps.findIndex((step) => step.id === currentStep)
    : 0;
  const canGo返回 = stepIndex > 0;
  const isBusy =
    isSaving ||
    settingsLoading ||
    isImportingResume ||
    isGenerating搜索Terms ||
    isValidatingLlm ||
    isValidatingRxresume ||
    isValidatingBaseResume;

  const currentCopy = currentStep ? STEP_COPY[currentStep] : STEP_COPY.llm;
  const baseResumeValue = watch("rxresumeBaseResumeId");

  const primaryLabel =
    currentStep === "llm"
      ? llmValidated
        ? "Revalidate connection"
        : "保存 connection"
      : currentStep === "baseresume"
        ? resumeSetupMode === "rxresume"
          ? rxresumeValidation.valid
            ? baseResumeValue
              ? "Recheck Reactive Resume"
              : "确认 Resume Template"
            : "Connect Reactive Resume"
          : baseResumeValidation.valid
            ? "Recheck resume"
            : "Check resume"
        : currentStep === "searchterms"
          ? has保存d搜索TermsInSession
            ? "更新 search terms"
            : "保存 search terms"
          : basicAuthChoice === "enable"
            ? "Enable authentication"
            : basicAuthChoice === "skip"
              ? "Finish onboarding"
              : "Choose an option";

  return {
    baseResumeValidation,
    baseResumeValue,
    basicAuthChoice,
    canGo返回,
    complete,
    control,
    currentCopy,
    currentStep,
    demoMode,
    handleRxresumeSelfHostedChange,
    handleImportResumeFile,
    isBusy,
    isGenerating搜索Terms,
    isImportingResume,
    isRxResumeSelfHosted,
    has保存d搜索TermsInSession,
    llmKeyHint,
    llmValidated,
    llmValidation,
    primaryLabel,
    progressValue,
    resumeSetupMode,
    rxresumeValidation,
    searchTermsComplete,
    searchTermsSource,
    searchTermsStale,
    selectedProvider,
    settings,
    settingsLoading,
    steps,
    watch,
    setCurrentStep,
    setBasicAuthChoice,
    setResumeSetupMode: handleResumeSetupModeChange,
    setValue,
    setBaseResumeId,
    handleRegenerate搜索Terms: async () => {
      await handleGenerate搜索Terms({ showToast: true });
    },
    handle返回: () => {
      if (!canGo返回) return;
      setCurrentStep(steps[stepIndex - 1]?.id ?? currentStep);
    },
    handlePrimaryAction,
    handleTemplateResumeChange: (value: string | null) => {
      const currentValue = getValues().rxresumeBaseResumeId;
      if (currentValue !== value) {
        mark搜索TermsStale();
      }
      setBaseResumeId(value);
      setValue("rxresumeBaseResumeId", value);
    },
  };
}
