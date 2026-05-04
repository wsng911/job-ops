import type { Job } from "@shared/types.js";
import type React from "react";
import { TailoringWorkspace } from "../tailoring/TailoringWorkspace";

interface TailorModeProps {
  job: Job;
  on返回: () => void;
  onFinalize: () => void;
  isFinalizing: boolean;
  onDirtyChange?: (isDirty: boolean) => void;
  variant?: "discovered" | "ready";
}

export const TailorMode: React.FC<TailorModeProps> = ({
  job,
  on返回,
  onFinalize,
  isFinalizing,
  onDirtyChange,
  variant = "discovered",
}) => {
  return (
    <TailoringWorkspace
      mode="tailor"
      job={job}
      on返回={on返回}
      onFinalize={onFinalize}
      isFinalizing={isFinalizing}
      onDirtyChange={onDirtyChange}
      variant={variant}
    />
  );
};
