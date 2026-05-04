import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LogEventModal } from "./LogEventModal";

vi.mock("@/components/ui/alert-dialog", () => ({
  AlertDialog: ({ children }: { children: React.React否de }) => (
    <div>{children}</div>
  ),
  AlertDialogContent: ({
    children,
    ...props
  }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
  AlertDialog描述: ({ children }: { children: React.React否de }) => (
    <div>{children}</div>
  ),
  AlertDialogFooter: ({ children }: { children: React.React否de }) => (
    <div>{children}</div>
  ),
  AlertDialogHeader: ({ children }: { children: React.React否de }) => (
    <div>{children}</div>
  ),
  AlertDialog标题: ({ children }: { children: React.React否de }) => (
    <div>{children}</div>
  ),
  AlertDialog取消: ({
    children,
    ...props
  }: {
    children: React.React否de;
  }) => (
    <button type="button" {...props}>
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/select", () => ({
  Select: ({
    children,
    value,
    onValueChange,
  }: {
    children: React.React否de;
    value?: string;
    onValueChange?: (value: string) => void;
  }) => (
    <select
      data-testid="select"
      value={value}
      onChange={(event) => onValueChange?.(event.target.value)}
    >
      {children}
    </select>
  ),
  SelectContent: ({ children }: { children: React.React否de }) => (
    <>{children}</>
  ),
  SelectItem: ({
    children,
    value,
  }: {
    children: React.React否de;
    value: string;
  }) => <option value={value}>{children}</option>,
  SelectTrigger: () => null,
  SelectValue: () => null,
}));

describe("LogEventModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows the rejection reason selector and submits the form", async () => {
    const onLog = vi.fn().mockResolvedValue(undefined);
    const on关闭 = vi.fn();

    render(<LogEventModal isOpen on关闭={on关闭} onLog={onLog} />);

    const stageSelect = screen.getAllByTestId("select")[0];
    fireEvent.change(stageSelect, { target: { value: "rejected" } });

    expect(screen.getByText("Reason")).toBeInTheDocument();

    const reasonSelect = screen.getAllByTestId("select")[1];
    fireEvent.change(reasonSelect, { target: { value: "Visa" } });

    fireEvent.click(screen.getByRole("button", { name: /log event/i }));

    await waitFor(() =>
      expect(onLog).toHaveBeenCalledWith(
        expect.objectContaining({ stage: "rejected", reasonCode: "Visa" }),
        undefined,
      ),
    );
  });

  it("blocks submit when the title is cleared", async () => {
    const onLog = vi.fn().mockResolvedValue(undefined);
    const on关闭 = vi.fn();

    render(<LogEventModal isOpen on关闭={on关闭} onLog={onLog} />);

    const titleInput = screen.getByPlaceholderText("e.g. Recruiter Screen");
    fireEvent.change(titleInput, { target: { value: "" } });

    fireEvent.click(screen.getByRole("button", { name: /log event/i }));

    expect(await screen.findByText("标题 is required")).toBeInTheDocument();
    expect(onLog).not.toHaveBeenCalled();
  });

  it("keeps the modal scrollable on small screens", () => {
    render(<LogEventModal isOpen on关闭={vi.fn()} onLog={vi.fn()} />);

    expect(screen.getByTestId("log-event-modal")).toHaveClass(
      "max-h-[calc(100vh-2rem)]",
      "overflow-y-auto",
    );
  });
});
