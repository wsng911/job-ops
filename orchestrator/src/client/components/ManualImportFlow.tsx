import * as api from "@client/api";
import type { ManualJobDraft } from "@shared/types.js";
import {
  ArrowDown,
  ArrowLeft,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  CircleAlert,
  DollarSign,
  FileText,
  GraduationCap,
  Link,
  Link2,
  ListChecks,
  Loader2,
  MapPin,
  Sparkles,
  Tag,
  Users,
} from "lucide-react";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { showErrorToast } from "@/client/lib/error-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

type ManualImportStep = "paste" | "loading" | "review";
type ManualImportProgressStep = "paste" | "review";

export type ManualImportTrackingSource = "pasted_description" | "fetched_url";

export interface ManualImportResult {
  jobId: string;
  source: ManualImportTrackingSource;
  sourceHost: string | null;
}

type ManualJobDraftState = {
  title: string;
  employer: string;
  jobUrl: string;
  applicationLink: string;
  location: string;
  salary: string;
  deadline: string;
  job描述: string;
  jobType: string;
  jobLevel: string;
  jobFunction: string;
  disciplines: string;
  degreeRequired: string;
  starting: string;
};

type DraftFieldKey = keyof ManualJobDraftState;

type ReviewFieldConfig = {
  id: string;
  key: DraftFieldKey;
  label: string;
  placeholder: string;
  icon: React.ComponentType<{ class名称?: string }>;
  required?: boolean;
  multiline?: boolean;
};

const emptyDraft: ManualJobDraftState = {
  title: "",
  employer: "",
  jobUrl: "",
  applicationLink: "",
  location: "",
  salary: "",
  deadline: "",
  job描述: "",
  jobType: "",
  jobLevel: "",
  jobFunction: "",
  disciplines: "",
  degreeRequired: "",
  starting: "",
};

const STEP_INDEX_BY_ID: Record<ManualImportProgressStep, number> = {
  paste: 0,
  review: 1,
};

const STEP_LABEL_BY_ID: Record<ManualImportProgressStep, string> = {
  paste: "添加 JD",
  review: "Review & import",
};

const REQUIRED_REVIEW_FIELDS: ReviewFieldConfig[] = [
  {
    id: "draft-title",
    key: "title",
    label: "标题",
    placeholder: "e.g. Junior 返回end Engineer",
    icon: Tag,
    required: true,
  },
  {
    id: "draft-employer",
    key: "employer",
    label: "Employer",
    placeholder: "e.g. Acme Labs",
    icon: Building2,
    required: true,
  },
  {
    id: "draft-job描述",
    key: "job描述",
    label: "描述",
    placeholder: "Paste the job description...",
    icon: FileText,
    required: true,
    multiline: true,
  },
  {
    id: "draft-jobUrl",
    key: "jobUrl",
    label: "Job URL",
    placeholder: "https://...",
    icon: Link2,
    required: true,
  },
];

const OTHER_REVIEW_FIELDS: ReviewFieldConfig[] = [
  {
    id: "draft-location",
    key: "location",
    label: "Location",
    placeholder: "e.g. London, UK",
    icon: MapPin,
  },
  {
    id: "draft-salary",
    key: "salary",
    label: "Salary",
    placeholder: "e.g. GBP 45k-55k",
    icon: DollarSign,
  },
  {
    id: "draft-jobType",
    key: "jobType",
    label: "Job type",
    placeholder: "e.g. Full-time",
    icon: Briefcase,
  },
  {
    id: "draft-jobLevel",
    key: "jobLevel",
    label: "Job level",
    placeholder: "e.g. Graduate",
    icon: ListChecks,
  },
  {
    id: "draft-jobFunction",
    key: "jobFunction",
    label: "Job function",
    placeholder: "e.g. Software Engineering",
    icon: Users,
  },
  {
    id: "draft-disciplines",
    key: "disciplines",
    label: "Disciplines",
    placeholder: "e.g. Computer Science",
    icon: ListChecks,
  },
  {
    id: "draft-deadline",
    key: "deadline",
    label: "Deadline",
    placeholder: "e.g. 30 Sep 2025",
    icon: Calendar,
  },
  {
    id: "draft-degreeRequired",
    key: "degreeRequired",
    label: "Degree required",
    placeholder: "e.g. BSc or MSc",
    icon: GraduationCap,
  },
  {
    id: "draft-starting",
    key: "starting",
    label: "Starting",
    placeholder: "e.g. September 2026",
    icon: Calendar,
  },
  {
    id: "draft-applicationLink",
    key: "applicationLink",
    label: "Application URL",
    placeholder: "https://...",
    icon: Link,
  },
];

