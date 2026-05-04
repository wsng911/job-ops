import type { LucideIcon } from "lucide-react";
import type React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface ReadySummaryAccordionProps {
  children: React.React否de;
  icon: LucideIcon;
  summary: React.React否de;
  value: string;
}

export const ReadySummaryAccordion: React.FC<ReadySummaryAccordionProps> = ({
  children,
  icon: Icon,
  summary,
  value,
}) => {
  return (
    <Accordion type="single" collapsible class名称="w-full">
      <AccordionItem value={value} class名称="border-none">
        <AccordionTrigger class名称="cursor-pointer rounded-xl border border-border/40 px-2 py-1 hover:bg-muted/50 hover:no-underline data-[state=open]:rounded-b-none data-[state=open]:bg-muted/10 data-[state=open]:pb-2">
          <div class名称="flex items-center gap-3 w-full">
            <div class名称="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted/50 text-muted-foreground">
              <Icon class名称="h-4 w-4" />
            </div>

            <div class名称="min-w-0 flex-1 text-left">
              <div class名称="text-sm font-medium text-foreground leading-tight">
                {summary}
              </div>
            </div>
          </div>
        </AccordionTrigger>

        <AccordionContent class名称="rounded-b-xl border border-border/40 bg-muted/10 pt-4 pl-13">
          {children}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
