import * as api from "@client/api";
import { PageHeader } from "@client/components/layout";
import { use更新设置Mutation } from "@client/hooks/queries/use设置Mutation";
import { useRxResumeConfigState } from "@client/hooks/useRxResumeConfigState";
import { useTracerReadiness } from "@client/hooks/useTracerReadiness";
import {
  getRxResumeCredentialDrafts,
  getRxResumeCredentialPrecheckFailure,
  isRxResumeAvailabilityValidationFailure,
  isRxResumeBlockingValidationFailure,
  RXRESUME_PRECHECK_MESSAGES,
  toRxResumeValidationPayload,
  validateAndMaybePersistRxResumeMode,
} from "@client/lib/rxresume-config";
import { 返回up设置Section } from "@client/pages/settings/components/返回up设置Section";
import { Chat设置Section } from "@client/pages/settings/components/Chat设置Section";
import { DangerZoneSection } from "@client/pages/settings/components/DangerZoneSection";
import { Display设置Section } from "@client/pages/settings/components/Display设置Section";
import { Environment设置Section } from "@client/pages/settings/components/Environment设置Section";
import { Model设置Section } from "@client/pages/settings/components/Model设置Section";
import { PromptTemplatesSection } from "@client/pages/settings/components/PromptTemplatesSection";
import { ReactiveResumeSection } from "@client/pages/settings/components/ReactiveResumeSection";
import { Scoring设置Section } from "@client/pages/settings/components/Scoring设置Section";
import { TracerLinks设置Section } from "@client/pages/settings/components/TracerLinks设置Section";
import { WebhooksSection } from "@client/pages/settings/components/WebhooksSection";
import {
  type LlmProviderId,
  normalizeLlmProvider,
  resumeProjectsEqual,
} from "@client/pages/settings/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { normalizeStringArray } from "@shared/normalize-string-array.js";
import {
  type 更新设置Input,
  update设置Schema,
} from "@shared/settings-schema.js";
import type {
  App设置,
  Job状态,
  ResumeProjectCatalogItem,
  ResumeProjects设置,
  ValidationResult,
} from "@shared/types.js";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { 搜索, 设置 } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FormProvider,
  type Resolver,
  useForm,
  useWatch,
} from "react-hook-form";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useQueryErrorToast } from "@/client/hooks/useQueryErrorToast";
import { formatUserFacingError } from "@/client/lib/error-format";
import { showErrorToast } from "@/client/lib/error-toast";
import { queryKeys } from "@/client/lib/queryKeys";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const DEFAULT_FORM_VALUES: 更新设置Input = {
  model: "",
  modelScorer: "",
  modelTailoring: "",
  modelProjectSelection: "",
  llmProvider: null,
  llmBaseUrl: "",
  llmApiKey: "",
  pipelineWebhookUrl: "",
  jobCompleteWebhookUrl: "",
  resumeProjects: null,
  pdfRenderer: "rxresume",
  rxresumeBaseResumeId: null,
  showSponsorInfo: null,
  renderMarkdownInJob描述s: null,
  chatStyleTone: "",
  chatStyleFormality: "",
  chatStyleConstraints: "",
  chatStyleDo否tUse: "",
  ghostwriterStopSlopEnabled: null,
  chatStyleSummaryMaxWords: null,
  chatStyleMaxKeywordsPerSkill: null,
  chatStyleLanguageMode: null,
  chatStyleManualLanguage: null,
  rxresumeUrl: "",
  rxresumeApiKey: "",
  basicAuthUser: "",
  basicAuth密码: "",
  ukvisajobs邮箱: "",
  ukvisajobs密码: "",
  adzunaAppId: "",
  adzunaAppKey: "",
  webhookSecret: "",
  enableBasicAuth: false,
  backupEnabled: null,
  backupHour: null,
  backupMaxCount: null,
  penalizeMissingSalary: null,
  missingSalaryPenalty: null,
  autoSkipScoreThreshold: null,
  blocked公司Keywords: [],
  scoringInstructions: "",
  ghostwriterSystemPromptTemplate: "",
  tailoringPromptTemplate: "",
  scoringPromptTemplate: "",
};

type LlmProviderValue = LlmProviderId | null;
type RxResumeValidationBadgeState = {
  checked: boolean;
  valid: boolean;
  message: string | null;
  status: number | null;
};
const EMPTY_RXRESUME_VALIDATION_BADGE_STATE: RxResumeValidationBadgeState = {
  checked: false,
  valid: false,
  message: null,
  status: null,
};

type 设置SectionId =
  | "model"
  | "chat"
  | "prompt-templates"
  | "scoring"
  | "reactive-resume"
  | "webhooks"
  | "tracer-links"
  | "environment"
  | "display"
  | "backup"
  | "danger-zone";

type 设置GroupId =
  | "ai"
  | "scoring"
  | "integrations"
  | "workspaces"
  | "display"
  | "backups"
  | "danger";

type 设置SectionDescriptor = {
  id: 设置SectionId;
  label: string;
  description: string;
  searchTerms: string[];
};

type 设置NavGroup = {
  id: 设置GroupId;
  items: 设置SectionDescriptor[];
  label: string;
};

const SETTINGS_NAV_GROUPS: 设置NavGroup[] = [
  {
    id: "ai",
    label: "AI",
    items: [
      {
        id: "model",
        label: "Models",
        description: "Provider, API credentials, and task-specific overrides.",
        searchTerms: [
          "llm",
          "provider",
          "openai",
          "gemini",
          "gemini_cli",
          "ollama",
          "codex",
        ],
      },
      {
        id: "chat",
        label: "Writing Style",
        description: "Tone, language, presets, and writing constraints.",
        searchTerms: ["ghostwriter", "language", "tone", "formality"],
      },
      {
        id: "prompt-templates",
        label: "Prompt Templates",
        description:
          "Base AI instructions for Ghostwriter, tailoring, and scoring.",
        searchTerms: ["prompt", "templates", "system prompt", "instructions"],
      },
    ],
  },
  {
    id: "scoring",
    label: "Scoring",
    items: [
      {
        id: "scoring",
        label: "Rules & Filters",
        description:
          "Salary penalties, thresholds, keywords, and scorer hints.",
        searchTerms: ["threshold", "salary", "keywords", "instructions"],
      },
    ],
  },
  {
    id: "integrations",
    label: "Integrations",
    items: [
      {
        id: "reactive-resume",
        label: "Reactive Resume",
        description: "Resume sync, templates, and project selection.",
        searchTerms: ["rxresume", "resume", "projects", "template"],
      },
      {
        id: "webhooks",
        label: "Webhooks",
        description: "Pipeline and job completion event destinations.",
        searchTerms: ["hooks", "notifications", "pipeline", "applied"],
      },
      {
        id: "tracer-links",
        label: "Tracer Links",
        description: "Public URL readiness and verification state.",
        searchTerms: ["public url", "verify", "readiness", "health"],
      },
    ],
  },
  {
    id: "workspaces",
    label: "Workspaces & Security",
    items: [
      {
        id: "environment",
        label: "Workspace Access",
        description: "Service credentials and authentication protection.",
        searchTerms: ["security", "auth", "adzuna", "ukvisajobs"],
      },
    ],
  },
  {
    id: "display",
    label: "Display",
    items: [
      {
        id: "display",
        label: "Display Preferences",
        description: "Sponsor badges and markdown rendering behavior.",
        searchTerms: ["markdown", "sponsor", "rendering", "appearance"],
      },
    ],
  },
  {
    id: "backups",
    label: "返回ups",
    items: [
      {
        id: "backup",
        label: "返回ups",
        description: "Automatic schedules, retention, and manual snapshots.",
        searchTerms: ["recovery", "database", "restore", "schedule"],
      },
    ],
  },
  {
    id: "danger",
    label: "Danger Zone",
    items: [
      {
        id: "danger-zone",
        label: "Danger Zone",
        description: "删除 jobs, runs, or the full local database.",
        searchTerms: ["delete", "clear", "cleanup", "destructive"],
      },
    ],
  },
];