const BLOCKED_AUTOFETCH_HOSTS: Array<{
  label: string;
  match: (hostname: string) => boolean;
}> = [
  {
    label: "LinkedIn",
    match: (hostname) =>
      hostname === "linkedin.com" || hostname.endsWith(".linkedin.com"),
  },
  {
    label: "Indeed",
    match: (hostname) =>
      hostname === "indeed.com" || hostname.includes("indeed."),
  },
];

const normalizeDraft = (
  draft?: ManualJobDraft | null,
  jd?: string,
): ManualJobDraftState => ({
  ...emptyDraft,
  title: draft?.title ?? "",
  employer: draft?.employer ?? "",
  jobUrl: draft?.jobUrl ?? "",
  applicationLink: draft?.applicationLink ?? "",
  location: draft?.location ?? "",
  salary: draft?.salary ?? "",
  deadline: draft?.deadline ?? "",
  job描述: jd ?? draft?.job描述 ?? "",
  jobType: draft?.jobType ?? "",
  jobLevel: draft?.jobLevel ?? "",
  jobFunction: draft?.jobFunction ?? "",
  disciplines: draft?.disciplines ?? "",
  degreeRequired: draft?.degreeRequired ?? "",
  starting: draft?.starting ?? "",
});

const toPayload = (draft: ManualJobDraftState): ManualJobDraft => {
  const clean = (value: string) => {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  };

  return {
    title: clean(draft.title),
    employer: clean(draft.employer),
    jobUrl: clean(draft.jobUrl),
    applicationLink: clean(draft.applicationLink),
    location: clean(draft.location),
    salary: clean(draft.salary),
    deadline: clean(draft.deadline),
    job描述: clean(draft.job描述),
    jobType: clean(draft.jobType),
    jobLevel: clean(draft.jobLevel),
    jobFunction: clean(draft.jobFunction),
    disciplines: clean(draft.disciplines),
    degreeRequired: clean(draft.degreeRequired),
    starting: clean(draft.starting),
  };
};

interface ManualImportFlowProps {
  active: boolean;
  onImported: (result: ManualImportResult) => void | Promise<void>;
  on关闭: () => void;
  showReviewIntro?: boolean;
}

function getSourceHost(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  try {
    return new URL(trimmed).hostname || null;
  } catch {
    return null;
  }
}

function getBlockedAutofetchLabel(value: string): string | null {
  const host = getSourceHost(value)?.toLowerCase();
  if (!host) return null;
  const blocked = BLOCKED_AUTOFETCH_HOSTS.find((entry) => entry.match(host));
  return blocked?.label ?? null;
}

