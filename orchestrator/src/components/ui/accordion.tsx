"use client";

import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

const Accordion = AccordionPrimitive.Root;

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ class名称, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    class名称={cn("border-b", class名称)}
    {...props}
  />
));
AccordionItem.display名称 = "AccordionItem";

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ class名称, children, ...props }, ref) => (
  <AccordionPrimitive.Header class名称="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      class名称={cn(
        "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
        class名称,
      )}
      {...props}
    >
      {children}
      <ChevronDown class名称="h-4 w-4 shrink-0 transition-transform duration-200" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.display名称 = AccordionPrimitive.Trigger.display名称;

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ class名称, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    class名称="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div class名称={cn("pb-4 pt-0", class名称)}>{children}</div>
  </AccordionPrimitive.Content>
));

AccordionContent.display名称 = AccordionPrimitive.Content.display名称;

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
