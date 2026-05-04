import * as api from "@client/api";
import type { 更新设置Input } from "@shared/settings-schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { invalidate设置Data } from "./invalidate";

export function use更新设置Mutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: 更新设置Input) => api.update设置(payload),
    onSuccess: async () => {
      await invalidate设置Data(queryClient);
    },
  });
}
