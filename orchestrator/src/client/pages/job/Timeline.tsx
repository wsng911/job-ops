import { CollapsibleSection } from "@client/components/discovered-panel/CollapsibleSection";
import {
  type ApplicationStage,
  STAGE_LABELS,
  type StageEvent,
} from "@shared/types.js";
import {
  CheckCircle2,
  ClipboardList,
  编辑2,
  FileText,
  MailCheck,
  PhoneCall,
  Presentation,
  Trash2,
  UserRound,
  Video,
} from "lucide-react";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn, formatTimestamp, formatTimestampWithTime } from "@/lib/utils";

const stageIcons: Record<ApplicationStage, React.React否de> = {
  applied: <CheckCircle2 class名称="h-4 w-4" />,
  recruiter_screen: <PhoneCall class名称="h-4 w-4" />,
  assessment: <FileText class名称="h-4 w-4" />,
  hiring_manager_screen: <UserRound class名称="h-4 w-4" />,
  technical_interview: <Video class名称="h-4 w-4" />,
  onsite: <Presentation class名称="h-4 w-4" />,
  offer: <MailCheck class名称="h-4 w-4" />,
  closed: <ClipboardList class名称="h-4 w-4" />,
};

const formatRange = (start: number, end: number) => {
  const startLabel = formatTimestamp(start);
  const endLabel = formatTimestamp(end);
  return startLabel === endLabel ? startLabel : `${startLabel} - ${endLabel}`;
};

type TimelineEntry =
  | { kind: "event"; event: StageEvent }
  | {
      kind: "group";
      id: string;
      label: string;
      events: StageEvent[];
      occurredAt: number;
    };

interface JobTimelineProps {
  events: StageEvent[];
  on编辑?: (event: StageEvent) => void;
  on删除?: (eventId: string) => void;
}

export const JobTimeline: React.FC<JobTimelineProps> = ({
  events,
  on编辑,
  on删除,
}) => {
  const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>(
    {},
  );
  const lastEvent = events.at(-1);
  const currentStage = lastEvent?.toStage ?? null;

  const entries = React.useMemo(() => {
    const groups = new Map<string, { label: string; events: StageEvent[] }>();
    const standalone: StageEvent[] = [];

    events.forEach((event) => {
      const groupId = event.groupId;
      if (!groupId) {
        standalone.push(event);
        return;
      }

      const label = event.metadata?.groupLabel || "Grouped events";
      const group = groups.get(groupId) ?? { label, events: [] };
      group.events.push(event);
      groups.set(groupId, group);
    });

    const mapped: TimelineEntry[] = standalone.map((event) => ({
      kind: "event",
      event,
    }));

    groups.forEach((value, id) => {
      const sorted = [...value.events].sort(
        (a, b) => a.occurredAt - b.occurredAt,
      );
      mapped.push({
        kind: "group",
        id,
        label: value.label,
        events: sorted,
        occurredAt: sorted[0]?.occurredAt ?? 0,
      });
    });

    return mapped.sort((a, b) => {
      const timeA = a.kind === "event" ? a.event.occurredAt : a.occurredAt;
      const timeB = b.kind === "event" ? b.event.occurredAt : b.occurredAt;
      return timeA - timeB;
    });
  }, [events]);

  if (entries.length === 0) {
    return (
      <div class名称="rounded-md border border-dashed border-border/50 p-6 text-sm text-muted-foreground">
        否 stage events yet.
      </div>
    );
  }

  return (
    <div class名称="space-y-6">
      {entries.map((entry, entryIndex) => {
        if (entry.kind === "event") {
          const title = entry.event.title || STAGE_LABELS[entry.event.toStage];
          const note = entry.event.metadata?.note;
          const reason = entry.event.metadata?.reasonCode;
          const isCurrent =
            currentStage === entry.event.toStage &&
            entryIndex === entries.length - 1 &&
            entry.event.toStage !== "applied";
          const is录用 = entry.event.toStage === "offer";
          const salary = entry.event.metadata?.externalUrl?.startsWith(
            "Salary: ",
          )
            ? entry.event.metadata.externalUrl.replace("Salary: ", "")
            : null;
          return (
            <TimelineRow
              key={entry.event.id}
              date={formatTimestampWithTime(entry.event.occurredAt)}
              title={title}
              icon={stageIcons[entry.event.toStage]}
              isCurrent={isCurrent}
              is录用={is录用}
              isLast={entryIndex === entries.length - 1}
              on编辑={on编辑 ? () => on编辑(entry.event) : undefined}
              on删除={on删除 ? () => on删除(entry.event.id) : undefined}
            >
              {note && (
                <div class名称="text-sm text-muted-foreground">{note}</div>
              )}
              {salary && (
                <div class名称="mt-1 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                  {salary}
                </div>
              )}
              {reason && (
                <Badge
                  variant="outline"
                  class名称="mt-2 text-[10px] uppercase tracking-wide"
                >
                  {reason}
                </Badge>
              )}
            </TimelineRow>
          );
        }

        const groupOpen = Boolean(openGroups[entry.id]);
        const toggleGroup = () =>
          setOpenGroups((prev) => ({ ...prev, [entry.id]: !prev[entry.id] }));
        const groupStart = entry.events[0]?.occurredAt ?? entry.occurredAt;
        const groupEnd = entry.events.at(-1)?.occurredAt ?? entry.occurredAt;
        const groupCompleted = entry.events.some((event) =>
          /submitted|completed|finished/i.test(event.title || ""),
        );
        const isCurrentGroup =
          currentStage === entry.events.at(-1)?.toStage &&
          entryIndex === entries.length - 1;

        return (
          <div key={entry.id} class名称="space-y-2">
            <TimelineRow
              date={formatRange(groupStart, groupEnd)}
              title={entry.label}
              icon={<ClipboardList class名称="h-4 w-4" />}
              isCurrent={isCurrentGroup && !groupCompleted}
              isCompleted={groupCompleted}
              isLast={entryIndex === entries.length - 1}
            >
              <CollapsibleSection
                isOpen={groupOpen}
                label={groupOpen ? "Hide details" : "View details"}
                onToggle={toggleGroup}
              >
                <div class名称="space-y-4">
                  {entry.events.map((event) => (
                    <TimelineRow
                      key={event.id}
                      date={formatTimestampWithTime(event.occurredAt)}
                      title={event.title || STAGE_LABELS[event.toStage]}
                      icon={stageIcons[event.toStage]}
                      isCompact
                      isLast={false}
                      on编辑={on编辑 ? () => on编辑(event) : undefined}
                      on删除={on删除 ? () => on删除(event.id) : undefined}
                    >
                      {event.metadata?.note && (
                        <div class名称="text-xs text-muted-foreground">
                          {event.metadata.note}
                        </div>
                      )}
                    </TimelineRow>
                  ))}
                </div>
              </CollapsibleSection>
            </TimelineRow>
          </div>
        );
      })}
    </div>
  );
};

