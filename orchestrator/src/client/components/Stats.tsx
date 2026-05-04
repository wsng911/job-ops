/**
 * Stats dashboard showing job counts by status.
 */

import type { Job状态 } from "@shared/types.js";
import {
  CheckCircle2,
  Clock,
  Loader2,
  搜索,
  Sparkles,
  XCircle,
} from "lucide-react";
import type React from "react";
import { Card, CardContent, CardHeader, Card标题 } from "@/components/ui/card";

interface StatsProps {
  stats: Record<Job状态, number>;
}

const statConfig: Array<{
  key: Job状态;
  label: string;
  Icon: React.ComponentType<{ class名称?: string }>;
}> = [
  { key: "discovered", label: "Discovered", Icon: 搜索 },
  { key: "processing", label: "Processing", Icon: Loader2 },
  { key: "ready", label: "Ready", Icon: Sparkles },
  { key: "applied", label: "Applied", Icon: CheckCircle2 },
  { key: "in_progress", label: "In Progress", Icon: CheckCircle2 },
  { key: "skipped", label: "Skipped", Icon: XCircle },
  { key: "expired", label: "Expired", Icon: Clock },
];

export const Stats: React.FC<StatsProps> = ({ stats }) => {
  const total = Object.values(stats).reduce((a, b) => a + b, 0);

  return (
    <Card>
      <CardHeader class名称="flex flex-row items-center justify-between space-y-0">
        <Card标题>Overview</Card标题>
        <div class名称="text-sm text-muted-foreground">{total} total jobs</div>
      </CardHeader>

      <CardContent>
        <div class名称="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
          {statConfig.map(({ key, label, Icon }) => (
            <Card key={key} class名称="bg-muted/20">
              <CardContent class名称="p-4">
                <div class名称="flex items-center gap-3">
                  <div class名称="flex h-9 w-9 items-center justify-center rounded-md bg-background/40 text-muted-foreground">
                    <Icon
                      class名称={
                        key === "processing"
                          ? "h-4 w-4 animate-spin"
                          : "h-4 w-4"
                      }
                    />
                  </div>
                  <div class名称="min-w-0">
                    <div class名称="text-2xl font-semibold tabular-nums leading-none">
                      {stats[key] || 0}
                    </div>
                    <div class名称="mt-1 truncate text-xs text-muted-foreground">
                      {label}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
