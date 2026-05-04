import type { ResumeProjectCatalogItem } from "@shared/types.js";
import { Plus, Redo2, Trash2, Undo2 } from "lucide-react";
import type React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ProjectSelector } from "../discovered-panel/ProjectSelector";
import type { 编辑ableSkillGroup } from "../tailoring-utils";

interface TailoringSectionsProps {
  catalog: ResumeProjectCatalogItem[];
  isCatalogLoading: boolean;
  summary: string;
  headline: string;
  job描述: string;
  skillsDraft: 编辑ableSkillGroup[];
  selectedIds: Set<string>;
  tracerLinksEnabled: boolean;
  tracerEnableBlocked: boolean;
  tracerEnableBlockedReason: string | null;
  tracerReadinessChecking?: boolean;
  openSkillGroupId: string;
  disableInputs: boolean;
  onSummaryChange: (value: string) => void;
  onHeadlineChange: (value: string) => void;
  onUndoSummary: () => void;
  onUndoHeadline: () => void;
  onUndoSkills: () => void;
  onRedoSummary: () => void;
  onRedoHeadline: () => void;
  onRedoSkills: () => void;
  canUndoSummary: boolean;
  canUndoHeadline: boolean;
  canUndoSkills: boolean;
  canRedoSummary: boolean;
  canRedoHeadline: boolean;
  canRedoSkills: boolean;
  undoDisabledReason?: string | null;
  on描述Change: (value: string) => void;
  onSkillGroupOpenChange: (value: string) => void;
  on添加SkillGroup: () => void;
  on更新SkillGroup: (
    id: string,
    key: "name" | "keywordsText",
    value: string,
  ) => void;
  on移除SkillGroup: (id: string) => void;
  onToggleProject: (id: string) => void;
  onTracerLinksEnabledChange: (value: boolean) => void;
}

const sectionClass = "rounded-lg border border-border/60 bg-muted/20 px-0";
const triggerClass =
  "px-3 py-2 text-xs font-medium text-muted-foreground hover:no-underline";
const inputClass =
  "w-full rounded-md border border-border/60 bg-background/60 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

