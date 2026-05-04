import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import * as React from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const AlertDialog = AlertDialogPrimitive.Root;

const AlertDialogTrigger = AlertDialogPrimitive.Trigger;

const AlertDialogPortal = AlertDialogPrimitive.Portal;

const AlertDialogOverlay = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ class名称, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    class名称={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      class名称,
    )}
    {...props}
    ref={ref}
  />
));
AlertDialogOverlay.display名称 = AlertDialogPrimitive.Overlay.display名称;

const AlertDialogContent = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>
>(({ class名称, ...props }, ref) => (
  <AlertDialogPortal>
    <AlertDialogOverlay />
    <AlertDialogPrimitive.Content
      ref={ref}
      class名称={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg",
        class名称,
      )}
      {...props}
    />
  </AlertDialogPortal>
));
AlertDialogContent.display名称 = AlertDialogPrimitive.Content.display名称;

const AlertDialogHeader = ({
  class名称,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    class名称={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      class名称,
    )}
    {...props}
  />
);
AlertDialogHeader.display名称 = "AlertDialogHeader";

const AlertDialogFooter = ({
  class名称,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    class名称={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      class名称,
    )}
    {...props}
  />
);
AlertDialogFooter.display名称 = "AlertDialogFooter";

const AlertDialog标题 = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.标题>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.标题>
>(({ class名称, ...props }, ref) => (
  <AlertDialogPrimitive.标题
    ref={ref}
    class名称={cn("text-lg font-semibold", class名称)}
    {...props}
  />
));
AlertDialog标题.display名称 = AlertDialogPrimitive.标题.display名称;

const AlertDialog描述 = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.描述>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.描述>
>(({ class名称, ...props }, ref) => (
  <AlertDialogPrimitive.描述
    ref={ref}
    class名称={cn("text-sm text-muted-foreground", class名称)}
    {...props}
  />
));
AlertDialog描述.display名称 =
  AlertDialogPrimitive.描述.display名称;

const AlertDialogAction = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>
>(({ class名称, ...props }, ref) => (
  <AlertDialogPrimitive.Action
    ref={ref}
    class名称={cn(buttonVariants(), class名称)}
    {...props}
  />
));
AlertDialogAction.display名称 = AlertDialogPrimitive.Action.display名称;

const AlertDialog取消 = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.取消>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.取消>
>(({ class名称, ...props }, ref) => (
  <AlertDialogPrimitive.取消
    ref={ref}
    class名称={cn(
      buttonVariants({ variant: "outline" }),
      "mt-2 sm:mt-0",
      class名称,
    )}
    {...props}
  />
));
AlertDialog取消.display名称 = AlertDialogPrimitive.取消.display名称;

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialog标题,
  AlertDialog描述,
  AlertDialogAction,
  AlertDialog取消,
};
