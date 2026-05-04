import * as api from "@client/api";
import { renderWithQueryClient } from "@client/test/renderWithQueryClient";
import { createJob } from "@shared/testing/factories.js";
import type { Job } from "@shared/types.js";
import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import type React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { JobDetailPanel } from "./JobDetailPanel";

const render = (ui: Parameters<typeof renderWithQueryClient>[0]) =>
  renderWithQueryClient(ui);

const mock设置 = {
  settings: null,
  error: null,
  isLoading: false,
  showSponsorInfo: true,
  renderMarkdownInJob描述s: true,
  refresh设置: vi.fn(),
};

vi.mock("@/components/ui/dropdown-menu", () => {
  return {
    DropdownMenu: ({ children }: { children: React.React否de }) => (
      <div>{children}</div>
    ),
    DropdownMenuTrigger: ({ children }: { children: React.React否de }) => (
      <>{children}</>
    ),
    DropdownMenuContent: ({ children }: { children: React.React否de }) => (
      <div role="menu">{children}</div>
    ),
    DropdownMenuItem: ({
      children,
      onSelect,
      ...props
    }: {
      children: React.React否de;
      onSelect?: () => void;
    }) => (
      <button
        type="button"
        role="menuitem"
        onClick={() => onSelect?.()}
        {...props}
      >
        {children}
      </button>
    ),
    DropdownMenuSeparator: () => <hr />,
  };
});

vi.mock("@client/components", () => ({
  JobHeader: () => <div data-testid="job-header" />,
  FitAssessment: () => <div data-testid="fit-assessment" />,
  TailoredSummary: () => <div data-testid="tailored-summary" />,
}));

vi.mock("@client/hooks/use设置", () => ({
  use设置: () => mock设置,
}));

vi.mock("@client/components/tailoring/TailoringWorkspace", () => ({
  TailoringWorkspace: ({
    onDirtyChange,
  }: {
    onDirtyChange?: (isDirty: boolean) => void;
  }) => (
    <div data-testid="tailoring-workspace">
      <button type="button" onClick={() => onDirtyChange?.(true)}>
        Mark tailoring dirty
      </button>
      <button type="button" onClick={() => onDirtyChange?.(false)}>
        Mark tailoring clean
      </button>
    </div>
  ),
}));

vi.mock("@client/components/JobDetails编辑Drawer", () => ({
  JobDetails编辑Drawer: ({
    open,
    onOpenChange,
    onJob更新d,
    job,
  }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onJob更新d: () => Promise<void>;
    job: Job | null;
  }) =>
    open ? (
      <div data-testid="job-details-edit-drawer">
        <div>{job?.id}</div>
        <button
          type="button"
          onClick={() => {
            void onJob更新d();
            onOpenChange(false);
          }}
        >
          保存 details
        </button>
      </div>
    ) : null,
}));

vi.mock("@/lib/utils", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/utils")>();
  return {
    ...actual,
    copyTextToClipboard: vi.fn().mockResolvedValue(undefined),
    formatJobForWebhook: vi.fn(() => "payload"),
  };
});

vi.mock("@client/api", () => ({
  updateJob: vi.fn(),
  processJob: vi.fn(),
  generateJobPdf: vi.fn(),
  markAsApplied: vi.fn(),
  skipJob: vi.fn(),
  get个人资料: vi.fn().mockResolvedValue({}),
  getResumeProjectsCatalog: vi.fn().mockResolvedValue([]),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    message: vi.fn(),
  },
}));

const renderJobDetailPanel = async (
  props: React.ComponentProps<typeof JobDetailPanel>,
) => {
  const rendered = render(<JobDetailPanel {...props} />);
  await act(async () => {
    await Promise.resolve();
  });
  return rendered;
};

