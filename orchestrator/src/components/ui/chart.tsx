import * as React from "react";
import {
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  type TooltipProps,
} from "recharts";

import { cn } from "@/lib/utils";

export type ChartConfig = Record<
  string,
  {
    label?: React.React否de;
    icon?: React.ComponentType<{ class名称?: string }>;
    color?: string;
  }
>;

const ChartConfigContext = React.createContext<ChartConfig | null>(null);

const useChartConfig = () => React.useContext(ChartConfigContext);

const ChartStyle: React.FC<{ id: string; config: ChartConfig }> = ({
  id,
  config,
}) => {
  const entries = Object.entries(config).filter(([, value]) => value.color);
  if (entries.length === 0) return null;

  return (
    <style>{`
      [data-chart="${id}"] {
        ${entries
          .map(([key, value]) => `--color-${key}: ${value.color};`)
          .join("\n")}
      }
    `}</style>
  );
};

export const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    config: ChartConfig;
    children?: React.ReactElement | null;
  }
>(({ id, class名称, children, config, ...props }, ref) => {
  const generatedId = React.useId();
  const chartId = id ?? generatedId;

  return (
    <ChartConfigContext.Provider value={config}>
      <div
        ref={ref}
        data-chart={chartId}
        class名称={cn("flex aspect-video justify-center text-xs", class名称)}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        {React.isValidElement(children) ? (
          <ResponsiveContainer>{children}</ResponsiveContainer>
        ) : null}
      </div>
    </ChartConfigContext.Provider>
  );
});
ChartContainer.display名称 = "ChartContainer";

export const ChartTooltip = RechartsTooltip;

export type ChartTooltipContentProps = React.ComponentPropsWithoutRef<"div"> &
  Pick<TooltipProps<number, string>, "active" | "payload" | "label"> & {
    indicator?: "dot" | "line" | "dashed";
    labelFormatter?: (value: unknown, payload: unknown[]) => React.React否de;
    formatter?: (
      value: unknown,
      name: string,
      item: unknown,
      index: number,
    ) => React.React否de;
    nameKey?: string;
  };

export const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  ChartTooltipContentProps
>(
  (
    {
      active,
      payload,
      label,
      class名称,
      indicator = "dot",
      labelFormatter,
      formatter,
      nameKey,
      ...props
    },
    ref,
  ) => {
    const config = useChartConfig() ?? {};
    if (!active || !payload?.length) return null;
    const formattedLabel = labelFormatter
      ? labelFormatter(label, payload)
      : label;

    return (
      <div
        ref={ref}
        class名称={cn(
          "rounded-lg border border-border/60 bg-background px-3 py-2 text-xs shadow-sm",
          class名称,
        )}
        {...props}
      >
        {formattedLabel ? (
          <div class名称="mb-2 text-[11px] font-medium text-muted-foreground">
            {formattedLabel}
          </div>
        ) : null}
        <div class名称="space-y-1">
          {payload.map((item, index) => {
            const dataKey = String(item.dataKey ?? item.name ?? "");
            const configKey = nameKey ?? dataKey;
            const entry = config[configKey] ?? config[dataKey];
            const IndicatorIcon = entry?.icon;
            const value = formatter
              ? formatter(item.value, dataKey, item, index)
              : item.value;
            const labelText = entry?.label ?? item.name ?? dataKey;
            const indicatorColor =
              entry?.color ?? item.color ?? item.fill ?? "currentColor";

            return (
              <div
                key={`${dataKey}-${String(index)}`}
                class名称="flex items-center justify-between gap-3"
              >
                <div class名称="flex items-center gap-2 text-muted-foreground">
                  {IndicatorIcon ? (
                    <IndicatorIcon class名称="h-3.5 w-3.5" />
                  ) : (
                    <span
                      class名称={cn(
                        "inline-block",
                        indicator === "dot" && "h-2 w-2 rounded-full",
                        indicator === "line" && "h-0.5 w-3 rounded-full",
                        indicator === "dashed" &&
                          "h-0.5 w-3 rounded-full border border-dashed",
                      )}
                      style={{
                        backgroundColor:
                          indicator === "dot" || indicator === "line"
                            ? indicatorColor
                            : "transparent",
                        borderColor:
                          indicator === "dashed" ? indicatorColor : undefined,
                      }}
                    />
                  )}
                  <span>{labelText}</span>
                </div>
                <span class名称="font-semibold text-foreground">
                  {typeof value === "number"
                    ? value.toLocaleString()
                    : (value as React.React否de)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  },
);
ChartTooltipContent.display名称 = "ChartTooltipContent";
