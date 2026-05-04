"use client";

import * as ProgressPrimitive from "@radix-ui/react-progress";
import * as React from "react";

import { cn } from "@/lib/utils";

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ class名称, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    class名称={cn(
      "relative h-2 w-full overflow-hidden rounded-full bg-primary/20",
      class名称,
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      class名称="h-full w-full flex-1 bg-primary transition-all"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
));
Progress.display名称 = ProgressPrimitive.Root.display名称;

export { Progress };