describe("JobDetailPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mock设置.renderMarkdownInJob描述s = true;
  });

  it("renders discovered jobs in the unified inspector", async () => {
    const job = createJob({ id: "job-99", status: "discovered" });

    await renderJobDetailPanel({
      activeTab: "discovered",
      activeJobs: [job],
      selectedJob: job,
      onSelectJobId: vi.fn(),
      onJob更新d: vi.fn().mockResolvedValue(undefined),
    });

    expect(screen.getByText("Start Tailoring")).toBeInTheDocument();
    expect(
      screen.getByText(
        "The source material for deciding, tailoring, and applying.",
      ),
    ).toBeInTheDocument();
  });

  it("shows an empty state when no job is selected", async () => {
    await renderJobDetailPanel({
      activeTab: "all",
      activeJobs: [],
      selectedJob: null,
      onSelectJobId: vi.fn(),
      onJob更新d: vi.fn().mockResolvedValue(undefined),
    });

    expect(screen.getByText("否 job selected")).toBeInTheDocument();
  });

  it("renders a stripped description preview for html content", async () => {
    await renderJobDetailPanel({
      activeTab: "all",
      activeJobs: [],
      selectedJob: createJob({
        status: "applied",
        job描述: "<p>Hello <strong>world</strong></p>",
      }),
      onSelectJobId: vi.fn(),
      onJob更新d: vi.fn().mockResolvedValue(undefined),
    });

    expect(screen.getByText("Hello world")).toBeInTheDocument();
  });

  it("renders markdown in the brief job description when enabled", async () => {
    await renderJobDetailPanel({
      activeTab: "all",
      activeJobs: [],
      selectedJob: createJob({
        status: "applied",
        job描述: "# Responsibilities\n\n- Build APIs",
      }),
      onSelectJobId: vi.fn(),
      onJob更新d: vi.fn().mockResolvedValue(undefined),
    });

    expect(
      screen.getByRole("heading", { name: "Responsibilities" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("# Responsibilities")).not.toBeInTheDocument();
  });

  it("shows a view job link in the job description actions", async () => {
    await renderJobDetailPanel({
      activeTab: "all",
      activeJobs: [],
      selectedJob: createJob({
        status: "applied",
        jobUrl: "https://example.com/jobs/source-listing",
        applicationLink: "https://example.com/apply/company",
      }),
      onSelectJobId: vi.fn(),
      onJob更新d: vi.fn().mockResolvedValue(undefined),
    });

    const viewJobLink = screen.getByRole("link", { name: /view job/i });

    expect(viewJobLink).toHaveAttribute(
      "href",
      "https://example.com/jobs/source-listing",
    );
    expect(viewJobLink).toHaveAttribute("target", "_blank");
    expect(viewJobLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders raw markdown in the brief job description when disabled", async () => {
    mock设置.renderMarkdownInJob描述s = false;

    const rendered = await renderJobDetailPanel({
      activeTab: "all",
      activeJobs: [],
      selectedJob: createJob({
        status: "applied",
        job描述: "# Responsibilities\n\n- Build APIs",
      }),
      onSelectJobId: vi.fn(),
      onJob更新d: vi.fn().mockResolvedValue(undefined),
    });

    const raw描述 = rendered.container.querySelector(
      "div.whitespace-pre-wrap",
    );
    expect(raw描述?.textContent).toBe(
      "# Responsibilities\n\n- Build APIs",
    );
    expect(
      screen.queryByRole("heading", { name: "Responsibilities" }),
    ).not.toBeInTheDocument();
  });

  it("saves an edited description", async () => {
    const onJob更新d = vi.fn().mockResolvedValue(undefined);
    vi.mocked(api.updateJob).mockResolvedValue(undefined as any);

    await renderJobDetailPanel({
      activeTab: "all",
      activeJobs: [],
      selectedJob: createJob({ status: "applied", job描述: "Original" }),
      onSelectJobId: vi.fn(),
      onJob更新d,
    });

    fireEvent.click(await screen.findByRole("button", { name: /^edit$/i }));

    fireEvent.change(screen.getByPlaceholderText("Enter job description..."), {
      target: { value: "更新d description" },
    });

    fireEvent.click(screen.getByRole("button", { name: /^save$/i }));

    await waitFor(() =>
      expect(api.updateJob).toHaveBeenCalledWith("job-1", {
        job描述: "更新d description",
      }),
    );
    expect(onJob更新d).toHaveBeenCalled();
  });

  it("opens edit details drawer from menu and saves", async () => {
    const onJob更新d = vi.fn().mockResolvedValue(undefined);

    await renderJobDetailPanel({
      activeTab: "all",
      activeJobs: [],
      selectedJob: createJob({ job描述: "Original" }),
      onSelectJobId: vi.fn(),
      onJob更新d,
    });

    fireEvent.click(screen.getByRole("menuitem", { name: /edit details/i }));
    expect(
      await screen.findByTestId("job-details-edit-drawer"),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /save details/i }));

    await waitFor(() => expect(onJob更新d).toHaveBeenCalled());
    expect(
      screen.queryByTestId("job-details-edit-drawer"),
    ).not.toBeInTheDocument();
  });

  it("marks a job as applied from the action button", async () => {
    const onJob更新d = vi.fn().mockResolvedValue(undefined);
    vi.mocked(api.markAsApplied).mockResolvedValue(undefined as any);

    await renderJobDetailPanel({
      activeTab: "all",
      activeJobs: [],
      selectedJob: createJob({ status: "ready" }),
      onSelectJobId: vi.fn(),
      onJob更新d,
    });

    fireEvent.click(screen.getByRole("button", { name: /applied/i }));

    await waitFor(() =>
      expect(api.markAsApplied).toHaveBeenCalledWith("job-1"),
    );
    expect(onJob更新d).toHaveBeenCalled();
  });

  it("moves an applied job to in progress from the action button", async () => {
    const onJob更新d = vi.fn().mockResolvedValue(undefined);
    vi.mocked(api.updateJob).mockResolvedValue(undefined as any);

    await renderJobDetailPanel({
      activeTab: "all",
      activeJobs: [],
      selectedJob: createJob({ status: "applied" }),
      onSelectJobId: vi.fn(),
      onJob更新d,
    });

    fireEvent.click(
      screen.getByRole("button", { name: /move to in progress/i }),
    );

    await waitFor(() =>
      expect(api.updateJob).toHaveBeenCalledWith("job-1", {
        status: "in_progress",
      }),
    );
    expect(onJob更新d).toHaveBeenCalled();
  });

  it("skips a job from the menu", async () => {
    const onJob更新d = vi.fn().mockResolvedValue(undefined);
    vi.mocked(api.skipJob).mockResolvedValue(undefined as any);

    await renderJobDetailPanel({
      activeTab: "all",
      activeJobs: [],
      selectedJob: createJob({ status: "ready" }),
      onSelectJobId: vi.fn(),
      onJob更新d,
    });

    fireEvent.pointerDown(
      screen.getByRole("button", { name: /more actions/i }),
    );
    const skipItem = await screen.findByRole("menuitem", { name: /skip job/i });
    fireEvent.click(skipItem);

    await waitFor(() => expect(api.skipJob).toHaveBeenCalledWith("job-1"));
    expect(onJob更新d).toHaveBeenCalled();
  });

  it("forwards tailoring dirty state to refresh pause callback", async () => {
    const onPauseRefreshChange = vi.fn();

    await renderJobDetailPanel({
      activeTab: "all",
      activeJobs: [],
      selectedJob: createJob({ status: "ready" }),
      onSelectJobId: vi.fn(),
      onJob更新d: vi.fn().mockResolvedValue(undefined),
      onPauseRefreshChange,
    });

    fireEvent.mouseDown(screen.getByRole("tab", { name: /tailoring/i }));
    fireEvent.click(await screen.findByText("Mark tailoring dirty"));
    fireEvent.click(screen.getByText("Mark tailoring clean"));

    expect(onPauseRefreshChange).toHaveBeenCalledWith(true);
    expect(onPauseRefreshChange).toHaveBeenCalledWith(false);
  });
});
