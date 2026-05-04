/**
 * 状态 badge component.
 */

import type { Job状态 } from "@shared/types.js";
import { Loader2 } from "lucide-react";
import type React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface 状态BadgeProps {
  status: Job状态;
}

const statusLabels: Record<Job状态, string> = {
  discovered: "Discovered",
  processing: "Processing",
  ready: "Ready",
  applied: "Applied",
  in_progress: "In Progress",
  skipped: "Skipped",
  expired: "Expired",
};

const statusStyles: Record<
  Job状态,
  {
    variant: "default" | "secondary" | "destructive" | "outline";
    class名称?: string;
  }
> = {
  discovered: { variant: "secondary" },
  processing: { variant: "secondary" },
  ready: { variant: "default" },
  applied: {
    variant: "outline",
    class名称: "text-emerald-400 border-emerald-500/30",
  },
  in_progress: {
    variant: "outline",
    class名称: "text-cyan-400 border-cyan-500/30",
  },
  skipped: { variant: "destructive" },
  expired: { variant: "outline", class名称: "text-muted-foreground" },
};

export const 状态Badge: React.FC<状态BadgeProps> = ({ status }) => {
  const { variant, class名称 } = statusStyles[status];

  return (
    <Badge variant={variant} class名称={cn("gap-1", class名称)}>
      {status === "processing" && <Loader2 class名称="h-3 w-3 animate-spin" />}
      {statusLabels[status]}
    </Badge>
  );
};
