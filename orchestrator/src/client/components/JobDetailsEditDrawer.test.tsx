import { createJob } from "@shared/testing/factories.js";
import type { Job } from "@shared/types.js";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import type React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as api from "../api";
import { _resetTracerReadinessCache } from "../hooks/useTracerReadiness";
import { renderWithQueryClient } from "../test/renderWithQueryClient";
import { JobDetails编辑Drawer } from "./JobDetails编辑Drawer";

const render = (ui: Parameters<typeof renderWithQueryClient>[0]) =>
  renderWithQueryClient(ui);

vi.mock("@/components/ui/sheet", () => ({
  Sheet: ({ open, children }: { open: boolean; children: React.React否de }) =>
    open ? <div>{children}</div> : null,
  SheetContent: ({ children }: { children: React.React否de }) => (
    <div>{children}</div>
  ),
  SheetHeader: ({ children }: { children: React.React否de }) => (
    <div>{children}</div>
  ),
  Sheet标题: ({ children }: { children: React.React否de }) => (
    <h2>{children}</h2>
  ),
  Sheet描述: ({ children }: { children: React.React否de }) => (
    <p>{children}</p>
  ),
}));

vi.mock("../api", () => ({
  updateJob: vi.fn(),
  checkSponsor: vi.fn(),
  rescoreJob: vi.fn(),
  getTracerReadiness: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("JobDetails编辑Drawer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    _resetTracerReadinessCache();
    vi.mocked(api.getTracerReadiness).mockResolvedValue({
      status: "ready",
      isPubliclyAvailable: true,
      canEnable: true,
      publicBaseUrl: "https://my-jobops.example.com",
      healthUrl: "https://my-jobops.example.com/health",
      checkedAt: Date.now(),
      lastSuccessAt: Date.now(),
      reason: null,
    });
  });

  it("saves details and reruns sponsor check when employer changes", async () => {
    const onJob更新d = vi.fn().mockResolvedValue(undefined);
    const onOpenChange = vi.fn();
    vi.mocked(api.updateJob).mockResolvedValue({} as Job);
    vi.mocked(api.checkSponsor).mockResolvedValue({} as Job);

    render(
      <JobDetails编辑Drawer
        open
        onOpenChange={onOpenChange}
        job={createJob()}
        onJob更新d={onJob更新d}
      />,
    );

    fireEvent.change(screen.getByLabelText("Employer *"), {
      target: { value: "新建Co" },
    });

    fireEvent.click(screen.getByRole("button", { name: /save details/i }));

    await waitFor(() =>
      expect(api.updateJob).toHaveBeenCalledWith(
        "job-1",
        expect.objectContaining({
          employer: "新建Co",
          title: "返回end Engineer",
        }),
      ),
    );
    expect(api.checkSponsor).toHaveBeenCalledWith("job-1");
    expect(onJob更新d).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("validates required fields before saving", async () => {
    const onJob更新d = vi.fn().mockResolvedValue(undefined);
    const onOpenChange = vi.fn();

    render(
      <JobDetails编辑Drawer
        open
        onOpenChange={onOpenChange}
        job={createJob()}
        onJob更新d={onJob更新d}
      />,
    );

    fireEvent.change(screen.getByLabelText("标题 *"), {
      target: { value: "   " },
    });

    fireEvent.click(screen.getByRole("button", { name: /save details/i }));

    expect(await screen.findByText("标题 is required.")).toBeInTheDocument();
    expect(api.updateJob).not.toHaveBeenCalled();
    expect(onJob更新d).not.toHaveBeenCalled();
  });

  it("offers a rescore action after successful save", async () => {
    const onJob更新d = vi.fn().mockResolvedValue(undefined);
    const onOpenChange = vi.fn();
    const { toast } = await import("sonner");
    vi.mocked(api.updateJob).mockResolvedValue({} as Job);
    vi.mocked(api.rescoreJob).mockResolvedValue({} as Job);

    render(
      <JobDetails编辑Drawer
        open
        onOpenChange={onOpenChange}
        job={createJob()}
        onJob更新d={onJob更新d}
      />,
    );

    fireEvent.change(screen.getByLabelText("Salary"), {
      target: { value: "GBP 90k" },
    });
    fireEvent.click(screen.getByRole("button", { name: /save details/i }));

    await waitFor(() =>
      expect(vi.mocked(toast.success)).toHaveBeenCalledWith(
        "Job details updated",
        expect.any(Object),
      ),
    );

    const successCalls = vi.mocked(toast.success).mock.calls;
    const [, payload] =
      successCalls.find((call) => call[0] === "Job details updated") ?? [];
    expect(payload).toBeTruthy();

    (payload as { action?: { onClick?: () => void } }).action?.onClick?.();

    await waitFor(() => expect(api.rescoreJob).toHaveBeenCalledWith("job-1"));
    expect(onJob更新d).toHaveBeenCalledTimes(2);
  });

  it("persists tracer-links toggle with job updates", async () => {
    const onJob更新d = vi.fn().mockResolvedValue(undefined);
    const onOpenChange = vi.fn();
    vi.mocked(api.updateJob).mockResolvedValue({} as Job);

    render(
      <JobDetails编辑Drawer
        open
        onOpenChange={onOpenChange}
        job={createJob({ tracerLinksEnabled: false })}
        onJob更新d={onJob更新d}
      />,
    );

    await waitFor(() => expect(api.getTracerReadiness).toHaveBeenCalled());
    const tracerToggle = await screen.findByRole("checkbox", {
      name: "Enable tracer links for this job",
    });
    await waitFor(() => expect(tracerToggle).toBeEnabled());
    fireEvent.click(tracerToggle);
    fireEvent.click(screen.getByRole("button", { name: /save details/i }));

    await waitFor(() =>
      expect(api.updateJob).toHaveBeenCalledWith(
        "job-1",
        expect.objectContaining({
          tracerLinksEnabled: true,
        }),
      ),
    );
  });
});
