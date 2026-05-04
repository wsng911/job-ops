import {
  type ApplicationStage,
  type ApplicationTask,
  type Job,
  type Job否te,
  type JobOutcome,
  type ResumeProjectCatalogItem,
  STAGE_LABELS,
  type StageEvent,
} from "@shared/types.js";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import confetti from "canvas-confetti";
import {
  ArrowLeft,
  ClipboardList,
  DollarSign,
  ExternalLink,
  FileText,
  MessageSquareText,
  PlusCircle,
  Sparkles,
  Upload,
} from "lucide-react";
import React from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
  use搜索Params,
} from "react-router-dom";
import { toast } from "sonner";
import { Job描述Markdown } from "@/client/components/Job描述Markdown";
import { invalidateJobData } from "@/client/hooks/queries/invalidate";
import {
  useCheckSponsorMutation,
  useGenerateJobPdfMutation,
  useMarkAsAppliedMutation,
  useRescoreJobMutation,
  useSkipJobMutation,
  use更新JobMutation,
} from "@/client/hooks/queries/useJobMutations";
import { useQueryErrorToast } from "@/client/hooks/useQueryErrorToast";
import { showErrorToast } from "@/client/lib/error-toast";
import { uploadJobPdfFromFile } from "@/client/lib/job-pdf-upload";
import { getRenderableJob描述 } from "@/client/lib/job描述";
import { openJobPdf } from "@/client/lib/private-pdf";
import { queryKeys } from "@/client/lib/queryKeys";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  copyTextToClipboard,
  formatDateTime,
  formatJobForWebhook,
  formatTimestamp,
  sourceLabel as sourceLabels,
} from "@/lib/utils";
import * as api from "../api";
import { 确认删除 } from "../components/确认删除";
import { GhostwriterPanel } from "../components/ghostwriter/GhostwriterPanel";
import { JobDetails编辑Drawer } from "../components/JobDetails编辑Drawer";
import {
  type LogEventFormValues,
  LogEventModal,
} from "../components/LogEventModal";
import { JobTimeline } from "./job/Timeline";
import { Job否tesCard } from "./job-page/Job否tesCard";
import {
  type JobMemoryView,
  JobPageLeftSidebar,
} from "./job-page/JobPageLeftSidebar";
import { JobPageRightSidebar } from "./job-page/JobPageRightSidebar";
import { OverviewGhostwriterComposer } from "./job-page/OverviewGhostwriterComposer";

const normalizeMemoryView = (view: string | undefined): JobMemoryView => {
  if (view === "notes" || view === "note") return "note";
  if (view === "documents" || view === "timeline" || view === "ghostwriter") {
    return view;
  }
  return "overview";
};

type JobPageLocationState = {
  jobPage返回To?: string;
};

const isValidJobPage返回Target = (value: unknown): value is string =>
  typeof value === "string" &&
  value.startsWith("/") &&
  !value.startsWith("/job/");

const getFallback返回Target = (job: Job | null): string => {
  if (job?.status === "ready" || job?.status === "discovered") {
    return `/jobs/${job.status}`;
  }
  if (job?.status === "applied") {
    return "/jobs/applied";
  }
  if (job?.status === "in_progress") {
    return "/applications/in-progress";
  }
  return "/jobs/all";
};

const sort否tesBy更新dAtDesc = (notes: Job否te[]) =>
  [...notes].sort(
    (left, right) =>
      new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
  );

const parseSelectedProjectIds = (value: string | null | undefined) =>
  value
    ?.split(",")
    .map((id) => id.trim())
    .filter(Boolean) ?? [];

