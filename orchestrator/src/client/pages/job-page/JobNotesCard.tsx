import type { Job否te } from "@shared/types.js";
import { useQuery } from "@tanstack/react-query";
import { 编辑2, FileText, PlusCircle, Trash2 } from "lucide-react";
import React from "react";
import { toast } from "sonner";
import * as api from "@/client/api";
import { 确认删除 } from "@/client/components/确认删除";
import { RichText编辑or } from "@/client/components/design-resume/RichText编辑or";
import { Job描述Markdown } from "@/client/components/Job描述Markdown";
import {
  use创建Job否teMutation,
  use删除Job否teMutation,
  use更新Job否teMutation,
} from "@/client/hooks/queries/useJobMutations";
import { useQueryErrorToast } from "@/client/hooks/useQueryErrorToast";
import { showErrorToast } from "@/client/lib/error-toast";
import { getRenderableJob描述 } from "@/client/lib/job描述";
import {
  markdownTo编辑orHtml as markdownToTipTapHtml,
  editorHtmlToMarkdown as tipTapHtmlToMarkdown,
} from "@/client/lib/job否teContent";
import { queryKeys } from "@/client/lib/queryKeys";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, Card标题 } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn, formatDateTime } from "@/lib/utils";

const sort否tesBy更新dAtDesc = (notes: Job否te[]) =>
  [...notes].sort(
    (left, right) =>
      new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
  );

type Job否tesCardProps = {
  jobId: string;
};

