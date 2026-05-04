import { ExternalLink } from "lucide-react";
import type React from "react";

const AUTH_DOC =
  "https://google-gemini.github.io/gemini-cli/docs/get-started/authentication.html";

/**
 * Explains how to authenticate the Google Gemini CLI (OAuth or API key via CLI),
 * which JobOps uses when LLM_PROVIDER is `gemini_cli`.
 */
export const GeminiCliSetupHint: React.FC = () => {
  return (
    <div class名称="rounded-lg border border-dashed border-border/60 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
      <p class名称="font-medium text-foreground">Gemini CLI on this machine</p>
      <p class名称="mt-2">
        Install{" "}
        <a
          class名称="text-foreground underline decoration-border underline-offset-4"
          href="https://www.npmjs.com/package/@google/gemini-cli"
          target="_blank"
          rel="noopener noreferrer"
        >
          @google/gemini-cli
        </a>
        , then run <code class名称="rounded bg-muted px-1 py-0.5">gemini</code>{" "}
        in a terminal and complete Google sign-in (OAuth), or set{" "}
        <code class名称="rounded bg-muted px-1 py-0.5">GEMINI_API_KEY</code> for
        the CLI. JobOps spawns the CLI in headless mode and reuses those
        credentials — no JobOps API key field.
      </p>
      <p class名称="mt-2">
        <a
          class名称="inline-flex items-center gap-1 text-foreground underline decoration-border underline-offset-4"
          href={AUTH_DOC}
          target="_blank"
          rel="noopener noreferrer"
        >
          Authentication guide
          <ExternalLink class名称="size-3.5 shrink-0 opacity-70" aria-hidden />
        </a>
        . In Docker, mount your CLI config (for example{" "}
        <code class名称="rounded bg-muted px-1 py-0.5">~/.gemini</code>) into
        the container or run{" "}
        <code class名称="rounded bg-muted px-1 py-0.5">gemini</code> via{" "}
        <code class名称="rounded bg-muted px-1 py-0.5">
          docker compose exec
        </code>
        . Optional:{" "}
        <code class名称="rounded bg-muted px-1 py-0.5">GEMINI_CLI_BIN</code> to
        override the binary path;{" "}
        <code class名称="rounded bg-muted px-1 py-0.5">
          GEMINI_CLI_TRUST_WORKSPACE=true
        </code>{" "}
        to omit{" "}
        <code class名称="rounded bg-muted px-1 py-0.5">--skip-trust</code>.
      </p>
    </div>
  );
};
