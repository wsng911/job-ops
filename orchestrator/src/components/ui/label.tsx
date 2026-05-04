"use client";

import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
);

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ class名称, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    class名称={cn(labelVariants(), class名称)}
    {...props}
  />
));
Label.display名称 = LabelPrimitive.Root.display名称;

export { Label };
