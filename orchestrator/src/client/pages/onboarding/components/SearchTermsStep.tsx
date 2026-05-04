import { parse搜索TermsInput } from "@client/pages/orchestrator/automatic-run";
import { TokenizedInput } from "@client/pages/orchestrator/TokenizedInput";
import type { 搜索TermsSuggestionResponse } from "@shared/types";
import { Info, RefreshCcw } from "lucide-react";
import type React from "react";
import { Alert, Alert描述, Alert标题 } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export const 搜索TermsStep: React.FC<{
  has保存d搜索TermsInSession: boolean;
  isBusy: boolean;
  isGenerating搜索Terms: boolean;
  searchTermDraft: string;
  searchTerms: string[];
  searchTermsSource: 搜索TermsSuggestionResponse["source"] | null;
  searchTermsStale: boolean;
  onRegenerate: () => Promise<void>;
  on搜索TermDraftChange: (value: string) => void;
  on搜索TermsChange: (values: string[]) => void;
}> = ({
  has保存d搜索TermsInSession,
  isBusy,
  isGenerating搜索Terms,
  searchTermDraft,
  searchTerms,
  searchTermsSource,
  searchTermsStale,
  onRegenerate,
  on搜索TermDraftChange,
  on搜索TermsChange,
}) => (
  <div class名称="space-y-6">
    <div class名称="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-border/60 bg-muted/10 p-5">
      <div class名称="max-w-2xl space-y-1">
        <div class名称="text-sm font-medium">标题s to search for</div>
        <p class名称="text-sm leading-6 text-muted-foreground">
          Pick the job titles Job Ops should search for. The first list can be
          generated from your resume, and you can edit every item before saving.
        </p>
      </div>
      <Button
        type="button"
        variant="outline"
        disabled={isBusy || isGenerating搜索Terms}
        onClick={() => void onRegenerate()}
      >
        <RefreshCcw class名称="h-4 w-4" />
        {isGenerating搜索Terms ? "Generating..." : "Regenerate from resume"}
      </Button>
    </div>

    {searchTermsStale ? (
      <Alert variant="warning">
        <Info class名称="h-4 w-4" />
        <Alert标题>Resume changed</Alert标题>
        <Alert描述>
          Your resume source changed after these search terms were generated or
          saved. Refresh or edit the list, then save it again.
        </Alert描述>
      </Alert>
    ) : searchTermsSource ? (
      <Alert>
        <Info class名称="h-4 w-4" />
        <Alert标题>
          {searchTermsSource === "ai"
            ? "Generated from your resume"
            : "Suggested from your resume"}
        </Alert标题>
        <Alert描述>
          {searchTermsSource === "ai"
            ? "These titles were generated from your current resume. Adjust anything that feels off before saving."
            : "Job Ops used a simpler resume-based fallback list. You can edit or regenerate it before saving."}
        </Alert描述>
      </Alert>
    ) : has保存d搜索TermsInSession ? (
      <Alert>
        <Info class名称="h-4 w-4" />
        <Alert标题>保存d search terms</Alert标题>
        <Alert描述>
          These titles are already saved and will be used for job discovery
          unless you update them.
        </Alert描述>
      </Alert>
    ) : null}

    <TokenizedInput
      id="onboarding-search-terms"
      values={searchTerms}
      draft={searchTermDraft}
      parseInput={parse搜索TermsInput}
      onDraftChange={on搜索TermDraftChange}
      onValuesChange={on搜索TermsChange}
      placeholder="Type a role and press Enter"
      helperText="Examples: Platform Engineer, Senior 返回end Engineer, Staff Software Engineer"
      removeLabelPrefix="移除 search term"
      disabled={isBusy}
    />
  </div>
);
