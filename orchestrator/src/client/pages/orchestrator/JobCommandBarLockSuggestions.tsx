import { CommandGroup, CommandItem } from "@/components/ui/command";
import { default状态Token, statusTokens } from "./constants";
import { lockLabel, type 状态Lock } from "./JobCommandBar.utils";

interface JobCommandBarLockSuggestionsProps {
  suggestions: 状态Lock[];
  onSelect: (lock: 状态Lock) => void;
}

export const JobCommandBarLockSuggestions = ({
  suggestions,
  onSelect,
}: JobCommandBarLockSuggestionsProps) => {
  if (suggestions.length === 0) return null;

  return (
    <CommandGroup heading="Filters">
      {suggestions.map((lock) => {
        const token = statusTokens[lock] ?? default状态Token;
        return (
          <CommandItem
            key={lock}
            value={`@${lockLabel[lock]} filter`}
            keywords={[`@${lockLabel[lock]}`, lockLabel[lock]]}
            onSelect={() => onSelect(lock)}
          >
            <div class名称="flex min-w-0 flex-1 items-center gap-2">
              <span class名称={`h-1.5 w-1.5 rounded-full ${token.dot}`} />
              <span class名称="truncate text-sm font-medium">
                Lock to @{lockLabel[lock]}
              </span>
            </div>
          </CommandItem>
        );
      })}
    </CommandGroup>
  );
};