export const Job否tesCard: React.FC<Job否tesCardProps> = ({ jobId }) => {
  const [editorState, set编辑orState] = React.useState<
    { mode: "create" } | { mode: "edit"; noteId: string } | null
  >(null);
  const [selected否teId, setSelected否teId] = React.useState<string | null>(
    null,
  );
  const [draft标题, setDraft标题] = React.useState("");
  const [draftContent, setDraftContent] = React.useState("");
  const [editorError, set编辑orError] = React.useState<string | null>(null);
  const [noteTo删除, set否teTo删除] = React.useState<Job否te | null>(null);

  const notesQuery = useQuery<Job否te[]>({
    queryKey: queryKeys.jobs.notes(jobId),
    queryFn: () => api.getJob否tes(jobId),
    enabled: Boolean(jobId),
  });
  const create否teMutation = use创建Job否teMutation();
  const update否teMutation = use更新Job否teMutation();
  const delete否teMutation = use删除Job否teMutation();

  useQueryErrorToast(
    notesQuery.error,
    "Failed to load notes. Please try again.",
  );

  const notes = React.useMemo(
    () => sort否tesBy更新dAtDesc(notesQuery.data ?? []),
    [notesQuery.data],
  );
  const selected否te = React.useMemo(
    () => notes.find((note) => note.id === selected否teId) ?? notes[0] ?? null,
    [notes, selected否teId],
  );
  const isSaving = create否teMutation.isPending || update否teMutation.isPending;
  const isDeleting = delete否teMutation.isPending;

  const reset编辑or = React.useCallback(() => {
    set编辑orState(null);
    setDraft标题("");
    setDraftContent("");
    set编辑orError(null);
  }, []);

  const open创建编辑or = React.useCallback(() => {
    set编辑orState({ mode: "create" });
    setSelected否teId(null);
    setDraft标题("");
    setDraftContent("");
    set编辑orError(null);
  }, []);

  const open编辑编辑or = React.useCallback((note: Job否te) => {
    set编辑orState({ mode: "edit", noteId: note.id });
    setDraft标题(note.title);
    setDraftContent(markdownToTipTapHtml(note.content));
    set编辑orError(null);
    setSelected否teId(note.id);
  }, []);

  const confirm删除否te = React.useCallback((note: Job否te) => {
    set否teTo删除(note);
  }, []);

  const save否te = React.useCallback(async () => {
    const title = draft标题.trim();
    const content = tipTapHtmlToMarkdown(draftContent).trim();

    if (!title || !content) {
      set编辑orError("标题 and note content are required.");
      return;
    }

    try {
      const saved否te =
        editorState?.mode === "edit"
          ? await update否teMutation.mutateAsync({
              jobId,
              noteId: editorState.noteId,
              input: { title, content },
            })
          : await create否teMutation.mutateAsync({
              jobId,
              input: { title, content },
            });

      toast.success("否te saved");
      setSelected否teId(saved否te.id);
      reset编辑or();
    } catch (error) {
      showErrorToast(error, "Failed to save note");
    }
  }, [
    create否teMutation,
    draftContent,
    draft标题,
    editorState,
    jobId,
    reset编辑or,
    update否teMutation,
  ]);

  const handle删除否te = React.useCallback(async () => {
    if (!noteTo删除) return;

    try {
      await delete否teMutation.mutateAsync({
        jobId,
        noteId: noteTo删除.id,
      });
      toast.success("否te deleted");
      if (selected否teId === noteTo删除.id) {
        const next否te = notes.find((note) => note.id !== noteTo删除.id);
        setSelected否teId(next否te?.id ?? null);
      }
      if (
        editorState?.mode === "edit" &&
        editorState.noteId === noteTo删除.id
      ) {
        reset编辑or();
      }
    } catch (error) {
      showErrorToast(error, "Failed to delete note");
    } finally {
      set否teTo删除(null);
    }
  }, [
    delete否teMutation,
    editorState,
    jobId,
    noteTo删除,
    notes,
    reset编辑or,
    selected否teId,
  ]);

  const can编辑Other否tes = editorState === null;

  React.useEffect(() => {
    if (editorState) return;
    if (notes.length === 0) {
      setSelected否teId(null);
      return;
    }

    if (!selected否teId || !notes.some((note) => note.id === selected否teId)) {
      setSelected否teId(notes[0]?.id ?? null);
    }
  }, [editorState, notes, selected否teId]);

  const startViewing否te = React.useCallback(
    (note: Job否te) => {
      if (editorState) return;
      setSelected否teId(note.id);
    },
    [editorState],
  );

  const selectedTimestamp = selected否te
    ? (formatDateTime(selected否te.updatedAt) ?? selected否te.updatedAt)
    : null;

  return (
    <section data-testid="job-notes-section" class名称="w-full">
      <Card class名称="border-border/50">
        <CardHeader>
          <div class名称="flex flex-wrap items-center justify-between gap-3">
            <Card标题 class名称="flex items-center gap-2 text-base">
              <FileText class名称="h-4 w-4" />
              否tes
            </Card标题>
            {!editorState && (
              <Button size="sm" variant="outline" onClick={open创建编辑or}>
                <PlusCircle class名称="mr-1.5 h-3.5 w-3.5" />
                添加 note
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div class名称="grid gap-6 lg:grid-cols-[minmax(14rem,0.7fr)_minmax(0,1.3fr)]">
            <aside data-testid="job-notes-list" class名称="space-y-3">
              {!editorState && notesQuery.isLoading && notes.length === 0 && (
                <div class名称="rounded-xl border border-dashed border-border/60 bg-muted/10 p-4 text-sm text-muted-foreground">
                  Loading notes...
                </div>
              )}

              {!editorState && !notesQuery.isLoading && notes.length === 0 && (
                <div class名称="rounded-xl border border-dashed border-border/60 bg-muted/10 p-4 text-sm text-muted-foreground">
                  否 notes yet. Capture reminders, interview prep, or links in
                  markdown.
                </div>
              )}

              {notes.length > 0 && (
                <div class名称="space-y-2">
                  {notes.map((note) => {
                    const noteTimestamp =
                      formatDateTime(note.updatedAt) ?? note.updatedAt;
                    const isSelected = note.id === selected否teId;
                    return (
                      <Button
                        key={note.id}
                        type="button"
                        variant="ghost"
                        class名称={cn(
                          "h-auto w-full justify-start whitespace-normal rounded-xl border px-4 py-3 text-left font-normal transition",
                          isSelected
                            ? "border-primary/40 bg-primary/5 shadow-sm"
                            : "border-border/60 bg-background/70 hover:border-border hover:bg-muted/40",
                          editorState && "cursor-default opacity-70",
                        )}
                        onClick={() => startViewing否te(note)}
                        disabled={Boolean(editorState)}
                      >
                        <div class名称="flex items-start justify-between gap-3">
                          <div class名称="min-w-0">
                            <div class名称="truncate text-sm font-semibold">
                              {note.title}
                            </div>
                            <div class名称="mt-1 text-xs text-muted-foreground">
                              更新d {noteTimestamp}
                            </div>
                          </div>
                          {isSelected && !editorState && (
                            <Badge variant="secondary" class名称="text-[10px]">
                              Selected
                            </Badge>
                          )}
                        </div>
                      </Button>
                    );
                  })}
                </div>
              )}
            </aside>

            <div
              data-testid="job-notes-detail"
              class名称="min-w-0 rounded-2xl border border-border/60 bg-muted/10 p-4 shadow-sm"
            >
              {editorState ? (
                <form
                  class名称="space-y-4"
                  on提交={(event) => {
                    event.preventDefault();
                    void save否te();
                  }}
                >
                  <div class名称="flex flex-wrap items-start justify-between gap-3">
                    <div class名称="min-w-0">
                      <div class名称="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                        {editorState.mode === "create"
                          ? "新建 note"
                          : "编辑ing note"}
                      </div>
                      <div class名称="mt-1 text-lg font-semibold">
                        {editorState.mode === "create"
                          ? "Draft a note"
                          : draft标题 || selected否te?.title || "编辑 note"}
                      </div>
                    </div>
                    {editorState.mode === "edit" && selected否te && (
                      <Badge variant="secondary" class名称="text-[10px]">
                        更新d {selectedTimestamp}
                      </Badge>
                    )}
                  </div>

                  <div class名称="space-y-2">
                    <label
                      htmlFor="job-note-title"
                      class名称="text-[10px] uppercase tracking-wide text-muted-foreground"
                    >
                      标题
                    </label>
                    <Input
                      id="job-note-title"
                      autoFocus
                      value={draft标题}
                      onChange={(event) => {
                        setDraft标题(event.target.value);
                        set编辑orError(null);
                      }}
                      placeholder="Why I am applying"
                      disabled={isSaving || isDeleting}
                    />
                  </div>

                  <div class名称="space-y-2">
                    <div class名称="flex items-center justify-between gap-3">
                      <div class名称="text-[10px] uppercase tracking-wide text-muted-foreground">
                        Content
                      </div>
                      <div class名称="text-xs text-muted-foreground">
                        TipTap editor
                      </div>
                    </div>
                    <RichText编辑or
                      key={
                        editorState.mode === "edit"
                          ? editorState.noteId
                          : "create-note"
                      }
                      value={draftContent}
                      onChange={(next) => {
                        setDraftContent(next);
                        set编辑orError(null);
                      }}
                      placeholder="Capture answers, reminders, interview notes, and useful links."
                      class名称="bg-background/20"
                    />
                  </div>

                  {editorError && (
                    <div class名称="text-sm text-destructive">
                      {editorError}
                    </div>
                  )}

                  <div class名称="flex flex-wrap items-center gap-2">
                    <Button type="submit" disabled={isSaving || isDeleting}>
                      {isSaving ? "Saving..." : "保存 note"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={reset编辑or}
                      disabled={isSaving || isDeleting}
                    >
                      取消
                    </Button>
                    {editorState.mode === "edit" && selected否te && (
                      <Button
                        type="button"
                        variant="ghost"
                        class名称="text-destructive hover:text-destructive"
                        onClick={() => confirm删除否te(selected否te)}
                        disabled={isSaving || isDeleting}
                      >
                        删除 note
                      </Button>
                    )}
                  </div>
                </form>
              ) : selected否te ? (
                <div class名称="space-y-4">
                  <div class名称="flex flex-wrap items-start justify-between gap-3">
                    <div class名称="min-w-0">
                      <div class名称="text-lg font-semibold">
                        {selected否te.title}
                      </div>
                      <div class名称="mt-1 text-sm text-muted-foreground">
                        更新d {selectedTimestamp}
                      </div>
                    </div>
                    <div class名称="flex flex-wrap items-center gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => open编辑编辑or(selected否te)}
                        disabled={!can编辑Other否tes}
                        aria-label="编辑 note"
                        title="编辑 note"
                      >
                        <编辑2 class名称="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        class名称="text-destructive hover:text-destructive"
                        onClick={() => confirm删除否te(selected否te)}
                        disabled={!can编辑Other否tes}
                        aria-label="删除 note"
                        title="删除 note"
                      >
                        <Trash2 class名称="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div class名称="rounded-xl border border-border/60 bg-card/70 p-4">
                    <Job描述Markdown
                      description={getRenderableJob描述(
                        selected否te.content,
                      )}
                    />
                  </div>
                </div>
              ) : (
                <div class名称="flex min-h-[280px] flex-col items-start justify-between gap-4 rounded-xl border border-dashed border-border/60 bg-background/60 p-5">
                  <div class名称="space-y-2">
                    <div class名称="text-lg font-semibold">
                      否 note selected
                    </div>
                    <div class名称="max-w-xl text-sm text-muted-foreground">
                      否tes you add here can hold interview answers, contact
                      details, and application-specific reminders. Select a note
                      on the left or create a new one to get started.
                    </div>
                  </div>
                  {!editorState && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={open创建编辑or}
                    >
                      <PlusCircle class名称="mr-1.5 h-3.5 w-3.5" />
                      添加 note
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <确认删除
        isOpen={noteTo删除 !== null}
        on关闭={() => set否teTo删除(null)}
        on确认={() => void handle删除否te()}
        title="删除 note?"
        description="This will permanently delete this note from the job."
      />
    </section>
  );
};
