import * as api from "@client/api";
import { renderWithQueryClient } from "@client/test/renderWithQueryClient";
import { createJob } from "@shared/testing/factories.js";
import type { Job } from "@shared/types.js";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import type React from "react";
import { MemoryRouter } from "react-router-dom";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DiscoveredPanel } from "./DiscoveredPanel";

const render = (ui: Parameters<typeof renderWithQueryClient>[0]) =>
  renderWithQueryClient(ui);

const mock设置 = {
  showSponsorInfo: false,
  renderMarkdownInJob描述s: true,
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

vi.mock("@client/hooks/use设置", () => ({
  use设置: () => mock设置,
}));

vi.mock("@client/api", () => ({
  rescoreJob: vi.fn(),
  skipJob: vi.fn(),
  processJob: vi.fn(),
  checkSponsor: vi.fn(),
}));

vi.mock("../JobDetails编辑Drawer", () => ({
  JobDetails编辑Drawer: ({
    open,
    onOpenChange,
    onJob更新d,
  }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onJob更新d: () => void | Promise<void>;
  }) =>
    open ? (
      <div data-testid="job-details-edit-drawer">
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

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    message: vi.fn(),
  },
}));

describe("DiscoveredPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mock设置.showSponsorInfo = false;
    mock设置.renderMarkdownInJob描述s = true;
  });

  it("re-runs the fit assessment from the menu", async () => {
    const onJob更新d = vi.fn().mockResolvedValue(undefined);
    const job = createJob({ id: "job-2" });
    vi.mocked(api.rescoreJob).mockResolvedValue(job as Job);

    render(
      <MemoryRouter>
        <DiscoveredPanel
          job={job}
          onJob更新d={onJob更新d}
          onJobMoved={vi.fn()}
        />
      </MemoryRouter>,
    );

    fireEvent.click(
      screen.getByRole("menuitem", { name: /recalculate match/i }),
    );

    await waitFor(() => expect(api.rescoreJob).toHaveBeenCalledWith("job-2"));
    expect(onJob更新d).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith("Match recalculated");
  });

  it("opens edit details drawer from more actions", async () => {
    const onJob更新d = vi.fn().mockResolvedValue(undefined);
    const job = createJob({ id: "job-2" });

    render(
      <MemoryRouter>
        <DiscoveredPanel
          job={job}
          onJob更新d={onJob更新d}
          onJobMoved={vi.fn()}
        />
      </MemoryRouter>,
    );

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

  it("shows an open job listing link when the discovered job has an external url", () => {
    const job = createJob({
      id: "job-3",
      jobUrl: "https://example.com/jobs/visit-me",
      applicationLink: null,
    });

    render(
      <MemoryRouter>
        <DiscoveredPanel
          job={job}
          onJob更新d={vi.fn()}
          onJobMoved={vi.fn()}
        />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("link", { name: /open job listing/i }),
    ).toHaveAttribute("href", "https://example.com/jobs/visit-me");
  });

  it("renders markdown formatting in the expanded job description when markdown rendering is enabled", () => {
    const job = createJob({
      job描述:
        "# Responsibilities\n\n- Build APIs\n- Improve reliability",
    });

    render(
      <MemoryRouter>
        <DiscoveredPanel
          job={job}
          onJob更新d={vi.fn()}
          onJobMoved={vi.fn()}
        />
      </MemoryRouter>,
    );

    fireEvent.click(
      screen.getByRole("button", { name: /view full job description/i }),
    );

    expect(
      screen.getByRole("heading", { name: "Responsibilities" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Build APIs")).toBeInTheDocument();
    expect(screen.queryByText("# Responsibilities")).not.toBeInTheDocument();
  });

  it("renders raw markdown in the expanded job description when markdown rendering is disabled", () => {
    mock设置.renderMarkdownInJob描述s = false;

    const job = createJob({
      job描述:
        "# Responsibilities\n\n- Build APIs\n- Improve reliability",
    });

    const rendered = render(
      <MemoryRouter>
        <DiscoveredPanel
          job={job}
          onJob更新d={vi.fn()}
          onJobMoved={vi.fn()}
        />
      </MemoryRouter>,
    );

    fireEvent.click(
      screen.getByRole("button", { name: /view full job description/i }),
    );

    const raw描述 = rendered.container.querySelector(
      "p.whitespace-pre-wrap",
    );
    expect(raw描述?.textContent).toBe(
      "# Responsibilities\n\n- Build APIs\n- Improve reliability",
    );
    expect(
      screen.queryByRole("heading", { name: "Responsibilities" }),
    ).not.toBeInTheDocument();
  });
});
