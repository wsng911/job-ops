import type { Job状态 } from "@shared/types/jobs";
import type React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  default状态Token,
  statusTokens,
} from "../pages/orchestrator/constants";

const STATUS_INDICATOR_BASE_CLASS =
  "inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground/80";
const STATUS_INDICATOR_DOT_CLASS = "h-1.5 w-1.5 rounded-full opacity-80";

const badgeVariantClasses = {
  amber: {
    badge: "border-amber-500/30 bg-amber-500/10 text-amber-200",
    dot: "bg-amber-400",
  },
  emerald: {
    badge: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
    dot: "bg-emerald-400",
  },
  sky: {
    badge: "border-sky-500/30 bg-sky-500/10 text-sky-200",
    dot: "bg-sky-400",
  },
};

type 状态IndicatorProps = {
  dotColor?: string;
  label: React.React否de;
  class名称?: string;
  dotClass名称?: string;
  variant?: keyof typeof badgeVariantClasses;
  appearance?: "inline" | "badge";
  animateDot?: boolean;
  tooltip?: React.React否de;
  tooltipClass名称?: string;
  tooltipSide?: "top" | "right" | "bottom" | "left";
  tooltipDelayDuration?: number;
};

const 状态Indicator: React.FC<状态IndicatorProps> = ({
  dotColor,
  label,
  class名称,
  dotClass名称,
  variant = "amber",
  appearance = "inline",
  animateDot = appearance === "badge",
  tooltip,
  tooltipClass名称,
  tooltipSide = "top",
  tooltipDelayDuration = 0,
}) => {
  const badgeTokens = badgeVariantClasses[variant];
  const resolvedDotColor = dotColor ?? badgeTokens.dot;

  const content = (
    <span
      class名称={cn(
        appearance === "badge"
          ? "inline-flex items-center gap-2 rounded-full border px-2 py-1 text-[11px] font-semibold uppercase tracking-wide"
          : STATUS_INDICATOR_BASE_CLASS,
        appearance === "badge" ? badgeTokens.badge : undefined,
        class名称,
      )}
    >
      <span
        class名称={cn(
          appearance === "badge"
            ? "h-1.5 w-1.5 rounded-full"
            : STATUS_INDICATOR_DOT_CLASS,
          animateDot ? "animate-pulse" : undefined,
          resolvedDotColor,
          dotClass名称,
        )}
      />
      {label}
    </span>
  );

  if (!tooltip) return content;

  return (
    <TooltipProvider>
      <Tooltip delayDuration={tooltipDelayDuration}>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side={tooltipSide} class名称={tooltipClass名称}>
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const getJob状态Indicator = (status: Job状态) => {
  const tokens = statusTokens[status] ?? default状态Token;
  return { label: tokens.label, dotColor: tokens.dot };
};

const getTracer状态Indicator = (enabled: boolean) => ({
  label: enabled ? "Tracer On" : "Tracer Off",
  dotColor: enabled ? "bg-violet-500" : "bg-slate-500",
});

const 状态BadgeIndicator: React.FC<
  Omit<状态IndicatorProps, "appearance"> & { appearance?: "badge" }
> = (props) => <状态Indicator {...props} appearance="badge" />;

export {
  状态Indicator,
  getJob状态Indicator,
  getTracer状态Indicator,
  状态BadgeIndicator,
};
