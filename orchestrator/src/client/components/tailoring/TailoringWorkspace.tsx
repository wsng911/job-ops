import * as api from "@client/api";
import { use个人资料 } from "@client/hooks/use个人资料";
import { useTracerReadiness } from "@client/hooks/useTracerReadiness";
import type { Job } from "@shared/types.js";
import {
  ArrowLeft,
  Check,
  CircleAlert,
  FileText,
  Loader2,
  Sparkles,
} from "lucide-react";
import type React from "react";
import type { ComponentProps } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { formatUserFacingError } from "@/client/lib/error-format";
import { showErrorToast } from "@/client/lib/error-toast";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  from编辑ableSkillGroups,
  getOriginalHeadline,
  getOriginalSkills,
  getOriginalSummary,
  parseTailoredSkills,
  serializeTailoredSkills,
  to编辑ableSkillGroups,
} from "../tailoring-utils";
import { canFinalizeTailoring } from "./rules";
import { TailoringSections } from "./TailoringSections";
import {
  getTailoring保存PayloadKey,
  type Tailoring保存Payload,
  useTailoringDraft,
} from "./useTailoringDraft";

interface TailoringWorkspaceBaseProps {
  job: Job;
  onDirtyChange?: (isDirty: boolean) => void;
}

interface TailoringWorkspace编辑orProps extends TailoringWorkspaceBaseProps {
  mode: "editor";
  on更新: () => void | Promise<void>;
  onRegister保存?: (save: () => Promise<void>) => void;
  onBeforeGenerate?: () => boolean | Promise<boolean>;
}

interface TailoringWorkspaceTailorProps extends TailoringWorkspaceBaseProps {
  mode: "tailor";
  on返回: () => void;
  onFinalize: () => void;
  isFinalizing: boolean;
  variant?: "discovered" | "ready";
}

type TailoringWorkspaceProps =
  | TailoringWorkspace编辑orProps
  | TailoringWorkspaceTailorProps;
type TailoringSectionsProps = ComponentProps<typeof TailoringSections>;

interface TailoringBaseline {
  summary: string;
  headline: string;
  skillsJson: string;
}

type Autosave状态 = "saved" | "unsaved" | "saving" | "error";

