import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ItemDialog, type ItemFieldConfig } from "./ItemDialog";

describe("ItemDialog", () => {
  it("uses tokenized input for tags fields", () => {
    const on保存 = vi.fn();
    const fields: ItemFieldConfig[] = [
      {
        key: "keywords",
        label: "Keywords",
        type: "tags",
        placeholder: "添加 keywords",
      },
    ];

    render(
      <ItemDialog
        open
        title="编辑 item"
        description="Dialog description"
        item={{ id: "item-1", keywords: ["React"] }}
        fields={fields}
        onOpenChange={vi.fn()}
        on保存={on保存}
      />,
    );

    const collapsedTokens = screen.getByTestId(
      "design-resume-item-keywords-collapsed-tokens",
    );
    expect(within(collapsedTokens).getByText("React")).toBeInTheDocument();

    const input = screen.getByLabelText("Keywords");
    fireEvent.change(input, { target: { value: "TypeScript, Next.js" } });
    fireEvent.blur(input);

    fireEvent.click(screen.getByRole("button", { name: "保存 item" }));

    expect(on保存).toHaveBeenCalledWith(
      expect.objectContaining({
        keywords: ["React", "TypeScript", "Next.js"],
      }),
    );
  });

  it("trims text input values before saving", () => {
    const on保存 = vi.fn();
    const fields: ItemFieldConfig[] = [
      { key: "name", label: "名称", type: "text" },
    ];

    render(
      <ItemDialog
        open
        title="编辑 item"
        description="Dialog description"
        item={{ id: "item-2", name: "" }}
        fields={fields}
        onOpenChange={vi.fn()}
        on保存={on保存}
      />,
    );

    fireEvent.change(screen.getByLabelText("名称"), {
      target: { value: "  Python  " },
    });
    fireEvent.click(screen.getByRole("button", { name: "保存 item" }));

    expect(on保存).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Python",
      }),
    );
  });
});
