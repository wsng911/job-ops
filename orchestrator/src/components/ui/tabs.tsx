import * as TabsPrimitive from "@radix-ui/react-tabs";
import * as React from "react";

import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ class名称, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    class名称={cn(
      "inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
      class名称,
    )}
    {...props}
  />
));
TabsList.display名称 = TabsPrimitive.List.display名称;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ class名称, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    class名称={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 aria-selected:bg-background aria-selected:text-foreground aria-selected:shadow",
      class名称,
    )}
    {...props}
  />
));
TabsTrigger.display名称 = TabsPrimitive.Trigger.display名称;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ class名称, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    class名称={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      class名称,
    )}
    {...props}
  />
));
TabsContent.display名称 = TabsPrimitive.Content.display名称;

export { Tabs, TabsList, TabsTrigger, TabsContent };