const SECTION_FIELD_MAP: Record<
  设置SectionId,
  Array<keyof 更新设置Input>
> = {
  model: [
    "llmProvider",
    "llmBaseUrl",
    "llmApiKey",
    "model",
    "modelScorer",
    "modelTailoring",
    "modelProjectSelection",
  ],
  chat: [
    "chatStyleTone",
    "chatStyleFormality",
    "chatStyleConstraints",
    "chatStyleDo否tUse",
    "ghostwriterStopSlopEnabled",
    "chatStyleLanguageMode",
    "chatStyleManualLanguage",
  ],
  "prompt-templates": [
    "ghostwriterSystemPromptTemplate",
    "tailoringPromptTemplate",
    "scoringPromptTemplate",
  ],
  scoring: [
    "penalizeMissingSalary",
    "missingSalaryPenalty",
    "autoSkipScoreThreshold",
    "blocked公司Keywords",
    "scoringInstructions",
  ],
  "reactive-resume": [
    "pdfRenderer",
    "rxresumeBaseResumeId",
    "rxresumeApiKey",
    "rxresumeUrl",
    "resumeProjects",
  ],
  webhooks: ["pipelineWebhookUrl", "jobCompleteWebhookUrl", "webhookSecret"],
  "tracer-links": [],
  environment: [
    "ukvisajobs邮箱",
    "ukvisajobs密码",
    "adzunaAppId",
    "adzunaAppKey",
    "enableBasicAuth",
    "basicAuthUser",
    "basicAuth密码",
  ],
  display: ["showSponsorInfo", "renderMarkdownInJob描述s"],
  backup: ["backupEnabled", "backupHour", "backupMaxCount"],
  "danger-zone": [],
};

function matches设置搜索(
  searchTerm: string,
  item: 设置SectionDescriptor,
): boolean {
  if (!searchTerm) return true;
  const normalized = searchTerm.toLowerCase();
  const haystack = [item.label, item.description, ...item.searchTerms].join(
    " ",
  );
  return haystack.toLowerCase().includes(normalized);
}

const getRxResumeValidationFields = (): Array<keyof 更新设置Input> => [
  "rxresumeApiKey",
  "rxresumeUrl",
];
const toRxResumeValidationBadgeState = (
  validation: ValidationResult,
): RxResumeValidationBadgeState => ({
  checked: true,
  valid: validation.valid,
  message: validation.valid ? null : (validation.message ?? null),
  status: validation.valid ? null : (validation.status ?? null),
});

const normalizeLlmProviderValue = (
  value: string | null | undefined,
): LlmProviderValue => (value ? normalizeLlmProvider(value) : null);

const NULL_SETTINGS_PAYLOAD: 更新设置Input = {
  model: null,
  modelScorer: null,
  modelTailoring: null,
  modelProjectSelection: null,
  llmProvider: null,
  llmBaseUrl: null,
  llmApiKey: null,
  pipelineWebhookUrl: null,
  jobCompleteWebhookUrl: null,
  resumeProjects: null,
  pdfRenderer: null,
  rxresumeBaseResumeId: null,
  showSponsorInfo: null,
  renderMarkdownInJob描述s: null,
  chatStyleTone: null,
  chatStyleFormality: null,
  chatStyleConstraints: null,
  chatStyleDo否tUse: null,
  ghostwriterStopSlopEnabled: null,
  chatStyleSummaryMaxWords: null,
  chatStyleMaxKeywordsPerSkill: null,
  chatStyleLanguageMode: null,
  chatStyleManualLanguage: null,
  rxresumeUrl: null,
  rxresumeApiKey: null,
  basicAuthUser: null,
  basicAuth密码: null,
  ukvisajobs邮箱: null,
  ukvisajobs密码: null,
  adzunaAppId: null,
  adzunaAppKey: null,
  adzunaMaxJobsPerTerm: null,
  webhookSecret: null,
  enableBasicAuth: undefined,
  backupEnabled: null,
  backupHour: null,
  backupMaxCount: null,
  penalizeMissingSalary: null,
  missingSalaryPenalty: null,
  autoSkipScoreThreshold: null,
  blocked公司Keywords: null,
  scoringInstructions: null,
  ghostwriterSystemPromptTemplate: null,
  tailoringPromptTemplate: null,
  scoringPromptTemplate: null,
};

const map设置ToForm = (data: App设置): 更新设置Input => ({
  model: data.model.override ?? "",
  modelScorer: data.modelScorer.override ?? "",
  modelTailoring: data.modelTailoring.override ?? "",
  modelProjectSelection: data.modelProjectSelection.override ?? "",
  llmProvider: normalizeLlmProviderValue(
    data.llmProvider.override ?? data.llmProvider.value,
  ),
  llmBaseUrl: data.llmBaseUrl.override ?? "",
  llmApiKey: "",
  pipelineWebhookUrl: data.pipelineWebhookUrl.override ?? "",
  jobCompleteWebhookUrl: data.jobCompleteWebhookUrl.override ?? "",
  resumeProjects: data.resumeProjects.override,
  pdfRenderer: data.pdfRenderer.override ?? data.pdfRenderer.value,
  rxresumeBaseResumeId: data.rxresumeBaseResumeId,
  showSponsorInfo: data.showSponsorInfo.override,
  renderMarkdownInJob描述s:
    data.renderMarkdownInJob描述s.override,
  chatStyleTone: data.chatStyleTone.override ?? "",
  chatStyleFormality: data.chatStyleFormality.override ?? "",
  chatStyleConstraints: data.chatStyleConstraints.override ?? "",
  chatStyleDo否tUse: data.chatStyleDo否tUse.override ?? "",
  ghostwriterStopSlopEnabled: data.ghostwriterStopSlopEnabled.override,
  chatStyleSummaryMaxWords: data.chatStyleSummaryMaxWords.override ?? null,
  chatStyleMaxKeywordsPerSkill:
    data.chatStyleMaxKeywordsPerSkill.override ?? null,
  chatStyleLanguageMode: data.chatStyleLanguageMode.override ?? null,
  chatStyleManualLanguage: data.chatStyleManualLanguage.override ?? null,
  rxresumeUrl: data.rxresumeUrl ?? "",
  rxresumeApiKey: "",
  basicAuthUser: data.basicAuthUser ?? "",
  basicAuth密码: data.basicAuth密码 ?? "",
  ukvisajobs邮箱: data.ukvisajobs邮箱 ?? "",
  ukvisajobs密码: "",
  adzunaAppId: data.adzunaAppId ?? "",
  adzunaAppKey: "",
  webhookSecret: "",
  enableBasicAuth: data.basicAuthActive,
  backupEnabled: data.backupEnabled.override,
  backupHour: data.backupHour.override,
  backupMaxCount: data.backupMaxCount.override,
  penalizeMissingSalary: data.penalizeMissingSalary.override,
  missingSalaryPenalty: data.missingSalaryPenalty.override,
  autoSkipScoreThreshold: data.autoSkipScoreThreshold.override,
  blocked公司Keywords: data.blocked公司Keywords.override ?? [],
  scoringInstructions: data.scoringInstructions.override ?? "",
  ghostwriterSystemPromptTemplate:
    data.ghostwriterSystemPromptTemplate.value ?? "",
  tailoringPromptTemplate: data.tailoringPromptTemplate.value ?? "",
  scoringPromptTemplate: data.scoringPromptTemplate.value ?? "",
});

