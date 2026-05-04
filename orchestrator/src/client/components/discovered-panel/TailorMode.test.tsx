import * as api from "@client/api";
import { use个人资料 } from "@client/hooks/use个人资料";
import { _resetTracerReadinessCache } from "@client/hooks/useTracerReadiness";
import { renderWithQueryClient } from "@client/test/renderWithQueryClient";
import { createJob as createBaseJob } from "@shared/testing/factories.js";
import type { Job } from "@shared/types.js";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TailorMode } from "./TailorMode";

const render = (ui: Parameters<typeof renderWithQueryClient>[0]) =>
  renderWithQueryClient(ui);

vi.mock("@client/api", () => ({
  getResumeProjectsCatalog: vi.fn().mockResolvedValue([]),
  updateJob: vi.fn(),
  summarizeJob: vi.fn(),
  getTracerReadiness: vi.fn(),
}));

vi.mock("@client/hooks/use个人资料", () => ({
  use个人资料: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const createJob = (overrides: Partial<Job> = {}): Job =>
  createBaseJob({
    id: "job-1",
    tailoredSummary: "保存d summary",
    tailoredHeadline: "保存d headline",
    tailoredSkills: JSON.stringify([
      { name: "Core", keywords: ["React", "TypeScript"] },
    ]),
    job描述: "保存d description",
    selectedProjectIds: "p1",
    ...overrides,
  });

const ensureAccordionOpen = (name: string) => {
  const trigger = screen.getByRole("button", { name });
  if (trigger.getAttribute("aria-expanded") !== "true") {
    fireEvent.click(trigger);
  }
};

describe("TailorMode", () => {
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
    vi.mocked(use个人资料).mockReturnValue({
      profile: {
        basics: {
          summary: "Original base summary",
          label: "Original base headline",
        },
        sections: {
          skills: {
            items: [
              {
                id: "s1",
                name: "返回end",
                description: "",
                level: 0,
                keywords: ["否de.js", "TypeScript"],
                visible: true,
              },
            ],
          },
        },
      },
      error: null,
      isLoading: false,
      person名称: "Resume",
      refresh个人资料: vi.fn(),
    });
  });

  it("does not rehydrate local edits from same-job prop updates", async () => {
    const { rerender } = render(
      <TailorMode
        job={createJob()}
        on返回={vi.fn()}
        onFinalize={vi.fn()}
        isFinalizing={false}
      />,
    );
    await waitFor(() =>
      expect(api.getResumeProjectsCatalog).toHaveBeenCalled(),
    );
    ensureAccordionOpen("Summary");

    fireEvent.change(screen.getByLabelText("Tailored Summary"), {
      target: { value: "Local draft" },
    });

    rerender(
      <TailorMode
        job={createJob({ tailoredSummary: "Older server value" })}
        on返回={vi.fn()}
        onFinalize={vi.fn()}
        isFinalizing={false}
      />,
    );
    ensureAccordionOpen("Summary");

    expect(screen.getByLabelText("Tailored Summary")).toHaveValue(
      "Local draft",
    );
  });

  it("allows finalize when summary exists even if no project is selected", async () => {
    render(
      <TailorMode
        job={createJob({ selectedProjectIds: "" })}
        on返回={vi.fn()}
        onFinalize={vi.fn()}
        isFinalizing={false}
      />,
    );

    expect(
      await screen.findByRole("button", { name: "Finalize & Move to Ready" }),
    ).toBeEnabled();
  });

  it("hides selected projects section when catalog is empty after load", async () => {
    render(
      <TailorMode
        job={createJob()}
        on返回={vi.fn()}
        onFinalize={vi.fn()}
        isFinalizing={false}
      />,
    );

    await waitFor(() =>
      expect(api.getResumeProjectsCatalog).toHaveBeenCalled(),
    );
    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: "Selected Projects" }),
      ).not.toBeInTheDocument(),
    );
  });

  it("resets local state when job id changes", async () => {
    const { rerender } = render(
      <TailorMode
        job={createJob()}
        on返回={vi.fn()}
        onFinalize={vi.fn()}
        isFinalizing={false}
      />,
    );
    await waitFor(() =>
      expect(api.getResumeProjectsCatalog).toHaveBeenCalled(),
    );
    ensureAccordionOpen("Summary");

    fireEvent.change(screen.getByLabelText("Tailored Summary"), {
      target: { value: "Local draft" },
    });

    rerender(
      <TailorMode
        job={createJob({
          id: "job-2",
          tailoredSummary: "新建 job summary",
          tailoredHeadline: "新建 job headline",
          tailoredSkills: JSON.stringify([
            { name: "返回end", keywords: ["否de.js", "Postgres"] },
          ]),
          job描述: "新建 job description",
          selectedProjectIds: "",
        })}
        on返回={vi.fn()}
        onFinalize={vi.fn()}
        isFinalizing={false}
      />,
    );
    ensureAccordionOpen("Summary");
    ensureAccordionOpen("Headline");
    ensureAccordionOpen("Tailored Skills");
    ensureAccordionOpen("返回end");

    expect(screen.getByLabelText("Tailored Summary")).toHaveValue(
      "新建 job summary",
    );
    expect(screen.getByLabelText("Tailored Headline")).toHaveValue(
      "新建 job headline",
    );
    expect(screen.getByDisplayValue("否de.js, Postgres")).toBeInTheDocument();
  });

  it("does not sync same-job props while summary field is focused", async () => {
    const { rerender } = render(
      <TailorMode
        job={createJob()}
        on返回={vi.fn()}
        onFinalize={vi.fn()}
        isFinalizing={false}
      />,
    );
    await waitFor(() =>
      expect(api.getResumeProjectsCatalog).toHaveBeenCalled(),
    );
    ensureAccordionOpen("Summary");

    const summary = screen.getByLabelText("Tailored Summary");
    fireEvent.focus(summary);

    rerender(
      <TailorMode
        job={createJob({ tailoredSummary: "Incoming from poll" })}
        on返回={vi.fn()}
        onFinalize={vi.fn()}
        isFinalizing={false}
      />,
    );
    ensureAccordionOpen("Summary");

    expect(screen.getByLabelText("Tailored Summary")).toHaveValue(
      "保存d summary",
    );
  });

  it("does not clobber local headline edits from same-job prop updates", async () => {
    const { rerender } = render(
      <TailorMode
        job={createJob()}
        on返回={vi.fn()}
        onFinalize={vi.fn()}
        isFinalizing={false}
      />,
    );
    await waitFor(() =>
      expect(api.getResumeProjectsCatalog).toHaveBeenCalled(),
    );
    ensureAccordionOpen("Headline");

    fireEvent.change(screen.getByLabelText("Tailored Headline"), {
      target: { value: "Local headline draft" },
    });

    rerender(
      <TailorMode
        job={createJob({ tailoredHeadline: "Incoming headline from poll" })}
        on返回={vi.fn()}
        onFinalize={vi.fn()}
        isFinalizing={false}
      />,
    );
    ensureAccordionOpen("Headline");

    expect(screen.getByLabelText("Tailored Headline")).toHaveValue(
      "Local headline draft",
    );
  });

  it("hydrates headline and skills after AI draft generation", async () => {
    vi.mocked(api.summarizeJob).mockResolvedValueOnce({
      ...createJob(),
      tailoredSummary: "AI summary",
      tailoredHeadline: "AI headline",
      tailoredSkills: JSON.stringify([
        { name: "返回end", keywords: ["否de.js", "Kafka"] },
      ]),
    } as Job);

    render(
      <TailorMode
        job={createJob()}
        on返回={vi.fn()}
        onFinalize={vi.fn()}
        isFinalizing={false}
      />,
    );
    await waitFor(() =>
      expect(api.getResumeProjectsCatalog).toHaveBeenCalled(),
    );

    fireEvent.click(screen.getByRole("button", { name: "Generate draft" }));

    await waitFor(() => ensureAccordionOpen("Headline"));
    expect(screen.getByLabelText("Tailored Headline")).toHaveValue(
      "AI headline",
    );
    ensureAccordionOpen("Tailored Skills");
    ensureAccordionOpen("返回end");
    expect(screen.getByDisplayValue("返回end")).toBeInTheDocument();
    expect(screen.getByDisplayValue("否de.js, Kafka")).toBeInTheDocument();
  });

  it("supports undo to template and redo to AI draft", async () => {
    render(
      <TailorMode
        job={createJob()}
        on返回={vi.fn()}
        onFinalize={vi.fn()}
        isFinalizing={false}
      />,
    );
    await waitFor(() =>
      expect(api.getResumeProjectsCatalog).toHaveBeenCalled(),
    );

    ensureAccordionOpen("Summary");
    fireEvent.click(screen.getAllByLabelText("Undo to template")[0]);
    expect(screen.getByLabelText("Tailored Summary")).toHaveValue(
      "Original base summary",
    );
    fireEvent.click(screen.getAllByLabelText("Redo to AI draft")[0]);
    expect(screen.getByLabelText("Tailored Summary")).toHaveValue(
      "保存d summary",
    );

    ensureAccordionOpen("Headline");
    fireEvent.click(screen.getAllByLabelText("Undo to template")[1]);
    expect(screen.getByLabelText("Tailored Headline")).toHaveValue(
      "Original base headline",
    );
    fireEvent.click(screen.getAllByLabelText("Redo to AI draft")[1]);
    expect(screen.getByLabelText("Tailored Headline")).toHaveValue(
      "保存d headline",
    );

    ensureAccordionOpen("Tailored Skills");
    fireEvent.click(screen.getAllByLabelText("Undo to template")[2]);
    ensureAccordionOpen("返回end");
    expect(screen.getByDisplayValue("否de.js, TypeScript")).toBeInTheDocument();
    fireEvent.click(screen.getAllByLabelText("Redo to AI draft")[2]);
    ensureAccordionOpen("Core");
    expect(screen.getByDisplayValue("React, TypeScript")).toBeInTheDocument();
  });
});