export const JobPage: React.FC = () => {
  const { id, view } = useParams<{ id: string; view?: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = use搜索Params();
  const queryClient = useQueryClient();
  const [isLogModalOpen, setIsLogModalOpen] = React.useState(false);
  const [is删除ModalOpen, setIs删除ModalOpen] = React.useState(false);
  const [is编辑DetailsOpen, setIs编辑DetailsOpen] = React.useState(false);
  const [isUploadingPdf, setIsUploadingPdf] = React.useState(false);
  const [activeAction, setActiveAction] = React.useState<string | null>(null);
  const [eventTo删除, setEventTo删除] = React.useState<string | null>(null);
  const [editingEvent, set编辑ingEvent] = React.useState<StageEvent | null>(
    null,
  );
  const [catalog, setCatalog] = React.useState<ResumeProjectCatalogItem[]>([]);
  const pendingEventRef = React.useRef<StageEvent | null>(null);
  const uploadPdfInputRef = React.useRef<HTMLInputElement | null>(null);
  const open编辑Details = React.useCallback(() => {
    window.setTimeout(() => setIs编辑DetailsOpen(true), 0);
  }, []);

  const jobQuery = useQuery<Job | null>({
    queryKey: ["jobs", "detail", id ?? null] as const,
    queryFn: () => (id ? api.getJob(id) : Promise.resolve(null)),
    enabled: Boolean(id),
  });
  const eventsQuery = useQuery<StageEvent[]>({
    queryKey: ["jobs", "stage-events", id ?? null] as const,
    queryFn: () => (id ? api.getJobStageEvents(id) : Promise.resolve([])),
    enabled: Boolean(id),
  });
  const notesQuery = useQuery<Job否te[]>({
    queryKey: queryKeys.jobs.notes(id ?? ""),
    queryFn: () => (id ? api.getJob否tes(id) : Promise.resolve([])),
    enabled: Boolean(id),
  });
  const tasksQuery = useQuery<ApplicationTask[]>({
    queryKey: ["jobs", "tasks", id ?? null] as const,
    queryFn: () => (id ? api.getJobTasks(id) : Promise.resolve([])),
    enabled: Boolean(id),
  });

  useQueryErrorToast(
    jobQuery.error,
    "Failed to load job details. Please try again.",
  );
  useQueryErrorToast(
    eventsQuery.error,
    "Failed to load job timeline. Please try again.",
  );
  useQueryErrorToast(
    tasksQuery.error,
    "Failed to load job tasks. Please try again.",
  );

  const markAsAppliedMutation = useMarkAsAppliedMutation();
  const updateJobMutation = use更新JobMutation();
  const skipJobMutation = useSkipJobMutation();
  const rescoreJobMutation = useRescoreJobMutation();
  const generatePdfMutation = useGenerateJobPdfMutation();
  const checkSponsorMutation = useCheckSponsorMutation();

  const job = jobQuery.data ?? null;
  const events = mergeEvents(eventsQuery.data ?? [], pendingEventRef.current);
  const notes = React.useMemo(
    () => sort否tesBy更新dAtDesc(notesQuery.data ?? []),
    [notesQuery.data],
  );
  const tasks = tasksQuery.data ?? [];
  const isLoading =
    jobQuery.isLoading || eventsQuery.isLoading || tasksQuery.isLoading;
  const activeMemoryView = normalizeMemoryView(view);
  useQueryErrorToast(
    activeMemoryView === "note" ? null : notesQuery.error,
    "Failed to load notes. Please try again.",
  );
  const selectedProjectIds = React.useMemo(
    () => parseSelectedProjectIds(job?.selectedProjectIds),
    [job?.selectedProjectIds],
  );
  const selectedProjectIdsKey = selectedProjectIds.join(",");
  const selectedProjects = React.useMemo(
    () =>
      selectedProjectIds.map(
        (projectId) =>
          catalog.find((project) => project.id === projectId)?.name ??
          projectId,
      ),
    [catalog, selectedProjectIds],
  );
  const sourceLabel = job ? sourceLabels[job.source] : "";
  const jobPage返回To = React.useMemo(() => {
    const state = location.state as JobPageLocationState | null;
    return isValidJobPage返回Target(state?.jobPage返回To)
      ? state.jobPage返回To
      : null;
  }, [location.state]);
  const jobPageNavigationState = React.useMemo(
    () => (jobPage返回To ? { jobPage返回To } : undefined),
    [jobPage返回To],
  );

  React.useEffect(() => {
    if (!id || view !== "note") return;
    const search = location.search;
    navigate(`/job/${id}/notes${search}`, {
      replace: true,
      state: jobPageNavigationState,
    });
  }, [id, jobPageNavigationState, location.search, navigate, view]);

  React.useEffect(() => {
    let is取消led = false;

    if (selectedProjectIdsKey.length === 0) {
      setCatalog([]);
      return () => {
        is取消led = true;
      };
    }

    void api
      .getResumeProjectsCatalog()
      .then((nextCatalog) => {
        if (!is取消led) {
          setCatalog(nextCatalog);
        }
      })
      .catch(() => {
        if (!is取消led) {
          setCatalog([]);
        }
      });

    return () => {
      is取消led = true;
    };
  }, [selectedProjectIdsKey]);

  const loadData = React.useCallback(async () => {
    if (!id) return;
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.detail(id) }),
      queryClient.invalidateQueries({
        queryKey: queryKeys.jobs.stageEvents(id),
      }),
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.tasks(id) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.notes(id) }),
    ]);
  }, [id, queryClient]);

  const handleLogEvent = async (
    values: LogEventFormValues,
    eventId?: string,
  ) => {
    if (!job) return;
    if (job.status !== "in_progress") {
      toast.error("Move this job to In Progress to track stages.");
      return;
    }

    let toStage: ApplicationStage | "no_change" = values.stage as
      | ApplicationStage
      | "no_change";
    let outcome: JobOutcome | null = null;

    if (values.stage === "rejected") {
      toStage = "closed";
      outcome = "rejected";
    } else if (values.stage === "withdrawn") {
      toStage = "closed";
      outcome = "withdrawn";
    }

    const currentStage = events.at(-1)?.toStage ?? "applied";
    const effectiveStage =
      toStage === "no_change" ? (currentStage ?? "applied") : toStage;

    try {
      if (eventId) {
        await api.updateJobStageEvent(job.id, eventId, {
          toStage: toStage === "no_change" ? undefined : toStage,
          occurredAt: toTimestamp(values.date) ?? undefined,
          metadata: {
            note: values.notes?.trim() || undefined,
            eventLabel: values.title.trim() || undefined,
            reasonCode:
              values.reasonCode ||
              (values.stage === "no_change"
                ? undefined
                : "job_page_manual_stage"),
            actor: "user",
            eventType: values.stage === "no_change" ? "note" : "status_update",
            externalUrl: values.salary ? `Salary: ${values.salary}` : undefined,
          },
          outcome,
        });
      } else {
        const newEvent = await api.transitionJobStage(job.id, {
          toStage: effectiveStage,
          occurredAt: toTimestamp(values.date),
          metadata: {
            note: values.notes?.trim() || undefined,
            eventLabel: values.title.trim() || undefined,
            reasonCode:
              values.reasonCode ||
              (values.stage === "no_change"
                ? undefined
                : "job_page_manual_stage"),
            actor: "user",
            eventType: values.stage === "no_change" ? "note" : "status_update",
            externalUrl: values.salary ? `Salary: ${values.salary}` : undefined,
          },
          outcome,
        });
        pendingEventRef.current = newEvent;
      }

      await invalidateJobData(queryClient, job.id);
      pendingEventRef.current = null;
      set编辑ingEvent(null);
      toast.success(eventId ? "Event updated" : "Event logged");

      if (effectiveStage === "offer") {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#10b981", "#34d399", "#6ee7b7", "#ffffff"],
        });
      }
    } catch (error) {
      showErrorToast(error, "Failed to log event");
    }
  };

  const confirm删除Event = (eventId: string) => {
    setEventTo删除(eventId);
    setIs删除ModalOpen(true);
  };

  const handle删除Event = async () => {
    if (!job || !eventTo删除) return;
    try {
      await api.deleteJobStageEvent(job.id, eventTo删除);
      await invalidateJobData(queryClient, job.id);
      toast.success("Event deleted");
    } catch (error) {
      showErrorToast(error, "Failed to delete event");
    } finally {
      setIs删除ModalOpen(false);
      setEventTo删除(null);
    }
  };

  const handle编辑Event = (event: StageEvent) => {
    set编辑ingEvent(event);
    setIsLogModalOpen(true);
  };

  const runAction = React.useCallback(
    async (actionKey: string, task: () => Promise<void>) => {
      if (!job) return;
      try {
        setActiveAction(actionKey);
        await task();
        await loadData();
      } catch (error) {
        showErrorToast(error, "Failed to run action");
      } finally {
        setActiveAction(null);
      }
    },
    [job, loadData],
  );

  const handleMarkApplied = async () => {
    await runAction("mark-applied", async () => {
      if (!job) return;
      await markAsAppliedMutation.mutateAsync(job.id);
      toast.success("Marked as applied");
    });
  };

  const handleMoveToInProgress = async () => {
    await runAction("move-in-progress", async () => {
      if (!job) return;
      await updateJobMutation.mutateAsync({
        id: job.id,
        update: { status: "in_progress" },
      });
      toast.success("Moved to in progress");
    });
  };

  const handleSkip = async () => {
    await runAction("skip", async () => {
      if (!job) return;
      await skipJobMutation.mutateAsync(job.id);
      toast.message("Job skipped");
    });
  };

  const handleRescore = async () => {
    await runAction("rescore", async () => {
      if (!job) return;
      await rescoreJobMutation.mutateAsync(job.id);
      toast.success("Match recalculated");
    });
  };

  const handleRegeneratePdf = async () => {
    await runAction("regenerate-pdf", async () => {
      if (!job) return;
      await generatePdfMutation.mutateAsync(job.id);
      toast.success("Resume PDF generated");
    });
  };

  const handleCheckSponsor = async () => {
    await runAction("check-sponsor", async () => {
      if (!job) return;
      await checkSponsorMutation.mutateAsync(job.id);
      toast.success("Sponsor check completed");
    });
  };

  const handleCopyJobInfo = async () => {
    if (!job) return;
    try {
      await copyTextToClipboard(formatJobForWebhook(job));
      toast.success("Copied job info", {
        description: "Webhook payload copied to clipboard.",
      });
    } catch {
      toast.error("Could not copy job info");
    }
  };

  const handleUploadPdf = async (file: File) => {
    if (!job) return;

    try {
      setIsUploadingPdf(true);
      await uploadJobPdfFromFile(job.id, file);
      await loadData();
      toast.success(
        job.pdfPath ? "Resume PDF replaced" : "Resume PDF attached",
      );
    } catch (error) {
      showErrorToast(error, "Failed to upload resume PDF");
    } finally {
      setIsUploadingPdf(false);
      if (uploadPdfInputRef.current) {
        uploadPdfInputRef.current.value = "";
      }
    }
  };

  const currentStage = job
    ? (events.at(-1)?.toStage ??
      (job.status === "applied" || job.status === "in_progress"
        ? "applied"
        : null))
    : null;
  const is关闭dStage = currentStage === "closed";
  const canTrackStages = job?.status === "in_progress";
  const canLogEvents = canTrackStages && !is关闭dStage;
  const jobLink = job ? job.applicationLink || job.jobUrl : null;
  const isBusy = activeAction !== null;
  const isDiscovered = job?.status === "discovered";
  const isReady = job?.status === "ready";
  const isApplied = job?.status === "applied";
  const isInProgress = job?.status === "in_progress";
  const baseJobPath = id ? `/job/${id}` : "";
  const latest否te = notes[0] ?? null;
  const latestEvent = events.at(-1) ?? null;
  const latestEvent标题 =
    latestEvent?.metadata?.eventLabel || latestEvent?.title || null;
  const job描述Preview = summarizeMemoryText(job?.job描述, 260);
  const latest否tePreview = summarizeMemoryText(latest否te?.content, 180);
  const initialGhostwriterPrompt =
    activeMemoryView === "ghostwriter" ? searchParams.get("prompt") : null;
  const clearInitialGhostwriterPrompt = React.useCallback(() => {
    navigate(`${baseJobPath}/ghostwriter`, {
      replace: true,
      state: jobPageNavigationState,
    });
  }, [baseJobPath, jobPageNavigationState, navigate]);
  const handle返回 = React.useCallback(() => {
    navigate(jobPage返回To ?? getFallback返回Target(job));
  }, [job, jobPage返回To, navigate]);
  const pageGridClass =
    activeMemoryView === "overview"
      ? "grid items-start gap-4 grid-cols-1 xl:grid-cols-[18rem_minmax(0,1fr)_18rem]"
      : "grid items-start gap-4 grid-cols-1 xl:grid-cols-[18rem_minmax(0,1fr)]";

  if (!id) {
    return null;
  }

  return (
    <main class名称="mx-auto max-w-[92rem] px-4 py-5">
      <div class名称="mb-4 flex items-center justify-between gap-4">
        <Button variant="ghost" size="sm" onClick={handle返回}>
          <ArrowLeft class名称="h-4 w-4" />
          返回
        </Button>
        {job && (
          <Badge
            variant="outline"
            class名称="border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
          >
            {currentStage
              ? STAGE_LABELS[currentStage as ApplicationStage] || currentStage
              : job.status}
          </Badge>
        )}
      </div>

      {!job && (
        <div class名称="rounded-lg border border-dashed border-border/40 p-6 text-sm text-muted-foreground">
          {isLoading ? "Loading application..." : "Application not found."}
        </div>
      )}

      {job && (
        <div class名称={pageGridClass}>
          <JobPageLeftSidebar
            job={job}
            activeMemoryView={activeMemoryView}
            baseJobPath={baseJobPath}
            navigationState={jobPageNavigationState}
            selectedProjects={selectedProjects}
            sourceLabel={sourceLabel}
          />

          <div class名称="space-y-4">
            {activeMemoryView === "overview" && (
              <section class名称="space-y-4">
                <OverviewGhostwriterComposer
                  job={job}
                  baseJobPath={baseJobPath}
                  has否tes={notes.length > 0}
                  navigationState={jobPageNavigationState}
                />

                <div class名称="grid gap-4 lg:grid-cols-2">
                  <article class名称="rounded-xl border border-border/50 bg-card/75 p-4">
                    <div class名称="flex items-start justify-between gap-3">
                      <div class名称="flex items-center gap-2 text-sm font-semibold">
                        <MessageSquareText class名称="h-4 w-4 text-primary" />
                        否tes
                      </div>
                      <Badge variant="secondary" class名称="text-[10px]">
                        {notesQuery.isLoading
                          ? "Loading"
                          : `${notes.length} saved`}
                      </Badge>
                    </div>
                    <div class名称="mt-4 min-h-[5.5rem] rounded-lg border border-border/50 bg-background/25 p-3">
                      {latest否te ? (
                        <div>
                          <div class名称="text-sm font-medium">
                            {latest否te.title}
                          </div>
                          <div class名称="mt-1 text-xs text-muted-foreground">
                            更新d{" "}
                            {formatDateTime(latest否te.updatedAt) ??
                              latest否te.updatedAt}
                          </div>
                          {latest否tePreview && (
                            <p class名称="mt-3 text-sm leading-6 text-muted-foreground">
                              {latest否tePreview}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div class名称="text-sm text-muted-foreground">
                          否 notes or transcripts captured yet.
                        </div>
                      )}
                    </div>
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      class名称="mt-4 w-full justify-between"
                    >
                      <Link
                        to={`${baseJobPath}/notes`}
                        state={jobPageNavigationState}
                      >
                        Open notes
                        <ExternalLink class名称="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </article>

                  <article class名称="rounded-xl border border-border/50 bg-card/75 p-4">
                    <div class名称="flex items-start justify-between gap-3">
                      <div class名称="flex items-center gap-2 text-sm font-semibold">
                        <FileText class名称="h-4 w-4 text-primary" />
                        Documents
                      </div>
                      <Badge variant="secondary" class名称="text-[10px]">
                        {job.pdfPath ? "Resume ready" : "否 resume PDF"}
                      </Badge>
                    </div>
                    <div class名称="mt-4 grid gap-3 sm:grid-cols-2">
                      <div class名称="rounded-lg border border-border/50 bg-background/25 p-3">
                        <div class名称="text-xs uppercase tracking-wide text-muted-foreground">
                          Resume PDF
                        </div>
                        <div class名称="mt-2 text-sm font-medium">
                          {job.pdfPath ? "Stored for this job" : "Missing"}
                        </div>
                      </div>
                      <div class名称="rounded-lg border border-border/50 bg-background/25 p-3">
                        <div class名称="text-xs uppercase tracking-wide text-muted-foreground">
                          Job description
                        </div>
                        <div class名称="mt-2 text-sm font-medium">
                          {job.job描述 ? "保存d" : "Missing"}
                        </div>
                      </div>
                    </div>
                    {job描述Preview && (
                      <p class名称="mt-4 line-clamp-3 text-sm leading-6 text-muted-foreground">
                        {job描述Preview}
                      </p>
                    )}
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      class名称="mt-4 w-full justify-between"
                    >
                      <Link
                        to={`${baseJobPath}/documents`}
                        state={jobPageNavigationState}
                      >
                        Open documents
                        <ExternalLink class名称="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </article>

                  <article class名称="rounded-xl border border-border/50 bg-card/75 p-4">
                    <div class名称="flex items-start justify-between gap-3">
                      <div class名称="flex items-center gap-2 text-sm font-semibold">
                        <ClipboardList class名称="h-4 w-4 text-primary" />
                        Timeline
                      </div>
                      {currentStage && (
                        <Badge variant="secondary" class名称="text-[10px]">
                          {STAGE_LABELS[currentStage as ApplicationStage] ||
                            currentStage}
                        </Badge>
                      )}
                    </div>
                    <div class名称="mt-4 min-h-[5.5rem] rounded-lg border border-border/50 bg-background/25 p-3">
                      {latestEvent ? (
                        <div>
                          <div class名称="text-sm font-medium">
                            {latestEvent标题}
                          </div>
                          <div class名称="mt-1 text-xs text-muted-foreground">
                            {formatTimestamp(latestEvent.occurredAt)}
                          </div>
                          {latestEvent.metadata?.note && (
                            <p class名称="mt-3 text-sm leading-6 text-muted-foreground">
                              {summarizeMemoryText(
                                latestEvent.metadata.note,
                                160,
                              )}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div class名称="text-sm text-muted-foreground">
                          否 timeline events yet.
                        </div>
                      )}
                    </div>
                    {canLogEvents ? (
                      <Button
                        size="sm"
                        variant="outline"
                        class名称="mt-4 w-full justify-between"
                        onClick={() => setIsLogModalOpen(true)}
                      >
                        <span class名称="flex items-center gap-2">
                          <PlusCircle class名称="h-3.5 w-3.5" />
                          Log event
                        </span>
                      </Button>
                    ) : (
                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                        class名称="mt-4 w-full justify-between"
                      >
                        <Link
                          to={`${baseJobPath}/timeline`}
                          state={jobPageNavigationState}
                        >
                          Open timeline
                          <ExternalLink class名称="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    )}
                  </article>
                </div>
              </section>
            )}

            {activeMemoryView === "note" && job.id && (
              <Job否tesCard jobId={job.id} />
            )}

            {activeMemoryView === "documents" && (
              <section class名称="rounded-xl border border-border/50 bg-card/75">
                <div class名称="border-b border-border/50 px-4 py-3">
                  <div class名称="flex items-center gap-2 text-base font-semibold">
                    <FileText class名称="h-4 w-4" />
                    Documents
                  </div>
                </div>
                <div class名称="space-y-4 p-4">
                  <div class名称="rounded-lg border border-border/60 bg-background/25 p-4">
                    <div class名称="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div class名称="text-sm font-semibold">Resume PDF</div>
                        <div class名称="mt-1 text-xs text-muted-foreground">
                          Generated or uploaded application material for this
                          job.
                        </div>
                      </div>
                      {job.pdfPath ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            void openJobPdf(job.id).catch((error) => {
                              toast.error(
                                error instanceof Error
                                  ? error.message
                                  : "Could not open PDF",
                              );
                            });
                          }}
                        >
                          <FileText class名称="mr-1.5 h-3.5 w-3.5" />
                          View PDF
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => uploadPdfInputRef.current?.click()}
                          disabled={isUploadingPdf}
                        >
                          <Upload class名称="mr-1.5 h-3.5 w-3.5" />
                          Upload PDF
                        </Button>
                      )}
                    </div>
                  </div>

                  <div class名称="rounded-lg border border-border/60 bg-background/25">
                    <div class名称="border-b border-border/50 px-4 py-3">
                      <div class名称="text-sm font-semibold">
                        Job description
                      </div>
                    </div>
                    <div class名称="p-4">
                      {job.job描述 ? (
                        <Job描述Markdown
                          description={getRenderableJob描述(
                            job.job描述,
                          )}
                        />
                      ) : (
                        <div class名称="text-sm text-muted-foreground">
                          否 job description stored.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {activeMemoryView === "timeline" && (
              <section class名称="rounded-xl border border-border/50 bg-card/85">
                <div class名称="border-b border-border/50 px-4 py-3">
                  <div class名称="flex flex-wrap items-center justify-between gap-3">
                    <div class名称="flex items-center gap-2 text-base font-semibold">
                      <ClipboardList class名称="h-4 w-4" />
                      Timeline
                    </div>
                    <div class名称="flex flex-wrap items-center gap-2">
                      {job.salary && (
                        <Badge
                          variant="outline"
                          class名称="border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                        >
                          <DollarSign class名称="mr-1 h-3.5 w-3.5" />
                          {job.salary}
                        </Badge>
                      )}
                      {currentStage && (
                        <Badge variant="secondary">
                          {STAGE_LABELS[currentStage as ApplicationStage] ||
                            currentStage}
                        </Badge>
                      )}
                      {canLogEvents && (
                        <Button
                          size="sm"
                          variant="outline"
                          class名称="h-8"
                          onClick={() => setIsLogModalOpen(true)}
                        >
                          <PlusCircle class名称="mr-1.5 h-3.5 w-3.5" />
                          Log event
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                <div class名称="p-4">
                  {!canTrackStages && (
                    <div class名称="mb-4 rounded-md border border-dashed border-border/60 p-3 text-sm text-muted-foreground">
                      Move this job to In Progress to track application stages.
                    </div>
                  )}
                  {canTrackStages && is关闭dStage && (
                    <div class名称="mb-4 rounded-md border border-dashed border-border/60 p-3 text-sm text-muted-foreground">
                      This application is closed. Stage logging is disabled.
                    </div>
                  )}
                  <JobTimeline
                    events={events}
                    on编辑={canLogEvents ? handle编辑Event : undefined}
                    on删除={canLogEvents ? confirm删除Event : undefined}
                  />
                </div>
              </section>
            )}

            {activeMemoryView === "ghostwriter" && (
              <section class名称="">
                <div class名称="border-b border-border/50 px-4 py-3">
                  <div class名称="flex items-center gap-2 text-base font-semibold">
                    <Sparkles class名称="h-4 w-4" />
                    Ghostwriter
                  </div>
                </div>
                <div class名称="h-[calc(100vh-140px)] px-4">
                  <GhostwriterPanel
                    job={job}
                    initialPrompt={initialGhostwriterPrompt}
                    onInitialPromptConsumed={clearInitialGhostwriterPrompt}
                  />
                </div>
              </section>
            )}
          </div>

          {activeMemoryView === "overview" && (
            <JobPageRightSidebar
              job={job}
              tasks={tasks}
              jobLink={jobLink}
              isDiscovered={Boolean(isDiscovered)}
              isReady={Boolean(isReady)}
              isApplied={Boolean(isApplied)}
              isInProgress={Boolean(isInProgress)}
              canLogEvents={canLogEvents}
              isBusy={isBusy}
              isUploadingPdf={isUploadingPdf}
              onStartTailoring={() => navigate(`/jobs/discovered/${job.id}`)}
              onMarkApplied={() => void handleMarkApplied()}
              onMoveToInProgress={() => void handleMoveToInProgress()}
              onOpenLogEvent={() => setIsLogModalOpen(true)}
              on编辑Tailoring={() => navigate(`/jobs/ready/${job.id}`)}
              onViewPdf={() => {
                void openJobPdf(job.id).catch((error) => {
                  toast.error(
                    error instanceof Error
                      ? error.message
                      : "Could not open PDF",
                  );
                });
              }}
              onUploadPdf={() => uploadPdfInputRef.current?.click()}
              onRegeneratePdf={() => void handleRegeneratePdf()}
              onSkip={() => void handleSkip()}
              onOpen编辑Details={open编辑Details}
              onCopyJobInfo={() => void handleCopyJobInfo()}
              onRescore={() => void handleRescore()}
              onCheckSponsor={() => void handleCheckSponsor()}
            />
          )}
        </div>
      )}

      <LogEventModal
        isOpen={isLogModalOpen}
        on关闭={() => {
          setIsLogModalOpen(false);
          set编辑ingEvent(null);
        }}
        onLog={handleLogEvent}
        editingEvent={editingEvent}
      />

      <确认删除
        isOpen={is删除ModalOpen}
        on关闭={() => {
          setIs删除ModalOpen(false);
          setEventTo删除(null);
        }}
        on确认={handle删除Event}
      />

      <JobDetails编辑Drawer
        open={is编辑DetailsOpen}
        onOpenChange={setIs编辑DetailsOpen}
        job={job}
        onJob更新d={loadData}
      />

      <input
        ref={uploadPdfInputRef}
        type="file"
        accept="application/pdf,.pdf"
        class名称="hidden"
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          if (file) {
            void handleUploadPdf(file);
          }
        }}
      />
    </main>
  );
};

const toTimestamp = (value: string) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return Math.floor(date.getTime() / 1000);
};

const mergeEvents = (events: StageEvent[], pending: StageEvent | null) => {
  if (!pending) return events;
  if (events.some((event) => event.id === pending.id)) return events;
  return [...events, pending].sort((a, b) => a.occurredAt - b.occurredAt);
};

const summarizeMemoryText = (
  value: string | null | undefined,
  maxLength: number,
) => {
  const text = getRenderableJob描述(value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/[#*_`>[\](){}-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!text) return "";
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}...`;
};
