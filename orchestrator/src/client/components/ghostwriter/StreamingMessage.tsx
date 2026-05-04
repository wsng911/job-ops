import type React from "react";

type StreamingMessageProps = {
  content: string;
};

export const StreamingMessage: React.FC<StreamingMessageProps> = ({
  content,
}) => {
  return (
    <div class名称="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
      {content}
      <span class名称="ml-1 inline-block h-4 w-2 animate-pulse rounded bg-primary/60 align-middle" />
    </div>
  );
};
