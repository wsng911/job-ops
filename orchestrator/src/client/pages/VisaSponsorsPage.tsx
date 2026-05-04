import { formatCountryLabel } from "@shared/location-support.js";
import type {
  VisaSponsor,
  VisaSponsor搜索Result,
  VisaSponsor状态Response,
} from "@shared/types.js";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  FileSpreadsheet,
  Loader2,
  MapPin,
  搜索,
  Shield,
  X,
} from "lucide-react";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useQueryErrorToast } from "@/client/hooks/useQueryErrorToast";
import { showErrorToast } from "@/client/lib/error-toast";
import { queryKeys } from "@/client/lib/queryKeys";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Drawer, Drawer关闭, DrawerContent } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, formatDateTime } from "@/lib/utils";
import * as api from "../api";
import {
  DetailPanel,
  EmptyState,
  ListItem,
  ListPanel,
  PageHeader,
  PageMain,
  ScoreMeter,
  SplitLayout,
  状态Indicator,
} from "../components";

const getScoreTokens = (score: number) => {
  if (score >= 90)
    return {
      badge: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
    };
  if (score >= 70)
    return { badge: "border-amber-500/30 bg-amber-500/10 text-amber-200" };
  if (score >= 50)
    return { badge: "border-orange-500/30 bg-orange-500/10 text-orange-200" };
  return { badge: "border-rose-500/30 bg-rose-500/10 text-rose-200" };
};

const ALL_SOURCES_VALUE = "__all_sources__";

const get搜索ScopeLabel = (countryLabel: string) =>
  countryLabel === "All sources" ? "all sources" : `the ${countryLabel} source`;

const getResultKey = (
  result: Pick<VisaSponsor搜索Result, "providerId" | "sponsor">,
) => `${result.providerId}::${result.sponsor.organisation名称}`;

