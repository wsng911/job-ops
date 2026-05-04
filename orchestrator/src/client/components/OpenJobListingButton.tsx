import { ExternalLink } from "lucide-react";
import type React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { KbdHint } from "./KbdHint";

interface OpenJobListingButtonProps {
  href: string;
  class名称?: string;
  shortcut?: string;
}

export const OpenJobListingButton: React.FC<OpenJobListingButtonProps> = ({
  href,
  class名称,
  shortcut,
}) => {
  return (
    <Button asChild variant="outline" class名称={cn("gap-1", class名称)}>
      <a href={href} target="_blank" rel="noopener noreferrer">
        <ExternalLink class名称="h-3.5 w-3.5 shrink-0" />
        <span class名称="truncate">Open Job Listing</span>
        {shortcut ? <KbdHint shortcut={shortcut} class名称="ml-auto" /> : null}
      </a>
    </Button>
  );
};
