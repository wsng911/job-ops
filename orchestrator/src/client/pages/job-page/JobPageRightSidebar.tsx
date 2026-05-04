import type { ApplicationTask, Job } from "@shared/types.js";
import {
  CalendarClock,
  CheckCircle2,
  Copy,
  编辑2,
  ExternalLink,
  FileText,
  MoreHorizontal,
  PlusCircle,
  RefreshCcw,
  Sparkles,
  Upload,
  XCircle,
} from "lucide-react";
import type React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatTimestamp } from "@/lib/utils";

type JobPageRightSidebarProps = {
  job: Job;
  tasks: ApplicationTask[];
  jobLink: string | null;
  isDiscovered: boolean;
  isReady: boolean;
  isApplied: boolean;
  isInProgress: boolean;
  canLogEvents: boolean;
  isBusy: boolean;
  isUploadingPdf: boolean;
  onStartTailoring: () => void;
  onMarkApplied: () => void;
  onMoveToInProgress: () => void;
  onOpenLogEvent: () => void;
  on编辑Tailoring: () => void;
  onViewPdf: () => void;
  onUploadPdf: () => void;
  onRegeneratePdf: () => void;
  onSkip: () => void;
  onOpen编辑Details: () => void;
  onCopyJobInfo: () => void;
  onRescore: () => void;
  onCheckSponsor: () => void;
};

export const JobPageRightSidebar: React.FC<JobPageRightSidebarProps> = ({
  job,
  tasks,
  jobLink,
  isDiscovered,
  isReady,
  isApplied,
  isInProgress,
  canLogEvents,
  isBusy,
  isUploadingPdf,
  onStartTailoring,
  onMarkApplied,
  onMoveToInProgress,
  onOpenLogEvent,
  on编辑Tailoring,
  onViewPdf,
  onUploadPdf,
  onRegeneratePdf,
  onSkip,
  onOpen编辑Details,
  onCopyJobInfo,
  onRescore,
  onCheckSponsor,
}) => (
  <aside class名称="space-y-4 xl:sticky xl:top-5">
    <section class名称="rounded-xl border border-border/50 bg-card/85 p-3">
      <div class名称="mb-3 flex items-center gap-2 px-1 text-sm font-semibold">
        操作
      </div>
      <div class名称="space-y-2">
        {jobLink && (
          <Button
            asChild
            size="sm"
            variant="outline"
            class名称="w-full justify-start"
          >
            <a href={jobLink} target="_blank" rel="noopener noreferrer">
              <ExternalLink class名称="mr-1.5 h-3.5 w-3.5" />
              Open Job Listing
            </a>
          </Button>
        )}

        {isDiscovered && (
          <Button
            size="sm"
            variant="outline"
            class名称="w-full justify-start"
            onClick={onStartTailoring}
            disabled={isBusy}
          >
            <Sparkles class名称="mr-1.5 h-3.5 w-3.5" />
            Start Tailoring
          </Button>
        )}

        {isReady && (
          <Button
            size="sm"
            class名称="w-full justify-start"
            variant="outline"
            onClick={onMarkApplied}
            disabled={isBusy}
          >
            <CheckCircle2 class名称="mr-1.5 h-3.5 w-3.5" />
            Mark Applied
          </Button>
        )}

        {isApplied && (
          <Button
            size="sm"
            class名称="w-full justify-start"
            variant="outline"
            onClick={onMoveToInProgress}
            disabled={isBusy}
          >
            <CheckCircle2 class名称="mr-1.5 h-3.5 w-3.5" />
            Move to In Progress
          </Button>
        )}

        {isInProgress && (
          <Button
            size="sm"
            class名称="w-full justify-start"
            variant="outline"
            onClick={onOpenLogEvent}
            disabled={!canLogEvents || isBusy}
          >
            <PlusCircle class名称="mr-1.5 h-3.5 w-3.5" />
            Log event
          </Button>
        )}

        {isReady && (
          <Button
            size="sm"
            variant="outline"
            class名称="h-9 w-full justify-start"
            onClick={on编辑Tailoring}
            disabled={isBusy}
          >
            <Sparkles class名称="mr-1.5 h-3.5 w-3.5" />
            编辑 Tailoring
          </Button>
        )}

        {job.pdfPath && (
          <Button
            size="sm"
            variant="outline"
            class名称="h-9 w-full justify-start"
            onClick={onViewPdf}
          >
            <FileText class名称="mr-1.5 h-3.5 w-3.5" />
            View PDF
          </Button>
        )}

        <Button
          size="sm"
          variant="outline"
          class名称="h-9 w-full justify-start"
          onClick={onUploadPdf}
          disabled={isUploadingPdf}
        >
          <Upload class名称="mr-1.5 h-3.5 w-3.5" />
          {isUploadingPdf
            ? "Uploading PDF"
            : job.pdfPath
              ? "Replace PDF"
              : "Upload PDF"}
        </Button>

        {isReady && (
          <Button
            size="sm"
            variant="outline"
            class名称="h-9 w-full justify-start"
            onClick={onRegeneratePdf}
            disabled={isBusy}
          >
            <RefreshCcw class名称="mr-1.5 h-3.5 w-3.5" />
            Regenerate PDF
          </Button>
        )}

        {(isReady || isDiscovered) && (
          <Button
            size="sm"
            variant="outline"
            class名称="h-9 w-full justify-start"
            onClick={onSkip}
            disabled={isBusy}
          >
            <XCircle class名称="mr-1.5 h-3.5 w-3.5" />
            Skip Job
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              class名称="h-9 w-full justify-start text-muted-foreground"
            >
              <MoreHorizontal class名称="mr-1.5 h-3.5 w-3.5" />
              More actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={onOpen编辑Details}>
              <编辑2 class名称="mr-2 h-4 w-4" />
              编辑 details
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={onCopyJobInfo}>
              <Copy class名称="mr-2 h-4 w-4" />
              Copy job info
            </DropdownMenuItem>
            {(isReady || isDiscovered) && (
              <DropdownMenuItem onSelect={onRescore}>
                <RefreshCcw class名称="mr-2 h-4 w-4" />
                Recalculate match
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={onCheckSponsor}>
              Check sponsorship status
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </section>

    {tasks.length > 0 && (
      <section class名称="rounded-xl border border-border/50 bg-card/70 p-4">
        <div class名称="mb-3 flex items-center gap-2 text-sm font-semibold">
          <CalendarClock class名称="h-4 w-4" />
          Upcoming tasks
        </div>
        <div class名称="space-y-3">
          {tasks.map((task) => (
            <div key={task.id} class名称="space-y-1">
              <div class名称="text-sm font-medium">{task.title}</div>
              {task.notes && (
                <div class名称="text-xs text-muted-foreground">
                  {task.notes}
                </div>
              )}
              <Badge
                variant="outline"
                class名称="text-[10px] uppercase tracking-wide"
              >
                {formatTimestamp(task.dueDate)}
              </Badge>
            </div>
          ))}
        </div>
      </section>
    )}
  </aside>
);
