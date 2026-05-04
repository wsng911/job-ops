import { stripHtml } from "@/lib/utils";

export const getRenderableJob描述 = (job描述?: string | null) => {
  if (!job描述) return "否 description available.";

  const plainText =
    job描述.includes("<") && job描述.includes(">")
      ? stripHtml(job描述)
      : job描述;

  const normalizedLineBreaks = plainText.replace(/\r\n/g, "\n");
  if (
    normalizedLineBreaks.includes("\\n") &&
    !normalizedLineBreaks.includes("\n")
  ) {
    return normalizedLineBreaks.replace(/\\n/g, "\n");
  }

  return normalizedLineBreaks;
};
