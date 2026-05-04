import { BaseResumeSelection } from "@client/pages/settings/components/BaseResumeSelection";
import { 设置Input } from "@client/pages/settings/components/设置Input";
import {
  toggleAiSelectable,
  toggleMustInclude,
} from "@client/pages/settings/resume-projects-state";
import type { ResumeProjects设置Input } from "@shared/settings-schema.js";
import {
  PDF_RENDERER_LABELS,
  type PdfRenderer,
  type ResumeProjectCatalogItem,
} from "@shared/types.js";
import { AlertCircle, AlertTriangle } from "lucide-react";
import type React from "react";
import { Alert, Alert描述, Alert标题 } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { clampInt } from "@/lib/utils";
import { 状态Indicator } from "./状态Indicator";

type VersionValidationState = {
  checked: boolean;
  valid: boolean;
  message?: string | null;
  status?: number | null;
};

type ProjectSelectionConfig = {
  baseResumeId: string | null;
  onBaseResumeIdChange: (value: string | null) => void;
  projects: ResumeProjectCatalogItem[];
  value: ResumeProjects设置Input | null | undefined;
  onChange: (next: ResumeProjects设置Input) => void;
  lockedCount: number;
  maxProjectsTotal: number;
  isProjectsLoading: boolean;
  disabled: boolean;
  maxProjectsError?: string;
};

type ReactiveResumeConfigPanelProps = {
  pdfRenderer: PdfRenderer;
  onPdfRendererChange: (renderer: PdfRenderer) => void;
  pdfRendererError?: string;
  disabled?: boolean;
  hasRxResumeAccess?: boolean;
  showValidation状态?: boolean;
  validation状态?: VersionValidationState;
  intro?: {
    title: string;
    description?: string;
  };
  v5: {
    apiKey: string;
    onApiKeyChange: (value: string) => void;
    error?: string;
    helper?: string;
    placeholder?: string;
  };
  shared: {
    baseUrl: string;
    onBaseUrlChange: (value: string) => void;
    baseUrlError?: string;
    baseUrlHelper?: string;
    baseUrlPlaceholder?: string;
  };
  projectSelection?: ProjectSelectionConfig;
};

function render状态Pill(label: string, state: VersionValidationState) {
  const statusLabel = state.checked
    ? state.valid
      ? "Connected"
      : "Failed"
    : "否t tested";
  const dotColor = state.checked
    ? state.valid
      ? "bg-emerald-500"
      : "bg-destructive"
    : "bg-muted-foreground";

  return (
    <状态Indicator
      label={`${label}: ${statusLabel}`}
      dotColor={dotColor}
      tooltip={
        state.checked && !state.valid && state.message
          ? state.message
          : undefined
      }
    />
  );
}

function isAvailabilityWarning(state?: VersionValidationState): boolean {
  const status = state?.status ?? null;
  return status === 0 || (typeof status === "number" && status >= 500);
}

export const ReactiveResumeConfigPanel: React.FC<
  ReactiveResumeConfigPanelProps
