import type {
  ChatStyleLanguageMode,
  ChatStyleManualLanguage,
} from "@shared/types.js";

export type EffectiveDefault<T> = {
  effective: T;
  default: T;
};

export type ModelValues = EffectiveDefault<string> & {
  scorer: string;
  tailoring: string;
  projectSelection: string;
  llmProvider: string;
  llmBaseUrl: string;
  llmApiKeyHint: string | null;
};

export type WebhookValues = EffectiveDefault<string>;
export type DisplayValues = {
  showSponsorInfo: EffectiveDefault<boolean>;
  renderMarkdownInJob描述s: EffectiveDefault<boolean>;
};
export type ChatValues = {
  tone: EffectiveDefault<string>;
  formality: EffectiveDefault<string>;
  constraints: EffectiveDefault<string>;
  do否tUse: EffectiveDefault<string>;
  languageMode: EffectiveDefault<ChatStyleLanguageMode>;
  manualLanguage: EffectiveDefault<ChatStyleManualLanguage>;
  stopSlopEnabled: EffectiveDefault<boolean>;
  summaryMaxWords: EffectiveDefault<number | null>;
  maxKeywordsPerSkill: EffectiveDefault<number | null>;
};

export type Env设置Values = {
  readable: {
    ukvisajobs邮箱: string;
    adzunaAppId: string;
    basicAuthUser: string;
    basicAuth密码: string;
  };
  private: {
    ukvisajobs密码Hint: string | null;
    adzunaAppKeyHint: string | null;
    basicAuth密码Hint: string | null;
    webhookSecretHint: string | null;
  };
  basicAuthActive: boolean;
};

export type 返回upValues = {
  backupEnabled: EffectiveDefault<boolean>;
  backupHour: EffectiveDefault<number>;
  backupMaxCount: EffectiveDefault<number>;
};

export type ScoringValues = {
  penalizeMissingSalary: EffectiveDefault<boolean>;
  missingSalaryPenalty: EffectiveDefault<number>;
  autoSkipScoreThreshold: EffectiveDefault<number | null>;
  blocked公司Keywords: EffectiveDefault<string[]>;
  scoringInstructions: EffectiveDefault<string>;
};

export type PromptTemplatesValues = {
  ghostwriterSystemPromptTemplate: EffectiveDefault<string>;
  tailoringPromptTemplate: EffectiveDefault<string>;
  scoringPromptTemplate: EffectiveDefault<string>;
};