export const ManualImportFlow: React.FC<ManualImportFlowProps> = ({
  active,
  onImported,
  on关闭,
  showReviewIntro = true,
}) => {
  const [step, setStep] = useState<ManualImportStep>("paste");
  const [raw描述, setRaw描述] = useState("");
  const [fetchUrl, setFetchUrl] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [draft, setDraft] = useState<ManualJobDraftState>(emptyDraft);
  const [warning, setWarning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fetch否tice, setFetch否tice] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importSource, setImportSource] =
    useState<ManualImportTrackingSource>("pasted_description");
  const [importSourceHost, setImportSourceHost] = useState<string | null>(null);
  const [fetchedSourceUrl, setFetchedSourceUrl] = useState<string | null>(null);

  useEffect(() => {
    if (active) return;
    setStep("paste");
    setRaw描述("");
    setFetchUrl("");
    setIsFetching(false);
    setDraft(emptyDraft);
    setWarning(null);
    setError(null);
    setFetch否tice(null);
    setIsImporting(false);
    setImportSource("pasted_description");
    setImportSourceHost(null);
    setFetchedSourceUrl(null);
  }, [active]);

  const progressStep: ManualImportProgressStep =
    step === "review" ? "review" : "paste";
  const stepIndex = STEP_INDEX_BY_ID[progressStep];
  const stepLabel = STEP_LABEL_BY_ID[progressStep];

  const canAnalyze =
    raw描述.trim().length > 0 && step !== "loading" && !isFetching;
  const canFetch =
    fetchUrl.trim().length > 0 && !isFetching && step === "paste";
  const canImport = useMemo(() => {
    if (step !== "review") return false;
    return (
      draft.title.trim().length > 0 &&
      draft.employer.trim().length > 0 &&
      draft.jobUrl.trim().length > 0 &&
      draft.job描述.trim().length > 0
    );
  }, [draft, step]);

  const handleFetch = async () => {
    const trimmedUrl = fetchUrl.trim();
    if (!trimmedUrl) return;
    const blockedLabel = getBlockedAutofetchLabel(trimmedUrl);
    if (blockedLabel) {
      setError(
        `Auto-fetch is not supported for ${blockedLabel} links. Paste the job description manually.`,
      );
      setWarning(null);
      setFetch否tice(null);
      return;
    }

    try {
      setError(null);
      setWarning(null);
      setFetch否tice(null);
      setIsFetching(true);

      const fetchResponse = await api.fetchJobFromUrl({ url: trimmedUrl });
      const fetchedContent = fetchResponse.content;
      const fetchedUrl = fetchResponse.url;

      setRaw描述(fetchedContent);
      setFetchedSourceUrl(fetchedUrl);
      setImportSource("fetched_url");
      setImportSourceHost(getSourceHost(fetchedUrl));
      setFetchUrl(fetchedUrl);
      setFetch否tice("Fetched the page text. Review it below, then analyze.");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Couldn't fetch this URL automatically. Paste the job description manually.";
      setError(message);
      setStep("paste");
    } finally {
      setIsFetching(false);
    }
  };

  const handleAnalyze = async () => {
    if (!raw描述.trim()) {
      setError("Paste a job description to continue.");
      return;
    }

    try {
      setError(null);
      setWarning(null);
      setStep("loading");
      const response = await api.inferManualJob({
        job描述: raw描述,
      });
      const normalized = normalizeDraft(response.job, raw描述.trim());
      if (fetchedSourceUrl && !normalized.jobUrl) {
        normalized.jobUrl = fetchedSourceUrl;
      }
      setDraft(normalized);
      setWarning(response.warning ?? null);
      setImportSource(fetchedSourceUrl ? "fetched_url" : "pasted_description");
      setImportSourceHost(
        getSourceHost(fetchedSourceUrl ?? "") ??
          getSourceHost(normalized.jobUrl) ??
          getSourceHost(normalized.applicationLink),
      );
      setStep("review");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to analyze job description";
      setError(message);
      setStep("paste");
    }
  };

  const handleImport = async () => {
    if (!canImport) return;

    try {
      setIsImporting(true);
      const payload = toPayload(draft);
      const created = await api.importManualJob({ job: payload });
      toast.success("Job imported", {
        description: "The job was tailored and moved to the ready column.",
      });
      await onImported({
        jobId: created.id,
        source: importSource,
        sourceHost:
          importSourceHost ??
          getSourceHost(payload.jobUrl ?? "") ??
          getSourceHost(payload.applicationLink ?? ""),
      });
      on关闭();
    } catch (err) {
      showErrorToast(err, "Failed to import job");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div class名称="flex h-full min-h-0 flex-col">
      <div class名称="space-y-4">
        <div class名称="space-y-2">
          <div class名称="flex items-center justify-between text-xs text-muted-foreground">
            <span>Step {stepIndex + 1} of 2</span>
            <span>{stepLabel}</span>
          </div>
          <div class名称="h-1 rounded-full bg-muted/40">
            <div
              class名称="h-1 rounded-full bg-primary/60 transition-all"
              style={{ width: `${((stepIndex + 1) / 2) * 100}%` }}
            />
          </div>
        </div>
        <Separator />
      </div>

      <div class名称="mt-4 flex-1 overflow-y-auto pr-1">
        {step === "paste" && (
          <div class名称="space-y-4">
            <div class名称="space-y-2">
              <div class名称="flex items-center justify-between gap-3">
                <label
                  htmlFor="fetch-url"
                  class名称="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  Job URL
                </label>
                <span class名称="text-[11px] text-muted-foreground">
                  Optional helper
                </span>
              </div>
              <div class名称="flex gap-2">
                <Input
                  id="fetch-url"
                  value={fetchUrl}
                  onChange={(event) => setFetchUrl(event.target.value)}
                  placeholder="https://example.com/job-posting"
                  class名称="flex-1"
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && canFetch) {
                      event.preventDefault();
                      void handleFetch();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="secondary"
                  disabled={!canFetch}
                  class名称="gap-2 shrink-0"
                  onClick={() => void handleFetch()}
                >
                  {isFetching ? (
                    <Loader2 class名称="h-4 w-4 animate-spin" />
                  ) : (
                    <Link class名称="h-4 w-4" />
                  )}
                  {isFetching ? "Fetching..." : "Fetch"}
                </Button>
              </div>
              <p class名称="text-xs text-muted-foreground">
                Fetch tries to copy the job text into the description field. If
                the site blocks simple fetching, paste the description manually.
              </p>
            </div>

            <div class名称="flex items-center justify-center text-muted-foreground">
              <div class名称="flex items-center gap-2 text-[11px] uppercase tracking-wide">
                <span class名称="h-px w-10 bg-border" />
                <ArrowDown class名称="h-3.5 w-3.5" />
                <span class名称="h-px w-10 bg-border" />
              </div>
            </div>

            <div class名称="space-y-2">
              <label
                htmlFor="raw-description"
                class名称="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
              >
                Job description
              </label>
              <Textarea
                id="raw-description"
                value={raw描述}
                onChange={(event) => {
                  setRaw描述(event.target.value);
                  setFetch否tice(null);
                  if (!event.target.value.trim()) {
                    setFetchedSourceUrl(null);
                    setImportSource("pasted_description");
                    setImportSourceHost(null);
                  }
                }}
                placeholder="Paste the full job description here, or fetch it from a URL above..."
                class名称="min-h-[200px] font-mono text-sm leading-relaxed"
              />
            </div>

            {fetch否tice && (
              <div class名称="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
                {fetch否tice}
              </div>
            )}

            {error && (
              <div class名称="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {error}
              </div>
            )}

            <Button
              onClick={() => void handleAnalyze()}
              disabled={!canAnalyze}
              class名称="w-full h-10 gap-2"
            >
              <Sparkles class名称="h-4 w-4" />
              Analyze JD
            </Button>
          </div>
        )}

        {step === "loading" && (
          <div class名称="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <Loader2 class名称="h-6 w-6 animate-spin text-muted-foreground" />
            <div class名称="text-sm font-semibold">
              Analyzing job description
            </div>
            <p class名称="text-xs text-muted-foreground max-w-xs">
              Extracting title, company, location, and other details.
            </p>
          </div>
        )}

        {step === "review" && (
          <div class名称="space-y-5 pb-4">
            {warning && (
              <div class名称="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
                {warning}
              </div>
            )}

            {showReviewIntro && (
              <div class名称="space-y-2">
                <h3 class名称="text-2xl font-semibold tracking-tight">
                  Review job details
                </h3>
                <p class名称="max-w-lg text-sm leading-6 text-muted-foreground">
                  AI extracted these from the job description. Review anything
                  missing or odd before importing.
                </p>
              </div>
            )}

            <ReviewSection
              icon={CheckCircle2}
              title="Required"
              description="标题, employer, job URL, and description are needed to import."
            >
              <div class名称="divide-y divide-border/70">
                {REQUIRED_REVIEW_FIELDS.map((field) => (
                  <ReviewField
                    key={field.id}
                    field={field}
                    value={draft[field.key]}
                    onChange={(value) =>
                      setDraft((prev) => ({ ...prev, [field.key]: value }))
                    }
                  />
                ))}
              </div>
            </ReviewSection>

            <ReviewSection
              icon={CircleAlert}
              title="Other details"
              description="Useful if available; blank fields can be added later."
            >
              <div class名称="grid gap-x-4 sm:grid-cols-2">
                {OTHER_REVIEW_FIELDS.map((field) => (
                  <ReviewField
                    key={field.id}
                    field={field}
                    value={draft[field.key]}
                    onChange={(value) =>
                      setDraft((prev) => ({ ...prev, [field.key]: value }))
                    }
                    compact
                  />
                ))}
              </div>
            </ReviewSection>

            <div class名称="sticky bottom-0 -mx-1 flex gap-3 border-t border-border/70 bg-background/95 px-1 py-4 backdrop-blur">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep("paste")}
                class名称="h-11 flex-1 gap-2"
              >
                <ArrowLeft class名称="h-4 w-4" />
                编辑 JD
              </Button>
              <Button
                onClick={() => void handleImport()}
                disabled={!canImport || isImporting}
                class名称="h-11 flex-1 gap-2"
              >
                {isImporting ? (
                  <Loader2 class名称="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles class名称="h-4 w-4" />
                )}
                {isImporting ? "Importing..." : "Import job"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ReviewSection: React.FC<{
  icon: React.ComponentType<{ class名称?: string }>;
  title: string;
  description: string;
  children: React.React否de;
}> = ({ icon: Icon, title, description, children }) => (
  <section class名称="rounded-xl border border-border/80 bg-card/45 p-3 shadow-sm">
    <div class名称="mb-3 flex items-start gap-3">
      <span class名称="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-background/80 text-muted-foreground">
        <Icon class名称="h-4 w-4" />
      </span>
      <div class名称="min-w-0">
        <h4 class名称="text-sm font-semibold text-foreground">{title}</h4>
        <p class名称="text-xs leading-5 text-muted-foreground">{description}</p>
      </div>
    </div>
    {children}
  </section>
);

const ReviewField: React.FC<{
  field: ReviewFieldConfig;
  value: string;
  onChange: (value: string) => void;
  compact?: boolean;
}> = ({ field, value, onChange, compact = false }) => {
  const hasValue = value.trim().length > 0;
  const needsReview = Boolean(field.required) && !hasValue;
  const Icon = field.icon;

  return (
    <div
      class名称={
        compact ? "border-border/60 border-b py-3" : "py-3 first:pt-0 last:pb-0"
      }
    >
      <div class名称="flex gap-3">
        <span class名称="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/55 text-muted-foreground">
          <Icon class名称="h-4 w-4" />
        </span>
        <div class名称="min-w-0 flex-1 space-y-2">
          <div class名称="flex items-center justify-between gap-3">
            <label
              htmlFor={field.id}
              class名称="text-xs font-medium text-muted-foreground"
            >
              {field.label}
              {field.required ? " *" : ""}
            </label>
            <Review状态Badge hasValue={hasValue} needsReview={needsReview} />
          </div>
          {field.multiline ? (
            <Textarea
              id={field.id}
              value={value}
              onChange={(event) => onChange(event.target.value)}
              placeholder={field.placeholder}
              class名称="min-h-[150px] resize-y border-border/70 bg-background/60 font-mono text-sm leading-relaxed"
            />
          ) : (
            <Input
              id={field.id}
              value={value}
              onChange={(event) => onChange(event.target.value)}
              placeholder={field.placeholder}
              class名称="h-9 border-border/70 bg-background/60 text-sm"
            />
          )}
        </div>
      </div>
    </div>
  );
};

const Review状态Badge: React.FC<{
  hasValue: boolean;
  needsReview: boolean;
}> = ({ hasValue, needsReview }) => {
  if (needsReview) {
    return (
      <span class名称="inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-[11px] font-medium text-amber-200">
        <CircleAlert class名称="h-3 w-3" />
        Review
      </span>
    );
  }

  if (hasValue) {
    return (
      <span class名称="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-1 text-[11px] font-medium text-emerald-200">
        <CheckCircle2 class名称="h-3 w-3" />
        Looks good
      </span>
    );
  }

  return (
    <span class名称="inline-flex shrink-0 items-center rounded-full border border-border bg-muted/40 px-2 py-1 text-[11px] font-medium text-muted-foreground">
      添加
    </span>
  );
};
