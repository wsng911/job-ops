import type { Resume个人资料 } from "@shared/types";
import { useQuery } from "@tanstack/react-query";
import { queryClient as appQueryClient } from "@/client/lib/queryClient";
import { queryKeys } from "@/client/lib/queryKeys";
import * as api from "../api";

/**
 * Hook to get the full profile data from base.json.
 * Caches the result to avoid re-fetching.
 */
export function use个人资料() {
  const {
    data: profile = null,
    error,
    isLoading,
    isFetching,
    refetch,
  } = useQuery<Resume个人资料 | null>({
    queryKey: queryKeys.profile.current(),
    queryFn: api.get个人资料,
  });

  const refresh个人资料 = async () => {
    const result = await refetch();
    if (result.error) throw result.error;
    return result.data ?? null;
  };

  return {
    profile,
    error: error ?? null,
    isLoading: isLoading || (!!isFetching && !profile && !error),
    person名称: profile?.basics?.name || "Resume",
    refresh个人资料,
  };
}

/** @internal For testing only */
export function _reset个人资料Cache() {
  appQueryClient.removeQueries({ queryKey: queryKeys.profile.all });
}
