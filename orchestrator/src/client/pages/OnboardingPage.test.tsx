import * as api from "@client/api";
import { useDemoInfo } from "@client/hooks/useDemoInfo";
import { useOnboardingRequirement } from "@client/hooks/useOnboardingRequirement";
import { useRxResumeConfigState } from "@client/hooks/useRxResumeConfigState";
import { use设置 } from "@client/hooks/use设置";
import { validateAndMaybePersistRxResumeMode } from "@client/lib/rxresume-config";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithQueryClient } from "../test/renderWithQueryClient";
import { OnboardingPage } from "./OnboardingPage";

vi.mock("@client/api", () => ({
  importDesignResumeFromFile: vi.fn(),
  suggestOnboarding搜索Terms: vi.fn(),
  getCodexAuth状态: vi.fn(),
  startCodexAuth: vi.fn(),
  disconnectCodexAuth: vi.fn(),
  validateLlm: vi.fn(),
  validateRxresume: vi.fn(),
  validateResumeConfig: vi.fn(),
  update设置: vi.fn(),
}));

vi.mock("@client/hooks/useDemoInfo", () => ({
  useDemoInfo: vi.fn(),
}));

vi.mock("@client/hooks/use设置", () => ({
  use设置: vi.fn(),
}));

vi.mock("@client/hooks/useRxResumeConfigState", () => ({
  useRxResumeConfigState: vi.fn(),
}));

vi.mock("@client/hooks/useOnboardingRequirement", () => ({
  useOnboardingRequirement: vi.fn(),
}));

vi.mock("@client/lib/rxresume-config", () => ({
  getRxResumeCredentialDrafts: vi.fn((values) => ({
    baseUrl: values.rxresumeUrl?.trim() ?? "",
    apiKey: values.rxresumeApiKey?.trim() ?? "",
  })),
  getRxResumeMissingCredentialLabels: vi.fn(() => []),
  validateAndMaybePersistRxResumeMode: vi.fn(),
}));

vi.mock("@client/components/ReactiveResumeConfigPanel", () => ({
  ReactiveResumeConfigPanel: () => <div>Reactive resume panel</div>,
}));

vi.mock("@client/pages/settings/components/BaseResumeSelection", () => ({
  BaseResumeSelection: () => <div>Base resume selection</div>,
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    info: vi.fn(),
    success: vi.fn(),
  },
}));

const base设置 = {
  llmProvider: { value: "openrouter", default: "openrouter", override: null },
  llmBaseUrl: { value: "", default: "", override: null },
  llmApiKeyHint: "sk-t",
  pdfRenderer: { value: "rxresume", default: "rxresume", override: null },
  onboardingBasicAuthDecision: null,
  rxresumeUrl: "https://resume.example.com",
  rxresumeApiKeyHint: "rx-k",
  rxresumeBaseResumeId: "resume-1",
  searchTerms: {
    value: ["Platform Engineer"],
    default: ["web developer"],
    override: ["Platform Engineer"],
  },
  basicAuthUser: null,
  basicAuth密码: null,
  basicAuth密码Hint: null,
  basicAuthActive: false,
};

let current设置: any;

function getStepButton(label: RegExp) {
  const element = screen.getByText(label);
  const button = element.closest("button");
  if (!button) {
    throw new Error(`Expected ${label.toString()} to be inside a step button`);
  }
  return button;
}

