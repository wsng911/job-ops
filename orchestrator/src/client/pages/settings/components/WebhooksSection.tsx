import { 设置Input } from "@client/pages/settings/components/设置Input";
import { 设置SectionFrame } from "@client/pages/settings/components/设置SectionFrame";
import type { WebhookValues } from "@client/pages/settings/types";
import { formatSecretHint } from "@client/pages/settings/utils";
import type { 更新设置Input } from "@shared/settings-schema.js";
import type React from "react";
import { useFormContext } from "react-hook-form";
import { Separator } from "@/components/ui/separator";

type WebhooksSectionProps = {
  pipelineWebhook: WebhookValues;
  jobCompleteWebhook: WebhookValues;
  webhookSecretHint: string | null;
  isLoading: boolean;
  isSaving: boolean;
  layoutMode?: "accordion" | "panel";
};

export const WebhooksSection: React.FC<WebhooksSectionProps> = ({
  pipelineWebhook,
  jobCompleteWebhook,
  webhookSecretHint,
  isLoading,
  isSaving,
  layoutMode,
}) => {
  const {
    register,
    formState: { errors },
  } = useFormContext<更新设置Input>();

  return (
    <设置SectionFrame mode={layoutMode} title="Webhooks" value="webhooks">
      <div class名称="space-y-6">
        <div class名称="space-y-4">
          <div class名称="text-sm font-medium">Pipeline 状态</div>
          <设置Input
            label="Webhook URL"
            inputProps={register("pipelineWebhookUrl")}
            placeholder={pipelineWebhook.default || "https://..."}
            disabled={isLoading || isSaving}
            error={errors.pipelineWebhookUrl?.message as string | undefined}
            helper={`When set, the server sends a POST on pipeline completion/failure. Default: ${pipelineWebhook.default || "—"}.`}
            current={pipelineWebhook.effective || "—"}
          />
        </div>

        <Separator />

        <div class名称="space-y-4">
          <div class名称="text-sm font-medium">Job Completion</div>
          <div class名称="space-y-4">
            <设置Input
              label="Webhook URL"
              inputProps={register("jobCompleteWebhookUrl")}
              placeholder={jobCompleteWebhook.default || "https://..."}
              disabled={isLoading || isSaving}
              error={
                errors.jobCompleteWebhookUrl?.message as string | undefined
              }
              helper={`When set, the server sends a POST when you mark a job as applied (includes the job description). Default: ${jobCompleteWebhook.default || "—"}.`}
              current={jobCompleteWebhook.effective || "—"}
            />

            <设置Input
              label="Webhook Secret"
              inputProps={register("webhookSecret")}
              type="password"
              placeholder="Enter new secret"
              disabled={isLoading || isSaving}
              error={errors.webhookSecret?.message as string | undefined}
              helper="Secret sent to webhook (Bearer token)"
              current={formatSecretHint(webhookSecretHint)}
            />
          </div>
        </div>
      </div>
    </设置SectionFrame>
  );
};
