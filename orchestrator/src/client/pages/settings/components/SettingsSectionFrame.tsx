import type React from "react";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

type 设置SectionFrameProps = {
  children: React.React否de;
  class名称?: string;
  contentClass名称?: string;
  mode?: "accordion" | "panel";
  title: React.React否de;
  tone?: "default" | "danger";
  value: string;
};

export const 设置SectionFrame: React.FC<设置SectionFrameProps> = ({
  children,
  class名称,
  contentClass名称,
  mode = "accordion",
  title,
  tone = "default",
  value,
}) => {
  if (mode === "panel") {
    return (
      <section
        class名称={cn("space-y-4", tone === "danger" && "pt-2", class名称)}
      >
        <div class名称={cn("space-y-4", contentClass名称)}>{children}</div>
      </section>
    );
  }

  return (
    <AccordionItem
      value={value}
      class名称={cn(
        "rounded-lg border px-4",
        tone === "danger" && "mt-4 border-destructive/30",
        class名称,
      )}
    >
      <AccordionTrigger class名称="py-4 hover:no-underline">
        {typeof title === "string" ? (
          <span
            class名称={cn(
              "text-base font-semibold",
              tone === "danger" && "tracking-wider text-destructive",
            )}
          >
            {title}
          </span>
        ) : (
          title
        )}
      </AccordionTrigger>
      <AccordionContent class名称={cn("pb-4", contentClass名称)}>
        {children}
      </AccordionContent>
    </AccordionItem>
  );
};
