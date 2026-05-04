import * as api from "@client/api";
import type { ManualImportResult } from "@client/components/ManualImportFlow";
import { use设置 } from "@client/hooks/use设置";
import {
  createLocationIntent,
  planLocationSources,
} from "@shared/location-intelligence.js";
import type { App设置, JobSource } from "@shared/types.js";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { showErrorToast } from "@/client/lib/error-toast";
import { trackProductEvent } from "@/lib/analytics";
import type { AutomaticRunValues } from "./automatic-run";
import {
  deriveExtractorLimits,
  serializeCityLocationsSetting,
} from "./automatic-run";
import type { RunMode } from "./run-mode";

type UsePipelineControlsArgs = {
  isPipelineRunning: boolean;
  setIsPipelineRunning: (value: boolean) => void;
  pipelineTerminalEvent: { status: string; errorMessage: string | null } | null;
  pipelineSources: JobSource[];
  loadJobs: () => Promise<void>;
  navigateWithContext: (
    newTab: string,
    newJobId?: string | null,
    isReplace?: boolean,
  ) => void;
};

export type UsePipelineControlsResult = {
  isRunModeModalOpen: boolean;
  setIsRunModeModalOpen: (open: boolean) => void;
  runMode: RunMode;
  setRunMode: (mode: RunMode) => void;
  is取消ling: boolean;
  openRunMode: (mode: RunMode) => void;
  handle取消Pipeline: () => Promise<void>;
  handle保存AndRunAutomatic: (values: AutomaticRunValues) => Promise<void>;
  handleManualImported: (result: ManualImportResult) => Promise<void>;
  refresh设置: () => Promise<App设置 | null>;
};

