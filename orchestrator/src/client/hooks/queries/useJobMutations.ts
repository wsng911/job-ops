import * as api from "@client/api";
import type {
  创建Job否teInput,
  Job,
  更新Job否teInput,
} from "@shared/types";
import type { QueryClient } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/client/lib/queryKeys";
import { invalidateJobData } from "./invalidate";

export async function invalidateJob否tesData(
  queryClient: QueryClient,
  jobId: string,
): Promise<void> {
  await queryClient.invalidateQueries({
    queryKey: queryKeys.jobs.notes(jobId),
  });
}

export function use更新JobMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, update }: { id: string; update: Partial<Job> }) =>
      api.updateJob(id, update),
    onSuccess: async (_data, variables) => {
      await invalidateJobData(queryClient, variables.id);
    },
  });
}

export function useMarkAsAppliedMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.markAsApplied(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.jobs.detail(id) });
      const previousJob = queryClient.getQueryData<Job>(
        queryKeys.jobs.detail(id),
      );
      queryClient.setQueryData<Job>(queryKeys.jobs.detail(id), (current) =>
        current ? { ...current, status: "applied" } : current,
      );
      return { previousJob, id };
    },
    onError: (_error, _id, context) => {
      if (context?.id) {
        queryClient.setQueryData(
          queryKeys.jobs.detail(context.id),
          context.previousJob,
        );
      }
    },
    onSettled: async (_data, _error, id) => {
      await invalidateJobData(queryClient, id);
    },
  });
}

export function useSkipJobMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.skipJob(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.jobs.detail(id) });
      const previousJob = queryClient.getQueryData<Job>(
        queryKeys.jobs.detail(id),
      );
      queryClient.setQueryData<Job>(queryKeys.jobs.detail(id), (current) =>
        current ? { ...current, status: "skipped" } : current,
      );
      return { previousJob, id };
    },
    onError: (_error, _id, context) => {
      if (context?.id) {
        queryClient.setQueryData(
          queryKeys.jobs.detail(context.id),
          context.previousJob,
        );
      }
    },
    onSettled: async (_data, _error, id) => {
      await invalidateJobData(queryClient, id);
    },
  });
}

export function useRescoreJobMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.rescoreJob(id),
    onSuccess: async (_data, id) => {
      await invalidateJobData(queryClient, id);
    },
  });
}

export function useGenerateJobPdfMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.generateJobPdf(id),
    onSuccess: async (_data, id) => {
      await invalidateJobData(queryClient, id);
    },
  });
}

export function useCheckSponsorMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.checkSponsor(id),
    onSuccess: async (_data, id) => {
      await invalidateJobData(queryClient, id);
    },
  });
}

export function use创建Job否teMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      jobId,
      input,
    }: {
      jobId: string;
      input: 创建Job否teInput;
    }) => api.createJob否te(jobId, input),
    onSuccess: async (_data, variables) => {
      await invalidateJob否tesData(queryClient, variables.jobId);
    },
  });
}

export function use更新Job否teMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      jobId,
      noteId,
      input,
    }: {
      jobId: string;
      noteId: string;
      input: 更新Job否teInput;
    }) => api.updateJob否te(jobId, noteId, input),
    onSuccess: async (_data, variables) => {
      await invalidateJob否tesData(queryClient, variables.jobId);
    },
  });
}

export function use删除Job否teMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ jobId, noteId }: { jobId: string; noteId: string }) =>
      api.deleteJob否te(jobId, noteId),
    onSuccess: async (_data, variables) => {
      await invalidateJob否tesData(queryClient, variables.jobId);
    },
  });
}
