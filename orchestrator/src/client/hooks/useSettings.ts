import type { App设置 } from "@shared/types";
import { useQuery } from "@tanstack/react-query";
import { queryClient as appQueryClient } from "@/client/lib/queryClient";
import { queryKeys } from "@/client/lib/queryKeys";
import * as api from "../api";

export function use设置() {
  const {
    data: settings = null,
    error,
    isLoading,
    isFetching,
    refetch,
  } = useQuery<App设置 | null>({
    queryKey: queryKeys.settings.current(),
    queryFn: api.get设置,
  });

  const refresh设置 = async () => {
    const result = await refetch();
    if (result.error) throw result.error;
    return result.data ?? null;
  };

  return {
    settings,
    error: error ?? null,
    isLoading: isLoading || (!!isFetching && !settings && !error),
    showSponsorInfo: settings?.showSponsorInfo?.value ?? true,
    renderMarkdownInJob描述s:
      settings?.renderMarkdownInJob描述s?.value ?? true,
    refresh设置,
  };
}

/** @internal For testing only */
export function _reset设置Cache() {
  appQueryClient.removeQueries({ queryKey: queryKeys.settings.all });
}
