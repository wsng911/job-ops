import { Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialog取消,
  AlertDialogContent,
  AlertDialog描述,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialog标题,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { DesignResumeSection } from "./DesignResumeSection";
import type { ItemDefinition } from "./definitions";
import { getByPath, toBoolean, toText } from "./utils";

type DesignResumeListSectionProps = {
  definition: ItemDefinition;
  items: Record<string, unknown>[];
  on添加: () => void;
  on编辑: (index: number) => void;
  on更新Items: (nextItems: Record<string, unknown>[]) => void;
};

export function DesignResumeListSection({
  definition,
  items,
  on添加,
  on编辑,
  on更新Items,
}: DesignResumeListSectionProps) {
  const [pendingRemovalIndex, setPendingRemovalIndex] = useState<number | null>(
    null,
  );
  const pendingRemovalItem = useMemo(
    () =>
      pendingRemovalIndex == null ? null : (items[pendingRemovalIndex] ?? null),
    [items, pendingRemovalIndex],
  );
  const pendingRemovalLabel = toText(
    pendingRemovalItem
      ? getByPath(pendingRemovalItem, definition.primaryField)
      : null,
    "this item",
  );

  const confirmRemoval = () => {
    if (pendingRemovalIndex == null) return;
    on更新Items(
      items.filter((_, currentIndex) => currentIndex !== pendingRemovalIndex),
    );
    setPendingRemovalIndex(null);
  };

  return (
    <DesignResumeSection
      value={definition.key}
      title={definition.title}
      subtitle={definition.description}
      badge={items.length === 0 ? "Empty" : `${items.length}`}
    >
      <div class名称="space-y-3">
        <div class名称="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 px-4 py-3">
          <div>
            <div class名称="text-sm font-medium text-foreground">
              {items.length} item{items.length === 1 ? "" : "s"}
            </div>
            <div class名称="text-xs text-muted-foreground">
              添加 entries, reorder them, or hide the ones you do not want to
              show.
            </div>
          </div>
          <Button type="button" variant="outline" onClick={on添加}>
            <Plus class名称="mr-2 h-4 w-4" />
            添加
          </Button>
        </div>

        {items.length === 0 ? (
          <div class名称="rounded-lg border border-dashed border-border/60 bg-muted/20 px-4 py-5 text-sm text-muted-foreground">
            否 items yet.
          </div>
        ) : (
          items.map((item, index) => (
            <div
              key={toText(item.id, `${definition.key}-${index}`)}
              class名称="rounded-lg border border-border/60 bg-background/60 px-4 py-3"
            >
              <div class名称="flex items-start justify-between gap-3">
                <div>
                  <div class名称="text-sm font-semibold text-foreground">
                    {toText(
                      getByPath(item, definition.primaryField),
                      "Untitled",
                    )}
                  </div>
                  {definition.secondaryField ? (
                    <div class名称="text-xs text-muted-foreground">
                      {toText(getByPath(item, definition.secondaryField))}
                    </div>
                  ) : null}
                </div>
                <div class名称="rounded-full border border-border/60 px-2 py-0.5 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  {toBoolean(item.hidden, false) ? "Hidden" : "Visible"}
                </div>
              </div>
              <div class名称="mt-3 flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => on编辑(index)}
                >
                  编辑
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    const nextItems = [...items];
                    nextItems[index] = {
                      ...nextItems[index],
                      hidden: !toBoolean(nextItems[index].hidden, false),
                    };
                    on更新Items(nextItems);
                  }}
                >
                  {toBoolean(item.hidden, false) ? "Show" : "Hide"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    if (index === 0) return;
                    const nextItems = [...items];
                    const [currentItem] = nextItems.splice(index, 1);
                    nextItems.splice(index - 1, 0, currentItem);
                    on更新Items(nextItems);
                  }}
                >
                  Up
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    if (index === items.length - 1) return;
                    const nextItems = [...items];
                    const [currentItem] = nextItems.splice(index, 1);
                    nextItems.splice(index + 1, 0, currentItem);
                    on更新Items(nextItems);
                  }}
                >
                  Down
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  class名称="text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
                  onClick={() => setPendingRemovalIndex(index)}
                >
                  移除
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <AlertDialog
        open={pendingRemovalIndex != null}
        onOpenChange={(open) => {
          if (!open) setPendingRemovalIndex(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialog标题>
              移除 {definition.singular标题.toLowerCase()}?
            </AlertDialog标题>
            <AlertDialog描述>
              This will remove {pendingRemovalLabel} from your Design Resume.
              You can add it again later, but this change will be saved.
            </AlertDialog描述>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialog取消>取消</AlertDialog取消>
            <AlertDialogAction
              class名称="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmRemoval}
            >
              <Trash2 class名称="mr-2 h-4 w-4" />
              移除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DesignResumeSection>
  );
}