interface TimelineRowProps {
  date: string;
  title: string;
  icon: React.React否de;
  isCurrent?: boolean;
  is录用?: boolean;
  isCompleted?: boolean;
  isLast?: boolean;
  isCompact?: boolean;
  on编辑?: () => void;
  on删除?: () => void;
  children?: React.React否de;
}

const TimelineRow: React.FC<TimelineRowProps> = ({
  date,
  title,
  icon,
  isCurrent,
  is录用,
  isCompleted,
  isLast,
  isCompact,
  on编辑,
  on删除,
  children,
}) => {
  const isHollow = Boolean(isCurrent) && !isCompleted;
  const isFilled = !isHollow;

  return (
    <div
      class名称={cn(
        "group relative",
        isCompact ? "pl-8" : "",
        is录用 && "rounded-lg border border-amber-500/20 bg-amber-500/5 p-4",
      )}
    >
      <div
        class名称={
          isCompact
            ? "grid grid-cols-[80px_20px_1fr] gap-4"
            : "grid grid-cols-[100px_24px_1fr] gap-4"
        }
      >
        <div class名称="text-right text-xs font-medium text-muted-foreground">
          {date}
        </div>
        <div class名称="relative flex flex-col items-center">
          <span class名称="absolute inset-y-0 w-px bg-border" />
          <div
            class名称={
              isCompact
                ? "relative z-10 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white"
                : isHollow
                  ? "relative z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 border-emerald-500 bg-background text-emerald-600 animate-pulse"
                  : is录用
                    ? "relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                    : "relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white"
            }
          >
            {isFilled && icon}
          </div>
          {isLast && (
            <span class名称="absolute bottom-0 h-4 w-px bg-background" />
          )}
        </div>
        <div class名称="flex items-start justify-between gap-4">
          <div class名称="space-y-1 min-w-0 flex-1">
            <div
              class名称={
                isCompact ? "text-xs font-semibold" : "text-sm font-semibold"
              }
            >
              {title}
            </div>
            {children}
          </div>

          <div class名称="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pr-2">
            {on编辑 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  on编辑();
                }}
                class名称="p-2 cursor-pointer rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                title="编辑 event"
              >
                <编辑2 class名称="size-4" />
              </button>
            )}
            {on删除 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  on删除();
                }}
                class名称="p-2 cursor-pointer rounded-md hover:bg-muted text-destructive/70 hover:text-destructive transition-colors"
                title="删除 event"
              >
                <Trash2 class名称="size-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