const normalizeString = (value: string | null | undefined) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

const normalizePrivateInput = (value: string | null | undefined) => {
  const trimmed = value?.trim();
  if (trimmed === "") return null;
  return trimmed || undefined;
};

const stringArraysEqual = (left: string[], right: string[]): boolean => {
  if (left.length !== right.length) return false;
  return left.every((value, index) => value === right[index]);
};

const nullIfSame = <T,>(value: T | null | undefined, defaultValue: T) =>
  value === defaultValue ? null : (value ?? null);

const normalizeResumeProjectsForCatalog = (
  catalog: ResumeProjectCatalogItem[],
  current: ResumeProjects设置 | null,
): ResumeProjects设置 | null => {
  const allowed = new Set(catalog.map((project) => project.id));

  const base = current ?? {
    maxProjects: 0,
    lockedProjectIds: catalog
      .filter((project) => project.isVisibleInBase)
      .map((project) => project.id),
    aiSelectableProjectIds: [],
  };

  const lockedProjectIds = base.lockedProjectIds.filter((id) =>
    allowed.has(id),
  );
  const lockedSet = new Set(lockedProjectIds);
  const aiSelectableProjectIds = (
    current ? base.aiSelectableProjectIds : catalog.map((project) => project.id)
  )
    .filter((id) => allowed.has(id))
    .filter((id) => !lockedSet.has(id));
  const maxProjectsRaw = Number.isFinite(base.maxProjects)
    ? base.maxProjects
    : 0;
  const maxProjectsInt = Math.max(0, Math.floor(maxProjectsRaw));
  const maxProjects = Math.min(
    catalog.length,
    Math.max(lockedProjectIds.length, maxProjectsInt, 3),
  );
  return { maxProjects, lockedProjectIds, aiSelectableProjectIds };
};

const getDerived设置 = (settings: App设置 | null) => {
  const profileProjects = settings?.profileProjects ?? [];

  return {
    model: {
      effective: settings?.model?.value ?? "",
      default: settings?.model?.default ?? "",
      scorer: settings?.modelScorer?.value ?? "",
      tailoring: settings?.modelTailoring?.value ?? "",
      projectSelection: settings?.modelProjectSelection?.value ?? "",
      llmProvider: settings?.llmProvider?.value ?? "",
      llmBaseUrl: settings?.llmBaseUrl?.value ?? "",
      llmApiKeyHint: settings?.llmApiKeyHint ?? null,
    },
    pipelineWebhook: {
      effective: settings?.pipelineWebhookUrl?.value ?? "",
      default: settings?.pipelineWebhookUrl?.default ?? "",
    },
    jobCompleteWebhook: {
      effective: settings?.jobCompleteWebhookUrl?.value ?? "",
      default: settings?.jobCompleteWebhookUrl?.default ?? "",
    },
    reactiveResume: {
      pdfRenderer: {
        effective: settings?.pdfRenderer?.value ?? "rxresume",
        default: settings?.pdfRenderer?.default ?? "rxresume",
      },
    },
    display: {
      showSponsorInfo: {
        effective: settings?.showSponsorInfo?.value ?? true,
        default: settings?.showSponsorInfo?.default ?? true,
      },
      renderMarkdownInJob描述s: {
        effective: settings?.renderMarkdownInJob描述s?.value ?? true,
        default: settings?.renderMarkdownInJob描述s?.default ?? true,
      },
    },
    chat: {
      tone: {
        effective: settings?.chatStyleTone?.value ?? "professional",
        default: settings?.chatStyleTone?.default ?? "professional",
      },
      formality: {
        effective: settings?.chatStyleFormality?.value ?? "medium",
        default: settings?.chatStyleFormality?.default ?? "medium",
      },
      constraints: {
        effective: settings?.chatStyleConstraints?.value ?? "",
        default: settings?.chatStyleConstraints?.default ?? "",
      },
      do否tUse: {
        effective: settings?.chatStyleDo否tUse?.value ?? "",
        default: settings?.chatStyleDo否tUse?.default ?? "",
      },
      stopSlopEnabled: {
        effective: settings?.ghostwriterStopSlopEnabled?.value ?? false,
        default: settings?.ghostwriterStopSlopEnabled?.default ?? false,
      },
      languageMode: {
        effective: settings?.chatStyleLanguageMode?.value ?? "manual",
        default: settings?.chatStyleLanguageMode?.default ?? "manual",
      },
      manualLanguage: {
        effective: settings?.chatStyleManualLanguage?.value ?? "english",
        default: settings?.chatStyleManualLanguage?.default ?? "english",
      },
      summaryMaxWords: {
        effective: settings?.chatStyleSummaryMaxWords?.value ?? null,
        default: settings?.chatStyleSummaryMaxWords?.default ?? null,
      },
      maxKeywordsPerSkill: {
        effective: settings?.chatStyleMaxKeywordsPerSkill?.value ?? null,
        default: settings?.chatStyleMaxKeywordsPerSkill?.default ?? null,
      },
    },
    env设置: {
      readable: {
        ukvisajobs邮箱: settings?.ukvisajobs邮箱 ?? "",
        adzunaAppId: settings?.adzunaAppId ?? "",
        basicAuthUser: settings?.basicAuthUser ?? "",
        basicAuth密码: settings?.basicAuth密码 ?? "",
      },
      private: {
        ukvisajobs密码Hint: settings?.ukvisajobs密码Hint ?? null,
        adzunaAppKeyHint: settings?.adzunaAppKeyHint ?? null,
        basicAuth密码Hint: settings?.basicAuth密码Hint ?? null,
        webhookSecretHint: settings?.webhookSecretHint ?? null,
      },
      basicAuthActive: settings?.basicAuthActive ?? false,
    },
    defaultResumeProjects: settings?.resumeProjects?.default ?? null,

    profileProjects,
    maxProjectsTotal: profileProjects.length,

    backup: {
      backupEnabled: {
        effective: settings?.backupEnabled?.value ?? false,
        default: settings?.backupEnabled?.default ?? false,
      },
      backupHour: {
        effective: settings?.backupHour?.value ?? 2,
        default: settings?.backupHour?.default ?? 2,
      },
      backupMaxCount: {
        effective: settings?.backupMaxCount?.value ?? 5,
        default: settings?.backupMaxCount?.default ?? 5,
      },
    },
    scoring: {
      penalizeMissingSalary: {
        effective: settings?.penalizeMissingSalary?.value ?? false,
        default: settings?.penalizeMissingSalary?.default ?? false,
      },
      missingSalaryPenalty: {
        effective: settings?.missingSalaryPenalty?.value ?? 10,
        default: settings?.missingSalaryPenalty?.default ?? 10,
      },
      autoSkipScoreThreshold: {
        effective: settings?.autoSkipScoreThreshold?.value ?? null,
        default: settings?.autoSkipScoreThreshold?.default ?? null,
      },
      blocked公司Keywords: {
        effective: settings?.blocked公司Keywords?.value ?? [],
        default: settings?.blocked公司Keywords?.default ?? [],
      },
      scoringInstructions: {
        effective: settings?.scoringInstructions?.value ?? "",
        default: settings?.scoringInstructions?.default ?? "",
      },
    },
    promptTemplates: {
      ghostwriterSystemPromptTemplate: {
        effective: settings?.ghostwriterSystemPromptTemplate?.value ?? "",
        default: settings?.ghostwriterSystemPromptTemplate?.default ?? "",
      },
      tailoringPromptTemplate: {
        effective: settings?.tailoringPromptTemplate?.value ?? "",
        default: settings?.tailoringPromptTemplate?.default ?? "",
      },
      scoringPromptTemplate: {
        effective: settings?.scoringPromptTemplate?.value ?? "",
        default: settings?.scoringPromptTemplate?.default ?? "",
      },
    },
  };
};

