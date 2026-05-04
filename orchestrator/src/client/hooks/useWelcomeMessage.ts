import welcomeMessages from "@shared/messages/jobs-welcome.json";
import { useMemo } from "react";
import { use个人资料 } from "./use个人资料";

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

export function useWelcomeMessage(): string {
  const { person名称 } = use个人资料();

  return useMemo(() => {
    const first名称 = person名称?.split(" ")[0] || "User";
    const today = new Date().toDateString();

    let isFirstDay = true;
    try {
      let firstSeenDate = localStorage.getItem("jobOps_firstWelcomeDate");
      if (!firstSeenDate) {
        firstSeenDate = today;
        localStorage.setItem("jobOps_firstWelcomeDate", today);
      }
      isFirstDay = firstSeenDate === today;
    } catch (_e) {
      // Ignore localStorage errors (e.g. private mode restrictions)
      // Fallback to true so we just show the first message
    }

    const lines = welcomeMessages.lines;
    let selectedIndex = 0; // Always default to the first message

    if (!isFirstDay) {
      // If it's not their first day, randomize consistently for the day
      const seed = Math.abs(hashCode(`${first名称}-${today}`));
      selectedIndex = seed % lines.length;
    }

    const line = lines[selectedIndex];

    switch (line.placement) {
      case "inline":
        return line.text.replace("{name}", first名称);
      case "prefix":
        return `${first名称}, ${line.text}`;
      case "suffix":
        return `${line.text}, ${first名称}.`;
      default:
        return line.text;
    }
  }, [person名称]);
}
