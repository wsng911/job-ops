import type { BranchInfo, JobChatMessage } from "@shared/types";
import { Check, Copy, Pencil, RefreshCcw } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import { showErrorToast } from "@/client/lib/error-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { bucketQueryLength, trackProductEvent } from "@/lib/analytics";
import { BranchNavigator } from "./BranchNavigator";
import { StreamingMessage } from "./StreamingMessage";

type MessageListProps = {
  messages: JobChatMessage[];
  branches: BranchInfo[];
  isStreaming: boolean;
  streamingMessageId: string | null;
  onRegenerate: (messageId: string) => void;
  on编辑: (messageId: string, content: string) => void;
  onSwitchBranch: (messageId: string) => void;
};

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  branches,
  isStreaming,
  streamingMessageId,
  onRegenerate,
  on编辑,
  onSwitchBranch,
}) => {
  const [editingMessageId, set编辑ingMessageId] = useState<string | null>(null);
  const [editContent, set编辑Content] = useState("");
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const copiedTimeoutRef = useRef<number | null>(null);

  const branchMap = new Map<string, BranchInfo>();
  for (const branch of branches) {
    branchMap.set(branch.messageId, branch);
  }

  const start编辑ing = (message: JobChatMessage) => {
    set编辑ingMessageId(message.id);
    set编辑Content(message.content);
  };

  const cancel编辑ing = () => {
    set编辑ingMessageId(null);
    set编辑Content("");
  };

  const submit编辑 = (messageId: string) => {
    const content = editContent.trim();
    if (!content) return;
    on编辑(messageId, content);
    set编辑ingMessageId(null);
    set编辑Content("");
  };

  useEffect(() => {
    return () => {
      if (copiedTimeoutRef.current !== null) {
        window.clearTimeout(copiedTimeoutRef.current);
      }
    };
  }, []);

  const copyMessage = async (messageId: string, content: string) => {
    if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
      toast.error("Copy is not available in this browser context");
      return;
    }
    try {
      await navigator.clipboard.writeText(content);
      trackProductEvent("ghostwriter_response_copied", {
        message_length_bucket: bucketQueryLength(content),
      });
      setCopiedMessageId(messageId);
      if (copiedTimeoutRef.current !== null) {
        window.clearTimeout(copiedTimeoutRef.current);
      }
      copiedTimeoutRef.current = window.setTimeout(() => {
        setCopiedMessageId(null);
        copiedTimeoutRef.current = null;
      }, 2000);
    } catch (error) {
      showErrorToast(error, "Failed to copy response");
    }
  };

  return (
    <div class名称="space-y-3">
      {messages.length > 0 &&
        messages.map((message) => {
          const isUser = message.role === "user";
          const isActiveStreaming =
            isStreaming &&
            message.role === "assistant" &&
            streamingMessageId === message.id;
          const is编辑ing = editingMessageId === message.id;
          const canCopyResponse =
            message.role === "assistant" &&
            message.status === "complete" &&
            !isStreaming &&
            !isActiveStreaming;
          const branch = branchMap.get(message.id);

          return (
            <div
              key={message.id}
              class名称={`group rounded-lg border p-3 ${
                isUser
                  ? "border-primary/30 bg-primary/5"
                  : "border-border/60 bg-background"
              }`}
            >
              <div class名称="mb-1 flex items-center gap-2">
                <span class名称="text-[10px] uppercase tracking-wide text-muted-foreground">
                  {isUser ? "You" : "Ghostwriter"}
                </span>
                {branch && (
                  <BranchNavigator
                    branchInfo={branch}
                    onSwitch={onSwitchBranch}
                  />
                )}
                <div class名称="ml-auto flex items-center gap-1 opacity-100 transition-opacity sm:pointer-events-none sm:opacity-0 sm:group-hover:pointer-events-auto sm:group-hover:opacity-100 sm:group-focus-within:pointer-events-auto sm:group-focus-within:opacity-100">
                  {isUser && !isStreaming && !is编辑ing && (
                    <button
                      type="button"
                      onClick={() => start编辑ing(message)}
                      class名称="rounded p-1 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                      aria-label="编辑 message"
                      title="编辑 message"
                    >
                      <Pencil class名称="h-3 w-3" />
                    </button>
                  )}
                  {!isUser && !isStreaming && !isActiveStreaming && (
                    <>
                      {canCopyResponse ? (
                        <button
                          type="button"
                          onClick={() =>
                            void copyMessage(message.id, message.content)
                          }
                          class名称="inline-flex items-center gap-1 rounded px-1.5 py-1 text-[11px] text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                          aria-label="Copy response"
                          title="Copy response"
                        >
                          {copiedMessageId === message.id ? (
                            <Check class名称="h-3 w-3" />
                          ) : (
                            <Copy class名称="h-3 w-3" />
                          )}
                          <span>
                            {copiedMessageId === message.id ? "Copied" : "Copy"}
                          </span>
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => onRegenerate(message.id)}
                        class名称="rounded p-1 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                        aria-label="Regenerate response"
                        title="Regenerate response"
                      >
                        <RefreshCcw class名称="h-3 w-3" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {is编辑ing ? (
                <div class名称="space-y-2">
                  <Textarea
                    value={editContent}
                    onChange={(e) => set编辑Content(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        cancel编辑ing();
                      }
                    }}
                    class名称="min-h-[60px]"
                    autoFocus
                  />
                  <div class名称="flex items-center justify-end gap-1">
                    <Button size="sm" variant="ghost" onClick={cancel编辑ing}>
                      取消
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => submit编辑(message.id)}
                      disabled={!editContent.trim()}
                    >
                      提交
                    </Button>
                  </div>
                </div>
              ) : isActiveStreaming ? (
                <StreamingMessage content={message.content} />
              ) : message.role === "assistant" ? (
                <div class名称="text-sm leading-relaxed text-foreground [&_a]:text-primary [&_a]:underline [&_blockquote]:border-l [&_blockquote]:border-border [&_blockquote]:pl-3 [&_code]:rounded [&_code]:bg-muted/40 [&_code]:px-1 [&_h1]:mt-4 [&_h1]:text-base [&_h1]:font-semibold [&_h2]:mt-4 [&_h2]:text-sm [&_h2]:font-semibold [&_h3]:mt-3 [&_h3]:text-sm [&_h3]:font-semibold [&_li]:my-1 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-2 [&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded [&_pre]:bg-muted/40 [&_pre]:p-3 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message.content || "..."}
                  </ReactMarkdown>
                </div>
              ) : (
                <div class名称="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                  {message.content}
                </div>
              )}
            </div>
          );
        })}
    </div>
  );
};
