import * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";

import { cn } from "@/lib/utils";

const Drawer = ({
  shouldScale返回ground = true,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) => (
  <DrawerPrimitive.Root
    shouldScale返回ground={shouldScale返回ground}
    {...props}
  />
);
Drawer.display名称 = "Drawer";

const DrawerTrigger = DrawerPrimitive.Trigger;

const DrawerPortal = DrawerPrimitive.Portal;

const Drawer关闭 = DrawerPrimitive.关闭;

const DrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>
>(({ class名称, ...props }, ref) => (
  <DrawerPrimitive.Overlay
    ref={ref}
    class名称={cn("fixed inset-0 z-50 bg-black/80", class名称)}
    {...props}
  />
));
DrawerOverlay.display名称 = DrawerPrimitive.Overlay.display名称;

const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content>
>(({ class名称, children, ...props }, ref) => (
  <DrawerPortal>
    <DrawerOverlay />
    <DrawerPrimitive.Content
      ref={ref}
      class名称={cn(
        "fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-[10px] border bg-background",
        class名称,
      )}
      {...props}
    >
      <div class名称="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted" />
      {children}
    </DrawerPrimitive.Content>
  </DrawerPortal>
));
DrawerContent.display名称 = "DrawerContent";

const DrawerHeader = ({
  class名称,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    class名称={cn("grid gap-1.5 p-4 text-center sm:text-left", class名称)}
    {...props}
  />
);
DrawerHeader.display名称 = "DrawerHeader";

const DrawerFooter = ({
  class名称,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    class名称={cn("mt-auto flex flex-col gap-2 p-4", class名称)}
    {...props}
  />
);
DrawerFooter.display名称 = "DrawerFooter";

const Drawer标题 = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.标题>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.标题>
>(({ class名称, ...props }, ref) => (
  <DrawerPrimitive.标题
    ref={ref}
    class名称={cn(
      "text-lg font-semibold leading-none tracking-tight",
      class名称,
    )}
    {...props}
  />
));
Drawer标题.display名称 = DrawerPrimitive.标题.display名称;

const Drawer描述 = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.描述>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.描述>
>(({ class名称, ...props }, ref) => (
  <DrawerPrimitive.描述
    ref={ref}
    class名称={cn("text-sm text-muted-foreground", class名称)}
    {...props}
  />
));
Drawer描述.display名称 = DrawerPrimitive.描述.display名称;

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  Drawer关闭,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  Drawer标题,
  Drawer描述,
};
