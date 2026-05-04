import type { Job状态 } from "@shared/types.js";
import { cn } from "@/lib/utils";
import { default状态Token, statusTokens } from "./constants";

interface Job状态BadgeProps {
  status: Job状态;
  label?: string;
  class名称?: string;
}

export const Job状态Badge = ({
  status,
  label,
  class名称,
}: Job状态BadgeProps) => {
  const statusToken = statusTokens[status] ?? default状态Token;
  return (
    <span
      class名称={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide",
        statusToken.badge,
        class名称,
      )}
    >
      <span class名称={cn("h-1.5 w-1.5 rounded-full", statusToken.dot)} />
      {label ?? statusToken.label}
    </span>
  );
};
