import type React from "react";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type DesignResumeSectionProps = {
  value: string;
  title: string;
  subtitle: string;
  children: React.React否de;
  badge?: string;
};

export function DesignResumeSection({
  value,
  title,
  subtitle,
  children,
  badge,
}: DesignResumeSectionProps) {
  return (
    <AccordionItem
      value={value}
      class名称="overflow-hidden rounded-xl border border-border/60 bg-card/40 px-0"
    >
      <AccordionTrigger class名称="px-4 py-3 text-left hover:no-underline">
        <div class名称="flex min-w-0 flex-1 items-center justify-between gap-3 pr-4">
          <div class名称="min-w-0 space-y-1">
            <h3 class名称="text-sm font-semibold text-foreground">{title}</h3>
            <p class名称="text-xs leading-5 text-muted-foreground">
              {subtitle}
            </p>
          </div>
          {badge ? (
            <div class名称="shrink-0 rounded-full border border-border/60 px-2 py-0.5 text-[11px] uppercase text-muted-foreground h-full">
              {badge}
            </div>
          ) : null}
        </div>
      </AccordionTrigger>
      <AccordionContent class名称="px-4 pb-4 pt-0">{children}</AccordionContent>
    </AccordionItem>
  );
}
