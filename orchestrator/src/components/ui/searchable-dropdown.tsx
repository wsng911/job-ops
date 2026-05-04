import { Check, ChevronsUpDown, 搜索 } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useVirtualizedListbox } from "@/components/ui/virtualized-listbox";
import { cn } from "@/lib/utils";

export interface 搜索ableDropdownOption {
  value: string;
  label: string;
  searchText?: string;
  disabled?: boolean;
}

interface 搜索ableDropdownProps {
  inputId?: string;
  value: string;
  options: 搜索ableDropdownOption[];
  onValueChange: (value: string) => void;
  placeholder: string;
  searchPlaceholder?: string;
  emptyText?: string;
  ariaLabel?: string;
  disabled?: boolean;
  triggerClass名称?: string;
  contentClass名称?: string;
  listClass名称?: string;
}

type 搜索ableDropdownRow =
  | {
      id: string;
      type: "custom";
      label: string;
      value: string;
    }
  | {
      id: string;
      type: "option";
      disabled: boolean;
      option: 搜索ableDropdownOption;
      searchableValue: string;
    };

function get搜索ableValue(option: 搜索ableDropdownOption): string {
  return [option.label, option.searchText ?? "", option.value].join(" ").trim();
}

function toDomIdSegment(value: string): string {
  return Array.from(value)
    .map((character) => {
      if (/^[A-Za-z0-9_-]$/.test(character)) return character;
      return `_${character.codePointAt(0)?.toString(36) ?? "0"}_`;
    })
    .join("");
}

function createRowDomId(
  listId: string,
  type: 搜索ableDropdownRow["type"],
  value: string,
): string {
  return `${toDomIdSegment(listId)}-${type}-${toDomIdSegment(value)}`;
}