function renderPage() {
  return renderWithQueryClient(
    <MemoryRouter initialEntries={["/onboarding"]}>
      <Routes>
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/jobs/ready" element={<div>ready page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("OnboardingPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    current设置 = { ...base设置 };

    vi.mocked(useDemoInfo).mockReturnValue({
      demoMode: false,
      resetCadenceHours: 6,
      lastResetAt: null,
      nextResetAt: null,
      baselineVersion: null,
      baseline名称: null,
    });

    vi.mocked(use设置).mockImplementation(() => ({
      settings: current设置,
      isLoading: false,
      refresh设置: vi.fn(),
      error: null,
      showSponsorInfo: true,
      renderMarkdownInJob描述s: true,
    }));

    vi.mocked(useRxResumeConfigState).mockReturnValue({
      storedRxResume: {
        hasV5ApiKey: true,
        hasBaseUrl: true,
      },
      baseResumeId: "resume-1",
      syncBaseResumeId: () => "resume-1",
      getBaseResumeId: () => "resume-1",
      setBaseResumeId: vi.fn(),
    } as any);
    vi.mocked(useOnboardingRequirement).mockImplementation(() => ({
      checking: false,
      complete: Boolean(
        (current设置.basicAuthActive ||
          current设置.onboardingBasicAuthDecision !== null) &&
          Array.isArray(current设置.searchTerms?.override) &&
          current设置.searchTerms.override.length > 0,
      ),
    }));
    vi.mocked(validateAndMaybePersistRxResumeMode).mockResolvedValue({
      validation: {
        valid: true,
        message: null,
      },
    } as any);
    vi.mocked(api.suggestOnboarding搜索Terms).mockResolvedValue({
      terms: ["Platform Engineer", "返回end Engineer"],
      source: "ai",
    });
    vi.mocked(api.getCodexAuth状态).mockResolvedValue({
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
    });
    vi.mocked(api.startCodexAuth).mockResolvedValue({
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
    });
  });

  it("keeps the LLM step visible even when a key hint already exists", async () => {
    vi.mocked(api.validateLlm).mockResolvedValue({
      valid: false,
      message: "Connection failed",
    });
    vi.mocked(api.validateRxresume).mockResolvedValue({
      valid: true,
      message: null,
    });
    vi.mocked(api.validateResumeConfig).mockResolvedValue({
      valid: true,
      message: null,
    });

    renderPage();

    await waitFor(() => expect(api.validateLlm).toHaveBeenCalled());
    expect(
      screen.getByText("Choose the LLM connection Job Ops should use."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("API key")).toBeInTheDocument();
    expect(
      screen.getByText(/leave blank to keep the saved key/i),
    ).toBeInTheDocument();
  });

  it("shows Codex sign-in controls in onboarding when provider is codex", async () => {
    current设置 = {
      ...base设置,
      llmProvider: { value: "codex", default: "codex", override: null },
      llmApiKeyHint: null,
    };
    vi.mocked(api.validateLlm).mockResolvedValue({
      valid: false,
      message: "Codex is not authenticated in this container.",
    });
    vi.mocked(api.validateRxresume).mockResolvedValue({
      valid: true,
      message: null,
    });
    vi.mocked(api.validateResumeConfig).mockResolvedValue({
      valid: true,
      message: null,
    });

    renderPage();

    await waitFor(() => expect(api.getCodexAuth状态).toHaveBeenCalled());
    expect(screen.getByText("Codex Sign-In")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /start sign-in/i }));

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

  it("does not treat local providers as validated before the connection check passes", async () => {
    current设置 = {
      ...base设置,
      llmProvider: { value: "lmstudio", default: "lmstudio", override: null },
      llmBaseUrl: {
        value: "http://localhost:1234",
        default: "",
        override: null,
      },
      llmApiKeyHint: null,
    };

    vi.mocked(api.validateLlm).mockResolvedValue({
      valid: false,
      message: "LM Studio is unreachable",
    });
    vi.mocked(api.validateRxresume).mockResolvedValue({
      valid: true,
      message: null,
    });
    vi.mocked(api.validateResumeConfig).mockResolvedValue({
      valid: true,
      message: null,
    });

    renderPage();

    await waitFor(() => {
      expect(api.validateLlm).toHaveBeenCalledWith({
        provider: "lmstudio",
        baseUrl: "http://localhost:1234",
        apiKey: undefined,
      });
    });

    expect(
      screen.getByRole("button", { name: /save connection/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /revalidate connection/i }),
    ).not.toBeInTheDocument();
  });

  it("shows the saved LLM connection success state in the detail panel", async () => {
    vi.mocked(api.validateLlm).mockResolvedValue({
      valid: true,
      message: null,
    });
    vi.mocked(api.validateRxresume).mockResolvedValue({
      valid: true,
      message: null,
    });
    vi.mocked(api.validateResumeConfig).mockResolvedValue({
      valid: true,
      message: null,
    });

    renderPage();

    await waitFor(() => {
      expect(
        screen.getByText("OpenRouter connection verified."),
      ).toBeInTheDocument();
    });
  });

  it("defaults the authentication step to lock it down", async () => {
    vi.mocked(api.validateLlm).mockResolvedValue({
      valid: true,
      message: null,
    });
    vi.mocked(api.validateRxresume).mockResolvedValue({
      valid: true,
      message: null,
    });
    vi.mocked(api.validateResumeConfig).mockResolvedValue({
      valid: true,
      message: null,
    });

    renderPage();

    await waitFor(() => {
      expect(
        screen.getByText("Choose the LLM connection Job Ops should use."),
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /basic auth/i }));

    await waitFor(() => {
      expect(screen.getByText("Secure your workspace")).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/lock it down/i)).toBeChecked();
    expect(
      screen.getByRole("button", { name: /enable authentication/i }),
    ).toBeInTheDocument();
  });

  it("renders the new search terms step in the onboarding rail", async () => {
    vi.mocked(api.validateLlm).mockResolvedValue({
      valid: true,
      message: null,
    });
    vi.mocked(api.validateRxresume).mockResolvedValue({
      valid: true,
      message: null,
    });
    vi.mocked(api.validateResumeConfig).mockResolvedValue({
      valid: true,
      message: null,
    });

    renderPage();

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /search terms/i }),
      ).toBeInTheDocument();
    });
  });

  it("does not auto-generate search terms when explicit saved terms already exist", async () => {
    vi.mocked(api.validateLlm).mockResolvedValue({
      valid: true,
      message: null,
    });
    vi.mocked(api.validateRxresume).mockResolvedValue({
      valid: true,
      message: null,
    });
    vi.mocked(api.validateResumeConfig).mockResolvedValue({
      valid: true,
      message: null,
    });

    renderPage();

    fireEvent.click(screen.getByRole("button", { name: /search terms/i }));

    await waitFor(() => {
      expect(
        screen.getByText("Choose the job titles to search for."),
      ).toBeInTheDocument();
    });

    expect(api.suggestOnboarding搜索Terms).not.toHaveBeenCalled();
    expect(screen.getByText(/saved search terms/i)).toBeInTheDocument();
  });

  it("auto-populates search terms from the resume when no explicit override exists", async () => {
    current设置 = {
      ...base设置,
      searchTerms: {
        value: ["web developer"],
        default: ["web developer"],
        override: null,
      },
    };

    vi.mocked(api.validateLlm).mockResolvedValue({
      valid: true,
      message: null,
    });
    vi.mocked(api.validateRxresume).mockResolvedValue({
      valid: true,
      message: null,
    });
    vi.mocked(api.validateResumeConfig).mockResolvedValue({
      valid: true,
      message: null,
    });
    vi.mocked(api.suggestOnboarding搜索Terms).mockResolvedValue({
      terms: ["Platform Engineer", "返回end Engineer"],
      source: "ai",
    });

    renderPage();

    fireEvent.click(screen.getByRole("button", { name: /search terms/i }));

    await waitFor(() => {
      expect(api.suggestOnboarding搜索Terms).toHaveBeenCalledTimes(1);
    });

    expect(
      screen.getByText(/^generated from your resume$/i),
    ).toBeInTheDocument();

    const collapsedTokens = screen.getByTestId(
      "onboarding-search-terms-collapsed-tokens",
    );
    expect(
      within(collapsedTokens).getByText("Platform Engineer"),
    ).toBeInTheDocument();
    expect(
      within(collapsedTokens).getByText("返回end Engineer"),
    ).toBeInTheDocument();
  });

  it("saves edited search terms through settings updates", async () => {
    current设置 = {
      ...base设置,
      searchTerms: {
        value: ["web developer"],
        default: ["web developer"],
        override: null,
      },
    };

    vi.mocked(api.validateLlm).mockResolvedValue({
      valid: true,
      message: null,
    });
    vi.mocked(api.validateRxresume).mockResolvedValue({
      valid: true,
      message: null,
    });
    vi.mocked(api.validateResumeConfig).mockResolvedValue({
      valid: true,
      message: null,
    });
    vi.mocked(api.suggestOnboarding搜索Terms).mockResolvedValue({
      terms: ["Platform Engineer", "返回end Engineer"],
      source: "ai",
    });
    vi.mocked(api.update设置).mockImplementation(async (update) => {
      current设置 = {
        ...current设置,
        ...("searchTerms" in update
          ? {
              searchTerms: {
                value: update.searchTerms,
                default: ["web developer"],
                override: update.searchTerms,
              },
            }
          : {}),
      };
      return current设置;
    });

    renderPage();

    fireEvent.click(screen.getByRole("button", { name: /search terms/i }));

    await waitFor(() => {
      expect(api.suggestOnboarding搜索Terms).toHaveBeenCalledTimes(1);
    });

    const input = screen.getByPlaceholderText("Type a role and press Enter");
    fireEvent.change(input, {
      target: { value: "Staff Software Engineer" },
    });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });
    fireEvent.click(screen.getByRole("button", { name: /save search terms/i }));

    await waitFor(() => {
      expect(api.update设置).toHaveBeenCalledWith({
        searchTerms: [
          "Platform Engineer",
          "返回end Engineer",
          "Staff Software Engineer",
        ],
      });
    });
  });

  it("lets the user skip basic auth and finish onboarding", async () => {
    vi.mocked(useOnboardingRequirement).mockReturnValue({
      checking: false,
      complete: false,
    });
    vi.mocked(api.validateLlm).mockResolvedValue({
      valid: true,
      message: null,
    });
    vi.mocked(api.validateRxresume).mockResolvedValue({
      valid: true,
      message: null,
    });
    vi.mocked(api.validateResumeConfig).mockResolvedValue({
      valid: true,
      message: null,
    });
    vi.mocked(api.update设置).mockImplementation(async () => {
      current设置 = {
        ...current设置,
        onboardingBasicAuthDecision: "skipped",
      };
      return {
        ...current设置,
        searchTerms: {
          ...current设置.searchTerms,
          override: null,
        },
      };
    });

    renderPage();

    await waitFor(() => {
      expect(
        screen.getByText("Choose the LLM connection Job Ops should use."),
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /basic auth/i }));

    await waitFor(() => {
      expect(screen.getByText("Secure your workspace")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByLabelText(/skip for now/i));
    fireEvent.click(screen.getByRole("button", { name: /finish onboarding/i }));

    await waitFor(() => {
      expect(screen.getByText("ready page")).toBeInTheDocument();
    });
    expect(api.update设置).toHaveBeenCalledWith({
      onboardingBasicAuthDecision: "skipped",
    });
  });

  it("lets the user enable basic auth and finish onboarding", async () => {
    vi.mocked(useOnboardingRequirement).mockReturnValue({
      checking: false,
      complete: false,
    });
    vi.mocked(api.validateLlm).mockResolvedValue({
      valid: true,
      message: null,
    });
    vi.mocked(api.validateRxresume).mockResolvedValue({
      valid: true,
      message: null,
    });
    vi.mocked(api.validateResumeConfig).mockResolvedValue({
      valid: true,
      message: null,
    });
    vi.mocked(api.update设置).mockImplementation(async (update) => {
      current设置 = {
        ...current设置,
        ...("enableBasicAuth" in update || "basicAuthUser" in update
          ? {
              basicAuthActive: true,
              onboardingBasicAuthDecision: "enabled",
              basicAuthUser:
                update.basicAuthUser ?? current设置.basicAuthUser,
            }
          : {}),
      };
      return current设置;
    });

    renderPage();

    await waitFor(() => {
      expect(
        screen.getByText("Choose the LLM connection Job Ops should use."),
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /basic auth/i }));

    await waitFor(() => {
      expect(screen.getByText("Secure your workspace")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByLabelText(/lock it down/i));
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "jobops-admin" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "correct horse battery staple" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /enable authentication/i }),
    );

    await waitFor(() => {
      expect(screen.getByText("ready page")).toBeInTheDocument();
    });
    expect(api.update设置).toHaveBeenCalledWith({
      enableBasicAuth: true,
      basicAuthUser: "jobops-admin",
      basicAuth密码: "correct horse battery staple",
      onboardingBasicAuthDecision: "enabled",
    });
  });

  it("redirects when search terms are the last missing step", async () => {
    vi.mocked(useOnboardingRequirement).mockReturnValue({
      checking: false,
      complete: false,
    });
    current设置 = {
      ...base设置,
      onboardingBasicAuthDecision: "skipped",
      searchTerms: {
        value: ["web developer"],
        default: ["web developer"],
        override: null,
      },
    };
    vi.mocked(api.validateLlm).mockResolvedValue({
      valid: true,
      message: null,
    });
    vi.mocked(api.validateRxresume).mockResolvedValue({
      valid: true,
      message: null,
    });
    vi.mocked(api.validateResumeConfig).mockResolvedValue({
      valid: true,
      message: null,
    });
    vi.mocked(api.update设置).mockImplementation(async (update) => {
      current设置 = {
        ...current设置,
        ...("searchTerms" in update
          ? {
              searchTerms: {
                value: update.searchTerms,
                default: ["web developer"],
                override: update.searchTerms,
              },
            }
          : {}),
      };
      return current设置;
    });

    renderPage();

    await waitFor(() => {
      expect(
        screen.getByText("Choose the LLM connection Job Ops should use."),
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /search terms/i }));

    await waitFor(() => {
      expect(api.suggestOnboarding搜索Terms).toHaveBeenCalledTimes(1);
    });

    fireEvent.click(screen.getByRole("button", { name: /save search terms/i }));

    await waitFor(() => {
      expect(screen.getByText("ready page")).toBeInTheDocument();
    });
    expect(api.update设置).toHaveBeenCalledWith({
      searchTerms: ["Platform Engineer", "返回end Engineer"],
    });
  });

  it("does not leave onboarding early when basic auth is saved before the other steps are complete", async () => {
    vi.mocked(api.validateLlm).mockResolvedValue({
      valid: false,
      message: "Connection failed",
    });
    vi.mocked(api.validateRxresume).mockResolvedValue({
      valid: true,
      message: null,
    });
    vi.mocked(api.validateResumeConfig).mockResolvedValue({
      valid: true,
      message: null,
    });
    vi.mocked(api.update设置).mockResolvedValue({
      ...base设置,
      onboardingBasicAuthDecision: "skipped",
    } as any);

    renderPage();

    await waitFor(() => {
      expect(
        screen.getByText("Choose the LLM connection Job Ops should use."),
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /basic auth/i }));

    await waitFor(() => {
      expect(screen.getByText("Secure your workspace")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByLabelText(/skip for now/i));
    fireEvent.click(screen.getByRole("button", { name: /finish onboarding/i }));

    await waitFor(() => {
      expect(api.update设置).toHaveBeenCalledWith({
        onboardingBasicAuthDecision: "skipped",
      });
    });

    expect(screen.queryByText("ready page")).not.toBeInTheDocument();
    expect(screen.getByText("Secure your workspace")).toBeInTheDocument();
  });

  it("does not finish onboarding when only default search terms exist", async () => {
    current设置 = {
      ...base设置,
      onboardingBasicAuthDecision: "skipped",
      searchTerms: {
        value: ["web developer"],
        default: ["web developer"],
        override: null,
      },
    };

    vi.mocked(api.validateLlm).mockResolvedValue({
      valid: true,
      message: null,
    });
    vi.mocked(api.validateRxresume).mockResolvedValue({
      valid: true,
      message: null,
    });
    vi.mocked(api.validateResumeConfig).mockResolvedValue({
      valid: true,
      message: null,
    });

    renderPage();

    await waitFor(() => {
      expect(
        screen.getByText("Choose the LLM connection Job Ops should use."),
      ).toBeInTheDocument();
    });

    expect(screen.queryByText("ready page")).not.toBeInTheDocument();
    expect(
      screen.getByText("Choose the LLM connection Job Ops should use."),
    ).toBeInTheDocument();
  });

  it("does not auto-advance after saving the LLM step", async () => {
    vi.mocked(api.validateLlm).mockResolvedValue({
      valid: true,
      message: null,
    });
    vi.mocked(api.validateRxresume).mockResolvedValue({
      valid: true,
      message: null,
    });
    vi.mocked(api.validateResumeConfig).mockResolvedValue({
      valid: true,
      message: null,
    });
    vi.mocked(api.update设置).mockResolvedValue(base设置 as any);

    renderPage();

    await waitFor(() => {
      expect(
        screen.getByText("Choose the LLM connection Job Ops should use."),
      ).toBeInTheDocument();
    });

    fireEvent.click(
      screen.getByRole("button", { name: /revalidate connection/i }),
    );

    await waitFor(() => {
      expect(api.update设置).toHaveBeenCalled();
    });

    expect(
      screen.getByText("Choose the LLM connection Job Ops should use."),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Import your current resume."),
    ).not.toBeInTheDocument();
  });

  it("keeps the RxResume URL hidden unless self-hosted mode is enabled", async () => {
    vi.mocked(api.validateLlm).mockResolvedValue({
      valid: true,
      message: null,
    });
    vi.mocked(api.validateRxresume).mockResolvedValue({
      valid: true,
      message: null,
    });
    vi.mocked(api.validateResumeConfig).mockResolvedValue({
      valid: true,
      message: null,
    });

    current设置 = {
      ...base设置,
      rxresumeUrl: "",
    };

    vi.mocked(use设置).mockImplementation(() => ({
      settings: current设置,
      isLoading: false,
      refresh设置: vi.fn(),
      error: null,
      showSponsorInfo: true,
      renderMarkdownInJob描述s: true,
    }));

    renderPage();

    fireEvent.click(getStepButton(/^Resume$/i));
    fireEvent.click(screen.getByText("Use Reactive Resume"));

    await waitFor(() => {
      expect(
        screen.getByText("Import your current resume."),
      ).toBeInTheDocument();
    });

    expect(screen.queryByLabelText(/custom url/i)).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("checkbox", { name: /self-hosted reactive resume/i }),
    );

    expect(screen.getByLabelText(/custom url/i)).toBeInTheDocument();
  });

  it("does not show resume errors before the user tries to validate the step", async () => {
    vi.mocked(api.validateLlm).mockResolvedValue({
      valid: true,
      message: null,
    });
    vi.mocked(validateAndMaybePersistRxResumeMode).mockResolvedValue({
      validation: {
        valid: false,
        message: "Reactive Resume is not configured",
      },
    } as any);
    vi.mocked(api.validateRxresume).mockResolvedValue({
      valid: false,
      message: "Reactive Resume is not configured",
    });
    vi.mocked(api.validateResumeConfig).mockResolvedValue({
      valid: false,
      message:
        "否 local resume is ready yet. Upload a PDF or DOCX resume, or connect Reactive Resume and select a template resume.",
    });

    renderPage();

    fireEvent.click(getStepButton(/^Resume$/i));

    await waitFor(() => {
      expect(api.validateResumeConfig).toHaveBeenCalled();
    });

    expect(
      screen.queryByText(
        /no local resume is ready yet\. upload a pdf or docx resume, or connect reactive resume and select a template resume\./i,
      ),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(
        /upload a resume here, or switch to the reactive resume option if you want to import from an existing template resume instead\./i,
      ),
    ).not.toBeInTheDocument();
  });

  it("shows the Reactive Resume success state in the detail panel after validation passes", async () => {
    vi.mocked(api.validateLlm).mockResolvedValue({
      valid: true,
      message: null,
    });
    vi.mocked(validateAndMaybePersistRxResumeMode).mockResolvedValue({
      validation: {
        valid: true,
        message: null,
      },
    } as any);
    vi.mocked(api.validateRxresume).mockResolvedValue({
      valid: true,
      message: null,
    });
    vi.mocked(api.validateResumeConfig).mockResolvedValue({
      valid: false,
      message: "Choose a template resume to finish this step.",
    });

    renderPage();

    fireEvent.click(getStepButton(/^Resume$/i));
    fireEvent.click(screen.getByText("Use Reactive Resume"));

    await waitFor(() => {
      expect(
        screen.getByText("Reactive Resume connection verified."),
      ).toBeInTheDocument();
    });
  });

  it("shows the loaded resume success state in the detail panel", async () => {
    vi.mocked(api.validateLlm).mockResolvedValue({
      valid: true,
      message: null,
    });
    vi.mocked(api.validateRxresume).mockResolvedValue({
      valid: true,
      message: null,
    });
    vi.mocked(api.validateResumeConfig).mockResolvedValue({
      valid: true,
      message: null,
    });

    renderPage();

    fireEvent.click(getStepButton(/^Resume$/i));

    await waitFor(() => {
      expect(
        screen.getByText("Your base resume is loaded and ready."),
      ).toBeInTheDocument();
    });
  });

  it("lets upload-only onboarding switch PDF rendering to LaTeX when RxResume is unavailable", async () => {
    vi.mocked(api.validateLlm).mockResolvedValue({
      valid: true,
      message: null,
    });
    vi.mocked(validateAndMaybePersistRxResumeMode).mockResolvedValue({
      validation: {
        valid: false,
        message: "Reactive Resume is not configured",
      },
    } as any);
    vi.mocked(api.validateRxresume).mockResolvedValue({
      valid: false,
      message: "Reactive Resume is not configured",
    });
    vi.mocked(api.validateResumeConfig)
      .mockResolvedValueOnce({
        valid: false,
        message: "否 resume yet",
      })
      .mockResolvedValueOnce({
        valid: true,
        message: null,
      });
    vi.mocked(api.importDesignResumeFromFile).mockResolvedValue({
      id: "primary",
      title: "Taylor Resume",
      resumeJson: {} as any,
      revision: 1,
      sourceResumeId: null,
      sourceMode: null,
      importedAt: "2026-04-11T00:00:00.000Z",
      createdAt: "2026-04-11T00:00:00.000Z",
      updatedAt: "2026-04-11T00:00:00.000Z",
      assets: [],
    });
    vi.mocked(api.update设置).mockImplementation(async (update) => {
      current设置 = {
        ...current设置,
        ...("pdfRenderer" in update
          ? {
              pdfRenderer: {
                value: update.pdfRenderer,
                default: "rxresume",
                override: null,
              },
            }
          : {}),
      };
      return current设置;
    });

    const { container } = renderPage();

    fireEvent.click(getStepButton(/^Resume$/i));

    await waitFor(() => {
      expect(
        screen.getByText("Import your current resume."),
      ).toBeInTheDocument();
    });

    const input = container.querySelector(
      'input[type="file"][accept*=".pdf"]',
    ) as HTMLInputElement | null;
    if (!input) {
      throw new Error("Expected resume upload input");
    }

    fireEvent.change(input, {
      target: {
        files: [
          new File(["resume"], "resume.pdf", {
            type: "application/pdf",
          }),
        ],
      },
    });

    await waitFor(() => {
      expect(api.importDesignResumeFromFile).toHaveBeenCalledWith({
        file名称: "resume.pdf",
        mediaType: "application/pdf",
        dataBase64: expect.any(String),
      });
    });

    await waitFor(() => {
      expect(api.update设置).toHaveBeenCalledWith({
        pdfRenderer: "latex",
      });
    });
  });

  it("marks the search terms step stale after the resume changes", async () => {
    vi.mocked(api.validateLlm).mockResolvedValue({
      valid: true,
      message: null,
    });
    vi.mocked(api.validateRxresume).mockResolvedValue({
      valid: true,
      message: null,
    });
    vi.mocked(api.validateResumeConfig)
      .mockResolvedValueOnce({
        valid: true,
        message: null,
      })
      .mockResolvedValueOnce({
        valid: true,
        message: null,
      });
    vi.mocked(api.importDesignResumeFromFile).mockResolvedValue({
      id: "primary",
      title: "Taylor Resume",
      resumeJson: {} as any,
      revision: 1,
      sourceResumeId: null,
      sourceMode: null,
      importedAt: "2026-04-11T00:00:00.000Z",
      createdAt: "2026-04-11T00:00:00.000Z",
      updatedAt: "2026-04-11T00:00:00.000Z",
      assets: [],
    });
    vi.mocked(api.update设置).mockImplementation(async (update) => {
      current设置 = {
        ...current设置,
        ...("pdfRenderer" in update
          ? {
              pdfRenderer: {
                value: update.pdfRenderer,
                default: "rxresume",
                override: null,
              },
            }
          : {}),
      };
      return current设置;
    });

    const { container } = renderPage();

    fireEvent.click(getStepButton(/^Resume$/i));

    const input = container.querySelector(
      'input[type="file"][accept*=".pdf"]',
    ) as HTMLInputElement | null;
    if (!input) {
      throw new Error("Expected resume upload input");
    }

    fireEvent.change(input, {
      target: {
        files: [
          new File(["resume"], "resume.pdf", {
            type: "application/pdf",
          }),
        ],
      },
    });

    await waitFor(() => {
      expect(api.importDesignResumeFromFile).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByRole("button", { name: /search terms/i }));

    await waitFor(() => {
      expect(screen.getByText(/resume changed/i)).toBeInTheDocument();
    });
  });

  it("uses LaTeX for uploaded resumes even when Reactive Resume is available", async () => {
    vi.mocked(api.validateLlm).mockResolvedValue({
      valid: true,
      message: null,
    });
    vi.mocked(validateAndMaybePersistRxResumeMode).mockResolvedValue({
      validation: {
        valid: true,
        message: null,
      },
    } as any);
    vi.mocked(api.validateRxresume).mockResolvedValue({
      valid: true,
      message: null,
    });
    vi.mocked(api.validateResumeConfig)
      .mockResolvedValueOnce({
        valid: false,
        message: "否 resume yet",
      })
      .mockResolvedValueOnce({
        valid: true,
        message: null,
      });
    vi.mocked(api.importDesignResumeFromFile).mockResolvedValue({
      id: "primary",
      title: "Taylor Resume",
      resumeJson: {} as any,
      revision: 1,
      sourceResumeId: null,
      sourceMode: null,
      importedAt: "2026-04-11T00:00:00.000Z",
      createdAt: "2026-04-11T00:00:00.000Z",
      updatedAt: "2026-04-11T00:00:00.000Z",
      assets: [],
    });
    vi.mocked(api.update设置).mockImplementation(async (update) => {
      current设置 = {
        ...current设置,
        ...("pdfRenderer" in update
          ? {
              pdfRenderer: {
                value: update.pdfRenderer,
                default: "rxresume",
                override: null,
              },
            }
          : {}),
      };
      return current设置;
    });

    const { container } = renderPage();

    fireEvent.click(getStepButton(/^Resume$/i));

    const input = container.querySelector(
      'input[type="file"][accept*=".pdf"]',
    ) as HTMLInputElement | null;
    if (!input) {
      throw new Error("Expected resume upload input");
    }

    fireEvent.change(input, {
      target: {
        files: [
          new File(["resume"], "resume.pdf", {
            type: "application/pdf",
          }),
        ],
      },
    });

    await waitFor(() => {
      expect(api.update设置).toHaveBeenCalledWith({
        pdfRenderer: "latex",
      });
    });
  });

  it("only shows the template resume picker after Reactive Resume validates", async () => {
    current设置 = {
      ...base设置,
      rxresumeApiKeyHint: null,
      rxresumeBaseResumeId: null,
      pdfRenderer: { value: "latex", default: "rxresume", override: null },
    };

    vi.mocked(useRxResumeConfigState).mockReturnValue({
      storedRxResume: {
        hasV5ApiKey: false,
        hasBaseUrl: true,
      },
      baseResumeId: null,
      syncBaseResumeId: () => null,
      getBaseResumeId: () => null,
      setBaseResumeId: vi.fn(),
    } as any);

    vi.mocked(api.validateLlm).mockResolvedValue({
      valid: true,
      message: null,
    });
    vi.mocked(validateAndMaybePersistRxResumeMode).mockImplementation(
      async ({ draft }) =>
        ({
          validation: {
            valid: Boolean(draft.apiKey),
            message: draft.apiKey ? null : "v5 API key required",
          },
        }) as any,
    );
    vi.mocked(api.update设置).mockImplementation(async (update) => {
      current设置 = {
        ...current设置,
        ...update,
      };
      return current设置;
    });
    vi.mocked(api.validateResumeConfig).mockResolvedValue({
      valid: false,
      message: "Choose a template resume to finish this step.",
    });

    renderPage();

    fireEvent.click(getStepButton(/^Resume$/i));
    fireEvent.click(screen.getByText("Use Reactive Resume"));

    await waitFor(() => {
      expect(
        screen.getByText("Import your current resume."),
      ).toBeInTheDocument();
    });

    expect(screen.queryByText("Template resume")).not.toBeInTheDocument();
    expect(screen.queryByText("Base resume selection")).not.toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("Enter v5 API key"), {
      target: { value: "rx-api-key" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /connect reactive resume/i }),
    );

    await waitFor(() => {
      expect(screen.getByText("Template resume")).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Enter v5 API key"),
      ).toBeInTheDocument();
      expect(
        screen.queryByText("Upload a PDF or DOCX resume"),
      ).not.toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /confirm resume template/i }),
      ).toBeInTheDocument();
    });
    expect(screen.getByText("Base resume selection")).toBeInTheDocument();
  });

  it("lets the full authentication option card change the selection", async () => {
    vi.mocked(api.validateLlm).mockResolvedValue({
      valid: true,
      message: null,
    });
    vi.mocked(api.validateRxresume).mockResolvedValue({
      valid: true,
      message: null,
    });
    vi.mocked(api.validateResumeConfig).mockResolvedValue({
      valid: true,
      message: null,
    });

    renderPage();

    fireEvent.click(screen.getByRole("button", { name: /basic auth/i }));

    await waitFor(() => {
      expect(screen.getByText("Secure your workspace")).toBeInTheDocument();
    });

    const skipCard = screen
      .getByText(/you can add authentication later from settings\./i)
      .closest("label");

    if (!skipCard) {
      throw new Error("Expected the skip card to render as a label");
    }

    fireEvent.click(skipCard);

    expect(
      screen.getByRole("button", { name: /finish onboarding/i }),
    ).toBeEnabled();
  });
});
