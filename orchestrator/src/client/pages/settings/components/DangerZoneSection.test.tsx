import type { Job状态 } from "@shared/types.js";
import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Accordion } from "@/components/ui/accordion";
import { DangerZoneSection } from "./DangerZoneSection";

const DangerZoneHarness = ({
  initial状态es = [] as Job状态[],
  onClear,
}: {
  initial状态es?: Job状态[];
  onClear?: () => void;
}) => {
  const [statusesToClear, set状态esToClear] =
    useState<Job状态[]>(initial状态es);

  const toggle状态ToClear = (status: Job状态) => {
    set状态esToClear((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status],
    );
  };

  return (
    <Accordion type="multiple" defaultValue={["danger-zone"]}>
      <DangerZoneSection
        statusesToClear={statusesToClear}
        toggle状态ToClear={toggle状态ToClear}
        handleClearBy状态es={onClear ?? (() => {})}
        handleClearDatabase={() => {}}
        isLoading={false}
        isSaving={false}
      />
    </Accordion>
  );
};

describe("DangerZoneSection", () => {
  it("disables clear when no statuses are selected", () => {
    render(<DangerZoneHarness initial状态es={[]} />);

    const clearButton = screen.getByRole("button", { name: /clear selected/i });
    expect(clearButton).toBeDisabled();
  });

  it("toggles status selection and confirms clear", async () => {
    const onClear = vi.fn();
    render(
      <DangerZoneHarness initial状态es={["applied"]} onClear={onClear} />,
    );

    const appliedButton = screen.getByRole("button", { name: /^applied\b/i });
    const clearButton = screen.getByRole("button", { name: /clear selected/i });

    expect(clearButton).toBeEnabled();

    fireEvent.click(clearButton);
    const confirmButton = await screen.findByRole("button", {
      name: /clear 1 status/i,
    });
    fireEvent.click(confirmButton);

    expect(onClear).toHaveBeenCalledTimes(1);

    fireEvent.click(appliedButton);
    expect(clearButton).toBeDisabled();
  });
});