export const TailoringSections: React.FC<TailoringSectionsProps> = ({
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
  tracerReadinessChecking = false,
  openSkillGroupId,
  disableInputs,
  onSummaryChange,
  onHeadlineChange,
  onUndoSummary,
  onUndoHeadline,
  onUndoSkills,
  onRedoSummary,
  onRedoHeadline,
  onRedoSkills,
  canUndoSummary,
  canUndoHeadline,
  canUndoSkills,
  canRedoSummary,
  canRedoHeadline,
  canRedoSkills,
  undoDisabledReason = null,
  on描述Change,
  onSkillGroupOpenChange,
  on添加SkillGroup,
  on更新SkillGroup,
  on移除SkillGroup,
  onToggleProject,
  onTracerLinksEnabledChange,
}) => {
  const tracerToggleDisabled =
    disableInputs || (!tracerLinksEnabled && tracerEnableBlocked);
  const undoTooltip = "Undo to template";
  const redoTooltip = "Redo to AI draft";

  return (
    <TooltipProvider>
      <Accordion type="multiple" class名称="space-y-3">
        <AccordionItem value="job-description" class名称={sectionClass}>
          <AccordionTrigger class名称={triggerClass}>
            Job 描述
          </AccordionTrigger>
          <AccordionContent class名称="px-3 pb-3 pt-1">
            <label htmlFor="tailor-jd-edit" class名称="sr-only">
              Job 描述
            </label>
            <textarea
              id="tailor-jd-edit"
              class名称={`${inputClass} min-h-[120px] max-h-[250px]`}
              value={job描述}
              onChange={(event) => on描述Change(event.target.value)}
              placeholder="The raw job description..."
              disabled={disableInputs}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="summary" class名称={sectionClass}>
          <AccordionTrigger class名称={triggerClass}>Summary</AccordionTrigger>
          <AccordionContent class名称="px-3 pb-3 pt-1">
            <div class名称="mb-2 flex justify-end gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    class名称="h-7 w-7"
                    onClick={onUndoSummary}
                    disabled={disableInputs || !canUndoSummary}
                    aria-label={undoTooltip}
                    title={
                      !canUndoSummary
                        ? (undoDisabledReason ?? undefined)
                        : undefined
                    }
                  >
                    <Undo2 class名称="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{undoTooltip}</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    class名称="h-7 w-7"
                    onClick={onRedoSummary}
                    disabled={disableInputs || !canRedoSummary}
                    aria-label={redoTooltip}
                  >
                    <Redo2 class名称="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{redoTooltip}</TooltipContent>
              </Tooltip>
            </div>
            <label htmlFor="tailor-summary-edit" class名称="sr-only">
              Tailored Summary
            </label>
            <textarea
              id="tailor-summary-edit"
              class名称={`${inputClass} min-h-[120px]`}
              value={summary}
              onChange={(event) => onSummaryChange(event.target.value)}
              placeholder="Write a tailored summary for this role, or generate with AI..."
              disabled={disableInputs}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="headline" class名称={sectionClass}>
          <AccordionTrigger class名称={triggerClass}>Headline</AccordionTrigger>
          <AccordionContent class名称="px-3 pb-3 pt-1">
            <div class名称="mb-2 flex justify-end gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    class名称="h-7 w-7"
                    onClick={onUndoHeadline}
                    disabled={disableInputs || !canUndoHeadline}
                    aria-label={undoTooltip}
                    title={
                      !canUndoHeadline
                        ? (undoDisabledReason ?? undefined)
                        : undefined
                    }
                  >
                    <Undo2 class名称="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{undoTooltip}</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    class名称="h-7 w-7"
                    onClick={onRedoHeadline}
                    disabled={disableInputs || !canRedoHeadline}
                    aria-label={redoTooltip}
                  >
                    <Redo2 class名称="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{redoTooltip}</TooltipContent>
              </Tooltip>
            </div>
            <label htmlFor="tailor-headline-edit" class名称="sr-only">
              Tailored Headline
            </label>
            <input
              id="tailor-headline-edit"
              type="text"
              class名称={inputClass}
              value={headline}
              onChange={(event) => onHeadlineChange(event.target.value)}
              placeholder="Write a concise headline tailored to this role..."
              disabled={disableInputs}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="skills" class名称={sectionClass}>
          <AccordionTrigger class名称={triggerClass}>
            Tailored Skills
          </AccordionTrigger>
          <AccordionContent class名称="px-3 pb-3 pt-1">
            <div class名称="flex flex-wrap items-center justify-end gap-2 pb-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    class名称="h-7 w-7"
                    onClick={onUndoSkills}
                    disabled={disableInputs || !canUndoSkills}
                    aria-label={undoTooltip}
                    title={
                      !canUndoSkills
                        ? (undoDisabledReason ?? undefined)
                        : undefined
                    }
                  >
                    <Undo2 class名称="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{undoTooltip}</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    class名称="h-7 w-7"
                    onClick={onRedoSkills}
                    disabled={disableInputs || !canRedoSkills}
                    aria-label={redoTooltip}
                  >
                    <Redo2 class名称="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{redoTooltip}</TooltipContent>
              </Tooltip>
              <Button
                type="button"
                size="sm"
                variant="outline"
                class名称="h-7 text-[11px]"
                onClick={on添加SkillGroup}
                disabled={disableInputs}
              >
                <Plus class名称="mr-1 h-3.5 w-3.5" />
                添加 Skill Group
              </Button>
            </div>

            {skillsDraft.length === 0 ? (
              <div class名称="rounded-lg border border-dashed border-border/60 px-3 py-4 text-center text-[11px] text-muted-foreground">
                否 skill groups yet. 添加 one to tailor keywords for this role.
              </div>
            ) : (
              <Accordion
                type="single"
                collapsible
                value={openSkillGroupId}
                onValueChange={onSkillGroupOpenChange}
                class名称="space-y-2"
              >
                {skillsDraft.map((group, index) => (
                  <AccordionItem
                    key={group.id}
                    value={group.id}
                    class名称="rounded-lg border border-border/60 bg-background/40 px-0"
                  >
                    <AccordionTrigger class名称="px-3 py-2 text-[11px] font-medium hover:no-underline">
                      {group.name.trim() || `Skill Group ${index + 1}`}
                    </AccordionTrigger>
                    <AccordionContent class名称="px-3 pb-3 pt-1">
                      <div class名称="space-y-2">
                        <div class名称="space-y-1">
                          <label
                            htmlFor={`tailor-skill-group-name-${group.id}`}
                            class名称="text-[11px] font-medium text-muted-foreground"
                          >
                            Category
                          </label>
                          <input
                            id={`tailor-skill-group-name-${group.id}`}
                            type="text"
                            class名称={inputClass}
                            value={group.name}
                            onChange={(event) =>
                              on更新SkillGroup(
                                group.id,
                                "name",
                                event.target.value,
                              )
                            }
                            placeholder="返回end, Frontend, Infrastructure..."
                            disabled={disableInputs}
                          />
                        </div>

                        <div class名称="space-y-1">
                          <label
                            htmlFor={`tailor-skill-group-keywords-${group.id}`}
                            class名称="text-[11px] font-medium text-muted-foreground"
                          >
                            Keywords (comma-separated)
                          </label>
                          <textarea
                            id={`tailor-skill-group-keywords-${group.id}`}
                            class名称={`${inputClass} min-h-[88px]`}
                            value={group.keywordsText}
                            onChange={(event) =>
                              on更新SkillGroup(
                                group.id,
                                "keywordsText",
                                event.target.value,
                              )
                            }
                            placeholder="TypeScript, 否de.js, REST APIs..."
                            disabled={disableInputs}
                          />
                        </div>

                        <div class名称="flex justify-end">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            class名称="h-7 px-2 text-[11px]"
                            onClick={() => on移除SkillGroup(group.id)}
                            disabled={disableInputs}
                          >
                            <Trash2 class名称="mr-1 h-3.5 w-3.5" />
                            移除
                          </Button>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </AccordionContent>
        </AccordionItem>

        {!isCatalogLoading && catalog.length > 0 && (
          <AccordionItem value="projects" class名称={sectionClass}>
            <AccordionTrigger class名称={triggerClass}>
              <span class名称="inline-flex items-center gap-1">
                <span>Selected Projects</span>
                {selectedIds.size > 3 ? (
                  <span class名称="text-muted-foreground/70">
                    ({selectedIds.size})
                  </span>
                ) : null}
              </span>
            </AccordionTrigger>
            <AccordionContent class名称="px-3 pb-3 pt-1">
              <ProjectSelector
                catalog={catalog}
                selectedIds={selectedIds}
                onToggle={onToggleProject}
                maxProjects={3}
                disabled={disableInputs}
              />
            </AccordionContent>
          </AccordionItem>
        )}

        <AccordionItem value="tracer-links" class名称={sectionClass}>
          <AccordionTrigger class名称={triggerClass}>
            Tracer Links
          </AccordionTrigger>
          <AccordionContent class名称="px-3 pb-3 pt-1">
            <div class名称="rounded-md border border-border/60 bg-background/60 p-3">
              <label
                htmlFor="tailor-tracer-links-enabled"
                class名称="flex cursor-pointer items-center gap-3"
              >
                <Checkbox
                  id="tailor-tracer-links-enabled"
                  checked={tracerLinksEnabled}
                  onCheckedChange={(checked) =>
                    onTracerLinksEnabledChange(Boolean(checked))
                  }
                  disabled={tracerToggleDisabled}
                />
                <span class名称="text-sm font-medium text-foreground">
                  Enable tracer links for this job
                </span>
              </label>
              <p class名称="mt-2 text-xs text-muted-foreground">
                {tracerReadinessChecking
                  ? "Checking tracer-link readiness..."
                  : "When enabled, outgoing resume links are rewritten to JobOps tracer links on the next PDF generation. Existing PDFs are unchanged."}
              </p>
              {tracerEnableBlockedReason && !tracerLinksEnabled ? (
                <p class名称="mt-2 text-xs text-destructive">
                  Tracer links are unavailable: {tracerEnableBlockedReason}
                </p>
              ) : null}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </TooltipProvider>
  );
};
