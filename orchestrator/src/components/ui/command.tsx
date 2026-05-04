import type { DialogProps } from "@radix-ui/react-dialog";
import { Command as CommandPrimitive } from "cmdk";
import { 搜索 } from "lucide-react";
import * as React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ class名称, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    class名称={cn(
      "flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground",
      class名称,
    )}
    {...props}
  />
));
Command.display名称 = CommandPrimitive.display名称;

interface CommandDialogProps extends DialogProps {
  contentClass名称?: string;
  commandClass名称?: string;
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
}

const CommandDialog = ({
  children,
  contentClass名称,
  commandClass名称,
  onEscapeKeyDown,
  ...props
}: CommandDialogProps) => {
  return (
    <Dialog {...props}>
      <DialogContent
        class名称={cn("overflow-hidden p-0", contentClass名称)}
        onEscapeKeyDown={onEscapeKeyDown}
      >
        <Command
          class名称={cn(
            "[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5",
            commandClass名称,
          )}
        >
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
};

interface CommandInputProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>,
    "prefix"
  > {
  prefix?: React.React否de;
  wrapperClass名称?: string;
}

const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  CommandInputProps
>(({ class名称, prefix, wrapperClass名称, ...props }, ref) => (
  <div
    class名称={cn("flex items-center border-b px-3", wrapperClass名称)}
    cmdk-input-wrapper=""
  >
    <搜索 class名称="mr-2 h-4 w-4 shrink-0 opacity-50" />
    {prefix ? (
      <div class名称="mr-2 flex shrink-0 items-center">{prefix}</div>
    ) : null}
    <CommandPrimitive.Input
      ref={ref}
      class名称={cn(
        "flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
        class名称,
      )}
      {...props}
    />
  </div>
));

CommandInput.display名称 = CommandPrimitive.Input.display名称;

const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ class名称, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    class名称={cn("max-h-[300px] overflow-y-auto overflow-x-hidden", class名称)}
    {...props}
  />
));

CommandList.display名称 = CommandPrimitive.List.display名称;

const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    class名称="py-6 text-center text-sm"
    {...props}
  />
));

CommandEmpty.display名称 = CommandPrimitive.Empty.display名称;

const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ class名称, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    class名称={cn(
      "overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground",
      class名称,
    )}
    {...props}
  />
));

CommandGroup.display名称 = CommandPrimitive.Group.display名称;

const CommandSeparator = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ class名称, ...props }, ref) => (
  <CommandPrimitive.Separator
    ref={ref}
    class名称={cn("-mx-1 h-px bg-border", class名称)}
    {...props}
  />
));
CommandSeparator.display名称 = CommandPrimitive.Separator.display名称;

const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ class名称, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    class名称={cn(
      "relative flex cursor-default gap-2 select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
      class名称,
    )}
    {...props}
  />
));

CommandItem.display名称 = CommandPrimitive.Item.display名称;

const CommandShortcut = ({
  class名称,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      class名称={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground",
        class名称,
      )}
      {...props}
    />
  );
};
CommandShortcut.display名称 = "CommandShortcut";

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
};
