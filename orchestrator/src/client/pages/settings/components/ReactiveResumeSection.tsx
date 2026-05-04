import { ReactiveResumeConfigPanel } from "@client/components/ReactiveResumeConfigPanel";
import { 设置SectionFrame } from "@client/pages/settings/components/设置SectionFrame";
import type { 更新设置Input } from "@shared/settings-schema.js";
import type { PdfRenderer, ResumeProjectCatalogItem } from "@shared/types.js";
import type React from "react";
import {
  type Path,
  type PathValue,
  useFormContext,
  useWatch,
} from "react-hook-form";

type ReactiveResumeSectionProps = {
  rxResumeBaseResumeIdDraft: string | null;
  setRxResumeBaseResumeIdDraft: (value: string | null) => void;
  // True when v5 API key is configured.
  hasRxResumeAccess: boolean;
  onCredentialField编辑?: () => void;
  validation状态?: {
    checked: boolean;
    valid: boolean;
    message?: string | null;
    status?: number | null;
  };
  profileProjects: ResumeProjectCatalogItem[];
  lockedCount: number;
  maxProjectsTotal: number;
  isProjectsLoading: boolean;
  isLoading: boolean;
  isSaving: boolean;
  layoutMode?: "accordion" | "panel";
};

export const ReactiveResumeSection: React.FC<ReactiveResumeSectionProps> = ({
  rxResumeBaseResumeIdDraft,
  setRxResumeBaseResumeIdDraft,
  hasRxResumeAccess,
  onCredentialField编辑,
  validation状态,
  profileProjects,
  lockedCount,
  maxProjectsTotal,
  isProjectsLoading,
  isLoading,
  isSaving,
  layoutMode,
}) => {
  const {
    control,
    clearErrors,
    setValue,
    formState: { errors },
  } = useFormContext<更新设置Input>();

  const pdfRendererValue = (useWatch({
    control,
    name: "pdfRenderer",
  }) ?? "rxresume") as PdfRenderer;
  const rxresumeApiKeyValue =
    useWatch({ control, name: "rxresumeApiKey" }) ?? "";
  const rxresumeUrlValue = useWatch({ control, name: "rxresumeUrl" }) ?? "";
  const resumeProjectsValue = useWatch({ control, name: "resumeProjects" });
  const setDirtyTouchedValue = <TField extends Path<更新设置Input>>(
    field: TField,
    value: PathValue<更新设置Input, TField>,
  ) =>
    setValue(field, value, {
      shouldDirty: true,
      shouldTouch: true,
    });

  const clearRxResumeFeedback = () => {
    onCredentialField编辑?.();
    clearErrors(["rxresumeApiKey", "rxresumeUrl"]);
  };

  return (
    <设置SectionFrame
      mode={layoutMode}
      title="Reactive Resume"
      value="reactive-resume"
    >
      <ReactiveResumeConfigPanel
        pdfRenderer={pdfRendererValue}
        onPdfRendererChange={(value) =>
          setDirtyTouchedValue("pdfRenderer", value)
        }
        pdfRendererError={errors.pdfRenderer?.message as string | undefined}
        disabled={isLoading || isSaving}
        hasRxResumeAccess={hasRxResumeAccess}
        showValidation状态={Boolean(validation状态)}
        validation状态={validation状态}
        shared={{
          baseUrl: rxresumeUrlValue,
          onBaseUrlChange: (value) => {
            clearRxResumeFeedback();
            setDirtyTouchedValue("rxresumeUrl", value);
          },
          baseUrlError: errors.rxresumeUrl?.message as string | undefined,
        }}
        v5={{
          apiKey: rxresumeApiKeyValue,
          onApiKeyChange: (value) => {
            clearRxResumeFeedback();
            setDirtyTouchedValue("rxresumeApiKey", value);
          },
          error: errors.rxresumeApiKey?.message as string | undefined,
        }}
        projectSelection={{
          baseResumeId: rxResumeBaseResumeIdDraft,
          onBaseResumeIdChange: setRxResumeBaseResumeIdDraft,
          projects: profileProjects,
          value: resumeProjectsValue,
          onChange: (next) => setDirtyTouchedValue("resumeProjects", next),
          lockedCount,
          maxProjectsTotal,
          isProjectsLoading,
          disabled: isLoading || isSaving,
          maxProjectsError:
            errors.resumeProjects?.maxProjects?.message?.toString(),
        }}
      />
    </设置SectionFrame>
  );
};
