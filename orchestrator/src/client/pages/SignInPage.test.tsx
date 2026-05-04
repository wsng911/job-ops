import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SignInPage } from "./SignInPage";

vi.mock("@client/api", () => ({
  getAuthBootstrap状态: vi.fn(async () => ({
    setupRequired: false,
  })),
  hasAuthenticatedSession: vi.fn(() => false),
  restoreAuthSessionFromLegacyCredentials: vi.fn(async () => false),
  setupFirstAdmin: vi.fn(async () => ({
    id: "user-1",
    username: "admin",
    display名称: null,
    isSystemAdmin: true,
    isDisabled: false,
    workspaceId: "tenant_default",
    workspace名称: "JobOps",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })),
  signInWithCredentials: vi.fn(async () => undefined),
}));

import {
  getAuthBootstrap状态,
  hasAuthenticatedSession,
  restoreAuthSessionFromLegacyCredentials,
  setupFirstAdmin,
  signInWithCredentials,
} from "@client/api";

describe("SignInPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.mocked(getAuthBootstrap状态).mockResolvedValue({
      setupRequired: false,
    });
    vi.mocked(hasAuthenticatedSession).mockReturnValue(false);
    vi.mocked(restoreAuthSessionFromLegacyCredentials).mockResolvedValue(false);
    const authUser = {
      id: "user-1",
      username: "admin",
      display名称: null,
      isSystemAdmin: true,
      isDisabled: false,
      workspaceId: "tenant_default",
      workspace名称: "JobOps",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    vi.mocked(setupFirstAdmin).mockResolvedValue(authUser);
    vi.mocked(signInWithCredentials).mockResolvedValue(undefined);
  });

  it("signs in and returns to the requested next route", async () => {
    render(
      <MemoryRouter initialEntries={["/sign-in?next=%2Fjobs%2Fready"]}>
        <Routes>
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/jobs/ready" element={<div>ready-page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(restoreAuthSessionFromLegacyCredentials).toHaveBeenCalledTimes(1);
    });

    fireEvent.change(screen.getByLabelText("用户名"), {
      target: { value: "admin" },
    });
    fireEvent.change(screen.getByLabelText("密码"), {
      target: { value: "secret" },
    });
    fireEvent.click(screen.getByRole("button", { name: "登录" }));

    await waitFor(() => {
      expect(signInWithCredentials).toHaveBeenCalledWith("admin", "secret");
      expect(screen.getByText("ready-page")).toBeInTheDocument();
    });
  });

  it("prefills a remembered username but still requires a password", async () => {
    localStorage.setItem(
      "jobops.rememberedAuthUsers",
      JSON.stringify([
        {
          username: "remembered-admin",
          display名称: null,
          rememberedAt: Date.now(),
        },
      ]),
    );

    render(
      <MemoryRouter initialEntries={["/sign-in?user=remembered-admin"]}>
        <Routes>
          <Route path="/sign-in" element={<SignInPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(restoreAuthSessionFromLegacyCredentials).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByLabelText("用户名")).toHaveValue("remembered-admin");
    expect(screen.getByLabelText("密码")).toHaveValue("");

    fireEvent.click(screen.getByRole("button", { name: "登录" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Enter both username and password.",
    );
    expect(signInWithCredentials).not.toHaveBeenCalled();
  });
});
