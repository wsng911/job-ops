import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Accordion } from "@/components/ui/accordion";
import { DesignResumeListSection } from "./DesignResumeListSection";
import type { ItemDefinition } from "./definitions";

const projectsDefinition: ItemDefinition = {
  key: "projects",
  title: "Projects",
  singular标题: "Project",
  description: "Projects used for tailoring.",
  primaryField: "name",
  secondaryField: "period",
  fields: [],
  createItem: () => ({
    id: "new-project",
    name: "",
    period: "",
  }),
};

const projects = [
  { id: "project-1", name: "Apollo", period: "2024" },
  { id: "project-2", name: "Beacon", period: "2025" },
];

function renderListSection(on更新Items = vi.fn()) {
  render(
    <Accordion type="multiple" defaultValue={["projects"]}>
      <DesignResumeListSection
        definition={projectsDefinition}
        items={projects}
        on添加={vi.fn()}
        on编辑={vi.fn()}
        on更新Items={on更新Items}
      />
    </Accordion>,
  );
  return on更新Items;
}

describe("DesignResumeListSection", () => {
  it("asks for confirmation before removing an item", () => {
    const on更新Items = renderListSection();

    fireEvent.click(screen.getAllByRole("button", { name: "移除" })[0]);

    expect(
      screen.getByRole("alertdialog", { name: "移除 project?" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "This will remove Apollo from your Design Resume. You can add it again later, but this change will be saved.",
      ),
    ).toBeInTheDocument();
    expect(on更新Items).not.toHaveBeenCalled();
  });

  it("does not remove an item when confirmation is cancelled", () => {
    const on更新Items = renderListSection();

    fireEvent.click(screen.getAllByRole("button", { name: "移除" })[0]);
    fireEvent.click(screen.getByRole("button", { name: "取消" }));

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(on更新Items).not.toHaveBeenCalled();
  });

  it("removes the selected item after confirmation", () => {
    const on更新Items = renderListSection();

    fireEvent.click(screen.getAllByRole("button", { name: "移除" })[1]);
    const dialog = screen.getByRole("alertdialog", {
      name: "移除 project?",
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "移除" }));

    expect(on更新Items).toHaveBeenCalledWith([projects[0]]);
  });
});