export const 搜索ableDropdown: React.FC<搜索ableDropdownProps> = ({
  inputId,
  value,
  options,
  onValueChange,
  placeholder,
  searchPlaceholder = "搜索...",
  emptyText = "否 results found.",
  ariaLabel,
  disabled = false,
  triggerClass名称,
  contentClass名称,
  listClass名称,
}) => {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [listElement, setListElement] = React.useState<HTMLDivElement | null>(
    null,
  );
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const deferredQuery = React.useDeferredValue(query);
  const listId = React.useId();
  const selectedOption = options.find((option) => option.value === value);
  const trimmedQuery = query.trim();
  const deferredTrimmedQuery = deferredQuery.trim();
  const hasCustomValue =
    trimmedQuery.length > 0 &&
    !options.some(
      (option) =>
        option.value === trimmedQuery || option.label.trim() === trimmedQuery,
    );
  const triggerLabel = selectedOption?.label ?? (value || placeholder);
  const filteredOptions = React.useMemo(() => {
    if (!deferredTrimmedQuery) return options;

    const normalizedQuery = deferredTrimmedQuery.toLowerCase();
    return options.filter((option) =>
      get搜索ableValue(option).toLowerCase().includes(normalizedQuery),
    );
  }, [deferredTrimmedQuery, options]);

  const rows = React.useMemo<搜索ableDropdownRow[]>(() => {
    const nextRows: 搜索ableDropdownRow[] = [];

    if (hasCustomValue) {
      nextRows.push({
        id: createRowDomId(listId, "custom", trimmedQuery),
        type: "custom",
        label: `Use "${trimmedQuery}"`,
        value: trimmedQuery,
      });
    }

    for (const option of filteredOptions) {
      nextRows.push({
        id: createRowDomId(listId, "option", option.value),
        type: "option",
        disabled: Boolean(option.disabled),
        option,
        searchableValue: get搜索ableValue(option),
      });
    }

    return nextRows;
  }, [filteredOptions, hasCustomValue, listId, trimmedQuery]);

  const selectedRowId = React.useMemo(
    () =>
      rows.find(
        (row) =>
          row.type === "option" && row.option.value === value && !row.disabled,
      )?.id ?? null,
    [rows, value],
  );
  const rowIds = React.useMemo(() => rows.map((row) => row.id), [rows]);
  const selectableRowIndexes = React.useMemo(() => {
    const indexes: number[] = [];
    for (let index = 0; index < rows.length; index += 1) {
      const row = rows[index];
      if (row.type === "custom" || !row.disabled) {
        indexes.push(index);
      }
    }
    return indexes;
  }, [rows]);

  const [activeRowId, setActiveRowId] = React.useState<string | null>(null);
  const activeRowIndex = activeRowId ? rowIds.indexOf(activeRowId) : -1;
  const activeRow = activeRowIndex >= 0 ? rows[activeRowIndex] : null;

  const setListRef = React.useCallback((element: HTMLDivElement | null) => {
    setListElement(element);
  }, []);

  const { scrollToIndex, measureElement, getVirtualItems, getTotalSize } =
    useVirtualizedListbox<HTMLButtonElement>({
      count: rows.length,
      estimateSize: () => 40,
      getItemKey: (index: number) => rows[index]?.id ?? index,
      initialRect: { width: 320, height: 256 },
      overscan: 8,
      scrollElement: listElement,
    });

  React.useEffect(() => {
    if (!open) return;

    setActiveRowId((current) => {
      if (current) {
        const currentRow = rows.find((row) => row.id === current);
        if (
          currentRow &&
          (currentRow.type === "custom" || !currentRow.disabled)
        ) {
          return current;
        }
      }

      if (!rows.length) return null;
      if (!trimmedQuery && selectedRowId) return selectedRowId;
      return rows[selectableRowIndexes[0]]?.id ?? null;
    });
  }, [open, rows, selectedRowId, selectableRowIndexes, trimmedQuery]);

  React.useEffect(() => {
    if (!open) return;
    if (activeRowIndex < 0) return;
    scrollToIndex(activeRowIndex, { align: "auto" });
  }, [activeRowIndex, open, scrollToIndex]);

  React.useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
  }, [open]);

  const selectRow = React.useCallback(
    (row: 搜索ableDropdownRow) => {
      if (row.type === "option") {
        if (row.disabled) return;
        onValueChange(row.option.value);
      } else {
        onValueChange(row.value);
      }
      setOpen(false);
      setQuery("");
      setActiveRowId(null);
    },
    [onValueChange],
  );

  const moveActive = React.useCallback(
    (direction: 1 | -1) => {
      if (!selectableRowIndexes.length) return;

      const currentSelectableIndex =
        selectableRowIndexes.indexOf(activeRowIndex);

      let nextSelectableIndex = currentSelectableIndex;
      if (nextSelectableIndex < 0) {
        nextSelectableIndex = direction === 1 ? -1 : 0;
      }

      nextSelectableIndex =
        (nextSelectableIndex + direction + selectableRowIndexes.length) %
        selectableRowIndexes.length;

      setActiveRowId(
        rows[selectableRowIndexes[nextSelectableIndex]]?.id ?? null,
      );
    },
    [activeRowIndex, rows, selectableRowIndexes],
  );

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveActive(1);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      moveActive(-1);
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      setActiveRowId(rows[selectableRowIndexes[0]]?.id ?? null);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      setActiveRowId(
        rows[selectableRowIndexes[selectableRowIndexes.length - 1]]?.id ?? null,
      );
      return;
    }

    if (event.key === "Enter" && activeRow) {
      event.preventDefault();
      selectRow(activeRow);
    }
  };

  const virtualItems = getVirtualItems();

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          setQuery("");
          setActiveRowId(null);
        }
      }}
    >
      {inputId ? (
        <input
          id={inputId}
          type="text"
          value={value}
          disabled={disabled}
          onChange={(event) => onValueChange(event.target.value)}
          class名称="sr-only"
          tabIndex={-1}
          aria-hidden="true"
        />
      ) : null}
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          aria-label={inputId ? undefined : (ariaLabel ?? triggerLabel)}
          disabled={disabled}
          class名称={cn("justify-between", triggerClass名称)}
        >
          <span class名称="truncate">{triggerLabel}</span>
          <ChevronsUpDown class名称="ml-2 h-4 w-4 shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        class名称={cn("w-[320px] p-0", contentClass名称)}
      >
        <div class名称="flex items-center border-b px-3" cmdk-input-wrapper="">
          <搜索 class名称="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <input
            ref={inputRef}
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            aria-activedescendant={activeRowId ?? undefined}
            aria-autocomplete="list"
            placeholder={searchPlaceholder}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleInputKeyDown}
            class名称="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        <div
          ref={setListRef}
          id={listId}
          role="listbox"
          aria-label={ariaLabel}
          class名称={cn(
            "max-h-56 overflow-y-auto overflow-x-hidden",
            listClass名称,
          )}
          onWheelCapture={(event) => event.stopPropagation()}
        >
          {rows.length === 0 ? (
            <div class名称="py-6 text-center text-sm">{emptyText}</div>
          ) : (
            <div class名称="relative w-full" style={{ height: getTotalSize() }}>
              {virtualItems.map((virtualItem) => {
                const row = rows[virtualItem.index];
                if (!row) return null;

                const selected =
                  row.type === "option" && value === row.option.value;
                const isActive = row.id === activeRowId;

                return (
                  <button
                    key={virtualItem.key}
                    ref={measureElement}
                    type="button"
                    data-index={virtualItem.index}
                    role="option"
                    tabIndex={-1}
                    aria-selected={selected}
                    aria-disabled={row.type === "option" ? row.disabled : false}
                    id={row.id}
                    class名称={cn(
                      "absolute left-0 top-0 flex w-full cursor-default gap-2 select-none items-center rounded-sm px-2 py-1.5 text-left text-sm outline-none",
                      isActive ? "bg-accent text-accent-foreground" : "",
                      row.type === "option" && row.disabled
                        ? "pointer-events-none opacity-50"
                        : "hover:bg-accent/80 hover:text-accent-foreground",
                    )}
                    style={{
                      transform: `translateY(${virtualItem.start}px)`,
                    }}
                    onMouseEnter={() => {
                      if (row.type === "option" && row.disabled) return;
                      setActiveRowId(row.id);
                    }}
                    onClick={() => selectRow(row)}
                  >
                    <span class名称="truncate">
                      {row.type === "custom" ? row.label : row.option.label}
                    </span>
                    {row.type === "option" ? (
                      <Check
                        class名称={cn(
                          "ml-auto h-4 w-4 shrink-0",
                          selected ? "opacity-100" : "opacity-0",
                        )}
                      />
                    ) : null}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
