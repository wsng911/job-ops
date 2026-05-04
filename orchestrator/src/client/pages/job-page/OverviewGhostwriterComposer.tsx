import type { Job } from "@shared/types.js";
import { Send, Sparkles } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const getGhostwriterSuggestions = (job: Job, has否tes: boolean) => [
  has否tes
    ? "Summarize the latest interview notes."
    : "What should I remember if a recruiter calls?",
  `What should I know before speaking with ${job.employer}?`,
];

type OverviewGhostwriterComposerProps = {
  job: Job;
  baseJobPath: string;
  has否tes: boolean;
  navigationState?: { jobPage返回To: string };
};

export const OverviewGhostwriterComposer: React.FC<
  OverviewGhostwriterComposerProps
> = ({ job, baseJobPath, has否tes, navigationState }) => {
  const navigate = useNavigate();
  const [prompt, setPrompt] = React.useState("");
  const suggestions = React.useMemo(
    () => getGhostwriterSuggestions(job, has否tes),
    [has否tes, job],
  );

  const submitPrompt = React.useCallback(() => {
    const content = prompt.trim();
    if (!content) return;
    navigate(
      `${baseJobPath}/ghostwriter?prompt=${encodeURIComponent(content)}`,
      { state: navigationState },
    );
  }, [baseJobPath, navigate, navigationState, prompt]);

  return (
    <section class名称="rounded-xl border border-border/50 bg-card/85 p-4">
      <div class名称="flex items-start gap-3">
        <Sparkles class名称="mt-1.5 h-4 w-4 shrink-0 text-primary" />
        <Textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              submitPrompt();
            }
          }}
          placeholder="Ask Ghostwriter anything about this application..."
          class名称="min-h-[30px] resize-none border-0 bg-transparent px-0 py-1 text-xs shadow-none focus-visible:ring-0 md:text-sm"
        />
      </div>
      <div class名称="mt-3 flex items-center justify-between gap-3 border-t border-border/50">
        <div class名称="mt-3 flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <Button
              key={suggestion}
              type="button"
              size="sm"
              variant="outline"
              class名称="hidden h-auto text-left md:inline-flex md:px-3 md:py-1.5"
              onClick={() => setPrompt(suggestion)}
            >
              {suggestion}
            </Button>
          ))}
        </div>

        <Button
          size="sm"
          onClick={submitPrompt}
          disabled={!prompt.trim()}
          class名称="mt-3"
        >
          <Send class名称="mr-1.5 h-3.5 w-3.5" />
          Go
        </Button>
      </div>
    </section>
  );
};