export const 设置Page: React.FC = () => {
  const queryClient = useQueryClient();
  const location = useLocation();
  const [settings, set设置] = useState<App设置 | null>(null);
  const [activeSection, setActiveSection] =
    useState<设置SectionId>("model");
  const [openGroups, setOpenGroups] = useState<设置GroupId[]>([]);

  useEffect(() => {
    const hash = location.hash.replace(/^#/, "");
    const allSectionIds = SETTINGS_NAV_GROUPS.flatMap((g) =>
      g.items.map((i) => i.id),
    );
    if (hash && allSectionIds.includes(hash as 设置SectionId)) {
      setActiveSection(hash as 设置SectionId);
      const parentGroup = SETTINGS_NAV_GROUPS.find((g) =>
        g.items.some((i) => i.id === hash),
      );
      if (parentGroup) {
        setOpenGroups((prev) =>
          prev.includes(parentGroup.id) ? prev : [...prev, parentGroup.id],
        );
      }
    }
  }, [location.hash]);

  const [settings搜索, set设置搜索] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [rxresumeValidation状态, setRxresumeValidation状态] =
    useState<RxResumeValidationBadgeState>(
      EMPTY_RXRESUME_VALIDATION_BADGE_STATE,
    );
  const [statusesToClear, set状态esToClear] = useState<Job状态[]>([
    "discovered",
  ]);
  const [rxResumeBaseResumeIdDraft, setRxResumeBaseResumeIdDraft] = useState<
    string | null
  >(null);
  const [rxResumeProjectsOverride, setRxResumeProjectsOverride] = useState<
    ResumeProjectCatalogItem[] | null
  >(null);
  const [isFetchingRxResumeProjects, setIsFetchingRxResumeProjects] =
    useState(false);

  // 返回up state
  const [isCreating返回up, setIsCreating返回up] = useState(false);
  const [isDeleting返回up, setIsDeleting返回up] = useState(false);
  const {
    readiness: tracerReadiness,
    isLoading: isTracerReadinessLoading,
    isChecking: isTracerReadinessChecking,
    refreshReadiness,
  } = useTracerReadiness();

  const methods = useForm<更新设置Input>({
    resolver: zodResolver(
      update设置Schema,
    ) as Resolver<更新设置Input>,
    mode: "onChange",
    defaultValues: DEFAULT_FORM_VALUES,
  });

  const {
    clearErrors,
    handle提交,
    reset,
    setError,
    setValue,
    getValues,
    control,
    formState: { isDirty, errors, isValid, dirtyFields },
  } = methods;
  const { storedRxResume, setBaseResumeId } = useRxResumeConfigState(settings);

  const settingsQuery = useQuery({
    queryKey: queryKeys.settings.current(),
    queryFn: api.get设置,
  });
  const backupsQuery = useQuery({
    queryKey: queryKeys.backups.list(),
    queryFn: api.get返回ups,
  });
  const update设置Mutation = use更新设置Mutation();
  const isLoading = settingsQuery.isLoading;
  const backups = backupsQuery.data?.backups ?? [];
  const nextScheduled = backupsQuery.data?.nextScheduled ?? null;
  const isLoading返回ups = backupsQuery.isLoading;
  useQueryErrorToast(backupsQuery.error, "Failed to load backups");

  const resumeProjectsValue = useWatch({
    control,
    name: "resumeProjects",
  });
  const hasRxResumeAccess = Boolean(rxresumeValidation状态.valid);

  useEffect(() => {
    if (!settingsQuery.data) return;
    set设置(settingsQuery.data);
    reset(map设置ToForm(settingsQuery.data));
  }, [settingsQuery.data, reset]);

  useQueryErrorToast(settingsQuery.error, "Failed to load settings");

  useEffect(() => {
    if (!settings) return;
    const storedId = settings?.rxresumeBaseResumeId ?? null;
    setRxResumeBaseResumeIdDraft(storedId);
    setValue("rxresumeBaseResumeId", storedId, { shouldDirty: false });
    setRxResumeProjectsOverride(null);
  }, [settings, setValue]);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    if (!rxResumeBaseResumeIdDraft) {
      setRxResumeProjectsOverride(null);
      return () => {
        isMounted = false;
        controller.abort();
      };
    }

    if (!hasRxResumeAccess)
      return () => {
        isMounted = false;
        controller.abort();
      };

    setIsFetchingRxResumeProjects(true);
    api
      .getRxResumeProjects(rxResumeBaseResumeIdDraft, controller.signal)
      .then((projects) => {
        if (!isMounted) return;
        setRxResumeProjectsOverride(projects);
        const normalized = normalizeResumeProjectsForCatalog(
          projects,
          getValues("resumeProjects") ?? null,
        );
        if (normalized) {
          setValue("resumeProjects", normalized, { shouldDirty: false });
        }
      })
      .catch((error) => {
        if (!isMounted || error.name === "AbortError") return;
        showErrorToast(error, "Failed to load RxResume projects");
        setRxResumeProjectsOverride(null);
      })
      .finally(() => {
        if (!isMounted) return;
        setIsFetchingRxResumeProjects(false);
      });

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [rxResumeBaseResumeIdDraft, hasRxResumeAccess, getValues, setValue]);

  const derived = getDerived设置(settings);
  const {
    model,
    pipelineWebhook,
    jobCompleteWebhook,
    reactiveResume,
    display,
    chat,
    env设置,
    defaultResumeProjects,
    profileProjects,
    backup,
    scoring,
    promptTemplates,
  } = derived;

  const handle创建返回up = async () => {
    setIsCreating返回up(true);
    try {
      await api.createManual返回up();
      toast.success("返回up created successfully");
      await queryClient.invalidateQueries({ queryKey: queryKeys.backups.all });
    } catch (error) {
      showErrorToast(error, "Failed to create backup");
    } finally {
      setIsCreating返回up(false);
    }
  };

  const handle删除返回up = async (filename: string) => {
    const confirmed = window.confirm(
      `删除 backup "${filename}"? This action cannot be undone.`,
    );
    if (!confirmed) {
      return;
    }
    setIsDeleting返回up(true);
    try {
      await api.delete返回up(filename);
      toast.success("返回up deleted successfully");
      await queryClient.invalidateQueries({ queryKey: queryKeys.backups.all });
    } catch (error) {
      showErrorToast(error, "Failed to delete backup");
    } finally {
      setIsDeleting返回up(false);
    }
  };

  const handleVerifyTracerReadiness = useCallback(async () => {
    try {
      const readiness = await refreshReadiness(true);
      if (!readiness) {
        toast.error("Tracer links are unavailable. Verify your public URL.");
      } else if (readiness.canEnable) {
        toast.success("Tracer links are ready");
      } else {
        toast.error(
          readiness.reason ??
            "Tracer links are unavailable. Verify your public URL.",
        );
      }
    } catch (error) {
      showErrorToast(error, "Failed to verify tracer-link readiness");
    }
  }, [refreshReadiness]);

  const setRxResumeValidation状态 = useCallback(
    (validation: ValidationResult) => {
      setRxresumeValidation状态(toRxResumeValidationBadgeState(validation));
    },
    [],
  );

  const clearRxResumeValidationFeedback = useCallback(() => {
    setRxresumeValidation状态(EMPTY_RXRESUME_VALIDATION_BADGE_STATE);
    clearErrors(["rxresumeApiKey"]);
  }, [clearErrors]);

  const validateRxresume = useCallback(
    async (options?: { silent?: boolean; persistOnSuccess?: boolean }) => {
      const { silent = false, persistOnSuccess = true } = options ?? {};
      const notify = !silent;
      const values = getValues();
      const draftCredentials = getRxResumeCredentialDrafts(values);
      const result = await validateAndMaybePersistRxResumeMode({
        stored: storedRxResume,
        draft: draftCredentials,
        validate: api.validateRxresume,
        persist: api.update设置,
        persistOnSuccess,
        skipPrecheck: silent,
        getPrecheckMessage: (failure) => RXRESUME_PRECHECK_MESSAGES[failure],
        getValidationErrorMessage: (error) =>
          formatUserFacingError(error, "RxResume validation failed"),
        getPersistErrorMessage: (error) =>
          formatUserFacingError(error, "RxResume validation failed"),
      });

      setRxResumeValidation状态(result.validation);

      if (result.updated设置) {
        set设置(result.updated设置);
        queryClient.setQueryData(
          queryKeys.settings.current(),
          result.updated设置,
        );
        if (notify) {
          toast.success(`Reactive Resume validation passed`);
        }
        return;
      }

      if (!notify || result.validation.valid) {
        return;
      }

      if (result.precheckFailure) {
        toast.info(
          result.validation.message ??
            RXRESUME_PRECHECK_MESSAGES[result.precheckFailure],
        );
        return;
      }

      toast.error(
        result.validation.message || `Reactive Resume validation failed`,
      );
    },
    [getValues, queryClient, setRxResumeValidation状态, storedRxResume],
  );

  useEffect(() => {
    if (!settings) return;

    if (!rxresumeValidation状态.checked) {
      void validateRxresume({ silent: true, persistOnSuccess: false });
    }
  }, [rxresumeValidation状态, settings, validateRxresume]);

  const effective个人资料Projects = rxResumeProjectsOverride ?? profileProjects;
  const effectiveMaxProjectsTotal = effective个人资料Projects.length;

  const lockedCount = resumeProjectsValue?.lockedProjectIds.length ?? 0;

  const can保存 = isDirty && isValid;

  const on保存 = async (data: 更新设置Input) => {
    if (!settings) return;
    if (data.enableBasicAuth && !settings.basicAuthActive) {
      const password = data.basicAuth密码?.trim() ?? "";
      if (!password) {
        setError("basicAuth密码", {
          type: "manual",
          message: "密码 is required when authentication is enabled",
        });
        return;
      }
    }
    try {
      setIsSaving(true);

      // Prepare payload: nullify if equal to default
      const resumeProjectsData = data.resumeProjects;
      const resumeProjectsOverride =
        resumeProjectsData &&
        defaultResumeProjects &&
        resumeProjectsEqual(resumeProjectsData, defaultResumeProjects)
          ? null
          : resumeProjectsData;

      const envPayload: Partial<更新设置Input> = {};

      if (dirtyFields.rxresumeUrl) {
        envPayload.rxresumeUrl = normalizeString(data.rxresumeUrl);
      }

      if (dirtyFields.ukvisajobs邮箱 || dirtyFields.ukvisajobs密码) {
        envPayload.ukvisajobs邮箱 = normalizeString(data.ukvisajobs邮箱);
      }

      if (dirtyFields.adzunaAppId || dirtyFields.adzunaAppKey) {
        envPayload.adzunaAppId = normalizeString(data.adzunaAppId);
      }

      if (data.enableBasicAuth === false) {
        envPayload.basicAuthUser = null;
        envPayload.basicAuth密码 = null;
      } else if (
        dirtyFields.enableBasicAuth ||
        dirtyFields.basicAuthUser ||
        dirtyFields.basicAuth密码
      ) {
        // If enabling authentication or changing either field, ensure we send at least the username
        // to keep the pair consistent in the backend.
        envPayload.basicAuthUser = normalizeString(data.basicAuthUser);

        if (dirtyFields.basicAuth密码) {
          const value = normalizePrivateInput(data.basicAuth密码);
          if (value !== undefined) envPayload.basicAuth密码 = value;
        }
      }

      if (dirtyFields.llmProvider) {
        envPayload.llmProvider = data.llmProvider ?? null;
      }

      if (dirtyFields.llmBaseUrl) {
        envPayload.llmBaseUrl = normalizeString(data.llmBaseUrl);
      }

      if (dirtyFields.llmApiKey) {
        const value = normalizePrivateInput(data.llmApiKey);
        if (value !== undefined) envPayload.llmApiKey = value;
      }

      if (dirtyFields.rxresumeApiKey) {
        const value = normalizePrivateInput(data.rxresumeApiKey);
        if (value !== undefined) envPayload.rxresumeApiKey = value;
      }

      if (dirtyFields.ukvisajobs密码) {
        const value = normalizePrivateInput(data.ukvisajobs密码);
        if (value !== undefined) envPayload.ukvisajobs密码 = value;
      }

      if (dirtyFields.adzunaAppKey) {
        const value = normalizePrivateInput(data.adzunaAppKey);
        if (value !== undefined) envPayload.adzunaAppKey = value;
      }

      if (dirtyFields.webhookSecret) {
        const value = normalizePrivateInput(data.webhookSecret);
        if (value !== undefined) envPayload.webhookSecret = value;
      }

      const payload: Partial<更新设置Input> = {
        model: dirtyFields.llmProvider
          ? dirtyFields.model
            ? normalizeString(data.model)
            : null
          : normalizeString(data.model),
        modelScorer: dirtyFields.llmProvider
          ? dirtyFields.modelScorer
            ? normalizeString(data.modelScorer)
            : null
          : normalizeString(data.modelScorer),
        modelTailoring: dirtyFields.llmProvider
          ? dirtyFields.modelTailoring
            ? normalizeString(data.modelTailoring)
            : null
          : normalizeString(data.modelTailoring),
        modelProjectSelection: dirtyFields.llmProvider
          ? dirtyFields.modelProjectSelection
            ? normalizeString(data.modelProjectSelection)
            : null
          : normalizeString(data.modelProjectSelection),
        pipelineWebhookUrl: normalizeString(data.pipelineWebhookUrl),
        jobCompleteWebhookUrl: normalizeString(data.jobCompleteWebhookUrl),
        resumeProjects: resumeProjectsOverride,
        pdfRenderer: nullIfSame(
          data.pdfRenderer,
          reactiveResume.pdfRenderer.default,
        ),
        ...(dirtyFields.rxresumeBaseResumeId
          ? { rxresumeBaseResumeId: normalizeString(data.rxresumeBaseResumeId) }
          : {}),
        showSponsorInfo: nullIfSame(
          data.showSponsorInfo,
          display.showSponsorInfo.default,
        ),
        renderMarkdownInJob描述s: nullIfSame(
          data.renderMarkdownInJob描述s,
          display.renderMarkdownInJob描述s.default,
        ),
        chatStyleTone: normalizeString(data.chatStyleTone),
        chatStyleFormality: normalizeString(data.chatStyleFormality),
        chatStyleConstraints: normalizeString(data.chatStyleConstraints),
        chatStyleDo否tUse: normalizeString(data.chatStyleDo否tUse),
        ghostwriterStopSlopEnabled: nullIfSame(
          data.ghostwriterStopSlopEnabled,
          chat.stopSlopEnabled.default,
        ),
        chatStyleSummaryMaxWords: Number.isNaN(data.chatStyleSummaryMaxWords)
          ? null
          : (data.chatStyleSummaryMaxWords ?? null),
        chatStyleMaxKeywordsPerSkill: Number.isNaN(
          data.chatStyleMaxKeywordsPerSkill,
        )
          ? null
          : (data.chatStyleMaxKeywordsPerSkill ?? null),
        chatStyleLanguageMode: data.chatStyleLanguageMode ?? null,
        chatStyleManualLanguage: data.chatStyleManualLanguage ?? null,
        backupEnabled: nullIfSame(
          data.backupEnabled,
          backup.backupEnabled.default,
        ),
        backupHour: nullIfSame(data.backupHour, backup.backupHour.default),
        backupMaxCount: nullIfSame(
          data.backupMaxCount,
          backup.backupMaxCount.default,
        ),
        penalizeMissingSalary: nullIfSame(
          data.penalizeMissingSalary,
          scoring.penalizeMissingSalary.default,
        ),
        missingSalaryPenalty: nullIfSame(
          data.missingSalaryPenalty,
          scoring.missingSalaryPenalty.default,
        ),
        autoSkipScoreThreshold: nullIfSame(
          data.autoSkipScoreThreshold,
          scoring.autoSkipScoreThreshold.default,
        ),
        blocked公司Keywords: (() => {
          const normalized = normalizeStringArray(data.blocked公司Keywords);
          const normalizedDefault = normalizeStringArray(
            scoring.blocked公司Keywords.default,
          );
          return stringArraysEqual(normalized, normalizedDefault)
            ? null
            : normalized;
        })(),
        scoringInstructions: nullIfSame(
          normalizeString(data.scoringInstructions),
          scoring.scoringInstructions.default,
        ),
        ghostwriterSystemPromptTemplate: nullIfSame(
          normalizeString(data.ghostwriterSystemPromptTemplate),
          promptTemplates.ghostwriterSystemPromptTemplate.default,
        ),
        tailoringPromptTemplate: nullIfSame(
          normalizeString(data.tailoringPromptTemplate),
          promptTemplates.tailoringPromptTemplate.default,
        ),
        scoringPromptTemplate: nullIfSame(
          normalizeString(data.scoringPromptTemplate),
          promptTemplates.scoringPromptTemplate.default,
        ),
        ...envPayload,
      };

      const shouldValidateRxResumeBefore保存 = Boolean(
        dirtyFields.rxresumeUrl || dirtyFields.rxresumeApiKey,
      );
      let rxResume保存WarningMessage: string | null = null;

      if (shouldValidateRxResumeBefore保存) {
        const validationDraft = getRxResumeCredentialDrafts(data);
        const precheckFailure = getRxResumeCredentialPrecheckFailure({
          stored: storedRxResume,
          draft: validationDraft,
        });

        if (!precheckFailure) {
          const preserveBlankFields = [
            ...(dirtyFields.rxresumeApiKey ? (["apiKey"] as const) : []),
            ...(dirtyFields.rxresumeUrl ? (["baseUrl"] as const) : []),
          ];
          const validation = await api.validateRxresume({
            ...toRxResumeValidationPayload(validationDraft, {
              preserveBlankFields: preserveBlankFields as Array<
                keyof ReturnType<typeof getRxResumeCredentialDrafts>
              >,
            }),
          });

          setRxResumeValidation状态(validation);

          if (isRxResumeBlockingValidationFailure(validation)) {
            clearErrors(getRxResumeValidationFields());
            setError("rxresumeApiKey", {
              type: "manual",
              message:
                validation.message ?? "Reactive Resume API key is invalid.",
            });
            return;
          }

          clearErrors(getRxResumeValidationFields());
          if (isRxResumeAvailabilityValidationFailure(validation)) {
            rxResume保存WarningMessage =
              "设置 saved, but JobOps could not verify Reactive Resume because the instance is unavailable.";
          }
        }
      }

      const updated = await update设置Mutation.mutateAsync(payload);
      set设置(updated);
      reset(map设置ToForm(updated));
      toast.success("设置 saved");
      if (rxResume保存WarningMessage) {
        toast.info(rxResume保存WarningMessage);
      }
    } catch (error) {
      showErrorToast(error, "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearDatabase = async () => {
    try {
      setIsSaving(true);
      const result = await api.clearDatabase();
      toast.success("Database cleared", {
        description: `删除d ${result.jobs删除d} jobs.`,
      });
    } catch (error) {
      showErrorToast(error, "Failed to clear database");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearBy状态es = async () => {
    if (statusesToClear.length === 0) {
      toast.error("否 statuses selected");
      return;
    }
    try {
      setIsSaving(true);
      let total删除d = 0;
      const results: string[] = [];

      for (const status of statusesToClear) {
        const result = await api.deleteJobsBy状态(status);
        total删除d += result.count;
        if (result.count > 0) {
          results.push(`${result.count} ${status}`);
        }
      }

      if (total删除d > 0) {
        toast.success("Jobs cleared", {
          description: `删除d ${total删除d} jobs: ${results.join(", ")}`,
        });
      } else {
        toast.info("否 jobs found", {
          description: `否 jobs with selected statuses found`,
        });
      }
    } catch (error) {
      showErrorToast(error, "Failed to clear jobs");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearByScore = async (threshold: number) => {
    try {
      setIsSaving(true);
      const result = await api.deleteJobsBelowScore(threshold);

      if (result.count > 0) {
        toast.success("Jobs cleared", {
          description: `删除d ${result.count} jobs with score below ${threshold}. Applied jobs were preserved.`,
        });
      } else {
        toast.info("否 jobs found", {
          description: `否 jobs with score below ${threshold} found`,
        });
      }
    } catch (error) {
      showErrorToast(error, "Failed to clear jobs by score");
    } finally {
      setIsSaving(false);
    }
  };

  const toggle状态ToClear = (status: Job状态) => {
    set状态esToClear((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status],
    );
  };
  const handleReset = async () => {
    try {
      setIsSaving(true);
      const updated = await update设置Mutation.mutateAsync(
        NULL_SETTINGS_PAYLOAD,
      );
      set设置(updated);
      reset(map设置ToForm(updated));
      toast.success("Reset to default");
    } catch (error) {
      showErrorToast(error, "Failed to reset settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscardChanges = () => {
    if (!settings) return;
    reset(map设置ToForm(settings));
    toast.success("Discarded unsaved changes");
  };

  const filteredNavGroups = useMemo(
    () =>
      SETTINGS_NAV_GROUPS.map((group) => ({
        ...group,
        items: group.items.filter((item) =>
          matches设置搜索(settings搜索, item),
        ),
      })).filter((group) => group.items.length > 0),
    [settings搜索],
  );

  const visibleSectionIds = useMemo(
    () =>
      filteredNavGroups.flatMap((group) => group.items.map((item) => item.id)),
    [filteredNavGroups],
  );

  useEffect(() => {
    if (visibleSectionIds.length === 0) return;
    if (!visibleSectionIds.includes(activeSection)) {
      setActiveSection(visibleSectionIds[0]);
    }
  }, [activeSection, visibleSectionIds]);

  const activeSectionMeta =
    SETTINGS_NAV_GROUPS.flatMap((group) => group.items).find(
      (item) => item.id === activeSection,
    ) ?? SETTINGS_NAV_GROUPS[0].items[0];
  const activeGroup =
    SETTINGS_NAV_GROUPS.find((group) =>
      group.items.some((item) => item.id === activeSection),
    ) ?? SETTINGS_NAV_GROUPS[0];

  const sectionHasDirtyState = (sectionId: 设置SectionId) =>
    SECTION_FIELD_MAP[sectionId].some((field) => Boolean(dirtyFields[field]));
  const sectionHasErrors = (sectionId: 设置SectionId) =>
    SECTION_FIELD_MAP[sectionId].some((field) => Boolean(errors[field]));

  const getSectionBadge = (sectionId: 设置SectionId) => {
    if (sectionId === "danger-zone") {
      return { label: "Sensitive", variant: "destructive" as const };
    }
    if (sectionHasErrors(sectionId)) {
      return { label: "Needs attention", variant: "destructive" as const };
    }
    if (sectionHasDirtyState(sectionId)) {
      return { label: "Unsaved", variant: "secondary" as const };
    }

    switch (sectionId) {
      case "model":
        return model.llmProvider
          ? { label: "Configured", variant: "outline" as const }
          : { label: "Using defaults", variant: "secondary" as const };
      case "chat":
        return chat.tone.effective || chat.constraints.effective
          ? { label: "Ready", variant: "outline" as const }
          : { label: "Using defaults", variant: "secondary" as const };
      case "prompt-templates":
        return promptTemplates.ghostwriterSystemPromptTemplate.effective !==
          promptTemplates.ghostwriterSystemPromptTemplate.default ||
          promptTemplates.tailoringPromptTemplate.effective !==
            promptTemplates.tailoringPromptTemplate.default ||
          promptTemplates.scoringPromptTemplate.effective !==
            promptTemplates.scoringPromptTemplate.default
          ? { label: "Customized", variant: "outline" as const }
          : { label: "Using defaults", variant: "secondary" as const };
      case "scoring":
        return scoring.autoSkipScoreThreshold.effective != null ||
          scoring.blocked公司Keywords.effective.length > 0 ||
          scoring.scoringInstructions.effective
          ? { label: "Customized", variant: "outline" as const }
          : { label: "Default rules", variant: "secondary" as const };
      case "reactive-resume":
        return hasRxResumeAccess
          ? { label: "Connected", variant: "outline" as const }
          : null;
      case "webhooks":
        return pipelineWebhook.effective || jobCompleteWebhook.effective
          ? { label: "Configured", variant: "outline" as const }
          : { label: "Optional", variant: "secondary" as const };
      case "tracer-links":
        return tracerReadiness?.status === "ready"
          ? { label: "Ready", variant: "outline" as const }
          : tracerReadiness
            ? { label: "Check required", variant: "secondary" as const }
            : { label: "否t configured", variant: "secondary" as const };
      case "environment":
        return env设置.readable.ukvisajobs邮箱 ||
          env设置.readable.adzunaAppId ||
          env设置.basicAuthActive
          ? { label: "Configured", variant: "outline" as const }
          : null;
      case "display":
        return { label: "Active", variant: "secondary" as const };
      case "backup":
        return backup.backupEnabled.effective
          ? { label: "Scheduled", variant: "outline" as const }
          : { label: "Manual only", variant: "secondary" as const };
      default:
        return { label: "Ready", variant: "outline" as const };
    }
  };

  const selectedSectionBadge = getSectionBadge(activeSection);
  const dirtySectionCount = SETTINGS_NAV_GROUPS.flatMap(
    (group) => group.items,
  ).filter((item) => sectionHasDirtyState(item.id)).length;
  const activeSectionIsDirty = sectionHasDirtyState(activeSection);

  let activeSectionContent: React.React否de;
  switch (activeSection) {
    case "model":
      activeSectionContent = (
        <Model设置Section
          values={model}
          isLoading={isLoading}
          isSaving={isSaving}
          layoutMode="panel"
        />
      );
      break;
    case "chat":
      activeSectionContent = (
        <Chat设置Section
          values={chat}
          isLoading={isLoading}
          isSaving={isSaving}
          layoutMode="panel"
        />
      );
      break;
    case "prompt-templates":
      activeSectionContent = (
        <PromptTemplatesSection
          values={promptTemplates}
          isLoading={isLoading}
          isSaving={isSaving}
          layoutMode="panel"
        />
      );
      break;
    case "scoring":
      activeSectionContent = (
        <Scoring设置Section
          values={scoring}
          isLoading={isLoading}
          isSaving={isSaving}
          layoutMode="panel"
        />
      );
      break;
    case "reactive-resume":
      activeSectionContent = (
        <ReactiveResumeSection
          rxResumeBaseResumeIdDraft={rxResumeBaseResumeIdDraft}
          setRxResumeBaseResumeIdDraft={(value) => {
            setBaseResumeId(value);
            setRxResumeBaseResumeIdDraft(value);
            setValue("rxresumeBaseResumeId", value, { shouldDirty: true });
          }}
          hasRxResumeAccess={hasRxResumeAccess}
          onCredentialField编辑={clearRxResumeValidationFeedback}
          validation状态={rxresumeValidation状态}
          profileProjects={effective个人资料Projects}
          lockedCount={lockedCount}
          maxProjectsTotal={effectiveMaxProjectsTotal}
          isProjectsLoading={isFetchingRxResumeProjects}
          isLoading={isLoading}
          isSaving={isSaving}
          layoutMode="panel"
        />
      );
      break;
    case "webhooks":
      activeSectionContent = (
        <WebhooksSection
          pipelineWebhook={pipelineWebhook}
          jobCompleteWebhook={jobCompleteWebhook}
          webhookSecretHint={env设置.private.webhookSecretHint}
          isLoading={isLoading}
          isSaving={isSaving}
          layoutMode="panel"
        />
      );
      break;
    case "tracer-links":
      activeSectionContent = (
        <TracerLinks设置Section
          readiness={tracerReadiness}
          isLoading={isLoading || isTracerReadinessLoading}
          isChecking={isTracerReadinessChecking}
          onVerify否w={handleVerifyTracerReadiness}
          layoutMode="panel"
        />
      );
      break;
    case "environment":
      activeSectionContent = (
        <Environment设置Section
          values={env设置}
          isLoading={isLoading}
          isSaving={isSaving}
          layoutMode="panel"
        />
      );
      break;
    case "display":
      activeSectionContent = (
        <Display设置Section
          values={display}
          isLoading={isLoading}
          isSaving={isSaving}
          layoutMode="panel"
        />
      );
      break;
    case "backup":
      activeSectionContent = (
        <返回up设置Section
          values={backup}
          backups={backups}
          nextScheduled={nextScheduled}
          isLoading={isLoading || isLoading返回ups}
          isSaving={isSaving}
          on创建返回up={handle创建返回up}
          on删除返回up={handle删除返回up}
          isCreating返回up={isCreating返回up}
          isDeleting返回up={isDeleting返回up}
          layoutMode="panel"
        />
      );
      break;
    case "danger-zone":
      activeSectionContent = (
        <DangerZoneSection
          statusesToClear={statusesToClear}
          toggle状态ToClear={toggle状态ToClear}
          handleClearBy状态es={handleClearBy状态es}
          handleClearDatabase={handleClearDatabase}
          handleClearByScore={handleClearByScore}
          isLoading={isLoading}
          isSaving={isSaving}
          layoutMode="panel"
        />
      );
      break;
    default:
      activeSectionContent = null;
  }

  return (
    <FormProvider {...methods}>
      <PageHeader
        icon={设置}
        title="设置"
        subtitle="Configure AI, scoring, integrations, and recovery from one focused workspace."
      />

      <main class名称="container mx-auto px-4 py-6 pb-12">
        <div class名称="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside class名称="lg:sticky lg:top-6 lg:self-start">
            <div class名称="overflow-hidden rounded-2xl border border-border/70 bg-background/95">
              <div class名称="border-b px-4 py-4">
                <div class名称="relative">
                  <搜索 class名称="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={settings搜索}
                    onChange={(event) => set设置搜索(event.target.value)}
                    placeholder="搜索 settings"
                    class名称="pl-9"
                    aria-label="搜索 settings"
                  />
                </div>
              </div>
              <div class名称="p-2">
                {filteredNavGroups.length > 0 ? (
                  <Accordion
                    type="multiple"
                    value={
                      settings搜索.trim()
                        ? filteredNavGroups.map((group) => group.id)
                        : openGroups
                    }
                    onValueChange={(value) =>
                      setOpenGroups(value as 设置GroupId[])
                    }
                    class名称="space-y-1"
                  >
                    {filteredNavGroups.map((group) => (
                      <AccordionItem
                        key={group.id}
                        value={group.id}
                        class名称="border-b border-border/60 px-2 last:border-b-0"
                      >
                        <AccordionTrigger class名称="py-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground hover:no-underline">
                          {group.label}
                        </AccordionTrigger>
                        <AccordionContent class名称="pb-3">
                          <div class名称="space-y-1">
                            {group.items.map((item) => {
                              const isActive = item.id === activeSection;
                              return (
                                <Button
                                  key={item.id}
                                  type="button"
                                  variant="ghost"
                                  class名称={`h-9 w-full justify-start rounded-md px-3 text-left text-sm font-medium ${
                                    isActive
                                      ? "border border-orange-400/40 bg-orange-500/12 text-orange-100 hover:bg-orange-500/18 hover:text-orange-50"
                                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                                  }`}
                                  onClick={() => setActiveSection(item.id)}
                                >
                                  {item.label}
                                </Button>
                              );
                            })}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <div class名称="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                    否 settings matched “{settings搜索.trim()}”.
                  </div>
                )}
              </div>
            </div>
          </aside>

          <section class名称="space-y-4">
            <header class名称="space-y-4 border-b border-border/70 pb-5">
              <div class名称="flex flex-wrap items-center gap-2 text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
                <span>{activeGroup.label}</span>
                <span>/</span>
                <span>{activeSectionMeta.label}</span>
              </div>

              <div class名称="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div class名称="space-y-2">
                  <div class名称="flex flex-wrap items-center gap-2">
                    <h2 class名称="text-2xl font-semibold tracking-tight">
                      {activeSectionMeta.label}
                    </h2>
                    {selectedSectionBadge ? (
                      <Badge variant={selectedSectionBadge.variant}>
                        {selectedSectionBadge.label}
                      </Badge>
                    ) : null}
                    {dirtySectionCount > 0 ? (
                      <Badge variant="secondary">
                        {dirtySectionCount} unsaved section
                        {dirtySectionCount !== 1 ? "s" : ""}
                      </Badge>
                    ) : null}
                  </div>
                  <p class名称="max-w-2xl text-sm leading-6 text-muted-foreground">
                    {activeSectionMeta.description}
                  </p>
                </div>

                <div class名称="flex shrink-0 flex-nowrap gap-2 self-start">
                  {activeSectionIsDirty ? (
                    <Button
                      type="button"
                      variant="outline"
                      class名称="whitespace-nowrap"
                      onClick={handleDiscardChanges}
                      disabled={isLoading || isSaving || !isDirty}
                    >
                      Discard changes
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    variant="outline"
                    class名称="whitespace-nowrap"
                    onClick={handleReset}
                    disabled={isLoading || isSaving || !settings}
                  >
                    Reset to defaults
                  </Button>
                  <Button
                    type="button"
                    class名称="whitespace-nowrap"
                    onClick={handle提交(on保存)}
                    disabled={isLoading || isSaving || !can保存}
                  >
                    {isSaving ? "Saving..." : "保存 changes"}
                  </Button>
                </div>
              </div>
            </header>

            {activeSectionContent}

            {Object.keys(errors).length > 0 && (
              <div class名称="rounded-xl border border-destructive/30 bg-destructive/[0.03] px-4 py-3 text-sm text-destructive">
                Please fix the highlighted errors before saving.
              </div>
            )}
          </section>
        </div>
      </main>
    </FormProvider>
  );
};
