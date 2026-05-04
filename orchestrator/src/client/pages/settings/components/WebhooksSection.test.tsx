import type { 更新设置Input } from "@shared/settings-schema.js";
import { render, screen } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import { Accordion } from "@/components/ui/accordion";
import { WebhooksSection } from "./WebhooksSection";

const WebhooksHarness = () => {
  const methods = useForm<更新设置Input>({
    defaultValues: {
      pipelineWebhookUrl: "https://pipeline.com",
      jobCompleteWebhookUrl: "https://job.com",
      webhookSecret: "",
    },
  });

  return (
    <FormProvider {...methods}>
      <Accordion type="multiple" defaultValue={["webhooks"]}>
        <WebhooksSection
          pipelineWebhook={{
            default: "https://default-p.com",
            effective: "https://pipeline.com",
          }}
          jobCompleteWebhook={{
            default: "https://default-j.com",
            effective: "https://job.com",
          }}
          webhookSecretHint={null}
          isLoading={false}
          isSaving={false}
        />
      </Accordion>
    </FormProvider>
  );
};

describe("WebhooksSection", () => {
  it("renders both webhook sections and the secret field", () => {
    render(<WebhooksHarness />);

    expect(screen.getByText("Pipeline 状态")).toBeInTheDocument();
    expect(screen.getByText("Job Completion")).toBeInTheDocument();

    expect(
      screen.getByDisplayValue("https://pipeline.com"),
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue("https://job.com")).toBeInTheDocument();
    expect(screen.getByLabelText("Webhook Secret")).toBeInTheDocument();
  });
});
