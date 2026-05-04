import type { StageEvent } from "@shared/types.js";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { JobTimeline } from "./Timeline";

const baseEvent: StageEvent = {
  id: "event-1",
  applicationId: "app-1",
  fromStage: null,
  toStage: "applied",
  title: "Applied",
  groupId: null,
  occurredAt: 1735689600,
  metadata: {
    eventLabel: "Applied",
  },
  outcome: null,
};

describe("JobTimeline", () => {
  it("renders edit and delete controls when callbacks are provided", () => {
    const on编辑 = vi.fn();
    const on删除 = vi.fn();

    render(
      <JobTimeline events={[baseEvent]} on编辑={on编辑} on删除={on删除} />,
    );

    const editButton = screen.getBy标题("编辑 event");
    const deleteButton = screen.getBy标题("删除 event");

    fireEvent.click(editButton);
    fireEvent.click(deleteButton);

    expect(on编辑).toHaveBeenCalledWith(baseEvent);
    expect(on删除).toHaveBeenCalledWith("event-1");
  });

  it("omits edit and delete controls when callbacks are missing", () => {
    render(<JobTimeline events={[baseEvent]} />);

    expect(screen.queryBy标题("编辑 event")).not.toBeInTheDocument();
    expect(screen.queryBy标题("删除 event")).not.toBeInTheDocument();
  });
});
