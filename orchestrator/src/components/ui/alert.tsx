import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        warning:
          "border-amber-500/30 bg-amber-500/10 text-amber-950 [&>svg]:text-amber-700 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-100 dark:[&>svg]:text-amber-300",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ class名称, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    class名称={cn(alertVariants({ variant }), class名称)}
    {...props}
  />
));
Alert.display名称 = "Alert";

const Alert标题 = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ class名称, ...props }, ref) => (
  <h5
    ref={ref}
    class名称={cn("mb-1 font-medium leading-none tracking-tight", class名称)}
    {...props}
  />
));
Alert标题.display名称 = "Alert标题";

const Alert描述 = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ class名称, ...props }, ref) => (
  <div
    ref={ref}
    class名称={cn("text-sm [&_p]:leading-relaxed", class名称)}
    {...props}
  />
));
Alert描述.display名称 = "Alert描述";

export { Alert, Alert标题, Alert描述 };
