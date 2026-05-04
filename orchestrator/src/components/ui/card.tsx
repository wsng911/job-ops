import * as React from "react";

import { cn } from "@/lib/utils";

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ class名称, ...props }, ref) => (
  <div
    ref={ref}
    class名称={cn(
      "rounded-xl border bg-card text-card-foreground shadow",
      class名称,
    )}
    {...props}
  />
));
Card.display名称 = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ class名称, ...props }, ref) => (
  <div
    ref={ref}
    class名称={cn("flex flex-col space-y-1.5 p-6", class名称)}
    {...props}
  />
));
CardHeader.display名称 = "CardHeader";

const Card标题 = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ class名称, ...props }, ref) => (
  <div
    ref={ref}
    class名称={cn("font-semibold leading-none tracking-tight", class名称)}
    {...props}
  />
));
Card标题.display名称 = "Card标题";

const Card描述 = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ class名称, ...props }, ref) => (
  <div
    ref={ref}
    class名称={cn("text-sm text-muted-foreground", class名称)}
    {...props}
  />
));
Card描述.display名称 = "Card描述";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ class名称, ...props }, ref) => (
  <div ref={ref} class名称={cn("p-6 pt-0", class名称)} {...props} />
));
CardContent.display名称 = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ class名称, ...props }, ref) => (
  <div
    ref={ref}
    class名称={cn("flex items-center p-6 pt-0", class名称)}
    {...props}
  />
));
CardFooter.display名称 = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  Card标题,
  Card描述,
  CardContent,
};
