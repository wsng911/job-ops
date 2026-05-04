import { getDefaultPromptTemplate } from "@shared/prompt-template-definitions.js";
import { createApp设置 } from "@shared/testing/factories.js";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as api from "../api";
import { _resetTracerReadinessCache } from "../hooks/useTracerReadiness";
import { renderWithQueryClient } from "../test/renderWithQueryClient";
import { 设置Page } from "./设置Page";

const originalScrollIntoView = HTMLElement.prototype.scrollIntoView;

const render = (ui: Parameters<typeof renderWithQueryClient>[0]) =>
  renderWithQueryClient(ui);

vi.mock("../api", () => ({
  get设置: vi.fn(),
  getLlmModels: vi.fn().mockResolvedValue([]),
  getCodexAuth状态: vi.fn().mockResolvedValue({
    authenticated: false,
    username: null,
    validationMessage:
      "Codex is not authenticated in this container. Run `codex login` and try again.",
    flow状态: "idle",
    loginInProgress: false,
    verificationUrl: null,
    userCode: null,
    startedAt: null,
    expiresAt: null,
    flowMessage: null,
  }),
  startCodexAuth: vi.fn().mockResolvedValue({
    authenticated: false,
    username: null,
    validationMessage:
      "Codex is not authenticated in this container. Run `codex login` and try again.",
    flow状态: "running",
    loginInProgress: true,
    verificationUrl: "https://auth.openai.com/codex/device",
    userCode: "ABCD-EFGH",
    startedAt: "2026-04-14T16:00:00.000Z",
    expiresAt: "2026-04-14T16:15:00.000Z",
    flowMessage:
      "Open the verification URL and enter the one-time code to finish login.",
  }),
  disconnectCodexAuth: vi.fn(),
  update设置: vi.fn(),
  validateRxresume: vi.fn(),
  getRxResumeProjects: vi.fn(),
  clearDatabase: vi.fn(),
  deleteJobsBy状态: vi.fn(),
  getTracerReadiness: vi.fn(),
  get返回ups: vi.fn().mockResolvedValue({ backups: [], nextScheduled: null }),
  createManual返回up: vi.fn(),
  delete返回up: vi.fn(),
  getCurrentAuthUser: vi.fn().mockResolvedValue({
    id: "user-1",
    username: "test",
    display名称: null,
    isSystemAdmin: false,
    isDisabled: false,
    workspaceId: "tenant_default",
    workspace名称: "JobOps",
    createdAt: "2026-04-27T00:00:00.000Z",
    updatedAt: "2026-04-27T00:00:00.000Z",
  }),
  listWorkspaceUsers: vi.fn().mockResolvedValue([]),
  createWorkspaceUser: vi.fn(),
  setWorkspaceUserDisabled: vi.fn(),
  resetWorkspaceUser密码: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

const base设置 = createApp设置({
  profileProjects: [
    {
      id: "proj-1",
      name: "Project One",
      description: "Desc 1",
      date: "2024",
      isVisibleInBase: true,
    },
    {
      id: "proj-2",
      name: "Project Two",
      description: "Desc 2",
      date: "2023",
      isVisibleInBase: false,
    },
  ],
});

const renderPage = () => {
  return render(
    <MemoryRouter initialEntries={["/settings"]}>
      <设置Page />
    </MemoryRouter>,
  );
};

const get保存Button = () =>
  screen.getByRole("button", { name: /save changes/i });

const openNavGroup = async (name: RegExp) => {
  const groupButton = await screen.findByRole("button", { name });
  fireEvent.click(groupButton);
};

const clickLastButtonBy名称 = async (name: RegExp) => {
  const buttons = await screen.findAllByRole("button", { name });
  const target = buttons.at(-1);
  expect(target).toBeDefined();
  fireEvent.click(target as HTMLElement);
};

const openModelSection = async () => {
  await openNavGroup(/^ai$/i);
  await clickLastButtonBy名称(/models/i);
};

const openWritingStyleSection = async () => {
  await openNavGroup(/^ai$/i);
  await clickLastButtonBy名称(/writing style/i);
};

const openPromptTemplatesSection = async () => {
  await openNavGroup(/^ai$/i);
  await clickLastButtonBy名称(/prompt templates/i);
};

const openReactiveResumeSection = async () => {
  await openNavGroup(/^integrations$/i);
  await clickLastButtonBy名称(/reactive resume/i);
};

const openDisplaySection = async () => {
  await openNavGroup(/^display$/i);
  await clickLastButtonBy名称(/display preferences/i);
};

const openEnvironmentSection = async () => {
  await openNavGroup(/^workspaces & security$/i);
  await clickLastButtonBy名称(/workspace access/i);
};

const openScoringSection = async () => {
  await openNavGroup(/^scoring$/i);
  await clickLastButtonBy名称(/rules.*filters/i);
};

const openDangerZoneSection = async () => {
  await openNavGroup(/^danger zone$/i);
  await clickLastButtonBy名称(/danger zone/i);
};

describe("设置Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: vi.fn(),
    });
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
    vi.mocked(api.validateRxresume).mockResolvedValue({
      valid: false,
      message: "Missing credentials",
      status: 400,
    });
  });

  afterAll(() => {
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: originalScrollIntoView,
    });
  });

  it("saves trimmed model overrides", async () => {
    vi.mocked(api.get设置).mockResolvedValue(base设置);
    vi.mocked(api.update设置).mockResolvedValue({
      ...base设置,
      model: {
        value: "gpt-4",
        default: base设置.model.default,
        override: "gpt-4",
      },
    });

    renderPage();
    await openModelSection();

    const modelInput = screen.getByLabelText(/default model/i);
    await waitFor(() => expect(modelInput).toBeEnabled());
    fireEvent.change(modelInput, { target: { value: "  gpt-4  " } });

    const saveButton = get保存Button();
    await waitFor(() => expect(saveButton).toBeEnabled());

    fireEvent.click(saveButton);

    await waitFor(() => expect(api.update设置).toHaveBeenCalled());
    expect(api.update设置).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "gpt-4",
      }),
    );
    expect(toast.success).toHaveBeenCalledWith("设置 saved");
  });

  it("starts codex sign-in from model settings", async () => {
    vi.mocked(api.get设置).mockResolvedValue(
      createApp设置({
        llmProvider: {
          value: "codex",
          default: "codex",
          override: "codex",
        },
      }),
    );

    renderPage();
    await openModelSection();

    await waitFor(() => expect(api.getCodexAuth状态).toHaveBeenCalled());

    const startButton = await screen.findByRole("button", {
      name: /start sign-in/i,
    });
    fireEvent.click(startButton);

    await waitFor(() => expect(api.startCodexAuth).toHaveBeenCalled());
    expect(await screen.findByText(/ABCD-EFGH/)).toBeInTheDocument();
    const openVerificationLink = await screen.findByRole("link", {
      name: /open verification page/i,
    });
    expect(openVerificationLink).toHaveAttribute(
      "href",
      "https://auth.openai.com/codex/device",
    );
  });

  it("shows validation error for too long model override", async () => {
    vi.mocked(api.get设置).mockResolvedValue(base设置);

    renderPage();
    await openModelSection();

    const modelInput = screen.getByLabelText(/default model/i);
    await waitFor(() => expect(modelInput).toBeEnabled());

    // Change to > 200 chars
    fireEvent.change(modelInput, { target: { value: "a".repeat(201) } });

    // Should see error message
    expect(
      await screen.findByText(
        /String must contain at most 200 character\(s\)/i,
      ),
    ).toBeInTheDocument();

    // 保存 button should be disabled due to validation error (isValid will be false)
    const saveButton = get保存Button();
    expect(saveButton).toBeDisabled();
  });

  it("clears jobs by status and summarizes results", async () => {
    vi.mocked(api.get设置).mockResolvedValue(base设置);
    vi.mocked(api.deleteJobsBy状态).mockResolvedValue({
      message: "",
      count: 2,
    });

    renderPage();

    await openDangerZoneSection();

    const clearSelectedButton = await screen.findByRole("button", {
      name: /clear selected/i,
    });
    fireEvent.click(clearSelectedButton);

    const confirmButton = await screen.findByRole("button", {
      name: /clear 1 status/i,
    });
    fireEvent.click(confirmButton);

    await waitFor(() =>
      expect(api.deleteJobsBy状态).toHaveBeenCalledWith("discovered"),
    );
    expect(toast.success).toHaveBeenCalledWith(
      "Jobs cleared",
      expect.objectContaining({
        description: "删除d 2 jobs: 2 discovered",
      }),
    );
  });

  it("enables save button when model is changed", async () => {
    vi.mocked(api.get设置).mockResolvedValue(base设置);
    renderPage();
    const saveButton = get保存Button();
    expect(saveButton).toBeDisabled();
    await openModelSection();

    const modelInput = screen.getByLabelText(/default model/i);
    // Wait for the query to resolve and input to be enabled
    await waitFor(() => expect(modelInput).toBeEnabled());

    fireEvent.change(modelInput, { target: { value: "new-model" } });
    await waitFor(() => expect(saveButton).toBeEnabled());
  });

  it("clears stale model overrides when the provider changes", async () => {
    vi.mocked(api.get设置).mockResolvedValue(
      createApp设置({
        model: {
          value: "google/gemini-3-flash-preview",
          default: "google/gemini-3-flash-preview",
          override: "google/gemini-3-flash-preview",
        },
        modelScorer: { value: "google/gemini-3-flash-preview", override: null },
        modelTailoring: {
          value: "google/gemini-3-flash-preview",
          override: "google/gemini-3-flash-preview",
        },
        modelProjectSelection: {
          value: "google/gemini-3-flash-preview",
          override: null,
        },
        llmProvider: { value: "gemini", default: "gemini", override: "gemini" },
      }),
    );
    vi.mocked(api.update设置).mockResolvedValue(base设置);

    renderPage();
    await openModelSection();

    fireEvent.click(screen.getByRole("combobox", { name: /provider/i }));
    fireEvent.click(await screen.findByText("OpenAI"));

    const saveButton = get保存Button();
    await waitFor(() => expect(saveButton).toBeEnabled());
    fireEvent.click(saveButton);

    await waitFor(() => expect(api.update设置).toHaveBeenCalled());
    expect(api.update设置).toHaveBeenCalledWith(
      expect.objectContaining({
        llmProvider: "openai",
        model: null,
        modelScorer: null,
        modelTailoring: null,
        modelProjectSelection: null,
      }),
    );
  });

  it("does not mark model settings dirty on initial load when provider comes from effective settings", async () => {
    vi.mocked(api.get设置).mockResolvedValue(base设置);

    renderPage();
    await openModelSection();

    const saveButton = get保存Button();
    await waitFor(() => expect(saveButton).toBeDisabled());
  });

  it("does not mark Reactive Resume settings dirty when project catalog hydration finishes", async () => {
    vi.mocked(api.validateRxresume).mockResolvedValue({
      valid: true,
      message: null,
      status: 200,
    });
    vi.mocked(api.getRxResumeProjects).mockResolvedValue([
      {
        id: "proj-1",
        name: "Project One",
        description: "Desc 1",
        date: "2024",
        isVisibleInBase: true,
      },
    ]);
    vi.mocked(api.get设置).mockResolvedValue(
      createApp设置({
        rxresumeApiKeyHint: "rr-v5",
        rxresumeBaseResumeId: "resume-123",
        profileProjects: [
          {
            id: "proj-1",
            name: "Project One",
            description: "Desc 1",
            date: "2024",
            isVisibleInBase: true,
          },
        ],
      }),
    );

    renderPage();
    await openReactiveResumeSection();

    await waitFor(() => expect(api.getRxResumeProjects).toHaveBeenCalled());

    const saveButton = get保存Button();
    await waitFor(() => expect(saveButton).toBeDisabled());
  });

  it("does not clear the model override when saving an unrelated setting", async () => {
    vi.mocked(api.get设置).mockResolvedValue(
      createApp设置({
        model: {
          value: "gpt-4.1-mini",
          default: "gpt-4o",
          override: "gpt-4.1-mini",
        },
        llmProvider: {
          value: "openai",
          default: "openai",
          override: null,
        },
      }),
    );
    vi.mocked(api.update设置).mockResolvedValue(
      createApp设置({
        model: {
          value: "gpt-4.1-mini",
          default: "gpt-4o",
          override: "gpt-4.1-mini",
        },
        llmProvider: {
          value: "openai",
          default: "openai",
          override: null,
        },
        showSponsorInfo: {
          value: false,
          default: true,
          override: false,
        },
      }),
    );

    renderPage();

    await openDisplaySection();
    fireEvent.click(screen.getByLabelText(/show visa sponsor information/i));

    const saveButton = get保存Button();
    await waitFor(() => expect(saveButton).toBeEnabled());
    fireEvent.click(saveButton);

    await waitFor(() => expect(api.update设置).toHaveBeenCalled());
    expect(api.update设置).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "gpt-4.1-mini",
        showSponsorInfo: false,
      }),
    );
  });

  it("hides pipeline tuning sections that moved to run modal", async () => {
    vi.mocked(api.get设置).mockResolvedValue(base设置);
    renderPage();

    await openModelSection();
    expect(
      screen.queryByRole("button", { name: /ukvisajobs extractor/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /gradcracker extractor/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /search terms/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /jobspy scraper/i }),
    ).not.toBeInTheDocument();
  });

  it("enables save button when display setting is changed", async () => {
    vi.mocked(api.get设置).mockResolvedValue(base设置);
    renderPage();
    const saveButton = get保存Button();

    await openDisplaySection();
    const sponsorCheckbox = screen.getByLabelText(
      /show visa sponsor information/i,
    );
    fireEvent.click(sponsorCheckbox);
    await waitFor(() => expect(saveButton).toBeEnabled());
  });

  it("allows saving when Reactive Resume credentials are present", async () => {
    const settingsWithRxResumeAuth = createApp设置({
      rxresumeApiKeyHint: "api_",
    });
    vi.mocked(api.get设置).mockResolvedValue(settingsWithRxResumeAuth);
    vi.mocked(api.update设置).mockResolvedValue(settingsWithRxResumeAuth);

    renderPage();

    await openDisplaySection();
    const sponsorCheckbox = screen.getByLabelText(
      /show visa sponsor information/i,
    );
    fireEvent.click(sponsorCheckbox);

    const saveButton = get保存Button();
    await waitFor(() => expect(saveButton).toBeEnabled());
    fireEvent.click(saveButton);

    await waitFor(() => expect(api.update设置).toHaveBeenCalled());
    expect(toast.error).not.toHaveBeenCalledWith(
      "Choose one Reactive Resume auth method",
      expect.anything(),
    );
  });

  it("saves a shared RxResume URL from the Reactive Resume section", async () => {
    vi.mocked(api.get设置).mockResolvedValue(base设置);
    vi.mocked(api.update设置).mockResolvedValue({
      ...base设置,
      rxresumeUrl: "https://resume.example.com",
    });

    renderPage();

    await openReactiveResumeSection();
    const urlInput = screen.getByLabelText(/rxresume url/i);
    await waitFor(() => expect(urlInput).toBeEnabled());
    fireEvent.change(urlInput, {
      target: { value: "https://resume.example.com" },
    });

    const saveButton = get保存Button();
    await waitFor(() => expect(saveButton).toBeEnabled());
    fireEvent.click(saveButton);

    await waitFor(() => expect(api.update设置).toHaveBeenCalled());
    expect(api.update设置).toHaveBeenCalledWith(
      expect.objectContaining({
        rxresumeUrl: "https://resume.example.com",
      }),
    );
  });

  it("blocks save and renders an inline alert when the v5 API key is invalid", async () => {
    vi.mocked(api.get设置).mockResolvedValue(base设置);

    renderPage();
    await openReactiveResumeSection();

    await waitFor(() => expect(api.validateRxresume).toHaveBeenCalled());
    vi.mocked(api.validateRxresume).mockClear();
    vi.mocked(api.validateRxresume).mockResolvedValue({
      valid: false,
      message:
        "Reactive Resume v5 API key is invalid. 更新 the API key and try again.",
      status: 401,
    });

    fireEvent.change(screen.getByLabelText(/v5 api key/i), {
      target: { value: "invalid-v5-key" },
    });

    const saveButton = get保存Button();
    await waitFor(() => expect(saveButton).toBeEnabled());
    fireEvent.click(saveButton);

    expect(
      await screen.findByText(/Reactive Resume v5 API key is invalid/i),
    ).toBeInTheDocument();
    expect(api.update设置).not.toHaveBeenCalled();
  });

  it("allows saving on RxResume availability warnings and keeps the inline warning visible", async () => {
    vi.mocked(api.get设置).mockResolvedValue(base设置);
    vi.mocked(api.update设置).mockResolvedValue({
      ...base设置,
      rxresumeApiKeyHint: "rr-v",
    });

    renderPage();
    await openReactiveResumeSection();

    await waitFor(() => expect(api.validateRxresume).toHaveBeenCalled());
    vi.mocked(api.validateRxresume).mockClear();
    vi.mocked(api.validateRxresume).mockResolvedValue({
      valid: false,
      message:
        "JobOps could not verify Reactive Resume because the instance is unavailable right now.",
      status: 0,
    });

    fireEvent.change(screen.getByLabelText(/v5 api key/i), {
      target: { value: "rr-v5-warning-key" },
    });

    const saveButton = get保存Button();
    await waitFor(() => expect(saveButton).toBeEnabled());
    fireEvent.click(saveButton);

    await waitFor(() => expect(api.update设置).toHaveBeenCalled());
    expect(
      await screen.findByText(/instance is unavailable right now/i),
    ).toBeInTheDocument();
    expect(toast.success).toHaveBeenCalledWith("设置 saved");
    expect(toast.info).toHaveBeenCalledWith(
      "设置 saved, but JobOps could not verify Reactive Resume because the instance is unavailable.",
    );
  });

  it("does not run RxResume validation for unrelated settings saves", async () => {
    vi.mocked(api.get设置).mockResolvedValue(base设置);
    vi.mocked(api.update设置).mockResolvedValue({
      ...base设置,
      model: {
        value: "new-model",
        default: base设置.model.default,
        override: "new-model",
      },
    });

    renderPage();
    await openModelSection();
    await waitFor(() => expect(api.validateRxresume).toHaveBeenCalled());
    vi.mocked(api.validateRxresume).mockClear();

    fireEvent.change(screen.getByLabelText(/default model/i), {
      target: { value: "new-model" },
    });

    const saveButton = get保存Button();
    await waitFor(() => expect(saveButton).toBeEnabled());
    fireEvent.click(saveButton);

    await waitFor(() => expect(api.update设置).toHaveBeenCalled());
    expect(api.validateRxresume).not.toHaveBeenCalled();
  });

  it("clears the previous RxResume warning when the key or URL changes", async () => {
    vi.mocked(api.get设置).mockResolvedValue(base设置);
    vi.mocked(api.validateRxresume).mockResolvedValue({
      valid: false,
      message:
        "JobOps could not verify Reactive Resume because the instance is unavailable right now.",
      status: 0,
    });

    renderPage();
    await openReactiveResumeSection();

    expect(
      await screen.findByText(/instance is unavailable right now/i),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/rxresume url/i), {
      target: { value: "https://resume.example.com" },
    });

    await waitFor(() =>
      expect(
        screen.queryByText(/instance is unavailable right now/i),
      ).not.toBeInTheDocument(),
    );
  });

  it("saves the writing language mode through the settings page", async () => {
    vi.mocked(api.get设置).mockResolvedValue(base设置);
    vi.mocked(api.update设置).mockResolvedValue(
      createApp设置({
        chatStyleLanguageMode: {
          value: "match-resume",
          default: "manual",
          override: "match-resume",
        },
      }),
    );

    renderPage();
    await openWritingStyleSection();

    fireEvent.click(screen.getByRole("combobox", { name: /output language/i }));
    fireEvent.click(await screen.findByText("Match current resume language"));

    expect(
      screen.queryByRole("combobox", { name: /specific language/i }),
    ).not.toBeInTheDocument();

    const saveButton = get保存Button();
    await waitFor(() => expect(saveButton).toBeEnabled());
    fireEvent.click(saveButton);

    await waitFor(() => expect(api.update设置).toHaveBeenCalled());
    expect(api.update设置).toHaveBeenCalledWith(
      expect.objectContaining({
        chatStyleLanguageMode: "match-resume",
        chatStyleManualLanguage: null,
      }),
    );
  });

  it("saves the Ghostwriter Stop Slop toggle through the settings page", async () => {
    vi.mocked(api.get设置).mockResolvedValue(base设置);
    vi.mocked(api.update设置).mockResolvedValue(
      createApp设置({
        ghostwriterStopSlopEnabled: {
          value: true,
          default: false,
          override: true,
        },
      }),
    );

    renderPage();
    await openWritingStyleSection();

    const stopSlopCheckbox = screen.getByLabelText(
      /use stop slop for ghostwriter/i,
    );
    expect(stopSlopCheckbox).not.toBeChecked();

    fireEvent.click(stopSlopCheckbox);

    const saveButton = get保存Button();
    await waitFor(() => expect(saveButton).toBeEnabled());
    fireEvent.click(saveButton);

    await waitFor(() => expect(api.update设置).toHaveBeenCalled());
    expect(api.update设置).toHaveBeenCalledWith(
      expect.objectContaining({
        ghostwriterStopSlopEnabled: true,
      }),
    );
  });

  it("enables save button when the authentication toggle is changed", async () => {
    vi.mocked(api.get设置).mockResolvedValue(base设置);
    renderPage();
    const saveButton = get保存Button();

    await openEnvironmentSection();
    const authCheckbox = screen.getByLabelText(/enable authentication/i);
    fireEvent.click(authCheckbox);
    expect(saveButton).toBeEnabled();
  });

  it("wipes auth credentials when the toggle is disabled and saved", async () => {
    // Initial state: authentication is active
    const active设置 = {
      ...base设置,
      basicAuthActive: true,
      basicAuthUser: "admin",
      basicAuth密码Hint: "pass",
    };
    vi.mocked(api.get设置).mockResolvedValue(active设置);
    vi.mocked(api.update设置).mockResolvedValue(base设置);

    renderPage();

    await openEnvironmentSection();

    const authCheckbox = screen.getByLabelText(/enable authentication/i);
    expect(authCheckbox).toBeChecked();

    // Disable it
    fireEvent.click(authCheckbox);
    expect(authCheckbox).not.toBeChecked();

    const saveButton = get保存Button();
    expect(saveButton).toBeEnabled();
    fireEvent.click(saveButton);

    await waitFor(() => expect(api.update设置).toHaveBeenCalled());
    expect(api.update设置).toHaveBeenCalledWith(
      expect.objectContaining({
        basicAuthUser: null,
        basicAuth密码: null,
      }),
    );
  });

  it("saves blocked company keywords from scoring settings", async () => {
    vi.mocked(api.get设置).mockResolvedValue(base设置);
    vi.mocked(api.update设置).mockResolvedValue({
      ...base设置,
      blocked公司Keywords: {
        value: ["staffing"],
        default: [],
        override: ["staffing"],
      },
    });

    renderPage();

    await openScoringSection();

    const input = screen.getByPlaceholderText('e.g. "recruitment", "staffing"');
    fireEvent.change(input, { target: { value: "staffing" } });
    fireEvent.keyDown(input, { key: "Enter" });

    const saveButton = get保存Button();
    await waitFor(() => expect(saveButton).toBeEnabled());
    fireEvent.click(saveButton);

    await waitFor(() => expect(api.update设置).toHaveBeenCalled());
    expect(api.update设置).toHaveBeenCalledWith(
      expect.objectContaining({
        blocked公司Keywords: ["staffing"],
      }),
    );
  });

  it("saves auto-skip score threshold from scoring settings", async () => {
    vi.mocked(api.get设置).mockResolvedValue(base设置);
    vi.mocked(api.update设置).mockResolvedValue({
      ...base设置,
      autoSkipScoreThreshold: {
        value: 42,
        default: null,
        override: 42,
      },
    });

    renderPage();

    await openScoringSection();

    const input = screen.getByLabelText(/auto-skip score threshold/i);
    fireEvent.change(input, { target: { value: "42" } });

    const saveButton = get保存Button();
    await waitFor(() => expect(saveButton).toBeEnabled());
    fireEvent.click(saveButton);

    await waitFor(() => expect(api.update设置).toHaveBeenCalled());
    expect(api.update设置).toHaveBeenCalledWith(
      expect.objectContaining({
        autoSkipScoreThreshold: 42,
      }),
    );
  });

  it("sends null for both numeric limit fields on reset-to-default", async () => {
    vi.mocked(api.get设置).mockResolvedValue(
      createApp设置({
        chatStyleSummaryMaxWords: {
          value: 35,
          default: null,
          override: 35,
        },
        chatStyleMaxKeywordsPerSkill: {
          value: 8,
          default: null,
          override: 8,
        },
      }),
    );
    vi.mocked(api.update设置).mockResolvedValue(base设置);

    renderPage();

    const resetButton = await screen.findByRole("button", {
      name: /reset to default/i,
    });
    fireEvent.click(resetButton);

    await waitFor(() => expect(api.update设置).toHaveBeenCalled());
    expect(api.update设置).toHaveBeenCalledWith(
      expect.objectContaining({
        chatStyleSummaryMaxWords: null,
        chatStyleMaxKeywordsPerSkill: null,
      }),
    );
  });

  it("saves scoring instructions from scoring settings", async () => {
    vi.mocked(api.get设置).mockResolvedValue(base设置);
    vi.mocked(api.update设置).mockResolvedValue({
      ...base设置,
      scoringInstructions: {
        value:
          "Open to relocating, so do not mark down for location discrepancies.",
        default: "",
        override:
          "Open to relocating, so do not mark down for location discrepancies.",
      },
    });

    renderPage();

    await openScoringSection();

    const textarea = screen.getByLabelText(/scoring instructions/i);
    fireEvent.change(textarea, {
      target: {
        value:
          "Open to relocating, so do not mark down for location discrepancies.",
      },
    });

    const saveButton = get保存Button();
    await waitFor(() => expect(saveButton).toBeEnabled());
    fireEvent.click(saveButton);

    await waitFor(() => expect(api.update设置).toHaveBeenCalled());
    expect(api.update设置).toHaveBeenCalledWith(
      expect.objectContaining({
        scoringInstructions:
          "Open to relocating, so do not mark down for location discrepancies.",
      }),
    );
  });

  it("serializes prompt templates back to null when reset to defaults", async () => {
    vi.mocked(api.get设置).mockResolvedValue(
      createApp设置({
        ghostwriterSystemPromptTemplate: {
          value: "Custom Ghostwriter",
          default: getDefaultPromptTemplate("ghostwriterSystemPromptTemplate"),
          override: "Custom Ghostwriter",
        },
      }),
    );
    vi.mocked(api.update设置).mockResolvedValue(base设置);

    renderPage();

    await openPromptTemplatesSection();

    fireEvent.click(screen.getAllByRole("button", { name: /^reset$/i })[0]);

    const saveButton = get保存Button();
    await waitFor(() => expect(saveButton).toBeEnabled());
    fireEvent.click(saveButton);

    await waitFor(() => expect(api.update设置).toHaveBeenCalled());
    expect(api.update设置).toHaveBeenCalledWith(
      expect.objectContaining({
        ghostwriterSystemPromptTemplate: null,
      }),
    );
  });
});
