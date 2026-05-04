/**
 * 设置 page constants.
 */

import type { ChatValues } from "@client/pages/settings/types";
import type { Job状态 } from "@shared/types";

/** All available job statuses for clearing */
export const ALL_JOB_STATUSES: Job状态[] = [
  "discovered",
  "processing",
  "ready",
  "applied",
  "in_progress",
  "skipped",
  "expired",
];

/** 状态 descriptions for UI */
export const STATUS_DESCRIPTIONS: Record<Job状态, string> = {
  discovered: "Crawled but not processed",
  processing: "Currently generating resume",
  ready: "PDF generated, waiting for user to apply",
  applied: "Application sent",
  in_progress: "Application moved beyond applied stage",
  skipped: "User skipped this job",
  expired: "Deadline passed",
};

export type WritingStylePresetId =
  | "professional"
  | "concise"
  | "direct"
  | "friendly";

export type WritingStyleDraft = {
  tone: string;
  formality: string;
  constraints: string;
  do否tUse: string;
};

export type WritingStylePreset = {
  id: WritingStylePresetId;
  label: string;
  description: string;
  values: WritingStyleDraft;
};

export const WRITING_STYLE_PRESETS: WritingStylePreset[] = [
  {
    id: "professional",
    label: "Professional",
    description: "Balanced default for polished, job-ready writing.",
    values: {
      tone: "professional",
      formality: "medium",
      constraints: "",
      do否tUse: "",
    },
  },
  {
    id: "concise",
    label: "Concise",
    description: "Keeps responses compact and easy to scan.",
    values: {
      tone: "concise",
      formality: "medium",
      constraints: "Keep the response tight, practical, and easy to scan.",
      do否tUse: "",
    },
  },
  {
    id: "direct",
    label: "Direct",
    description: "Uses plain, decisive phrasing with minimal hedging.",
    values: {
      tone: "direct",
      formality: "medium",
      constraints: "Prioritize clarity and direct wording over flourish.",
      do否tUse: "",
    },
  },
  {
    id: "friendly",
    label: "Friendly",
    description: "Warm and personable while staying professional.",
    values: {
      tone: "friendly",
      formality: "low",
      constraints: "Keep the response warm, approachable, and confident.",
      do否tUse: "",
    },
  },
];

export function resolveWritingStyleDraft(args: {
  values: Partial<Record<keyof WritingStyleDraft, string | null | undefined>>;
  defaults: ChatValues;
}): WritingStyleDraft {
  const { values, defaults } = args;

  return {
    tone: values.tone?.trim() || defaults.tone.effective,
    formality: values.formality?.trim() || defaults.formality.effective,
    constraints: values.constraints?.trim() || defaults.constraints.effective,
    do否tUse: values.do否tUse?.trim() || defaults.do否tUse.effective,
  };
}

export function getMatchingWritingStylePresetId(
  style: WritingStyleDraft,
): WritingStylePresetId | null {
  const match = WRITING_STYLE_PRESETS.find(
    (preset) =>
      preset.values.tone === style.tone &&
      preset.values.formality === style.formality &&
      preset.values.constraints === style.constraints &&
      preset.values.do否tUse === style.do否tUse,
  );

  return match?.id ?? null;
}
