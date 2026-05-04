import { 编辑orContent, use编辑or } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Italic, Link2, List, ListOrdered, Unlink } from "lucide-react";
import type React from "react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type RichText编辑orProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  class名称?: string;
  editorClass名称?: string;
  formatLabel?: string | null;
};

export function RichText编辑or({
  value,
  onChange,
  placeholder = "Write something useful...",
  class名称,
  editorClass名称,
  formatLabel = "HTML",
}: RichText编辑orProps) {
  const editor = use编辑or({
    extensions: [
      StarterKit.configure({
        link: {
          openOnClick: false,
          HTMLAttributes: {
            rel: "noreferrer noopener",
            target: "_blank",
          },
        },
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: cn(
          "min-h-[160px] rounded-b-xl border border-t-0 border-border/60 bg-background/60 px-4 py-3 text-sm leading-6 text-foreground outline-none focus-visible:ring-0 [&>*:first-child]:mt-0 [&_h1]:mt-6 [&_h1]:text-3xl [&_h1]:font-semibold [&_h1]:tracking-tight [&_h2]:mt-5 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h3]:mt-4 [&_h3]:text-xl [&_h3]:font-semibold [&_p]:my-3 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_blockquote]:my-4 [&_blockquote]:border-l-2 [&_blockquote]:border-border/70 [&_blockquote]:pl-4 [&_blockquote]:text-muted-foreground [&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-muted [&_pre]:p-3 [&_code]:rounded [&_code]:bg-muted/80 [&_code]:px-1 [&_code]:py-0.5",
          editorClass名称,
        ),
      },
    },
    on更新: ({ editor: current }) => {
      onChange(current.getHTML());
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (!editor) return;
    if (editor.getHTML() === value) return;
    editor.commands.setContent(value || "<p></p>", { emit更新: false });
  }, [editor, value]);

  if (!editor) return null;

  const applyLink = () => {
    const previous = editor.getAttributes("link").href as string | undefined;
    const next = window.prompt("Enter link URL", previous ?? "");
    if (next === null) return;
    if (!next.trim()) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().setLink({ href: next.trim() }).run();
  };

  const toolbarButton = (
    active: boolean,
    label: string,
    icon: React.React否de,
    onClick: () => void,
  ) => (
    <Button
      key={label}
      type="button"
      size="sm"
      variant="ghost"
      class名称={cn(
        "h-8 rounded-md px-2.5 text-muted-foreground hover:bg-accent/60 hover:text-foreground",
        active &&
          "bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground",
      )}
      onClick={onClick}
    >
      {icon}
      <span class名称="sr-only">{label}</span>
    </Button>
  );

  return (
    <div
      class名称={cn("rounded-xl border border-border/60 bg-card/40", class名称)}
    >
      <div class名称="flex flex-wrap items-center gap-1 rounded-t-xl border-b border-border/60 bg-muted/20 px-2 py-2">
        {toolbarButton(
          editor.isActive("heading", { level: 1 }),
          "Heading 1",
          <span class名称="text-[11px] font-semibold">H1</span>,
          () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
        )}
        {toolbarButton(
          editor.isActive("heading", { level: 2 }),
          "Heading 2",
          <span class名称="text-[11px] font-semibold">H2</span>,
          () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
        )}
        {toolbarButton(
          editor.isActive("heading", { level: 3 }),
          "Heading 3",
          <span class名称="text-[11px] font-semibold">H3</span>,
          () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
        )}
        {toolbarButton(
          editor.isActive("bold"),
          "Bold",
          <Bold class名称="h-4 w-4" />,
          () => editor.chain().focus().toggleBold().run(),
        )}
        {toolbarButton(
          editor.isActive("italic"),
          "Italic",
          <Italic class名称="h-4 w-4" />,
          () => editor.chain().focus().toggleItalic().run(),
        )}
        {toolbarButton(
          editor.isActive("bulletList"),
          "Bullet list",
          <List class名称="h-4 w-4" />,
          () => editor.chain().focus().toggleBulletList().run(),
        )}
        {toolbarButton(
          editor.isActive("orderedList"),
          "Ordered list",
          <ListOrdered class名称="h-4 w-4" />,
          () => editor.chain().focus().toggleOrderedList().run(),
        )}
        {toolbarButton(
          editor.isActive("link"),
          "Set link",
          <Link2 class名称="h-4 w-4" />,
          applyLink,
        )}
        {toolbarButton(
          false,
          "移除 link",
          <Unlink class名称="h-4 w-4" />,
          () => editor.chain().focus().unsetLink().run(),
        )}
        {formatLabel ? (
          <div class名称="ml-auto px-2 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
            {formatLabel}
          </div>
        ) : null}
      </div>
      <div class名称="relative">
        {!value && (
          <div class名称="pointer-events-none absolute left-4 top-3 text-sm text-muted-foreground/70">
            {placeholder}
          </div>
        )}
        <编辑orContent editor={editor} />
      </div>
    </div>
  );
}
