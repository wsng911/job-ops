import * as api from "@client/api";
import { DesignResumePreviewPanel } from "@client/components/design-resume/DesignResumePreviewPanel";
import { DesignResumeRail } from "@client/components/design-resume/DesignResumeRail";
import { ItemDialog } from "@client/components/design-resume/ItemDialog";
import { PageHeader, PageMain } from "@client/components/layout";
import { useDesignResume } from "@client/hooks/useDesignResume";
import { use设置 } from "@client/hooks/use设置";
import { useTracerReadiness } from "@client/hooks/useTracerReadiness";
import type {
  DesignResumeDocument,
  DesignResumeJson,
  PdfRenderer,
} from "@shared/types";
import { useQueryClient } from "@tanstack/react-query";
import {
  Download,
  FileDown,
  Import,
  MoreHorizontal,
  PanelLeft,
  PenSquare,
} from "lucide-react";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { showErrorToast } from "@/client/lib/error-toast";
import { downloadDesignResumePdf } from "@/client/lib/private-pdf";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialog取消,
  AlertDialogContent,
  AlertDialog描述,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialog标题,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  Sheet标题,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { ItemDefinition } from "../components/design-resume/definitions";
import {
  asArray,
  asRecord,
  fileToDataUrl,
  getDesignResumeDialogItem,
  makeDownload,
} from "../components/design-resume/utils";
import { formatUserFacingError } from "../lib/error-format";
import { queryKeys } from "../lib/queryKeys";

