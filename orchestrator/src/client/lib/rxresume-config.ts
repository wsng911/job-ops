import type { 更新设置Input } from "@shared/settings-schema.js";
import type { ValidationResult } from "@shared/types.js";
import { formatUserFacingError } from "@/client/lib/error-format";

export type RxResume设置Like =
  | {
      rxresumeUrl?: string | null;
      rxresumeApiKeyHint?: string | null;
      rxresumeBaseResumeId?: string | null;
    }
  | null
  | undefined;

export const RXRESUME_PRECHECK_MESSAGES = {
  "missing-v5-api-key": "添加 an API key, then test again.",
} as const;

export const getStoredRxResumeCredentialAvailability = (
  settings: RxResume设置Like,
) => {
  const apiKey = Boolean(settings?.rxresumeApiKeyHint);
  return { apiKey, hasV5: apiKey };
};

export const getRxResumeBaseResumeSelection = (
  settings: RxResume设置Like,
) => {
  return { selectedId: settings?.rxresumeBaseResumeId ?? null };
};

export const getRxResumeCredentialDrafts = (input: {
  rxresumeUrl?: string | null;
  rxresumeApiKey?: string | null;
}) => ({
  baseUrl: input.rxresumeUrl?.trim() ?? "",
  apiKey: input.rxresumeApiKey?.trim() ?? "",
});

export type RxResumeCredentialDrafts = ReturnType<
  typeof getRxResumeCredentialDrafts
>;
export type RxResumeStoredCredentialAvailability = Pick<
  ReturnType<typeof getStoredRxResumeCredentialAvailability>,
  "apiKey"
>;

export const getRxResumeCredentialPrecheckFailure = (input: {
  stored: RxResumeStoredCredentialAvailability;
  draft: RxResumeCredentialDrafts;
}) => {
  const hasV5 = input.stored.apiKey || Boolean(input.draft.apiKey);
  if (!hasV5) return "missing-v5-api-key" as const;
  return null;
};

export type RxResumeCredentialPrecheckFailure = ReturnType<
  typeof getRxResumeCredentialPrecheckFailure
>;

export const getRxResumeMissingCredentialLabels = (input: {
  stored: RxResumeStoredCredentialAvailability;
  draft: RxResumeCredentialDrafts;
}) => (input.stored.apiKey || input.draft.apiKey ? [] : ["RxResume API key"]);

export const toRxResumeValidationPayload = (
  draft: RxResumeCredentialDrafts,
  options?: {
    preserveBlankFields?: Array<keyof RxResumeCredentialDrafts>;
  },
) => {
  const preserveBlankFields = new Set(options?.preserveBlankFields ?? []);
  return {
    baseUrl: preserveBlankFields.has("baseUrl")
      ? draft.baseUrl
      : draft.baseUrl || undefined,
    apiKey: preserveBlankFields.has("apiKey")
      ? draft.apiKey
      : draft.apiKey || undefined,
  };
};

export const isRxResumeBlockingValidationFailure = (
  validation: ValidationResult,
): boolean =>
  !validation.valid &&
  typeof validation.status === "number" &&
  validation.status >= 400 &&
  validation.status < 500;

export const isRxResumeAvailabilityValidationFailure = (
  validation: ValidationResult,
): boolean =>
  !validation.valid &&
  (validation.status === 0 ||
    (typeof validation.status === "number" && validation.status >= 500));

export const buildRxResume设置更新 = (
  draft: RxResumeCredentialDrafts,
): Partial<更新设置Input> => {
  const update: Partial<更新设置Input> = {
    rxresumeUrl: draft.baseUrl || null,
  };
  if (draft.apiKey) update.rxresumeApiKey = draft.apiKey;
  return update;
};

type ValidateAndMaybePersistRxResumeModeInput<T设置> = {
  stored: RxResumeStoredCredentialAvailability;
  draft: RxResumeCredentialDrafts;
  validationPayloadOptions?: {
    preserveBlankFields?: Array<keyof RxResumeCredentialDrafts>;
  };
  validate: (
    payload: ReturnType<typeof toRxResumeValidationPayload>,
  ) => Promise<ValidationResult>;
  persist?: (update: Partial<更新设置Input>) => Promise<T设置>;
  persistOnSuccess?: boolean;
  skipPrecheck?: boolean;
  getPrecheckMessage?: (
    failure: Exclude<RxResumeCredentialPrecheckFailure, null>,
  ) => string;
  getValidationErrorMessage?: (error: unknown) => string;
  getPersistErrorMessage?: (error: unknown) => string;
};

export type ValidateAndMaybePersistRxResumeModeResult<T设置> = {
  validation: ValidationResult;
  precheckFailure: RxResumeCredentialPrecheckFailure;
  updated设置: T设置 | null;
};

export const validateAndMaybePersistRxResumeMode = async <T设置>(
  input: ValidateAndMaybePersistRxResumeModeInput<T设置>,
): Promise<ValidateAndMaybePersistRxResumeModeResult<T设置>> => {
  const {
    stored,
    draft,
    validationPayloadOptions,
    validate,
    persist,
    persistOnSuccess = false,
    skipPrecheck = false,
    getPrecheckMessage = (failure) => RXRESUME_PRECHECK_MESSAGES[failure],
    getValidationErrorMessage = (error) =>
      formatUserFacingError(error, "RxResume validation failed"),
    getPersistErrorMessage = (error) =>
      formatUserFacingError(error, "Failed to save RxResume settings"),
  } = input;

  const precheckFailure = skipPrecheck
    ? null
    : getRxResumeCredentialPrecheckFailure({
        stored,
        draft,
      });
  if (precheckFailure !== null) {
    return {
      validation: {
        valid: false,
        message: getPrecheckMessage(precheckFailure),
        status: 400,
      },
      precheckFailure,
      updated设置: null,
    };
  }

  let validation: ValidationResult;
  try {
    validation = await validate(
      toRxResumeValidationPayload(draft, validationPayloadOptions),
    );
  } catch (error) {
    return {
      validation: {
        valid: false,
        message: getValidationErrorMessage(error),
        status: 0,
      },
      precheckFailure: null,
      updated设置: null,
    };
  }

  if (!validation.valid || !persistOnSuccess || !persist) {
    return {
      validation: {
        valid: validation.valid,
        message: validation.valid ? null : (validation.message ?? null),
        status: validation.valid ? null : (validation.status ?? null),
      },
      precheckFailure: null,
      updated设置: null,
    };
  }

  try {
    const updated设置 = await persist(buildRxResume设置更新(draft));
    return {
      validation: {
        valid: true,
        message: null,
        status: null,
      },
      precheckFailure: null,
      updated设置,
    };
  } catch (error) {
    return {
      validation: {
        valid: false,
        message: getPersistErrorMessage(error),
        status: 0,
      },
      precheckFailure: null,
      updated设置: null,
    };
  }
};