> = ({
  pdfRenderer,
  onPdfRendererChange,
  pdfRendererError,
  disabled = false,
  hasRxResumeAccess = false,
  showValidation状态 = false,
  validation状态,
  intro,
  shared,
  v5,
  projectSelection,
}) => {
  const canShowProjectSelection = Boolean(
    projectSelection && hasRxResumeAccess,
  );
  const selectedValidation状态 = validation状态;
  const showInlineValidationAlert = Boolean(
    selectedValidation状态?.checked &&
      !selectedValidation状态.valid &&
      selectedValidation状态.message,
  );
  const selectedValidationIsWarning =
    showInlineValidationAlert &&
    isAvailabilityWarning(selectedValidation状态);

  const latexSelected = pdfRenderer === "latex";

  return (
    <div class名称="space-y-4">
      {intro ? (
        <div>
          <p class名称="text-sm font-semibold">{intro.title}</p>
          {intro.description ? (
            <p class名称="text-xs text-muted-foreground">{intro.description}</p>
          ) : null}
        </div>
      ) : null}

      <div class名称="space-y-2">
        <label htmlFor="pdfRenderer" class名称="text-sm font-medium">
          PDF renderer
        </label>
        <Select
          value={pdfRenderer}
          onValueChange={(value) =>
            onPdfRendererChange(value === "latex" ? "latex" : "rxresume")
          }
          disabled={disabled}
        >
          <SelectTrigger id="pdfRenderer">
            <SelectValue placeholder="Choose PDF renderer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rxresume">
              {PDF_RENDERER_LABELS.rxresume}
            </SelectItem>
            <SelectItem value="latex">{PDF_RENDERER_LABELS.latex}</SelectItem>
          </SelectContent>
        </Select>
        {pdfRendererError ? (
          <p class名称="text-xs text-destructive">{pdfRendererError}</p>
        ) : null}
        <p class名称="text-xs text-muted-foreground">
          {latexSelected
            ? "LaTeX renders PDFs locally with Jake's template and requires tectonic on the JobOps host."
            : "RxResume export uses the upstream print/export endpoint for the final PDF."}
        </p>
      </div>

      {showValidation状态 && selectedValidation状态 ? (
        <div class名称="flex flex-wrap items-center gap-2 text-xs w-full justify-between">
          {render状态Pill("v5 status", selectedValidation状态)}
        </div>
      ) : null}

      {showInlineValidationAlert && selectedValidation状态?.message ? (
        <Alert
          variant={selectedValidationIsWarning ? "warning" : "destructive"}
        >
          {selectedValidationIsWarning ? (
            <AlertTriangle class名称="h-4 w-4" />
          ) : (
            <AlertCircle class名称="h-4 w-4" />
          )}
          <Alert标题>
            Reactive Resume API{" "}
            {selectedValidationIsWarning ? "warning" : "error"}
          </Alert标题>
          <Alert描述>
            {selectedValidation状态.message}
          </Alert描述>
        </Alert>
      ) : null}

      {
        <div class名称="grid gap-4">
          <设置Input
            label="RxResume URL"
            inputProps={{
              name: "rxresumeUrl",
              value: shared.baseUrl,
              onChange: (event) =>
                shared.onBaseUrlChange(event.currentTarget.value),
            }}
            type="url"
            placeholder={
              shared.baseUrlPlaceholder ?? "https://resume.example.com"
            }
            helper={
              shared.baseUrlHelper ??
              "Leave blank to use the default for the selected mode (or the RXRESUME_URL environment override, if set)."
            }
            disabled={disabled}
            error={shared.baseUrlError}
          />
          <设置Input
            label="v5 API key"
            inputProps={{
              name: "rxresumeApiKey",
              value: v5.apiKey,
              onChange: (event) => v5.onApiKeyChange(event.currentTarget.value),
            }}
            type="password"
            placeholder={v5.placeholder ?? "Enter v5 API key"}
            helper={v5.helper}
            disabled={disabled}
            error={v5.error}
          />
        </div>
      }

      {projectSelection ? (
        <>
          <Separator />

          {!canShowProjectSelection ? (
            <div class名称="rounded-md border border-dashed border-muted-foreground/40 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
              Connect Reactive Resume and choose a template resume to configure
              resume projects.
            </div>
          ) : (
            <div class名称="space-y-4">
              <BaseResumeSelection
                value={projectSelection.baseResumeId}
                onValueChange={projectSelection.onBaseResumeIdChange}
                hasRxResumeAccess={hasRxResumeAccess}
                disabled={projectSelection.disabled}
              />

              {!projectSelection.baseResumeId ? (
                <div class名称="rounded-md border border-dashed border-muted-foreground/40 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                  Choose a PDF to configure resume projects.
                </div>
              ) : (
                <>
                  <div class名称="space-y-2">
                    <div class名称="text-sm font-medium">
                      Max projects to choose
                    </div>
                    <Input
                      type="number"
                      inputMode="numeric"
                      min={projectSelection.lockedCount}
                      max={projectSelection.maxProjectsTotal}
                      value={projectSelection.value?.maxProjects ?? 0}
                      onChange={(event) => {
                        if (!projectSelection.value) return;
                        const next = Number(event.target.value);
                        const clamped = clampInt(
                          next,
                          projectSelection.lockedCount,
                          projectSelection.maxProjectsTotal,
                        );
                        projectSelection.onChange({
                          ...projectSelection.value,
                          maxProjects: clamped,
                        });
                      }}
                      disabled={
                        projectSelection.disabled ||
                        projectSelection.isProjectsLoading ||
                        !projectSelection.value
                      }
                    />
                    {projectSelection.maxProjectsError ? (
                      <p class名称="text-xs text-destructive">
                        {projectSelection.maxProjectsError}
                      </p>
                    ) : null}
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead class名称="text-xs whitespace-wrap sm:whitespace-nowrap">
                          Project
                        </TableHead>
                        <TableHead class名称="text-xs whitespace-wrap sm:whitespace-nowrap">
                          Visible in template
                        </TableHead>
                        <TableHead class名称="text-xs whitespace-wrap sm:whitespace-nowrap">
                          Must Include
                        </TableHead>
                        <TableHead class名称="text-xs whitespace-wrap sm:whitespace-nowrap">
                          AI selectable
                        </TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {projectSelection.projects.map((project) => {
                        const value = projectSelection.value;
                        const locked = Boolean(
                          value?.lockedProjectIds.includes(project.id),
                        );
                        const aiSelectable = Boolean(
                          value?.aiSelectableProjectIds.includes(project.id),
                        );
                        const projectMeta = project.date;

                        return (
                          <TableRow key={project.id}>
                            <TableCell>
                              <div class名称="space-y-0.5">
                                <div class名称="font-medium">
                                  {project.name}
                                </div>
                                {projectMeta ? (
                                  <div class名称="text-xs text-muted-foreground">
                                    {projectMeta}
                                  </div>
                                ) : null}
                              </div>
                            </TableCell>
                            <TableCell>
                              {project.isVisibleInBase ? "是" : "否"}
                            </TableCell>
                            <TableCell>
                              <Checkbox
                                checked={locked}
                                onCheckedChange={() => {
                                  if (!value) return;
                                  projectSelection.onChange(
                                    toggleMustInclude({
                                      settings: value,
                                      projectId: project.id,
                                      checked: !locked,
                                      maxProjectsTotal:
                                        projectSelection.maxProjectsTotal,
                                    }),
                                  );
                                }}
                                disabled={
                                  projectSelection.disabled ||
                                  projectSelection.isProjectsLoading ||
                                  !value
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <Checkbox
                                checked={locked ? true : aiSelectable}
                                onCheckedChange={() => {
                                  if (!value) return;
                                  projectSelection.onChange(
                                    toggleAiSelectable({
                                      settings: value,
                                      projectId: project.id,
                                      checked: !aiSelectable,
                                    }),
                                  );
                                }}
                                disabled={
                                  projectSelection.disabled ||
                                  projectSelection.isProjectsLoading ||
                                  locked ||
                                  !value
                                }
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </>
              )}
            </div>
          )}
        </>
      ) : null}
    </div>
  );
};