export function usePipelineControls(
  args: UsePipelineControlsArgs,
): UsePipelineControlsResult {
  const {
    isPipelineRunning,
    setIsPipelineRunning,
    pipelineTerminalEvent,
    pipelineSources,
    loadJobs,
    navigateWithContext,
  } = args;

  const [isRunModeModalOpen, setIsRunModeModalOpen] = useState(false);
  const [runMode, setRunMode] = useState<RunMode>("automatic");
  const [is取消ling, setIs取消ling] = useState(false);

  const { refresh设置 } = use设置();

  useEffect(() => {
    if (!pipelineTerminalEvent) return;
    setIsPipelineRunning(false);
    setIs取消ling(false);

    if (pipelineTerminalEvent.status === "cancelled") {
      trackProductEvent("jobs_pipeline_run_finished", {
        status: "cancelled",
        had_error_message: false,
      });
      toast.message("Pipeline cancelled");
      return;
    }

    if (pipelineTerminalEvent.status === "failed") {
      trackProductEvent("jobs_pipeline_run_finished", {
        status: "failed",
        had_error_message: Boolean(pipelineTerminalEvent.errorMessage),
      });
      toast.error(pipelineTerminalEvent.errorMessage || "Pipeline failed");
      return;
    }

    trackProductEvent("jobs_pipeline_run_finished", {
      status: "completed",
      had_error_message: false,
    });
    toast.success("Pipeline completed");
  }, [pipelineTerminalEvent, setIsPipelineRunning]);

  const openRunMode = useCallback((mode: RunMode) => {
    setRunMode(mode);
    setIsRunModeModalOpen(true);
  }, []);

  const startPipelineRun = useCallback(
    async (config: {
      topN: number;
      minSuitabilityScore: number;
      sources: JobSource[];
      runBudget: number;
      searchTerms: string[];
      country: string;
      cityLocations: string[];
      workplaceTypes: Array<"remote" | "hybrid" | "onsite">;
      searchScope: AutomaticRunValues["searchScope"];
      matchStrictness: AutomaticRunValues["matchStrictness"];
    }) => {
      try {
        setIsPipelineRunning(true);
        setIs取消ling(false);
        await api.runPipeline({
          topN: config.topN,
          minSuitabilityScore: config.minSuitabilityScore,
          sources: config.sources,
          runBudget: config.runBudget,
          searchTerms: config.searchTerms,
          country: config.country,
          cityLocations: config.cityLocations,
          workplaceTypes: config.workplaceTypes,
          searchScope: config.searchScope,
          matchStrictness: config.matchStrictness,
        });
        toast.message("Pipeline started", {
          description: `Sources: ${config.sources.join(", ")}. This may take a few minutes.`,
        });
      } catch (error) {
        setIsPipelineRunning(false);
        setIs取消ling(false);
        showErrorToast(error, "Failed to start pipeline");
      }
    },
    [setIsPipelineRunning],
  );

  const handle取消Pipeline = useCallback(async () => {
    if (is取消ling || !isPipelineRunning) return;

    try {
      setIs取消ling(true);
      trackProductEvent("jobs_pipeline_run_cancel_requested", {
        was_running: isPipelineRunning,
      });
      const result = await api.cancelPipeline();
      toast.message(result.message);
    } catch (error) {
      setIs取消ling(false);
      showErrorToast(error, "Failed to cancel pipeline");
    }
  }, [is取消ling, isPipelineRunning]);

  const handle保存AndRunAutomatic = useCallback(
    async (values: AutomaticRunValues) => {
      const locationIntent = createLocationIntent({
        selectedCountry: values.country,
        cityLocations: values.cityLocations,
        workplaceTypes: values.workplaceTypes,
        searchScope: values.searchScope,
        matchStrictness: values.matchStrictness,
      });
      const sourcePlan = planLocationSources({
        intent: locationIntent,
        sources: pipelineSources,
      });
      const incompatiblePlans = sourcePlan.plans.filter((plan) => !plan.canRun);
      const compatibleSources = sourcePlan.compatibleSources as JobSource[];

      if (incompatiblePlans.length > 0) {
        toast.error(
          incompatiblePlans[0]?.reasons[0] ??
            "Some selected sources do not support this location setup.",
        );
        return;
      }

      if (compatibleSources.length === 0) {
        toast.error(
          "否 compatible sources for the selected location setup. Choose another country, city, or source.",
        );
        return;
      }

      const limits = deriveExtractorLimits({
        budget: values.runBudget,
        searchTerms: values.searchTerms,
        sources: compatibleSources,
      });
      const searchCities = serializeCityLocationsSetting(values.cityLocations);
      await api.update设置({
        searchTerms: values.searchTerms,
        workplaceTypes: values.workplaceTypes,
        location搜索Scope: values.searchScope,
        locationMatchStrictness: values.matchStrictness,
        jobspyResultsWanted: limits.jobspyResultsWanted,
        gradcrackerMaxJobsPerTerm: limits.gradcrackerMaxJobsPerTerm,
        ukvisajobsMaxJobs: limits.ukvisajobsMaxJobs,
        adzunaMaxJobsPerTerm: limits.adzunaMaxJobsPerTerm,
        startupjobsMaxJobsPerTerm: limits.startupjobsMaxJobsPerTerm,
        jobindexMaxJobsPerTerm: limits.jobindexMaxJobsPerTerm,
        seekMaxJobsPerTerm: limits.seekMaxJobsPerTerm,
        naukriMaxJobsPerTerm: limits.naukriMaxJobsPerTerm,
        jobspyCountryIndeed: values.country,
        searchCities,
      });
      await refresh设置();
      await startPipelineRun({
        ...values,
        sources: compatibleSources,
        topN: values.topN,
        minSuitabilityScore: values.minSuitabilityScore,
      });
      setIsRunModeModalOpen(false);
    },
    [pipelineSources, refresh设置, startPipelineRun],
  );

  const handleManualImported = useCallback(
    async (imported: ManualImportResult) => {
      trackProductEvent("jobs_manual_import_completed", {
        manual_import_source: imported.source,
        manual_import_source_host: imported.sourceHost ?? undefined,
      });
      await loadJobs();
      navigateWithContext("ready", imported.jobId);
    },
    [loadJobs, navigateWithContext],
  );

  return {
    isRunModeModalOpen,
    setIsRunModeModalOpen,
    runMode,
    setRunMode,
    is取消ling,
    openRunMode,
    handle取消Pipeline,
    handle保存AndRunAutomatic,
    handleManualImported,
    refresh设置,
  };
}