const Autosave状态Icon: React.FC<{ status: Autosave状态 }> = ({
  status,
}) => {
  const copy =
    status === "saving"
      ? "Saving..."
      : status === "unsaved"
        ? "Unsaved changes"
        : status === "error"
          ? "保存 failed"
          : "保存d";
  const iconClass名称 =
    status === "error"
      ? "text-rose-300"
      : status === "unsaved"
        ? "text-amber-300"
        : status === "saving"
          ? "text-muted-foreground"
          : "text-emerald-400/80";

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            class名称="inline-flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground"
            role="img"
            aria-label={copy}
          >
            {status === "saving" ? (
              <Loader2 class名称="h-3.5 w-3.5 animate-spin" />
            ) : status === "error" || status === "unsaved" ? (
              <CircleAlert class名称={`h-3.5 w-3.5 ${iconClass名称}`} />
            ) : (
              <Check class名称={`h-3.5 w-3.5 ${iconClass名称}`} />
            )}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>{copy}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const normalizeSkillsJson = (value: string | null | undefined) =>
  serializeTailoredSkills(parseTailoredSkills(value));

const toBaselineFromJob = (job: Job): TailoringBaseline => ({
  summary: job.tailoredSummary ?? "",
  headline: job.tailoredHeadline ?? "",
  skillsJson: normalizeSkillsJson(job.tailoredSkills),
});

const to保存PayloadFromJob = (job: Job): Tailoring保存Payload => ({
  tailoredSummary: job.tailoredSummary ?? "",
  tailoredHeadline: job.tailoredHeadline ?? "",
  tailoredSkills: normalizeSkillsJson(job.tailoredSkills),
  job描述: job.job描述 ?? "",
  selectedProjectIds: job.selectedProjectIds ?? "",
  tracerLinksEnabled: Boolean(job.tracerLinksEnabled),
});

export const TailoringWorkspace: React.FC<TailoringWorkspaceProps> = (
  props,
) => {
  const editorProps = props.mode === "editor" ? props : null;
  const tailorProps = props.mode === "tailor" ? props : null;

  const {
    catalog,
    isCatalogLoading,
    summary,
    setSummary,
    headline,
    setHeadline,
    job描述,
    setJob描述,
    selectedIds,
    selectedIdsCsv,
    tracerLinksEnabled,
    setTracerLinksEnabled,
    skillsDraft,
    setSkillsDraft,
    openSkillGroupId,
    setOpenSkillGroupId,
    skillsJson,
    isDirty,
    savedPayloadKey,
    applyIncomingDraft,
    mark保存dJob,
    handleToggleProject,
    handle添加SkillGroup,
    handle更新SkillGroup,
    handle移除SkillGroup,
  } = useTailoringDraft({
    job: props.job,
    onDirtyChange: props.onDirtyChange,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [autosave状态, setAutosave状态] = useState<Autosave状态>("saved");
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveInFlightRef = useRef<Promise<void> | null>(null);
  const saveAgainRef = useRef(false);
  const latestPayloadRef = useRef<Tailoring保存Payload | null>(null);
  const persistedPayloadKeyRef = useRef(savedPayloadKey);
  const isMountedRef = useRef(true);
  const { profile, error: profileError } = use个人资料();
  const { readiness: tracerReadiness, isChecking: isTracerReadinessChecking } =
    useTracerReadiness();

  const originalValues = useMemo(() => {
    const skillsDraft = to编辑ableSkillGroups(getOriginalSkills(profile));
    return {
      summary: getOriginalSummary(profile),
      headline: getOriginalHeadline(profile),
      skillsDraft,
      skillsJson: serializeTailoredSkills(from编辑ableSkillGroups(skillsDraft)),
    };
  }, [profile]);
  const canUseOriginalValues = Boolean(profile) && !profileError;
  const [aiBaseline, setAiBaseline] = useState<TailoringBaseline>(() =>
    toBaselineFromJob(props.job),
  );

  useEffect(() => {
    setAiBaseline({
      summary: props.job.tailoredSummary ?? "",
      headline: props.job.tailoredHeadline ?? "",
      skillsJson: normalizeSkillsJson(props.job.tailoredSkills),
    });
  }, [
    props.job.tailoredSummary,
    props.job.tailoredHeadline,
    props.job.tailoredSkills,
  ]);

  const tracerEnableBlocked =
    !tracerLinksEnabled && !tracerReadiness?.canEnable;
  const tracerEnableBlockedReason =
    tracerReadiness?.canEnable === false
      ? (tracerReadiness.reason ??
        "Verify tracer links in 设置 before enabling this job.")
      : null;

  const savePayload = useMemo<Tailoring保存Payload>(
    () => ({
      tailoredSummary: summary,
      tailoredHeadline: headline,
      tailoredSkills: skillsJson,
      job描述,
      selectedProjectIds: selectedIdsCsv,
      tracerLinksEnabled,
    }),
    [
      summary,
      headline,
      skillsJson,
      job描述,
      selectedIdsCsv,
      tracerLinksEnabled,
    ],
  );
  const savePayloadKey = useMemo(
    () => getTailoring保存PayloadKey(savePayload),
    [savePayload],
  );

  useEffect(() => {
    latestPayloadRef.current = savePayload;
  }, [savePayload]);

  useEffect(() => {
    persistedPayloadKeyRef.current = savedPayloadKey;
  }, [savedPayloadKey]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
    };
  }, []);

  const persistCurrent = useCallback(async () => {
    const updatedJob = await api.updateJob(props.job.id, savePayload);
    applyIncomingDraft(updatedJob);
  }, [props.job.id, savePayload, applyIncomingDraft]);

  const runAutosaveLoop = useCallback(async () => {
    if (!editorProps) return;
    if (saveInFlightRef.current) {
      saveAgainRef.current = true;
      await saveInFlightRef.current;
      return;
    }

    const savePromise = (async () => {
      try {
        do {
          saveAgainRef.current = false;
          const snapshot = latestPayloadRef.current;
          if (!snapshot) return;

          if (
            getTailoring保存PayloadKey(snapshot) ===
            persistedPayloadKeyRef.current
          ) {
            if (isMountedRef.current) setAutosave状态("saved");
            return;
          }

          if (isMountedRef.current) setAutosave状态("saving");
          const snapshotKey = getTailoring保存PayloadKey(snapshot);
          const updatedJob = await api.updateJob(props.job.id, snapshot);
          if (!isMountedRef.current) return;
          const updatedPayload = to保存PayloadFromJob(updatedJob);

          const latestStillMatchesSnapshot =
            latestPayloadRef.current &&
            getTailoring保存PayloadKey(latestPayloadRef.current) ===
              snapshotKey;
          if (latestStillMatchesSnapshot) {
            applyIncomingDraft(updatedJob);
            latestPayloadRef.current = updatedPayload;
          } else {
            mark保存dJob(updatedJob);
          }
          persistedPayloadKeyRef.current =
            getTailoring保存PayloadKey(updatedPayload);

          const latestKey = latestPayloadRef.current
            ? getTailoring保存PayloadKey(latestPayloadRef.current)
            : persistedPayloadKeyRef.current;
          if (isMountedRef.current) {
            setAutosave状态(
              latestKey === persistedPayloadKeyRef.current
                ? "saved"
                : "unsaved",
            );
          }
        } while (
          saveAgainRef.current ||
          (latestPayloadRef.current &&
            getTailoring保存PayloadKey(latestPayloadRef.current) !==
              persistedPayloadKeyRef.current)
        );
      } catch {
        if (isMountedRef.current) setAutosave状态("error");
        throw new Error("Autosave failed");
      } finally {
        saveInFlightRef.current = null;
      }
    })();

    saveInFlightRef.current = savePromise;
    await savePromise;
  }, [applyIncomingDraft, editorProps, mark保存dJob, props.job.id]);

  const flushAutosave = useCallback(async () => {
    if (!editorProps) return;
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
      autosaveTimerRef.current = null;
    }
    if (saveInFlightRef.current) {
      saveAgainRef.current = true;
      await saveInFlightRef.current;
    }
    const latestPayload = latestPayloadRef.current;
    if (
      latestPayload &&
      getTailoring保存PayloadKey(latestPayload) !==
        persistedPayloadKeyRef.current
    ) {
      await runAutosaveLoop();
    }
  }, [editorProps, runAutosaveLoop]);

  useEffect(() => {
    if (!editorProps) return;
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
      autosaveTimerRef.current = null;
    }

    if (!isDirty || savePayloadKey === persistedPayloadKeyRef.current) {
      if (!saveInFlightRef.current) setAutosave状态("saved");
      return;
    }

    setAutosave状态("unsaved");
    if (saveInFlightRef.current) {
      saveAgainRef.current = true;
      return;
    }

    autosaveTimerRef.current = setTimeout(() => {
      autosaveTimerRef.current = null;
      void runAutosaveLoop().catch(() => {
        // The status state already reflects the failure; keep the draft local.
      });
    }, 800);

    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
        autosaveTimerRef.current = null;
      }
    };
  }, [editorProps, isDirty, runAutosaveLoop, savePayloadKey]);

  useEffect(() => {
    if (!editorProps?.onRegister保存) return;
    editorProps.onRegister保存(flushAutosave);
  }, [editorProps, flushAutosave]);

  const handleSummarize编辑or = useCallback(async () => {
    if (!editorProps) return;

    try {
      setIsSummarizing(true);
      await flushAutosave();

      const updatedJob = await api.summarizeJob(props.job.id, { force: true });
      applyIncomingDraft(updatedJob);
      setAiBaseline(toBaselineFromJob(updatedJob));
      toast.success("Draft content generated");
      await editorProps.on更新();
    } catch (error) {
      showErrorToast(error, "AI summarization failed");
    } finally {
      setIsSummarizing(false);
    }
  }, [editorProps, flushAutosave, props.job.id, applyIncomingDraft]);

  const handleGenerateWithAi = useCallback(async () => {
    if (!tailorProps) return;

    try {
      setIsGenerating(true);

      if (isDirty) {
        await persistCurrent();
      }

      const updatedJob = await api.summarizeJob(props.job.id, { force: true });
      applyIncomingDraft(updatedJob);
      setAiBaseline(toBaselineFromJob(updatedJob));

      toast.success("Draft generated with AI", {
        description: "Review and edit before finalizing.",
      });
    } catch (error) {
      showErrorToast(error, "Failed to generate AI draft");
    } finally {
      setIsGenerating(false);
    }
  }, [tailorProps, isDirty, persistCurrent, props.job.id, applyIncomingDraft]);

  const handleGeneratePdf = useCallback(async () => {
    if (!editorProps) return;

    try {
      const shouldProceed = editorProps.onBeforeGenerate
        ? await editorProps.onBeforeGenerate()
        : true;
      if (shouldProceed === false) return;

      setIsGeneratingPdf(true);
      await flushAutosave();
      await api.generateJobPdf(props.job.id);
      toast.success("Resume PDF generated");
      await editorProps.on更新();
    } catch (error) {
      const message = formatUserFacingError(error, "PDF generation failed");
      if (/tracer/i.test(message)) {
        toast.error("Tracer links are unavailable right now", {
          description: message,
        });
      } else {
        showErrorToast(error, "PDF generation failed");
      }
    } finally {
      setIsGeneratingPdf(false);
    }
  }, [editorProps, flushAutosave, props.job.id]);

  const handleFinalize = useCallback(async () => {
    if (!tailorProps) return;

    if (isDirty) {
      try {
        setIsSaving(true);
        await persistCurrent();
      } catch {
        toast.error("Failed to save draft before finalizing");
        setIsSaving(false);
        return;
      } finally {
        setIsSaving(false);
      }
    }

    tailorProps.onFinalize();
  }, [tailorProps, isDirty, persistCurrent]);

  const handleUndoSummary = useCallback(() => {
    setSummary(originalValues.summary);
  }, [originalValues.summary, setSummary]);

  const handleUndoHeadline = useCallback(() => {
    setHeadline(originalValues.headline);
  }, [originalValues.headline, setHeadline]);

  const handleUndoSkills = useCallback(() => {
    setSkillsDraft(originalValues.skillsDraft);
  }, [originalValues.skillsDraft, setSkillsDraft]);

  const handleRedoSummary = useCallback(() => {
    setSummary(aiBaseline.summary);
  }, [aiBaseline.summary, setSummary]);

  const handleRedoHeadline = useCallback(() => {
    setHeadline(aiBaseline.headline);
  }, [aiBaseline.headline, setHeadline]);

  const handleRedoSkills = useCallback(() => {
    setSkillsDraft(
      to编辑ableSkillGroups(parseTailoredSkills(aiBaseline.skillsJson)),
    );
  }, [aiBaseline.skillsJson, setSkillsDraft]);

  const disableInputs = editorProps
    ? isSummarizing || isGeneratingPdf || isSaving
    : isGenerating || Boolean(tailorProps?.isFinalizing) || isSaving;

  const canFinalize = canFinalizeTailoring(summary);
  const tailoringSectionsProps = useMemo<TailoringSectionsProps>(
    () => ({
      catalog,
      isCatalogLoading,
      summary,
      headline,
      job描述,
      skillsDraft,
      selectedIds,
      tracerLinksEnabled,
      tracerEnableBlocked,
      tracerEnableBlockedReason,
      tracerReadinessChecking: isTracerReadinessChecking,
      openSkillGroupId,
      disableInputs,
      onSummaryChange: setSummary,
      onHeadlineChange: setHeadline,
      onUndoSummary: handleUndoSummary,
      onUndoHeadline: handleUndoHeadline,
      onUndoSkills: handleUndoSkills,
      onRedoSummary: handleRedoSummary,
      onRedoHeadline: handleRedoHeadline,
      onRedoSkills: handleRedoSkills,
      canUndoSummary:
        canUseOriginalValues && summary !== originalValues.summary,
      canUndoHeadline:
        canUseOriginalValues && headline !== originalValues.headline,
      canUndoSkills:
        canUseOriginalValues && skillsJson !== originalValues.skillsJson,
      canRedoSummary: summary !== aiBaseline.summary,
      canRedoHeadline: headline !== aiBaseline.headline,
      canRedoSkills: skillsJson !== aiBaseline.skillsJson,
      undoDisabledReason: canUseOriginalValues
        ? null
        : "Original base CV unavailable.",
      on描述Change: setJob描述,
      onSkillGroupOpenChange: setOpenSkillGroupId,
      on添加SkillGroup: handle添加SkillGroup,
      on更新SkillGroup: handle更新SkillGroup,
      on移除SkillGroup: handle移除SkillGroup,
      onToggleProject: handleToggleProject,
      onTracerLinksEnabledChange: setTracerLinksEnabled,
    }),
    [
      catalog,
      isCatalogLoading,
      summary,
      headline,
      job描述,
      skillsDraft,
      selectedIds,
      tracerLinksEnabled,
      tracerEnableBlocked,
      tracerEnableBlockedReason,
      isTracerReadinessChecking,
      openSkillGroupId,
      disableInputs,
      setSummary,
      setHeadline,
      handleUndoSummary,
      handleUndoHeadline,
      handleUndoSkills,
      handleRedoSummary,
      handleRedoHeadline,
      handleRedoSkills,
      canUseOriginalValues,
      originalValues,
      skillsJson,
      aiBaseline,
      setJob描述,
      setOpenSkillGroupId,
      handle添加SkillGroup,
      handle更新SkillGroup,
      handle移除SkillGroup,
      handleToggleProject,
      setTracerLinksEnabled,
    ],
  );

  if (editorProps) {
    return (
      <div class名称="space-y-4">
        <div class名称="space-y-3 pb-2">
          <div>
            <div class名称="flex items-center gap-1.5">
              <h3 class名称="text-sm font-semibold text-foreground/85">
                Tailoring
              </h3>
              <Autosave状态Icon status={autosave状态} />
            </div>
            <p class名称="mt-0.5 text-[10px] text-muted-foreground/70">
              Changes autosave. Draft resume content, or generate the PDF.
            </p>
          </div>
          <div class名称="grid gap-2 sm:grid-cols-2">
            <Button
              onClick={handleSummarize编辑or}
              disabled={isSummarizing || isGeneratingPdf}
              variant="outline"
              class名称="h-10 w-full gap-1.5 px-2 text-xs"
            >
              {isSummarizing ? (
                <Loader2 class名称="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles class名称="mr-2 h-4 w-4" />
              )}
              Draft Content
            </Button>
            <Button
              onClick={handleGeneratePdf}
              disabled={isSummarizing || isGeneratingPdf || !summary}
              class名称="h-10 w-full gap-1.5 px-2 text-xs"
            >
              {isGeneratingPdf ? (
                <Loader2 class名称="h-4 w-4 animate-spin" />
              ) : (
                <FileText class名称="mr-2 h-4 w-4" />
              )}
              Generate PDF
            </Button>
          </div>
        </div>

        <div class名称="space-y-4 rounded-lg border bg-card p-4 shadow-sm">
          <TailoringSections {...tailoringSectionsProps} />
        </div>
      </div>
    );
  }

  if (!tailorProps) return null;

  const finalizeVariant = tailorProps.variant ?? "discovered";

  return (
    <div class名称="flex h-full flex-col">
      <div class名称="flex flex-col gap-2 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={tailorProps.on返回}
          class名称="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft class名称="h-3.5 w-3.5" />
          返回 to overview
        </button>
      </div>

      <div class名称="flex-1 space-y-4 overflow-y-auto pr-1">
        <div class名称="flex flex-col gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div class名称="flex items-center gap-2">
              <div class名称="h-2 w-2 animate-pulse rounded-full bg-amber-400" />
              <span class名称="text-xs font-medium text-amber-300">
                Draft tailoring for this role
              </span>
            </div>
            <p class名称="ml-4 mt-1 text-[10px] text-muted-foreground">
              AI can draft summary, headline, skills, and project selection.
            </p>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={handleGenerateWithAi}
            disabled={isGenerating || tailorProps.isFinalizing || isSaving}
            class名称="h-8 w-full text-xs sm:w-auto"
          >
            {isGenerating ? (
              <Loader2 class名称="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles class名称="mr-1.5 h-3.5 w-3.5" />
            )}
            Generate draft
          </Button>
        </div>

        <TailoringSections {...tailoringSectionsProps} />
      </div>

      <Separator class名称="my-4 opacity-50" />

      <div class名称="space-y-2">
        {!canFinalize && (
          <p class名称="text-center text-[10px] text-muted-foreground">
            添加 a summary to{" "}
            {finalizeVariant === "ready" ? "regenerate" : "finalize"}.
          </p>
        )}
        <Button
          onClick={() => void handleFinalize()}
          disabled={tailorProps.isFinalizing || !canFinalize || isGenerating}
          class名称="h-10 w-full bg-emerald-600 text-white hover:bg-emerald-500"
        >
          {tailorProps.isFinalizing ? (
            <>
              <Loader2 class名称="mr-2 h-4 w-4 animate-spin" />
              {finalizeVariant === "ready"
                ? "Regenerating PDF..."
                : "Finalizing & generating PDF..."}
            </>
          ) : (
            <>
              <Check class名称="mr-2 h-4 w-4" />
              {finalizeVariant === "ready"
                ? "Regenerate PDF"
                : "Finalize & Move to Ready"}
            </>
          )}
        </Button>
        <p class名称="text-center text-[10px] text-muted-foreground/70">
          {finalizeVariant === "ready"
            ? "This will save your changes and regenerate the tailored PDF."
            : "This will generate your tailored PDF and move the job to Ready."}
        </p>
      </div>
    </div>
  );
};
