import { createApp设置 } from "@shared/testing/factories.js";
import { act, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as api from "../api";
import { renderHookWithQueryClient } from "../test/renderWithQueryClient";
import { _reset设置Cache, use设置 } from "./use设置";

vi.mock("../api", () => ({
  get设置: vi.fn(),
}));

describe("use设置", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    _reset设置Cache();
  });

  it("fetches settings on mount if not already cached", async () => {
    const mock设置 = createApp设置({
      showSponsorInfo: { value: false, default: true, override: false },
      renderMarkdownInJob描述s: {
        value: false,
        default: true,
        override: false,
      },
    });
    vi.mocked(api.get设置).mockResolvedValue(mock设置);

    const { result } = renderHookWithQueryClient(() => use设置());

    // Should start in loading state
    expect(result.current.settings).toBeNull();

    await waitFor(() => {
      expect(result.current.settings).toEqual(mock设置);
    });

    expect(result.current.showSponsorInfo).toBe(false);
    expect(result.current.renderMarkdownInJob描述s).toBe(false);
    expect(api.get设置).toHaveBeenCalledTimes(1);
  });

  it("uses default values when settings are null", async () => {
    vi.mocked(api.get设置).mockResolvedValue(null as any);

    const { result } = renderHookWithQueryClient(() => use设置());

    await waitFor(() => {
      // settings is null, so showSponsorInfo should default to true
      expect(result.current.showSponsorInfo).toBe(true);
      expect(result.current.renderMarkdownInJob描述s).toBe(true);
    });
  });

  it("provides a refresh function that updates settings", async () => {
    const initial设置 = createApp设置();
    const updated设置 = createApp设置({
      showSponsorInfo: { value: false, default: true, override: false },
      renderMarkdownInJob描述s: {
        value: false,
        default: true,
        override: false,
      },
    });

    vi.mocked(api.get设置).mockResolvedValueOnce(initial设置);
    vi.mocked(api.get设置).mockResolvedValueOnce(updated设置);

    const { result } = renderHookWithQueryClient(() => use设置());

    await waitFor(() => {
      expect(result.current.settings).toEqual(initial设置);
    });

    let refreshed: any;
    await act(async () => {
      refreshed = await result.current.refresh设置();
    });

    await waitFor(() => {
      expect(result.current.settings).toEqual(updated设置);
    });

    expect(refreshed).toEqual(updated设置);
    expect(result.current.showSponsorInfo).toBe(false);
    expect(result.current.renderMarkdownInJob描述s).toBe(false);
  });

  it("handles errors when fetching settings", async () => {
    const mockError = new Error("Failed to fetch");
    vi.mocked(api.get设置).mock已拒绝Value(mockError);

    const { result } = renderHookWithQueryClient(() => use设置());

    await waitFor(() => {
      expect(result.current.error).toEqual(mockError);
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.settings).toBeNull();
  });
});
