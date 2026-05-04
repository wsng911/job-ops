import { ChevronDown, ChevronUp } from "lucide-react";
import type React from "react";

interface CollapsibleSectionProps {
  isOpen: boolean;
  label: string;
  onToggle: () => void;
  children: React.React否de;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  isOpen,
  label,
  onToggle,
  children,
}) => {
  return (
    <div class名称="space-y-2">
      <button
        type="button"
        onClick={onToggle}
        class名称="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-full"
      >
        {isOpen ? (
          <ChevronUp class名称="h-3.5 w-3.5" />
        ) : (
          <ChevronDown class名称="h-3.5 w-3.5" />
        )}
        {label}
      </button>
      {isOpen ? children : null}
    </div>
  );
};
