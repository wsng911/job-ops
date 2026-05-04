import type { Job } from "@shared/types";
import { Maximize2, Minimize2, PanelRightOpen } from "lucide-react";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  Sheet关闭,
  SheetContent,
  Sheet描述,
  SheetHeader,
  Sheet标题,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { GhostwriterPanel } from "./GhostwriterPanel";

type GhostwriterDrawerProps = {
  job: Job | null;
  triggerClass名称?: string;
};

type DisplayMode = "drawer" | "fullscreen";

const DESKTOP_MEDIA_QUERY = "(min-width: 1024px)";
const DISPLAY_MODE_STORAGE_KEY = "jobops.ghostwriter.display-mode.v1";

function getIsDesktopViewport(): boolean {
  if (typeof window === "undefined") return false;
  if (typeof window.matchMedia !== "function") return false;
  return window.matchMedia(DESKTOP_MEDIA_QUERY).matches;
}

function getStoredDisplayMode(): DisplayMode {
  if (typeof window === "undefined") return "drawer";
  try {
    const value = window.localStorage.getItem(DISPLAY_MODE_STORAGE_KEY);
    return value === "fullscreen" ? "fullscreen" : "drawer";
  } catch {
    return "drawer";
  }
}

export const GhostwriterDrawer: React.FC<GhostwriterDrawerProps> = ({
  job,
  triggerClass名称,
}) => {
  const [open, setOpen] = useState(false);
  const [displayMode, setDisplayMode] = useState<DisplayMode>(() =>
    getStoredDisplayMode(),
  );
  const [isDesktop, setIsDesktop] = useState(() => getIsDesktopViewport());

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (typeof window.matchMedia !== "function") return;
    const media = window.matchMedia(DESKTOP_MEDIA_QUERY);
    const handleChange = () => setIsDesktop(media.matches);
    handleChange();
    if (media.addEventListener) {
      media.addEventListener("change", handleChange);
      return () => media.removeEventListener("change", handleChange);
    }
    media.addListener(handleChange);
    return () => media.removeListener(handleChange);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(DISPLAY_MODE_STORAGE_KEY, displayMode);
    } catch {
      // Ignore storage failures and continue with in-memory mode.
    }
  }, [displayMode]);

  const isFullscreen = isDesktop && displayMode === "fullscreen";
  const panelClass名称 = useMemo(
    () =>
      cn(
        "flex w-full flex-col p-0",
        isFullscreen
          ? "inset-0 h-dvh w-screen max-w-none sm:max-w-none border-0 rounded-none shadow-none"
          : "sm:max-w-none lg:w-[50vw] xl:w-[40vw] 2xl:w-[30vw]",
        "[&>button]:hidden",
      ),
    [isFullscreen],
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          class名称={cn("h-8 gap-1.5 text-xs", triggerClass名称)}
          disabled={!job}
        >
          <PanelRightOpen class名称="h-3.5 w-3.5" />
          Ghostwriter
        </Button>
      </SheetTrigger>

      <SheetContent side="right" class名称={panelClass名称}>
        <div class名称="border-b border-border/50 p-4">
          <SheetHeader>
            <div class名称="flex items-start justify-between gap-2 w-full max-w-6xl mx-auto">
              <div class名称="min-w-0">
                <Sheet标题>Ghostwriter</Sheet标题>
                <Sheet描述>
                  {job && `${job.title} at ${job.employer}.`}
                </Sheet描述>
              </div>
              <div class名称="flex shrink-0 items-center gap-1 rounded-md border border-border/60 bg-background/70 p-1">
                {isDesktop && (
                  <Button
                    size="icon"
                    variant="ghost"
                    class名称="h-7 w-7"
                    onClick={() =>
                      setDisplayMode((current) =>
                        current === "fullscreen" ? "drawer" : "fullscreen",
                      )
                    }
                    aria-label={
                      isFullscreen
                        ? "Restore Ghostwriter drawer"
                        : "Open Ghostwriter pop-up"
                    }
                    title={
                      isFullscreen
                        ? "Restore Ghostwriter drawer"
                        : "Open Ghostwriter pop-up"
                    }
                  >
                    {isFullscreen ? (
                      <Minimize2 class名称="h-4 w-4" />
                    ) : (
                      <Maximize2 class名称="h-4 w-4" />
                    )}
                  </Button>
                )}
                <Sheet关闭 asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    class名称="h-7 w-7"
                    aria-label="关闭 Ghostwriter"
                    title="关闭 Ghostwriter"
                  >
                    <span class名称="text-base leading-none">×</span>
                  </Button>
                </Sheet关闭>
              </div>
            </div>
          </SheetHeader>
        </div>

        {job && (
          <div class名称="flex min-h-0 flex-1 p-4 pt-0">
            <GhostwriterPanel job={job} />
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
