import type { Job } from "@shared/types.js";
import type React from "react";
import { TailoringWorkspace } from "./tailoring/TailoringWorkspace";

interface Tailoring编辑orProps {
  job: Job;
  on更新: () => void | Promise<void>;
  onDirtyChange?: (isDirty: boolean) => void;
  onRegister保存?: (save: () => Promise<void>) => void;
  onBeforeGenerate?: () => boolean | Promise<boolean>;
}

export const Tailoring编辑or: React.FC<Tailoring编辑orProps> = ({
  job,
  on更新,
  onDirtyChange,
  onRegister保存,
  onBeforeGenerate,
}) => {
  return (
    <TailoringWorkspace
      mode="editor"
      job={job}
      on更新={on更新}
      onDirtyChange={onDirtyChange}
      onRegister保存={onRegister保存}
      onBeforeGenerate={onBeforeGenerate}
    />
  );
};
