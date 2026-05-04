import * as api from "@client/api";
import type { Job否te } from "@shared/types";
import { act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { queryKeys } from "@/client/lib/queryKeys";
import { renderHookWithQueryClient } from "@/client/test/renderWithQueryClient";
import { use创建Job否teMutation } from "./useJobMutations";

vi.mock("@client/api", () => ({
  createJob否te: vi.fn(),
}));

describe("job note mutations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("invalidates the job notes query after creating a note", async () => {
    const note: Job否te = {
      id: "note-1",
      jobId: "job-1",
      title: "Why applied",
      content: "Because it fits.",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    };
    vi.mocked(api.createJob否te).mockResolvedValue(note);

    const { result, queryClient } = renderHookWithQueryClient(() =>
      use创建Job否teMutation(),
    );
    const invalidateSpy = vi
      .spyOn(queryClient, "invalidateQueries")
      .mockResolvedValue(undefined);

    await act(async () => {
      await result.current.mutateAsync({
        jobId: "job-1",
        input: {
          title: "Why applied",
          content: "Because it fits.",
        },
      });
    });

    expect(api.createJob否te).toHaveBeenCalledWith("job-1", {
      title: "Why applied",
      content: "Because it fits.",
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.jobs.notes("job-1"),
    });
  });
});
