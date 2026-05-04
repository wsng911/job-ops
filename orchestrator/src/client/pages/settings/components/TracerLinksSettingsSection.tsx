import { 设置SectionFrame } from "@client/pages/settings/components/设置SectionFrame";
import type { TracerReadinessResponse } from "@shared/types";
import { AlertCircle, CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import type React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type TracerLinks设置SectionProps = {
  readiness: TracerReadinessResponse | null;
  isLoading: boolean;
  isChecking: boolean;
  onVerify否w: () => void | Promise<void>;
  layoutMode?: "accordion" | "panel";
};

const STALE_AFTER_MS = 15 * 60_000;

function formatLastChecked(value: number | null): string {
  if (!value) return "Never";
  const date = new Date(value);
  return date.toLocaleString();
}

function derive状态(
  readiness: TracerReadinessResponse | null,
  isChecking: boolean,
): {
  label: string;
  class名称: string;
  icon: React.React否de;
} {
  if (isChecking) {
    return {
      label: "Checking",
      class名称: "border-blue-300 text-blue-700",
      icon: <Loader2 class名称="h-3.5 w-3.5 animate-spin" />,
    };
  }

  if (!readiness) {
    return {
      label: "否t configured",
      class名称: "border-muted text-muted-foreground",
      icon: <AlertCircle class名称="h-3.5 w-3.5" />,
    };
  }

  const ageMs = Date.now() - readiness.checkedAt;
  if (ageMs > STALE_AFTER_MS) {
    return {
      label: "Stale",
      class名称: "border-amber-300 text-amber-700",
      icon: <AlertCircle class名称="h-3.5 w-3.5" />,
    };
  }

  if (readiness.status === "ready") {
    return {
      label: "Ready",
      class名称: "border-emerald-300 text-emerald-700",
      icon: <CheckCircle2 class名称="h-3.5 w-3.5" />,
    };
  }

  if (readiness.status === "unavailable") {
    return {
      label: "Unavailable",
      class名称: "border-destructive/40 text-destructive",
      icon: <AlertCircle class名称="h-3.5 w-3.5" />,
    };
  }

  return {
    label: "否t configured",
    class名称: "border-muted text-muted-foreground",
    icon: <AlertCircle class名称="h-3.5 w-3.5" />,
  };
}

export const TracerLinks设置Section: React.FC<
  TracerLinks设置SectionProps
> = ({ readiness, isLoading, isChecking, onVerify否w, layoutMode }) => {
  const statusUi = derive状态(readiness, isChecking);
  const publicBaseUrl = readiness?.publicBaseUrl ?? null;
  const checkTimestamp = readiness?.checkedAt ?? null;

  return (
    <设置SectionFrame
      mode={layoutMode}
      title="Tracer Links"
      value="tracer-links"
    >
      <div class名称="space-y-4">
        <div class名称="flex items-center justify-between gap-3 rounded-md border border-border/60 bg-muted/20 p-3">
          <div class名称="flex items-center gap-2 text-sm">
            {statusUi.icon}
            <span class名称="font-medium">Readiness</span>
          </div>
          <Badge variant="outline" class名称={statusUi.class名称}>
            {statusUi.label}
          </Badge>
        </div>

        <div class名称="space-y-1">
          <div class名称="text-xs font-medium text-muted-foreground">
            Public URL
          </div>
          <div class名称="rounded-md border border-border/60 bg-background px-3 py-2 font-mono text-xs">
            {publicBaseUrl ?? "否t configured"}
          </div>
        </div>

        <div class名称="text-xs text-muted-foreground">
          Last checked: {formatLastChecked(checkTimestamp)}
        </div>

        {readiness?.reason ? (
          <div class名称="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
            {readiness.reason}
          </div>
        ) : null}

        <div class名称="flex items-center justify-between gap-2">
          <p class名称="text-xs text-muted-foreground">
            Enable per-job tracer links only when status is Ready.
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => void onVerify否w()}
            disabled={isLoading || isChecking}
          >
            {isChecking ? (
              <Loader2 class名称="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw class名称="mr-2 h-4 w-4" />
            )}
            Verify now
          </Button>
        </div>
      </div>
    </设置SectionFrame>
  );
};
