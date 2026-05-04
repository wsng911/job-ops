import * as api from "@client/api";
import type { Job, ResumeProjectCatalogItem } from "@shared/types.js";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  createTailoredSkillDraftId,
  type 编辑ableSkillGroup,
  from编辑ableSkillGroups,
  parseTailoredSkills,
  serializeTailoredSkills,
  to编辑ableSkillGroups,
} from "../tailoring-utils";

const parseSelectedIds = (value: string | null | undefined) =>
  new Set(value?.split(",").filter(Boolean) ?? []);

const toSelectedIdsCsv = (ids: Set<string>) => Array.from(ids).sort().join(",");

const hasSelectionDiff = (current: Set<string>, saved: Set<string>) => {
  if (current.size !== saved.size) return true;
  for (const id of current) {
    if (!saved.has(id)) return true;
  }
  return false;
};

export interface Tailoring保存Payload {
  tailoredSummary: string;
  tailoredHeadline: string;
  tailoredSkills: string;
  job描述: string;
  selectedProjectIds: string;
  tracerLinksEnabled: boolean;
}

export const getTailoring保存PayloadKey = (
  payload: Tailoring保存Payload,
): string =>
  JSON.stringify({
    tailoredSummary: payload.tailoredSummary,
    tailoredHeadline: payload.tailoredHeadline,
    tailoredSkills: payload.tailoredSkills,
    job描述: payload.job描述,
    selectedProjectIds: toSelectedIdsCsv(
      parseSelectedIds(payload.selectedProjectIds),
    ),
    tracerLinksEnabled: payload.tracerLinksEnabled,
  });

const parseIncomingDraft = (incomingJob: Job) => {
  const summary = incomingJob.tailoredSummary || "";
  const headline = incomingJob.tailoredHeadline || "";
  const description = incomingJob.job描述 || "";
  const selectedIds = parseSelectedIds(incomingJob.selectedProjectIds);
  const skillsDraft = to编辑ableSkillGroups(
    parseTailoredSkills(incomingJob.tailoredSkills),
  );
  const skillsJson = serializeTailoredSkills(
    from编辑ableSkillGroups(skillsDraft),
  );
  const tracerLinksEnabled = Boolean(incomingJob.tracerLinksEnabled);

  return {
    summary,
    headline,
    description,
    selectedIds,
    skillsDraft,
    skillsJson,
    tracerLinksEnabled,
  };
};

interface UseTailoringDraftParams {
  job: Job;
  onDirtyChange?: (isDirty: boolean) => void;
}

