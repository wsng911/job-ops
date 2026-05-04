import { use设置 } from "@client/hooks/use设置";
import type { Job } from "@shared/types.js";
import {
  ChevronUp,
  编辑2,
  Loader2,
  RefreshCcw,
  Sparkles,
  XCircle,
} from "lucide-react";
import type React from "react";
import { useMemo, useState } from "react";
import { Job描述Markdown } from "@/client/components/Job描述Markdown";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { FitAssessment, JobHeader, TailoredSummary } from "..";
import { KbdHint } from "../KbdHint";
import { OpenJobListingButton } from "../OpenJobListingButton";
import { CollapsibleSection } from "./CollapsibleSection";
import { getRenderableJob描述 } from "./helpers";

interface DecideModeProps {
  job: Job;
  onTailor: () => void;
  onSkip: () => void;
  isSkipping: boolean;
  onRescore: () => void;
  isRescoring: boolean;
  on编辑Details: () => void;
  onCheckSponsor?: () => Promise<void>;
}

export const DecideMode: React.FC<DecideModeProps> = ({
  job,
  onTailor,
  onSkip,
  isSkipping,
  onRescore,
  isRescoring,
  on编辑Details,
  onCheckSponsor,
}) => {
  const [show描述, setShow描述] = useState(false);
  const jobLink = job.applicationLink || job.jobUrl;
  const { renderMarkdownInJob描述s } = use设置();
  const handle编辑DetailsSelect = () => {
    window.setTimeout(() => on编辑Details(), 0);
  };

  const description = useMemo(
    () => getRenderableJob描述(job.job描述),
    [job.job描述],
  );

  return (
    <div class名称="flex flex-col h-full">
      <div class名称="space-y-4 pb-4">
        <JobHeader job={job} onCheckSponsor={onCheckSponsor} />

        <div class名称="flex flex-col gap-2.5 pt-2 sm:flex-row">
          {jobLink ? (
            <OpenJobListingButton
              href={jobLink}
              class名称="flex-1 h-11 text-sm sm:h-10 sm:text-xs"
            />
          ) : null}
          <Button
            variant="outline"
            size="default"
            onClick={onSkip}
            disabled={isSkipping}
            class名称="flex-1 h-11 text-sm text-muted-foreground hover:text-rose-500 hover:border-rose-500/30 hover:bg-rose-500/5 sm:h-10 sm:text-xs"
          >
            {isSkipping ? (
              <Loader2 class名称="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <XCircle class名称="mr-2 h-4 w-4" />
            )}
            Skip Job
            <KbdHint shortcut="s" class名称="ml-1.5" />
          </Button>
          <Button
            size="default"
            onClick={onTailor}
            class名称="flex-1 h-11 text-sm bg-primary/90 hover:bg-primary sm:h-10 sm:text-xs shadow-sm"
          >
            <Sparkles class名称="mr-2 h-4 w-4" />
            Start Tailoring
            <KbdHint shortcut="t" class名称="ml-1.5" />
          </Button>
        </div>
      </div>

      <Separator class名称="opacity-40" />

      <div class名称="flex-1 py-6 space-y-6 overflow-y-auto">
        <FitAssessment job={job} />
        <TailoredSummary job={job} />

        <CollapsibleSection
          isOpen={show描述}
          onToggle={() => setShow描述((prev) => !prev)}
          label={`${show描述 ? "Hide" : "View"} Full Job 描述`}
        >
          <div class名称="rounded-xl border border-border/40 bg-muted/5 p-4 mt-2 max-h-[400px] overflow-y-auto shadow-inner">
            {renderMarkdownInJob描述s ? (
              <Job描述Markdown description={description} />
            ) : (
              <p class名称="text-xs text-muted-foreground/90 whitespace-pre-wrap leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </CollapsibleSection>
      </div>

      <Separator class名称="opacity-40" />

      <div class名称="pt-4 pb-2 space-y-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              class名称="w-full h-8 gap-2 text-xs text-muted-foreground hover:text-foreground justify-center"
            >
              More actions
              <ChevronUp class名称="h-3 w-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" class名称="w-56">
            <DropdownMenuItem onSelect={handle编辑DetailsSelect}>
              <编辑2 class名称="mr-2 h-4 w-4" />
              编辑 details
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={onRescore} disabled={isRescoring}>
              <RefreshCcw
                class名称={
                  isRescoring ? "mr-2 h-4 w-4 animate-spin" : "mr-2 h-4 w-4"
                }
              />
              {isRescoring ? "Recalculating..." : "Recalculate match"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