export const DesignResumePage: React.FC = () => {
  const queryClient = useQueryClient();
  const { document, status, isLoading, error } = useDesignResume();
  const { settings, isLoading: settingsLoading } = use设置();
  const { readiness: tracerReadiness } = useTracerReadiness();
  const [draft, setDraft] = useState<DesignResumeDocument | null>(null);
  const [saveState, set保存State] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [dialogState, setDialogState] = useState<{
    definition: ItemDefinition;
    index: number | null;
    seed: Record<string, unknown> | null;
  } | null>(null);
  const [mobileRailOpen, setMobileRailOpen] = useState(false);
  const [pictureUploading, setPictureUploading] = useState(false);
  const [resumeImporting, setResumeImporting] = useState(false);
  const [showReimport确认, setShowReimport确认] = useState(false);
  const [pdfDownloading, setPdfDownloading] = useState(false);
  const [rendererUpdating, setRendererUpdating] = useState(false);
  const [dirty, setDirty] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importFileInputRef = useRef<HTMLInputElement>(null);
  const editVersionRef = useRef(0);
  const draftRef = useRef<DesignResumeDocument | null>(null);
  draftRef.current = draft;

  const pdfRenderer = settings?.pdfRenderer?.value ?? "rxresume";
  const canDownloadPdf = status?.exists && !pdfDownloading;
  const pictureEnabled = Boolean(tracerReadiness?.isPubliclyAvailable);
  const pictureDisabledReason =
    tracerReadiness?.reason ??
    "Pictures require JobOps to be reachable at a public URL.";

  useEffect(() => {
    if (!document) return;
    setDraft(document);
    setDirty(false);
  }, [document]);

  useEffect(() => {
    if (
      !draft ||
      !document ||
      !dirty ||
      saveState === "saving" ||
      saveState === "error"
    ) {
      return;
    }

    const timer = window.setTimeout(async () => {
      const editVersionAtStart = editVersionRef.current;
      const baseRevision = draft.revision;
      const documentSnapshot = structuredClone(draft.resumeJson);

      try {
        set保存State("saving");
        const updated = await api.updateDesignResume({
          baseRevision,
          document: documentSnapshot,
        });
        if (editVersionRef.current === editVersionAtStart) {
          queryClient.setQueryData(queryKeys.designResume.current(), updated);
          queryClient.setQueryData(queryKeys.designResume.status(), {
            exists: true,
            documentId: updated.id,
            updatedAt: updated.updatedAt,
          });
          setDraft(updated);
          setDirty(false);
          set保存State("saved");
          return;
        }

        // Keep any newer local edits, but advance the base revision for the
        // next autosave cycle so stale responses never clobber in-flight work.
        setDraft((current) =>
          current
            ? {
                ...updated,
                resumeJson: current.resumeJson,
              }
            : updated,
        );
        set保存State("idle");
      } catch (saveError) {
        set保存State("error");
        showErrorToast(saveError, "Failed to save Design Resume.");
      }
    }, 700);

    return () => window.clearTimeout(timer);
  }, [dirty, draft, document, queryClient, saveState]);

  const setDesignResume = (next: DesignResumeDocument) => {
    queryClient.setQueryData(queryKeys.designResume.current(), next);
    queryClient.setQueryData(queryKeys.designResume.status(), {
      exists: true,
      documentId: next.id,
      updatedAt: next.updatedAt,
    });
    setDraft(next);
    setDirty(false);
  };

  const ensureLatestPersistedDraft =
    async (): Promise<DesignResumeDocument | null> => {
      if (!draft) return null;
      if (!dirty) return draft;
      if (saveState === "saving") {
        throw new Error(
          "Design Resume is still saving. Try again in a moment.",
        );
      }

      const editVersionAtStart = editVersionRef.current;
      const baseRevision = draft.revision;
      const documentSnapshot = structuredClone(draft.resumeJson);

      set保存State("saving");
      const updated = await api.updateDesignResume({
        baseRevision,
        document: documentSnapshot,
      });

      if (editVersionRef.current === editVersionAtStart) {
        setDesignResume(updated);
        set保存State("saved");
        return updated;
      }

      const mergedResumeJson =
        draftRef.current?.resumeJson ?? updated.resumeJson;
      const mergedDraft = {
        ...updated,
        resumeJson: structuredClone(mergedResumeJson) as DesignResumeJson,
      };
      setDraft((current) =>
        current
          ? {
              ...updated,
              resumeJson: current.resumeJson,
            }
          : updated,
      );
      setDirty(true);
      set保存State("idle");
      return mergedDraft;
    };

  const updateResumeJson = (
    updater: (resumeJson: DesignResumeJson) => DesignResumeJson,
  ) => {
    editVersionRef.current += 1;
    setDraft((current) => {
      if (!current) return current;
      return {
        ...current,
        resumeJson: updater(current.resumeJson),
      };
    });
    setDirty(true);
    if (saveState === "saved" || saveState === "error") set保存State("idle");
  };

  const activeDialogItem = useMemo(() => {
    if (!dialogState) return null;
    return (
      dialogState.seed ??
      (dialogState.index == null
        ? dialogState.definition.createItem()
        : getDesignResumeDialogItem(
            draft,
            dialogState.definition,
            dialogState.index,
          ))
    );
  }, [dialogState, draft]);

  const handleImport = async () => {
    try {
      set保存State("saving");
      const imported = await api.importDesignResumeFromRxResume();
      setDesignResume(imported);
      set保存State("saved");
      toast.success("Imported your resume.");
    } catch (importError) {
      set保存State("error");
      showErrorToast(importError, "Failed to import your resume.");
    }
  };

  const handleImportWith确认 = () => {
    if (status?.exists) {
      setShowReimport确认(true);
    } else {
      void handleImport();
    }
  };

  const handleImportFile = async (file: File) => {
    try {
      setResumeImporting(true);
      const dataUrl = await fileToDataUrl(file);
      const match = /^data:([^;]+);base64,(.+)$/s.exec(dataUrl.trim());

      if (!match) {
        throw new Error("Resume file could not be encoded for upload.");
      }

      const imported = await api.importDesignResumeFromFile({
        file名称: file.name,
        mediaType: file.type || match[1],
        dataBase64: match[2],
      });
      setDesignResume(imported);
      set保存State("saved");
      toast.success("Imported your resume file.");
    } catch (importError) {
      set保存State("error");
      showErrorToast(importError, "Failed to import your resume file.");
    } finally {
      setResumeImporting(false);
      if (importFileInputRef.current) {
        importFileInputRef.current.value = "";
      }
    }
  };

  const handleExport = async () => {
    try {
      const exported = await api.exportDesignResume();
      makeDownload(exported.file名称, exported.document);
      toast.success("Exported your resume JSON.");
    } catch (exportError) {
      showErrorToast(exportError, "Failed to export Design Resume.");
    }
  };

  const handleDownloadPdf = async () => {
    try {
      setPdfDownloading(true);
      const generated = await api.generateDesignResumePdf();
      await downloadDesignResumePdf(generated.file名称);
      toast.success("Your PDF is ready.");
    } catch (downloadError) {
      showErrorToast(downloadError, "Failed to generate a PDF.");
    } finally {
      setPdfDownloading(false);
    }
  };

  const handleUploadPicture = async (file: File) => {
    if (!pictureEnabled) {
      toast.error(pictureDisabledReason);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    try {
      setPictureUploading(true);
      const latestDraft = await ensureLatestPersistedDraft();
      if (!latestDraft) return;

      const editVersionAtStart = editVersionRef.current;
      const updated = await api.uploadDesignResumePictureFile({
        file,
        baseRevision: latestDraft.revision,
      });
      if (editVersionRef.current === editVersionAtStart) {
        setDesignResume(updated);
      } else {
        setDraft((current) =>
          current
            ? {
                ...updated,
                resumeJson: current.resumeJson,
              }
            : updated,
        );
        setDirty(true);
        set保存State("idle");
      }
      toast.success("Picture uploaded.");
    } catch (uploadError) {
      showErrorToast(uploadError, "Failed to upload picture.");
    } finally {
      setPictureUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handle删除Picture = async () => {
    try {
      const latestDraft = await ensureLatestPersistedDraft();
      if (!latestDraft) return;

      const editVersionAtStart = editVersionRef.current;
      const updated = await api.deleteDesignResumePicture({
        baseRevision: latestDraft.revision,
        document: latestDraft.resumeJson,
      });
      if (editVersionRef.current === editVersionAtStart) {
        setDesignResume(updated);
      } else {
        setDraft((current) =>
          current
            ? {
                ...updated,
                resumeJson: current.resumeJson,
              }
            : updated,
        );
        setDirty(true);
        set保存State("idle");
      }
      toast.success("Picture removed.");
    } catch (deleteError) {
      showErrorToast(deleteError, "Failed to delete picture.");
    }
  };

  const handlePdfRendererChange = async (nextRenderer: PdfRenderer) => {
    if (settingsLoading || nextRenderer === pdfRenderer) return;

    try {
      setRendererUpdating(true);
      const updated设置 = await api.update设置({
        pdfRenderer: nextRenderer,
      });
      queryClient.setQueryData(queryKeys.settings.current(), updated设置);
      toast.success(
        nextRenderer === "latex"
          ? "Jake's template is now active."
          : "React Resume Renderer is now active.",
      );
    } catch (updateError) {
      showErrorToast(updateError, "Failed to update the resume template.");
    } finally {
      setRendererUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <PageHeader
          icon={PenSquare}
          title="Design Resume"
          subtitle="Loading your resume"
        />
        <PageMain>
          <div class名称="rounded-2xl border border-border/70 bg-background/95 px-6 py-20 text-center text-sm text-muted-foreground">
            Loading Design Resume...
          </div>
        </PageMain>
      </>
    );
  }

  const rail = draft ? (
    <DesignResumeRail
      draft={draft}
      on更新ResumeJson={updateResumeJson}
      onOpenDialog={(definition, index) =>
        setDialogState({
          definition,
          index,
          seed:
            index == null
              ? definition.createItem()
              : getDesignResumeDialogItem(draft, definition, index),
        })
      }
      onUploadPicture={() => fileInputRef.current?.click()}
      on删除Picture={handle删除Picture}
      pictureUploading={pictureUploading}
      pictureEnabled={pictureEnabled}
      pictureDisabledReason={pictureDisabledReason}
    />
  ) : null;

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        class名称="hidden"
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          if (file) {
            void handleUploadPicture(file);
          }
        }}
      />
      <input
        ref={importFileInputRef}
        type="file"
        accept="application/pdf,.pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx"
        class名称="hidden"
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          if (file) {
            void handleImportFile(file);
          }
        }}
      />

      <PageHeader
        icon={PenSquare}
        title="Design Resume"
        subtitle="编辑 your resume details"
        actions={
          <div class名称="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:flex-nowrap sm:justify-end">
            <Sheet open={mobileRailOpen} onOpenChange={setMobileRailOpen}>
              <SheetTrigger asChild>
                <Button type="button" variant="outline" class名称="lg:hidden">
                  <PanelLeft class名称="mr-2 h-4 w-4" />
                  编辑
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                class名称="w-full max-w-[28rem] overflow-y-auto"
              >
                <SheetHeader>
                  <Sheet标题>Design Resume</Sheet标题>
                </SheetHeader>
                <div class名称="mt-6">{rail}</div>
              </SheetContent>
            </Sheet>

            <div class名称="hidden items-center gap-2 sm:flex">
              <Button
                type="button"
                variant="outline"
                onClick={() => importFileInputRef.current?.click()}
                disabled={resumeImporting}
              >
                <Import class名称="mr-2 h-4 w-4" />
                {resumeImporting ? "Importing File" : "Import File"}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleImportWith确认}
              >
                <Import class名称="mr-2 h-4 w-4" />
                {status?.exists ? "Re-import RxResume" : "Import RxResume"}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleDownloadPdf}
                disabled={!canDownloadPdf}
              >
                <FileDown class名称="mr-2 h-4 w-4" />
                {pdfDownloading ? "Preparing PDF" : "Download PDF"}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleExport}
                disabled={!status?.exists}
              >
                <Download class名称="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  class名称="ml-auto sm:hidden"
                  aria-label="Open resume actions"
                >
                  <MoreHorizontal class名称="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" class名称="w-48">
                <DropdownMenuItem
                  onSelect={() => importFileInputRef.current?.click()}
                  disabled={resumeImporting}
                >
                  <Import class名称="mr-2 h-4 w-4" />
                  {resumeImporting ? "Importing File" : "Import File"}
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleImportWith确认()}>
                  <Import class名称="mr-2 h-4 w-4" />
                  {status?.exists ? "Re-import RxResume" : "Import RxResume"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => handleDownloadPdf()}
                  disabled={!canDownloadPdf}
                >
                  <FileDown class名称="mr-2 h-4 w-4" />
                  {pdfDownloading ? "Preparing PDF" : "Download PDF"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => handleExport()}
                  disabled={!status?.exists}
                >
                  <Download class名称="mr-2 h-4 w-4" />
                  Export JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        }
      />

      <PageMain class名称="h-[calc(100dvh-5rem)] overflow-hidden">
        {!draft ? (
          <div class名称="flex h-full items-center justify-center rounded-2xl border border-border/70 bg-background/95 px-6 py-20 text-center">
            <div class名称="mx-auto max-w-xl space-y-4">
              <div class名称="inline-flex rounded-full border border-border/70 bg-muted/20 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                Design Resume
              </div>
              <h2 class名称="text-3xl font-semibold tracking-tight text-foreground">
                Import your resume to start editing it here.
              </h2>
              <p class名称="text-sm leading-7 text-muted-foreground">
                Once imported, you can update your resume here without jumping
                between tools.
              </p>
              <div class名称="flex justify-center gap-3">
                <Button type="button" onClick={handleImport}>
                  <Import class名称="mr-2 h-4 w-4" />
                  Import resume
                </Button>
                {error ? (
                  <div class名称="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm text-rose-300">
                    {formatUserFacingError(
                      error,
                      "Unable to load Design Resume.",
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        ) : (
          <div class名称="grid h-full min-h-0 gap-6 lg:grid-cols-[400px_minmax(0,1fr)] xl:grid-cols-[500px_minmax(0,1fr)]">
            <aside class名称="hidden min-h-0 lg:block">
              <div class名称="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-border/70 bg-muted/20">
                <div class名称="border-b border-border/70 px-4 py-4">
                  <div class名称="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Design Resume
                  </div>
                  <p class名称="mt-1 text-xs text-muted-foreground">
                    更新 your resume details here. Changes save automatically.
                  </p>
                </div>
                <div class名称="min-h-0 flex-1 overflow-y-auto p-4">{rail}</div>
              </div>
            </aside>

            <DesignResumePreviewPanel
              draft={draft}
              pdfRenderer={pdfRenderer}
              isUpdatingRenderer={rendererUpdating || settingsLoading}
              isDirty={dirty}
              saveState={saveState}
              onPdfRendererChange={handlePdfRendererChange}
            />
          </div>
        )}
      </PageMain>

      {dialogState && draft ? (
        <ItemDialog
          open={Boolean(dialogState)}
          title={`${dialogState.index == null ? "添加" : "编辑"} ${dialogState.definition.singular标题}`}
          description={dialogState.definition.description}
          item={activeDialogItem}
          fields={dialogState.definition.fields}
          onOpenChange={(open) => {
            if (!open) setDialogState(null);
          }}
          on保存={(item) => {
            updateResumeJson((current) => {
              const next = structuredClone(current);
              const sections = (asRecord(next.sections) ?? {}) as Record<
                string,
                unknown
              >;
              const section = (asRecord(sections[dialogState.definition.key]) ??
                {}) as Record<string, unknown>;
              const items = asArray(section.items).map(
                (entry) => asRecord(entry) ?? {},
              ) as Record<string, unknown>[];
              const nextItems =
                dialogState.index == null
                  ? [...items, item]
                  : items.map((entry, index) =>
                      index === dialogState.index ? item : entry,
                    );
              next.sections = {
                ...sections,
                [dialogState.definition.key]: {
                  ...section,
                  // Ensure the edited section is visible in rendered output.
                  hidden: false,
                  items: nextItems,
                },
              } as DesignResumeJson["sections"];
              return next;
            });
          }}
          on删除={
            dialogState.index == null
              ? undefined
              : () => {
                  updateResumeJson((current) => {
                    const next = structuredClone(current);
                    const sections = (asRecord(next.sections) ?? {}) as Record<
                      string,
                      unknown
                    >;
                    const section = (asRecord(
                      sections[dialogState.definition.key],
                    ) ?? {}) as Record<string, unknown>;
                    const items = asArray(section.items).filter(
                      (_, index) => index !== dialogState.index,
                    );
                    next.sections = {
                      ...sections,
                      [dialogState.definition.key]: {
                        ...section,
                        // Keep section visible after inline list edits.
                        hidden: false,
                        items,
                      },
                    } as DesignResumeJson["sections"];
                    return next;
                  });
                  setDialogState(null);
                }
          }
        />
      ) : null}

      <AlertDialog
        open={showReimport确认}
        onOpenChange={setShowReimport确认}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialog标题>Re-import from RxResume?</AlertDialog标题>
            <AlertDialog描述>
              This will replace your current Design Resume with the latest data
              from RxResume. Any edits you've made here will be permanently
              overwritten and cannot be undone.
            </AlertDialog描述>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialog取消>取消</AlertDialog取消>
            <AlertDialogAction
              class名称="bg-[#F1703E] text-white hover:bg-[#d9612f]"
              onClick={() => {
                setShowReimport确认(false);
                void handleImport();
              }}
            >
              <Import class名称="mr-2 h-4 w-4" />
              Re-import
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
