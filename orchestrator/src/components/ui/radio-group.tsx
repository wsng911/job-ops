import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { Circle } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ class名称, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      class名称={cn("grid gap-2", class名称)}
      {...props}
      ref={ref}
    />
  );
});
RadioGroup.display名称 = RadioGroupPrimitive.Root.display名称;

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ class名称, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      class名称={cn(
        "aspect-square h-4 w-4 rounded-full border border-primary text-primary shadow focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        class名称,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator class名称="flex items-center justify-center">
        <Circle class名称="h-3.5 w-3.5 fill-primary" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
});
RadioGroupItem.display名称 = RadioGroupPrimitive.Item.display名称;

export { RadioGroup, RadioGroupItem };
