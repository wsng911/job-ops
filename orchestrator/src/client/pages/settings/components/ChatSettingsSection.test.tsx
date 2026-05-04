import type { 更新设置Input } from "@shared/settings-schema.js";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";
import { Accordion } from "@/components/ui/accordion";
import { Chat设置Section } from "./Chat设置Section";

vi.mock("@/components/ui/select", () => {
  const SelectContext = React.createContext<{
    onValueChange?: (value: string) => void;
  } | null>(null);

  const Select = ({
    children,
    value,
    onValueChange,
  }: {
    children: React.React否de;
    value?: string;
    onValueChange?: (value: string) => void;
  }) => {
    return (
      <SelectContext.Provider value={{ onValueChange }}>
        <div>
          <input readOnly value={value ?? ""} aria-label="select-value" />
          {children}
        </div>
      </SelectContext.Provider>
    );
  };

  const SelectContent = ({ children }: { children: React.React否de }) => (
    <>{children}</>
  );
  const SelectItem = ({
    value,
    children,
  }: {
    value: string;
    children: React.React否de;
  }) => {
    const context = React.useContext(SelectContext);

    return (
      <button type="button" onClick={() => context?.onValueChange?.(value)}>
        {children}
      </button>
    );
  };
  const SelectTrigger = ({
    children,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button type="button" role="combobox" aria-expanded="false" {...props}>
      {children}
    </button>
  );
  const SelectValue = () => null;

  return {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  };
});

const Chat设置Harness = ({
  mode = "on提交" as const,
}: {
  mode?: "on提交" | "onChange";
} = {}) => {
  const methods = useForm<更新设置Input>({
    mode,
    defaultValues: {
      chatStyleTone: "",
      chatStyleFormality: "",
      chatStyleConstraints: "",
      chatStyleDo否tUse: "",
      chatStyleLanguageMode: null,
      chatStyleManualLanguage: null,
      ghostwriterStopSlopEnabled: null,
      chatStyleSummaryMaxWords: null,
      chatStyleMaxKeywordsPerSkill: null,
    },
  });

  return (
    <FormProvider {...methods}>
      <Accordion type="multiple" defaultValue={["chat"]}>
        <Chat设置Section
          values={{
            tone: { effective: "professional", default: "professional" },
            formality: { effective: "medium", default: "medium" },
            constraints: { effective: "", default: "" },
            do否tUse: { effective: "", default: "" },
            languageMode: { effective: "manual", default: "manual" },
            manualLanguage: { effective: "english", default: "english" },
            stopSlopEnabled: { effective: false, default: false },
            summaryMaxWords: { effective: null, default: null },
            maxKeywordsPerSkill: { effective: null, default: null },
          }}
          isLoading={false}
          isSaving={false}
        />
      </Accordion>
    </FormProvider>
  );
};

describe("Chat设置Section", () => {
  it("treats blank overrides as unset so preset and selects stay aligned", () => {
    render(<Chat设置Harness />);

    expect(screen.getAllByDisplayValue("professional").length).toBeGreaterThan(
      0,
    );
    expect(screen.getByDisplayValue("medium")).toBeInTheDocument();
    expect(screen.getByDisplayValue("manual")).toBeInTheDocument();
    expect(screen.getByDisplayValue("english")).toBeInTheDocument();
  });

  it("applies preset values to the writing style fields", () => {
    render(<Chat设置Harness />);

    fireEvent.click(screen.getAllByRole("button", { name: "Friendly" })[0]);

    expect(screen.getAllByDisplayValue("friendly").length).toBeGreaterThan(0);
    expect(screen.getByDisplayValue("low")).toBeInTheDocument();
    expect(
      screen.getByDisplayValue(
        "Keep the response warm, approachable, and confident.",
      ),
    ).toBeInTheDocument();
  });

  it("hides the manual language selector when matching the resume language", () => {
    render(<Chat设置Harness />);

    fireEvent.click(
      screen.getByRole("button", { name: "Match current resume language" }),
    );

    expect(
      screen.queryByRole("combobox", { name: /specific language/i }),
    ).not.toBeInTheDocument();
    expect(screen.queryByDisplayValue("english")).not.toBeInTheDocument();
  });

  it("renders the Stop Slop Ghostwriter toggle", () => {
    render(<Chat设置Harness />);

    expect(
      screen.getByLabelText("Use Stop Slop for Ghostwriter"),
    ).toBeInTheDocument();
    expect(screen.getByText(/Effective: Disabled/)).toBeInTheDocument();
  });

  it("shows validation error when summary word limit is out of range", async () => {
    const { container } = render(<Chat设置Harness mode="onChange" />);

    const input = container.querySelector(
      "#chatStyleSummaryMaxWords",
    ) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "999", valueAsNumber: 999 } });

    await waitFor(() => {
      expect(screen.getByText("Must be between 1 and 500")).toBeInTheDocument();
    });
  });

  it("shows validation error when max keywords per skill is out of range", async () => {
    const { container } = render(<Chat设置Harness mode="onChange" />);

    const input = container.querySelector(
      "#chatStyleMaxKeywordsPerSkill",
    ) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "0", valueAsNumber: 0 } });

    await waitFor(() => {
      expect(screen.getByText("Must be between 1 and 50")).toBeInTheDocument();
    });
  });

  it("does not show validation error for valid summary word limit", async () => {
    const { container } = render(<Chat设置Harness mode="onChange" />);

    const input = container.querySelector(
      "#chatStyleSummaryMaxWords",
    ) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "50", valueAsNumber: 50 } });

    await waitFor(() => {
      expect(
        screen.queryByText("Must be between 1 and 500"),
      ).not.toBeInTheDocument();
    });
  });
});
