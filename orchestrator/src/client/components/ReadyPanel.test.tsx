import { createJob } from "@shared/testing/factories.js";
import type { Job } from "@shared/types.js";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import type React from "react";
import { MemoryRouter } from "react-router-dom";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as api from "../api";
import { renderWithQueryClient } from "../test/renderWithQueryClient";
import { ReadyPanel } from "./ReadyPanel";

const render = (ui: Parameters<typeof renderWithQueryClient>[0]) =>
  renderWithQueryClient(ui);

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

vi.mock("../hooks/use个人资料", () => ({
  use个人资料: () => ({ person名称: "Test" }),
}));

vi.mock("../hooks/use设置", () => ({
  use设置: () => ({ showSponsorInfo: false }),
}));

vi.mock("../api", () => ({
  rescoreJob: vi.fn(),
  getResumeProjectsCatalog: vi.fn().mockResolvedValue([]),
  markAsApplied: vi.fn(),
  generateJobPdf: vi.fn(),
  checkSponsor: vi.fn(),
  skipJob: vi.fn(),
  updateJob: vi.fn(),
}));

vi.mock("./JobDetails编辑Drawer", () => ({
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

describe("ReadyPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("re-runs the fit assessment from the menu", async () => {
    const onJob更新d = vi.fn().mockResolvedValue(undefined);
    const job = createJob();
    vi.mocked(api.rescoreJob).mockResolvedValue(job as Job);

    render(
      <MemoryRouter>
        <ReadyPanel
          job={job}
          onJob更新d={onJob更新d}
          onJobMoved={vi.fn()}
        />
      </MemoryRouter>,
    );

    fireEvent.click(
      screen.getByRole("menuitem", { name: /recalculate match/i }),
    );

    await waitFor(() => expect(api.rescoreJob).toHaveBeenCalledWith("job-1"));
    expect(onJob更新d).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith("Match recalculated");
  });

  it("opens edit details drawer from more actions", async () => {
    const onJob更新d = vi.fn().mockResolvedValue(undefined);
    const job = createJob();

    render(
      <MemoryRouter>
        <ReadyPanel
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

  it("renders descriptive google dork links in the ready summary", async () => {
    render(
      <MemoryRouter>
        <ReadyPanel
          job={createJob({
            employer: "HP",
            title: "Frontend Engineer",
            skills: "Wolf Security, React, TypeScript",
          })}
          onJob更新d={vi.fn()}
          onJobMoved={vi.fn()}
        />
      </MemoryRouter>,
    );

    await waitFor(() =>
      expect(api.getResumeProjectsCatalog).toHaveBeenCalled(),
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /3 search links/i,
      }),
    );

    const linkedInLink = screen.getByRole("link", {
      name: "LinkedIn profiles with HP, Wolf Security, and React in them",
    });
    expect(linkedInLink).toHaveAttribute(
      "href",
      `https://www.google.com/search?q=${encodeURIComponent('site:linkedin.com/in "HP" "Wolf Security" "React"')}`,
    );
    expect(linkedInLink).toHaveAttribute("target", "_blank");
    expect(linkedInLink).toHaveAttribute("rel", "noopener noreferrer");
    expect(linkedInLink).toHaveAttribute(
      "title",
      'site:linkedin.com/in "HP" "Wolf Security" "React"',
    );
  });
});