export function useTailoringDraft({
  job,
  onDirtyChange,
}: UseTailoringDraftParams) {
  const [catalog, setCatalog] = useState<ResumeProjectCatalogItem[]>([]);
  const [isCatalogLoading, setIsCatalogLoading] = useState(true);
  const [summary, setSummary] = useState(job.tailoredSummary || "");
  const [headline, setHeadline] = useState(job.tailoredHeadline || "");
  const [job描述, setJob描述] = useState(
    job.job描述 || "",
  );
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() =>
    parseSelectedIds(job.selectedProjectIds),
  );
  const [skillsDraft, setSkillsDraft] = useState<编辑ableSkillGroup[]>(() =>
    to编辑ableSkillGroups(parseTailoredSkills(job.tailoredSkills)),
  );
  const [openSkillGroupId, setOpenSkillGroupId] = useState<string>("");
  const [tracerLinksEnabled, setTracerLinksEnabled] = useState(
    Boolean(job.tracerLinksEnabled),
  );

  const [savedSummary, set保存dSummary] = useState(job.tailoredSummary || "");
  const [savedHeadline, set保存dHeadline] = useState(
    job.tailoredHeadline || "",
  );
  const [saved描述, set保存d描述] = useState(
    job.job描述 || "",
  );
  const [savedSelectedIds, set保存dSelectedIds] = useState<Set<string>>(() =>
    parseSelectedIds(job.selectedProjectIds),
  );
  const [savedSkillsJson, set保存dSkillsJson] = useState(() =>
    serializeTailoredSkills(parseTailoredSkills(job.tailoredSkills)),
  );
  const [savedTracerLinksEnabled, set保存dTracerLinksEnabled] = useState(
    Boolean(job.tracerLinksEnabled),
  );

  const lastJobIdRef = useRef(job.id);
  const jobRef = useRef(job);

  const skillsJson = useMemo(
    () => serializeTailoredSkills(from编辑ableSkillGroups(skillsDraft)),
    [skillsDraft],
  );

  const selectedIdsCsv = useMemo(
    () => toSelectedIdsCsv(selectedIds),
    [selectedIds],
  );

  const isDirty = useMemo(() => {
    if (summary !== savedSummary) return true;
    if (headline !== savedHeadline) return true;
    if (job描述 !== saved描述) return true;
    if (skillsJson !== savedSkillsJson) return true;
    if (tracerLinksEnabled !== savedTracerLinksEnabled) return true;
    return hasSelectionDiff(selectedIds, savedSelectedIds);
  }, [
    summary,
    savedSummary,
    headline,
    savedHeadline,
    job描述,
    saved描述,
    skillsJson,
    savedSkillsJson,
    tracerLinksEnabled,
    savedTracerLinksEnabled,
    selectedIds,
    savedSelectedIds,
  ]);

  const savedPayloadKey = useMemo(
    () =>
      getTailoring保存PayloadKey({
        tailoredSummary: savedSummary,
        tailoredHeadline: savedHeadline,
        tailoredSkills: savedSkillsJson,
        job描述: saved描述,
        selectedProjectIds: toSelectedIdsCsv(savedSelectedIds),
        tracerLinksEnabled: savedTracerLinksEnabled,
      }),
    [
      savedSummary,
      savedHeadline,
      savedSkillsJson,
      saved描述,
      savedSelectedIds,
      savedTracerLinksEnabled,
    ],
  );

  const applyIncomingDraft = useCallback((incomingJob: Job) => {
    const next = parseIncomingDraft(incomingJob);
    setSummary(next.summary);
    setHeadline(next.headline);
    setJob描述(next.description);
    setSelectedIds(next.selectedIds);
    setSkillsDraft(next.skillsDraft);
    set保存dSummary(next.summary);
    set保存dHeadline(next.headline);
    set保存d描述(next.description);
    set保存dSelectedIds(next.selectedIds);
    set保存dSkillsJson(next.skillsJson);
    setTracerLinksEnabled(next.tracerLinksEnabled);
    set保存dTracerLinksEnabled(next.tracerLinksEnabled);
  }, []);

  const mark保存dSnapshot = useCallback((snapshot: Tailoring保存Payload) => {
    set保存dSummary(snapshot.tailoredSummary);
    set保存dHeadline(snapshot.tailoredHeadline);
    set保存d描述(snapshot.job描述);
    set保存dSelectedIds(parseSelectedIds(snapshot.selectedProjectIds));
    set保存dSkillsJson(snapshot.tailoredSkills);
    set保存dTracerLinksEnabled(snapshot.tracerLinksEnabled);
  }, []);

  const mark保存dJob = useCallback((incomingJob: Job) => {
    const next = parseIncomingDraft(incomingJob);
    set保存dSummary(next.summary);
    set保存dHeadline(next.headline);
    set保存d描述(next.description);
    set保存dSelectedIds(next.selectedIds);
    set保存dSkillsJson(next.skillsJson);
    set保存dTracerLinksEnabled(next.tracerLinksEnabled);
  }, []);

  const loadCatalog = useCallback(async (silently = false) => {
    if (!silently) setIsCatalogLoading(true);
    try {
      const nextCatalog = await api.getResumeProjectsCatalog();
      setCatalog(nextCatalog);
    } catch {
      if (!silently) setCatalog([]);
    } finally {
      if (!silently) setIsCatalogLoading(false);
    }
  }, []);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  useEffect(() => {
    return () => onDirtyChange?.(false);
  }, [onDirtyChange]);

  useEffect(() => {
    void loadCatalog(false);

    const refreshCatalog = () => {
      void loadCatalog(true);
    };

    window.addEventListener("focus", refreshCatalog);
    document.addEventListener("visibilitychange", refreshCatalog);
    return () => {
      window.removeEventListener("focus", refreshCatalog);
      document.removeEventListener("visibilitychange", refreshCatalog);
    };
  }, [loadCatalog]);

  useEffect(() => {
    jobRef.current = job;
  }, [job]);

  // Only sync when job ID changes (user switched to a different job)
  // User edits persist until explicitly saved - no auto-sync from server
  useEffect(() => {
    if (job.id !== lastJobIdRef.current) {
      lastJobIdRef.current = job.id;
      applyIncomingDraft(jobRef.current);
    }
  }, [job.id, applyIncomingDraft]);

  useEffect(() => {
    if (
      openSkillGroupId.length > 0 &&
      !skillsDraft.some((group) => group.id === openSkillGroupId)
    ) {
      setOpenSkillGroupId("");
    }
  }, [skillsDraft, openSkillGroupId]);

  const handleToggleProject = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handle添加SkillGroup = useCallback(() => {
    const nextId = createTailoredSkillDraftId();
    setSkillsDraft((prev) => [
      ...prev,
      { id: nextId, name: "", keywordsText: "" },
    ]);
    setOpenSkillGroupId(nextId);
  }, []);

  const handle更新SkillGroup = useCallback(
    (id: string, key: "name" | "keywordsText", value: string) => {
      setSkillsDraft((prev) =>
        prev.map((group) =>
          group.id === id ? { ...group, [key]: value } : group,
        ),
      );
    },
    [],
  );

  const handle移除SkillGroup = useCallback((id: string) => {
    setSkillsDraft((prev) => prev.filter((group) => group.id !== id));
  }, []);

  return {
    catalog,
    isCatalogLoading,
    summary,
    setSummary,
    headline,
    setHeadline,
    job描述,
    setJob描述,
    selectedIds,
    selectedIdsCsv,
    skillsDraft,
    setSkillsDraft,
    openSkillGroupId,
    setOpenSkillGroupId,
    skillsJson,
    tracerLinksEnabled,
    setTracerLinksEnabled,
    isDirty,
    savedPayloadKey,
    applyIncomingDraft,
    mark保存dSnapshot,
    mark保存dJob,
    handleToggleProject,
    handle添加SkillGroup,
    handle更新SkillGroup,
    handle移除SkillGroup,
  };
}
