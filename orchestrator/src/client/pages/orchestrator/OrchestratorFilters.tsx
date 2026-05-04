import { KbdHint } from "@client/components/KbdHint";
import { getDisplayKey, SHORTCUTS } from "@client/lib/shortcut-map";
import type { JobSource } from "@shared/types.js";
import { Filter, 搜索 } from "lucide-react";
import type React from "react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, Card标题 } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  Sheet描述,
  SheetHeader,
  Sheet标题,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { sourceLabel } from "@/lib/utils";
import type {
  DateFilterDimension,
  DateFilterPreset,
  FilterTab,
  JobDateFilter,
  JobSort,
  SalaryFilter,
  SalaryFilterMode,
  SponsorFilter,
} from "./constants";
import {
  dateFilterDimensionLabels,
  dateFilterDimensionOrder,
  defaultSortDirection,
  orderedFilterSources,
  tabs,
} from "./constants";

interface OrchestratorFiltersProps {
  activeTab: FilterTab;
  onTabChange: (value: FilterTab) => void;
  counts: Record<FilterTab, number>;
  onOpenCommandBar: () => void;
  sourceFilter: JobSource | "all";
  onSourceFilterChange: (value: JobSource | "all") => void;
  sponsorFilter: SponsorFilter;
  onSponsorFilterChange: (value: SponsorFilter) => void;
  salaryFilter: SalaryFilter;
  onSalaryFilterChange: (value: SalaryFilter) => void;
  dateFilter: JobDateFilter;
  onDateFilterChange: (value: JobDateFilter) => void;
  sourcesWithJobs: JobSource[];
  sort: JobSort;
  onSortChange: (sort: JobSort) => void;
  onResetFilters: () => void;
  filteredCount: number;
  isFiltersOpen?: boolean;
  onFiltersOpenChange?: (open: boolean) => void;
}

const sponsorOptions: Array<{
  value: SponsorFilter;
  label: string;
}> = [
  { value: "all", label: "All statuses" },
  { value: "confirmed", label: "确认ed sponsor" },
  { value: "potential", label: "Potential sponsor" },
  { value: "not_found", label: "Sponsor not found" },
  { value: "unknown", label: "Unchecked sponsor" },
];

const salaryModeOptions: Array<{
  value: SalaryFilterMode;
  label: string;
}> = [
  { value: "at_least", label: "at least" },
  { value: "at_most", label: "at most" },
  { value: "between", label: "between" },
];

const sortFieldOrder: JobSort["key"][] = [
  "score",
  "date",
  "discoveredAt",
  "salary",
  "title",
  "employer",
];

const sortFieldLabels: Record<JobSort["key"], string> = {
  score: "Score",
  date: "Date",
  discoveredAt: "Discovered",
  salary: "Salary",
  title: "标题",
  employer: "公司",
};

const tab描述s: Partial<Record<FilterTab, string>> = {
  discovered: "Jobs searched, ready to be tailored",
  ready: "Jobs with tailored CVs, ready to apply",
  applied: "Jobs you've marked as applied",
};

const datePresetOptions: Array<{
  value: Exclude<DateFilterPreset, "custom">;
  label: string;
}> = [
  { value: "7", label: "7 days" },
  { value: "14", label: "14 days" },
  { value: "30", label: "30 days" },
  { value: "90", label: "90 days" },
];

const toDateInputValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getDateRangeForPreset = (preset: Exclude<DateFilterPreset, "custom">) => {
  const end = new Date();
  end.setHours(0, 0, 0, 0);

  const start = new Date(end);
  start.setDate(start.getDate() - (Number.parseInt(preset, 10) - 1));

  return {
    startDate: toDateInputValue(start),
    endDate: toDateInputValue(end),
  };
};

const getDirectionOptions = (
  key: JobSort["key"],
): Array<{ value: JobSort["direction"]; label: string }> => {
  if (key === "date" || key === "discoveredAt") {
    return [
      { value: "desc", label: "Most recent" },
      { value: "asc", label: "Least recent" },
    ];
  }
  if (key === "score" || key === "salary") {
    return [
      { value: "desc", label: "Largest first" },
      { value: "asc", label: "Smallest first" },
    ];
  }
  return [
    { value: "asc", label: "A to Z" },
    { value: "desc", label: "Z to A" },
  ];
};