export const VisaSponsorsPage: React.FC = () => {
  const queryClient = useQueryClient();
  // State
  const [searchQuery, set搜索Query] = useState("");
  const [debounced搜索Query, setDebounced搜索Query] = useState("");
  const [selectedResultKey, setSelectedResultKey] = useState<string | null>(
    null,
  );
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  // Loading states
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(min-width: 1024px)").matches
      : false,
  );

  const statusQuery = useQuery<VisaSponsor状态Response>({
    queryKey: queryKeys.visaSponsors.status(),
    queryFn: api.getVisaSponsor状态,
  });
  const status = statusQuery.data ?? null;
  useQueryErrorToast(statusQuery.error, "Failed to fetch status");
  const statusProviders = status?.providers ?? [];
  const providerOptions = statusProviders.map((provider) => ({
    value: provider.countryKey,
    label: formatCountryLabel(provider.countryKey),
    providerId: provider.providerId,
  }));
  const selectedCountryLabel =
    providerOptions.find((option) => option.value === selectedCountry)?.label ??
    "All sources";
  const searchScopeLabel = get搜索ScopeLabel(selectedCountryLabel);
  const activeProviders = selectedCountry
    ? statusProviders.filter(
        (provider) => provider.countryKey === selectedCountry,
      )
    : statusProviders;
  const totalSponsors = activeProviders.reduce(
    (sum, provider) => sum + provider.totalSponsors,
    0,
  );
  const latest更新dAt = activeProviders.reduce<string | null>(
    (latest, provider) => {
      if (!provider.last更新d) return latest;
      if (!latest) return provider.last更新d;
      return new Date(provider.last更新d) > new Date(latest)
        ? provider.last更新d
        : latest;
    },
    null,
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced搜索Query(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const searchQueryResult = useQuery({
    queryKey: queryKeys.visaSponsors.search(
      debounced搜索Query.trim(),
      100,
      20,
      selectedCountry ?? undefined,
    ),
    queryFn: () =>
      api.searchVisaSponsors({
        query: debounced搜索Query.trim(),
        limit: 100,
        minScore: 20,
        country: selectedCountry ?? undefined,
      }),
    enabled: Boolean(debounced搜索Query.trim()),
  });
  useQueryErrorToast(searchQueryResult.error, "搜索 failed");

  const results = useMemo<VisaSponsor搜索Result[]>(() => {
    if (!debounced搜索Query.trim()) return [];
    return searchQueryResult.data?.results ?? [];
  }, [debounced搜索Query, searchQueryResult.data]);

  const selectedResult = useMemo(
    () => results.find((r) => getResultKey(r) === selectedResultKey) ?? null,
    [results, selectedResultKey],
  );
  const selectedOrg = selectedResult?.sponsor.organisation名称 ?? null;

  const orgDetailsQuery = useQuery<VisaSponsor[]>({
    queryKey: queryKeys.visaSponsors.organization(
      selectedOrg ?? "",
      selectedResult?.providerId,
    ),
    queryFn: () =>
      selectedOrg
        ? api.getVisaSponsorOrganization(
            selectedOrg,
            selectedResult?.providerId,
          )
        : Promise.resolve([]),
    enabled: Boolean(selectedOrg),
  });
  const orgDetails = orgDetailsQuery.data ?? [];
  useQueryErrorToast(orgDetailsQuery.error, "Failed to fetch details");

  // Auto-select first result
  useEffect(() => {
    if (results.length === 0) {
      setSelectedResultKey(null);
      return;
    }
    if (
      !selectedResultKey ||
      !results.some((r) => getResultKey(r) === selectedResultKey)
    ) {
      setSelectedResultKey(getResultKey(results[0]));
    }
  }, [results, selectedResultKey]);

  useEffect(() => {
    if (!selectedResultKey) {
      setIsDetailDrawerOpen(false);
    }
  }, [selectedResultKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(min-width: 1024px)");
    const handleChange = () => setIsDesktop(media.matches);
    handleChange();
    if (media.addEventListener) {
      media.addEventListener("change", handleChange);
      return () => media.removeEventListener("change", handleChange);
    }
    media.addListener(handleChange);
    return () => media.removeListener(handleChange);
  }, []);

  useEffect(() => {
    if (isDesktop && isDetailDrawerOpen) {
      setIsDetailDrawerOpen(false);
    }
  }, [isDesktop, isDetailDrawerOpen]);

  // Trigger manual update
  const updateListMutation = useMutation({
    mutationFn: api.updateVisaSponsorList,
    onSuccess: async (result) => {
      queryClient.setQueryData(queryKeys.visaSponsors.status(), result.status);
      if (debounced搜索Query.trim()) {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.visaSponsors.search(
            debounced搜索Query.trim(),
            100,
            20,
            selectedCountry ?? undefined,
          ),
        });
      }
      toast.success(result.message);
    },
    onError: (error) => {
      showErrorToast(error, "更新 failed");
    },
  });

  const handle更新 = async () => {
    await updateListMutation.mutateAsync();
  };

  const handleSelectOrg = (resultKey: string) => {
    setSelectedResultKey(resultKey);
    if (!isDesktop) {
      setIsDetailDrawerOpen(true);
    }
  };

  const handleCountryChange = (value: string) => {
    setSelectedCountry(value === ALL_SOURCES_VALUE ? null : value);
    setSelectedResultKey(null);
    setIsDetailDrawerOpen(false);
  };

  const is更新InProgress =
    updateListMutation.isPending ||
    statusProviders.some((provider) => provider.isUpdating);
  const isLoading状态 = statusQuery.isLoading;
  const is搜索ing = searchQueryResult.isFetching;
  const isLoadingDetails = orgDetailsQuery.isLoading;

  const detailPanelContent = !selectedResult ? (
    <div class名称="flex h-full flex-col items-center justify-center gap-2 text-center">
      <div class名称="text-base font-semibold">Select a company</div>
      <p class名称="text-sm text-muted-foreground">
        Pick a company from the results to see details here.
      </p>
    </div>
  ) : isLoadingDetails ? (
    <div class名称="flex items-center justify-center h-32">
      <Loader2 class名称="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  ) : (
    <div class名称="space-y-4">
      {/* Header */}
      <div>
        <div class名称="flex items-center gap-2 mb-2">
          <span class名称="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-200">
            <CheckCircle2 class名称="h-3 w-3" />
            Licensed Sponsor
          </span>
          {selectedResult && (
            <span
              class名称={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
                getScoreTokens(selectedResult.score).badge,
              )}
            >
              {selectedResult.score}% Match
            </span>
          )}
        </div>
        <h2 class名称="text-lg font-semibold text-foreground">{selectedOrg}</h2>
        <p class名称="mt-1 text-xs text-muted-foreground">
          Source: {formatCountryLabel(selectedResult.countryKey)}
        </p>
      </div>

      {/* Location */}
      {orgDetails.length > 0 &&
        (orgDetails[0].townCity || orgDetails[0].county) && (
          <div>
            <div class名称="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">
              Location
            </div>
            <div class名称="flex items-center gap-2 text-sm text-foreground">
              <MapPin class名称="h-4 w-4 text-muted-foreground" />
              {[orgDetails[0].townCity, orgDetails[0].county]
                .filter(Boolean)
                .join(", ")}
            </div>
          </div>
        )}

      {/* Licence types / routes */}
      <div>
        <div class名称="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
          Licensed Routes ({orgDetails.length})
        </div>
        <div class名称="space-y-2">
          {orgDetails.map((entry) => (
            <div
              key={`${entry.route}-${entry.typeRating}`}
              class名称="rounded-lg border border-border/60 bg-muted/20 p-3"
            >
              <div class名称="flex items-start justify-between gap-2 mb-1">
                <Badge variant="secondary" class名称="text-xs">
                  {entry.route}
                </Badge>
              </div>
              <div class名称="text-xs text-muted-foreground">
                <span class名称="font-medium text-foreground">
                  Type & Rating:
                </span>{" "}
                {entry.typeRating}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info box */}
      <div class名称="rounded-lg border border-sky-500/30 bg-sky-500/10 p-3 text-sm">
        <div class名称="font-medium text-sky-200 mb-1">
          What does this mean?
        </div>
        <p class名称="text-xs text-sky-300/80">
          This organisation appears in the selected sponsor source and may be
          able to sponsor workers on the routes listed above. Always verify the
          latest source entry before relying on it.
        </p>
      </div>
    </div>
  );

  return (
    <>
      <PageHeader
        icon={Shield}
        title="Visa Sponsors"
        statusIndicator={
          is更新InProgress ? <状态Indicator label="Updating" /> : undefined
        }
        subtitle="搜索 sponsor data across available sources"
        actions={
          <>
            {status && (
              <div class名称="hidden md:flex items-center gap-4 text-xs text-muted-foreground mr-2">
                <span class名称="flex items-center gap-1.5">
                  <FileSpreadsheet class名称="h-3.5 w-3.5" />
                  {totalSponsors.toLocaleString()} sponsors
                </span>
                <span class名称="flex items-center gap-1.5">
                  <Clock class名称="h-3.5 w-3.5" />
                  {formatDateTime(latest更新dAt) || "Never"}
                </span>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={handle更新}
              disabled={is更新InProgress}
              aria-label="更新 sponsor list"
            >
              {is更新InProgress ? (
                <Loader2 class名称="h-4 w-4 animate-spin" />
              ) : (
                <Download class名称="h-4 w-4" />
              )}
            </Button>
          </>
        }
      />

      <PageMain>
        {/* 搜索 section */}
        <section class名称="rounded-xl border border-border/60 bg-card/40 p-4">
          <div class名称="grid gap-4">
            <div class名称="space-y-2">
              <div class名称="space-y-2">
                <label
                  htmlFor="sponsor-search"
                  class名称="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  公司 name
                </label>
                <div class名称="relative">
                  <搜索 class名称="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="sponsor-search"
                    placeholder="搜索 for a company name..."
                    value={searchQuery}
                    onChange={(e) => set搜索Query(e.target.value)}
                    class名称="pl-10 pr-10 h-10"
                    autoFocus
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => set搜索Query("")}
                      class名称="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X class名称="h-4 w-4" />
                    </button>
                  )}
                </div>
                <p class名称="text-xs text-muted-foreground">
                  Enter a company name to check if they&apos;re a licensed visa
                  sponsor in {searchScopeLabel}.
                </p>
              </div>
              <label
                htmlFor="sponsor-source"
                class名称="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
              >
                Source
              </label>
              <Select
                value={selectedCountry ?? ALL_SOURCES_VALUE}
                onValueChange={handleCountryChange}
              >
                <SelectTrigger
                  id="sponsor-source"
                  aria-label="Select sponsor source"
                >
                  <SelectValue placeholder="All sources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_SOURCES_VALUE}>All sources</SelectItem>
                  {providerOptions.map((option) => (
                    <SelectItem key={option.providerId} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        <SplitLayout>
          {/* Left panel - Results */}
          <ListPanel
            footer={
              results.length > 0 ? (
                <div class名称="text-xs text-muted-foreground">
                  {results.length} result{results.length !== 1 ? "s" : ""}
                  {is搜索ing && (
                    <span class名称="ml-2">
                      <Loader2 class名称="inline h-3 w-3 animate-spin" />
                    </span>
                  )}
                </div>
              ) : null
            }
          >
            {!isLoading状态 && status && totalSponsors === 0 && (
              <EmptyState
                icon={AlertCircle}
                title="否 sponsor data available"
                description="The visa sponsor list hasn't been downloaded yet."
                action={
                  <Button
                    size="sm"
                    onClick={handle更新}
                    disabled={is更新InProgress}
                  >
                    {is更新InProgress ? (
                      <>
                        <Loader2 class名称="h-4 w-4 mr-2 animate-spin" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download class名称="h-4 w-4 mr-2" />
                        Download List
                      </>
                    )}
                  </Button>
                }
              />
            )}

            {status && totalSponsors > 0 && !searchQuery && (
              <EmptyState
                icon={搜索}
                title="搜索 for a company"
                description={`Enter a company name above to search ${searchScopeLabel}.`}
              />
            )}

            {searchQuery && !is搜索ing && results.length === 0 && (
              <EmptyState
                icon={AlertCircle}
                title="否 matches found"
                description={`否 sponsors match "${searchQuery}". Try a different spelling.`}
              />
            )}

            {results.length > 0 &&
              results.map((result) => (
                <ListItem
                  key={getResultKey(result)}
                  selected={selectedResultKey === getResultKey(result)}
                  onClick={() => handleSelectOrg(getResultKey(result))}
                  class名称="gap-3"
                >
                  <div class名称="flex-1 min-w-0">
                    <div class名称="flex items-center gap-2 mb-1">
                      <Building2 class名称="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span class名称="text-sm font-medium text-foreground truncate">
                        {result.sponsor.organisation名称}
                      </span>
                    </div>
                    {(result.sponsor.townCity || result.sponsor.county) && (
                      <div class名称="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin class名称="h-3 w-3" />
                        {[
                          formatCountryLabel(result.countryKey),
                          result.sponsor.townCity,
                          result.sponsor.county,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </div>
                    )}
                    {!result.sponsor.townCity &&
                      !result.sponsor.county &&
                      result.countryKey && (
                        <div class名称="text-xs text-muted-foreground">
                          {formatCountryLabel(result.countryKey)}
                        </div>
                      )}
                  </div>
                  <div class名称="flex items-center gap-2 shrink-0">
                    <ScoreMeter score={result.score} />
                    <ChevronRight class名称="h-4 w-4 text-muted-foreground" />
                  </div>
                </ListItem>
              ))}
          </ListPanel>

          {/* Right panel - Details */}
          <DetailPanel class名称="hidden lg:block">
            {detailPanelContent}
          </DetailPanel>
        </SplitLayout>
      </PageMain>

      <Drawer open={isDetailDrawerOpen} onOpenChange={setIsDetailDrawerOpen}>
        <DrawerContent class名称="max-h-[90vh]">
          <div class名称="flex items-center justify-between px-4 pt-2">
            <div class名称="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Sponsor details
            </div>
            <Drawer关闭 asChild>
              <Button variant="ghost" size="sm" class名称="h-8 px-2 text-xs">
                关闭
              </Button>
            </Drawer关闭>
          </div>
          <div class名称="max-h-[calc(90vh-3.5rem)] overflow-y-auto px-4 pb-6 pt-3">
            {detailPanelContent}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
};
