import { createJob as createBaseJob } from "@shared/testing/factories.js";
import type { Job } from "@shared/types.js";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as api from "../api";
import { use个人资料 } from "../hooks/use个人资料";
import { _resetTracerReadinessCache } from "../hooks/useTracerReadiness";
import { renderWithQueryClient } from "../test/renderWithQueryClient";
import { Tailoring编辑or } from "./Tailoring编辑or";

const render = (ui: Parameters<typeof renderWithQueryClient>[0]) =>
  renderWithQueryClient(ui);

vi.mock("../api", () => ({
  getResumeProjectsCatalog: vi.fn().mockResolvedValue([]),
  updateJob: vi.fn().mockResolvedValue({}),
  summarizeJob: vi.fn(),
  generateJobPdf: vi.fn(),
  getTracerReadiness: vi.fn(),
}));

vi.mock("../hooks/use个人资料", () => ({
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

describe("Tailoring编辑or", () => {
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
      <Tailoring编辑or job={createJob()} on更新={vi.fn()} />,
    );
    await waitFor(() =>
      expect(api.getResumeProjectsCatalog).toHaveBeenCalled(),
    );
    ensureAccordionOpen("Summary");

    fireEvent.change(screen.getByLabelText("Tailored Summary"), {
      target: { value: "Local draft" },
    });

    rerender(
      <Tailoring编辑or
        job={createJob({ tailoredSummary: "Older server value" })}
        on更新={vi.fn()}
      />,
    );
    ensureAccordionOpen("Summary");

    expect(screen.getByLabelText("Tailored Summary")).toHaveValue(
      "Local draft",
    );
  });

  it("resets local state when job id changes", async () => {
    const { rerender } = render(
      <Tailoring编辑or job={createJob()} on更新={vi.fn()} />,
    );
    await waitFor(() =>
      expect(api.getResumeProjectsCatalog).toHaveBeenCalled(),
    );
    ensureAccordionOpen("Summary");

    fireEvent.change(screen.getByLabelText("Tailored Summary"), {
      target: { value: "Local draft" },
    });

    rerender(
      <Tailoring编辑or
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
        on更新={vi.fn()}
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

  it("emits dirty state changes", async () => {
    const onDirtyChange = vi.fn();
    render(
      <Tailoring编辑or
        job={createJob()}
        on更新={vi.fn()}
        onDirtyChange={onDirtyChange}
      />,
    );
    await waitFor(() =>
      expect(api.getResumeProjectsCatalog).toHaveBeenCalled(),
    );
    ensureAccordionOpen("Summary");

    fireEvent.change(screen.getByLabelText("Tailored Summary"), {
      target: { value: "Local draft" },
    });

    expect(onDirtyChange).toHaveBeenCalledWith(true);
  });

  it("does not sync same-job props while summary field is focused", async () => {
    const { rerender } = render(
      <Tailoring编辑or job={createJob()} on更新={vi.fn()} />,
    );
    await waitFor(() =>
      expect(api.getResumeProjectsCatalog).toHaveBeenCalled(),
    );
    ensureAccordionOpen("Summary");

    const summary = screen.getByLabelText("Tailored Summary");
    fireEvent.focus(summary);

    rerender(
      <Tailoring编辑or
        job={createJob({ tailoredSummary: "Incoming from poll" })}
        on更新={vi.fn()}
      />,
    );
    ensureAccordionOpen("Summary");

    expect(screen.getByLabelText("Tailored Summary")).toHaveValue(
      "保存d summary",
    );
  });

  it("does not clobber local headline edits from same-job prop updates", async () => {
    const { rerender } = render(
      <Tailoring编辑or job={createJob()} on更新={vi.fn()} />,
    );
    await waitFor(() =>
      expect(api.getResumeProjectsCatalog).toHaveBeenCalled(),
    );
    ensureAccordionOpen("Headline");

    fireEvent.change(screen.getByLabelText("Tailored Headline"), {
      target: { value: "Local headline draft" },
    });

    rerender(
      <Tailoring编辑or
        job={createJob({ tailoredHeadline: "Incoming headline from poll" })}
        on更新={vi.fn()}
      />,
    );
    ensureAccordionOpen("Headline");

    expect(screen.getByLabelText("Tailored Headline")).toHaveValue(
      "Local headline draft",
    );
  });

  it("saves headline and skills in update payload", async () => {
    render(<Tailoring编辑or job={createJob()} on更新={vi.fn()} />);
    await waitFor(() =>
      expect(api.getResumeProjectsCatalog).toHaveBeenCalled(),
    );
    ensureAccordionOpen("Headline");
    ensureAccordionOpen("Tailored Skills");
    ensureAccordionOpen("Core");

    fireEvent.change(screen.getByLabelText("Tailored Headline"), {
      target: { value: "更新d headline" },
    });
    fireEvent.change(screen.getByLabelText("Keywords (comma-separated)"), {
      target: { value: "否de.js, TypeScript" },
    });

    await waitFor(
      () =>
        expect(api.updateJob).toHaveBeenCalledWith(
          "job-1",
          expect.objectContaining({
            tailoredHeadline: "更新d headline",
            tailoredSkills:
              '[{"name":"Core","keywords":["否de.js","TypeScript"]}]',
          }),
        ),
      { timeout: 2000 },
    );
  });

  it("hydrates headline and skills after AI summarize", async () => {
    vi.mocked(api.summarizeJob).mockResolvedValueOnce({
      ...createJob(),
      tailoredSummary: "AI summary",
      tailoredHeadline: "AI headline",
      tailoredSkills: JSON.stringify([
        { name: "返回end", keywords: ["否de.js", "Kafka"] },
      ]),
    } as Job);

    render(<Tailoring编辑or job={createJob()} on更新={vi.fn()} />);
    await waitFor(() =>
      expect(api.getResumeProjectsCatalog).toHaveBeenCalled(),
    );

    fireEvent.click(screen.getByRole("button", { name: "Draft Content" }));

    await waitFor(() => ensureAccordionOpen("Headline"));
    expect(screen.getByLabelText("Tailored Headline")).toHaveValue(
      "AI headline",
    );
    ensureAccordionOpen("Tailored Skills");
    ensureAccordionOpen("返回end");
    expect(screen.getByDisplayValue("返回end")).toBeInTheDocument();
    expect(screen.getByDisplayValue("否de.js, Kafka")).toBeInTheDocument();
  });

  it("persists tracer-links toggle in tailoring save payload", async () => {
    render(
      <Tailoring编辑or
        job={createJob({ tracerLinksEnabled: false })}
        on更新={vi.fn()}
      />,
    );
    await waitFor(() =>
      expect(api.getResumeProjectsCatalog).toHaveBeenCalled(),
    );
    await waitFor(() => expect(api.getTracerReadiness).toHaveBeenCalled());
    ensureAccordionOpen("Tracer Links");

    fireEvent.click(screen.getByLabelText("Enable tracer links for this job"));

    await waitFor(
      () =>
        expect(api.updateJob).toHaveBeenCalledWith(
          "job-1",
          expect.objectContaining({
            tracerLinksEnabled: true,
          }),
        ),
      { timeout: 2000 },
    );
  });

  it("supports undo to template and redo to AI draft", async () => {
    render(<Tailoring编辑or job={createJob()} on更新={vi.fn()} />);
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

  it("resets redo baseline when switching jobs", async () => {
    const { rerender } = render(
      <Tailoring编辑or job={createJob()} on更新={vi.fn()} />,
    );
    await waitFor(() =>
      expect(api.getResumeProjectsCatalog).toHaveBeenCalled(),
    );

    ensureAccordionOpen("Summary");
    fireEvent.click(screen.getAllByLabelText("Undo to template")[0]);
    expect(screen.getByLabelText("Tailored Summary")).toHaveValue(
      "Original base summary",
    );

    rerender(
      <Tailoring编辑or
        job={createJob({
          id: "job-2",
          tailoredSummary: "Second job summary",
        })}
        on更新={vi.fn()}
      />,
    );

    ensureAccordionOpen("Summary");
    fireEvent.click(screen.getAllByLabelText("Undo to template")[0]);
    fireEvent.click(screen.getAllByLabelText("Redo to AI draft")[0]);
    expect(screen.getByLabelText("Tailored Summary")).toHaveValue(
      "Second job summary",
    );
  });

  it("keeps undo disabled until profile template is loaded", async () => {
    vi.mocked(use个人资料).mockReturnValue({
      profile: null,
      error: null,
      isLoading: true,
      person名称: "Resume",
      refresh个人资料: vi.fn(),
    });

    render(<Tailoring编辑or job={createJob()} on更新={vi.fn()} />);
    await waitFor(() =>
      expect(api.getResumeProjectsCatalog).toHaveBeenCalled(),
    );
    ensureAccordionOpen("Summary");
    ensureAccordionOpen("Headline");
    ensureAccordionOpen("Tailored Skills");

    for (const button of screen.getAllByLabelText("Undo to template")) {
      expect(button).toBeDisabled();
    }
  });
});