const toggleDimension = (
  filter: JobDateFilter,
  dimension: DateFilterDimension,
): JobDateFilter => {
  const nextDimensions = filter.dimensions.includes(dimension)
    ? filter.dimensions.filter((value) => value !== dimension)
    : [...filter.dimensions, dimension].sort(
        (left, right) =>
          dateFilterDimensionOrder.indexOf(left) -
          dateFilterDimensionOrder.indexOf(right),
      );

  return {
    ...filter,
    dimensions: nextDimensions,
  };
};

export const OrchestratorFilters: React.FC<OrchestratorFiltersProps> = ({
  activeTab,
  onTabChange,
  counts,
  onOpenCommandBar,
  sourceFilter,
  onSourceFilterChange,
  sponsorFilter,
  onSponsorFilterChange,
  salaryFilter,
  onSalaryFilterChange,
  dateFilter,
  onDateFilterChange,
  sourcesWithJobs,
  sort,
  onSortChange,
  onResetFilters,
  filteredCount,
  isFiltersOpen: isFiltersOpenProp,
  onFiltersOpenChange: onFiltersOpenChangeProp,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isFiltersOpen = isFiltersOpenProp ?? internalOpen;
  const onFiltersOpenChange = onFiltersOpenChangeProp ?? setInternalOpen;

  const visibleSources = orderedFilterSources.filter((source) =>
    sourcesWithJobs.includes(source),
  );

  const activeFilterCount = useMemo(
    () =>
      Number(sourceFilter !== "all") +
      Number(sponsorFilter !== "all") +
      Number(dateFilter.dimensions.length > 0) +
      Number(
        (typeof salaryFilter.min === "number" && salaryFilter.min > 0) ||
          (typeof salaryFilter.max === "number" && salaryFilter.max > 0),
      ),
    [
      sourceFilter,
      sponsorFilter,
      dateFilter.dimensions.length,
      salaryFilter.min,
      salaryFilter.max,
    ],
  );

  const showSalaryMin =
    salaryFilter.mode === "at_least" || salaryFilter.mode === "between";
  const showSalaryMax =
    salaryFilter.mode === "at_most" || salaryFilter.mode === "between";
  const commandShortcutLabel = getDisplayKey(SHORTCUTS.search);

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => onTabChange(value as FilterTab)}
    >
      <div class名称="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <TooltipProvider delayDuration={0}>
          <TabsList class名称="h-auto w-full flex-wrap justify-start gap-1 lg:w-auto">
            {tabs.map((tab, index) => {
              const description = tab描述s[tab.id];
              const trigger = (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  class名称="flex-1 flex items-center lg:flex-none gap-1.5"
                >
                  <KbdHint shortcut={String(index + 1)} class名称="mr-0.5" />
                  <span>{tab.label}</span>
                  {counts[tab.id] > 0 && (
                    <span class名称="text-[10px] mt-[2px] tabular-nums opacity-60">
                      {counts[tab.id]}
                    </span>
                  )}
                </TabsTrigger>
              );

              if (!description) {
                return trigger;
              }

              return (
                <Tooltip key={tab.id}>
                  <TooltipTrigger asChild>{trigger}</TooltipTrigger>
                  <TooltipContent class名称="max-w-xs text-center">
                    <p>{description}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </TabsList>
        </TooltipProvider>

        <div class名称="flex lg:flex-nowrap flex-wrap items-center justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onOpenCommandBar}
            aria-label="搜索 jobs"
            class名称="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground w-auto"
          >
            <搜索 class名称="h-3.5 w-3.5" />
            搜索
            <span class名称="rounded border border-border/70 px-1 py-0.5 font-mono text-xs leading-none text-muted-foreground">
              {commandShortcutLabel}
            </span>
          </Button>

          <Sheet open={isFiltersOpen} onOpenChange={onFiltersOpenChange}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                class名称="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground w-auto"
              >
                <Filter class名称="h-3.5 w-3.5" />
                Filters
                {activeFilterCount > 0 && (
                  <span class名称="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary/20 px-1 text-[10px] font-semibold tabular-nums text-primary">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>

            <SheetContent side="right" class名称="w-full sm:max-w-2xl">
              <div class名称="flex h-full min-h-0 flex-col">
                <SheetHeader>
                  <Sheet标题 class名称="flex items-center gap-2">
                    Filters
                    {activeFilterCount > 0 && (
                      <span class名称="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/20 px-1 text-[11px] font-semibold tabular-nums text-primary">
                        {activeFilterCount}
                      </span>
                    )}
                  </Sheet标题>
                  <Sheet描述>
                    Use the right-side filter panel to refine jobs across every
                    tab.
                  </Sheet描述>
                </SheetHeader>

                <Separator class名称="my-4" />

                <div class名称="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
                  <Card>
                    <CardHeader class名称="pb-3">
                      <Card标题>Sources</Card标题>
                    </CardHeader>
                    <CardContent class名称="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant={sourceFilter === "all" ? "default" : "outline"}
                        onClick={() => onSourceFilterChange("all")}
                      >
                        All sources
                      </Button>
                      {visibleSources.map((source) => (
                        <Button
                          key={source}
                          type="button"
                          size="sm"
                          variant={
                            sourceFilter === source ? "default" : "outline"
                          }
                          onClick={() => onSourceFilterChange(source)}
                        >
                          {sourceLabel[source]}
                        </Button>
                      ))}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader class名称="pb-3">
                      <Card标题>Dates</Card标题>
                    </CardHeader>
                    <CardContent class名称="space-y-3">
                      <div class名称="flex flex-wrap gap-2">
                        {dateFilterDimensionOrder.map((dimension) => (
                          <Button
                            key={dimension}
                            type="button"
                            size="sm"
                            variant={
                              dateFilter.dimensions.includes(dimension)
                                ? "default"
                                : "outline"
                            }
                            onClick={() =>
                              onDateFilterChange(
                                toggleDimension(dateFilter, dimension),
                              )
                            }
                          >
                            {dateFilterDimensionLabels[dimension]}
                          </Button>
                        ))}
                      </div>

                      {dateFilter.dimensions.length > 0 && (
                        <>
                          <div class名称="flex flex-wrap gap-2">
                            {datePresetOptions.map((option) => (
                              <Button
                                key={option.value}
                                type="button"
                                size="sm"
                                variant={
                                  dateFilter.preset === option.value
                                    ? "default"
                                    : "outline"
                                }
                                onClick={() =>
                                  onDateFilterChange({
                                    ...dateFilter,
                                    preset: option.value,
                                    ...getDateRangeForPreset(option.value),
                                  })
                                }
                              >
                                Last {option.label}
                              </Button>
                            ))}
                          </div>

                          <div class名称="grid gap-3 md:grid-cols-2">
                            <div class名称="space-y-1">
                              <Label htmlFor="date-start-filter">
                                Start date
                              </Label>
                              <Input
                                id="date-start-filter"
                                type="date"
                                value={dateFilter.startDate ?? ""}
                                onChange={(event) =>
                                  onDateFilterChange({
                                    ...dateFilter,
                                    startDate: event.target.value || null,
                                    preset: "custom",
                                  })
                                }
                              />
                            </div>

                            <div class名称="space-y-1">
                              <Label htmlFor="date-end-filter">End date</Label>
                              <Input
                                id="date-end-filter"
                                type="date"
                                value={dateFilter.endDate ?? ""}
                                onChange={(event) =>
                                  onDateFilterChange({
                                    ...dateFilter,
                                    endDate: event.target.value || null,
                                    preset: "custom",
                                  })
                                }
                              />
                            </div>
                          </div>

                          <div>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                onDateFilterChange({
                                  dimensions: [],
                                  startDate: null,
                                  endDate: null,
                                  preset: null,
                                })
                              }
                            >
                              Clear date filters
                            </Button>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader class名称="pb-3">
                      <Card标题>Sponsor status</Card标题>
                    </CardHeader>
                    <CardContent class名称="flex flex-wrap gap-2">
                      {sponsorOptions.map((option) => (
                        <Button
                          key={option.value}
                          type="button"
                          size="sm"
                          variant={
                            sponsorFilter === option.value
                              ? "default"
                              : "outline"
                          }
                          onClick={() => onSponsorFilterChange(option.value)}
                        >
                          {option.label}
                        </Button>
                      ))}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader class名称="pb-3">
                      <Card标题>Salary</Card标题>
                    </CardHeader>
                    <CardContent class名称="space-y-3">
                      <div class名称="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <span>Salary is</span>
                        <Select
                          value={salaryFilter.mode}
                          onValueChange={(value) => {
                            const nextMode = value as SalaryFilterMode;
                            if (nextMode === "at_least") {
                              onSalaryFilterChange({
                                mode: nextMode,
                                min: salaryFilter.min,
                                max: null,
                              });
                              return;
                            }
                            if (nextMode === "at_most") {
                              onSalaryFilterChange({
                                mode: nextMode,
                                min: null,
                                max: salaryFilter.max,
                              });
                              return;
                            }
                            onSalaryFilterChange({
                              mode: nextMode,
                              min: salaryFilter.min,
                              max: salaryFilter.max,
                            });
                          }}
                        >
                          <SelectTrigger
                            id="salary-mode"
                            aria-label="Salary range specifier"
                            class名称="h-8 w-[170px] text-foreground"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {salaryModeOptions.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div
                        class名称={
                          showSalaryMin && showSalaryMax
                            ? "grid gap-3 md:grid-cols-2"
                            : "space-y-3"
                        }
                      >
                        {showSalaryMin && (
                          <div class名称="space-y-1">
                            <Label htmlFor="salary-min-filter">Minimum</Label>
                            <Input
                              id="salary-min-filter"
                              value={
                                salaryFilter.min == null
                                  ? ""
                                  : String(salaryFilter.min)
                              }
                              onChange={(event) => {
                                const raw = event.target.value.trim();
                                const parsed = Number.parseInt(raw, 10);
                                onSalaryFilterChange({
                                  ...salaryFilter,
                                  min:
                                    Number.isFinite(parsed) && parsed > 0
                                      ? parsed
                                      : null,
                                });
                              }}
                              inputMode="numeric"
                              placeholder="e.g. 60000"
                            />
                          </div>
                        )}

                        {showSalaryMax && (
                          <div class名称="space-y-1">
                            <Label htmlFor="salary-max-filter">Maximum</Label>
                            <Input
                              id="salary-max-filter"
                              value={
                                salaryFilter.max == null
                                  ? ""
                                  : String(salaryFilter.max)
                              }
                              onChange={(event) => {
                                const raw = event.target.value.trim();
                                const parsed = Number.parseInt(raw, 10);
                                onSalaryFilterChange({
                                  ...salaryFilter,
                                  max:
                                    Number.isFinite(parsed) && parsed > 0
                                      ? parsed
                                      : null,
                                });
                              }}
                              inputMode="numeric"
                              placeholder="e.g. 100000"
                            />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader class名称="pb-3">
                      <Card标题>Sort</Card标题>
                    </CardHeader>
                    <CardContent class名称="space-y-3">
                      <div class名称="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:items-center">
                        <div class名称="flex items-center gap-2">
                          <span class名称="whitespace-nowrap">Sort by</span>
                          <Select
                            value={sort.key}
                            onValueChange={(value) =>
                              onSortChange({
                                key: value as JobSort["key"],
                                direction:
                                  defaultSortDirection[value as JobSort["key"]],
                              })
                            }
                          >
                            <SelectTrigger
                              id="sort-key"
                              aria-label="Sort field"
                              class名称="h-8 flex-1 sm:w-[180px] text-foreground"
                            >
                              <SelectValue
                                placeholder={sortFieldLabels[sort.key]}
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {sortFieldOrder.map((key) => (
                                <SelectItem key={key} value={key}>
                                  {sortFieldLabels[key]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div class名称="flex items-center gap-2">
                          <span class名称="whitespace-nowrap">and</span>
                          <Select
                            value={sort.direction}
                            onValueChange={(value) =>
                              onSortChange({
                                ...sort,
                                direction: value as JobSort["direction"],
                              })
                            }
                          >
                            <SelectTrigger
                              id="sort-direction"
                              aria-label="Sort order"
                              class名称="h-8 flex-1 sm:w-[180px] text-foreground"
                            >
                              <SelectValue
                                placeholder={
                                  getDirectionOptions(sort.key).find(
                                    (option) => option.value === sort.direction,
                                  )?.label
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {getDirectionOptions(sort.key).map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div class名称="mt-3 flex shrink-0 items-center justify-between border-t border-border/60 bg-background pt-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onResetFilters}
                  >
                    Reset
                  </Button>
                  <Button
                    type="button"
                    onClick={() => onFiltersOpenChange?.(false)}
                  >
                    Show {filteredCount.toLocaleString()}{" "}
                    {filteredCount === 1 ? "job" : "jobs"}
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </Tabs>
  );
};
