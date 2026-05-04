import type React from "react";
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

interface 确认删除Props {
  isOpen: boolean;
  on关闭: () => void;
  on确认: () => void;
  title?: string;
  description?: string;
}

export const 确认删除: React.FC<确认删除Props> = ({
  isOpen,
  on关闭,
  on确认,
  title = "Are you sure?",
  description = "This action cannot be undone. This will permanently delete this event from the timeline.",
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && on关闭()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialog标题>{title}</AlertDialog标题>
          <AlertDialog描述>{description}</AlertDialog描述>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialog取消 onClick={on关闭}>取消</AlertDialog取消>
          <AlertDialogAction
            onClick={() => {
              on确认();
              on关闭();
            }}
            class名称="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            删除
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
