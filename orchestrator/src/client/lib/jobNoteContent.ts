import MarkdownIt from "markdown-it";

const markdownIt = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: false,
});

const ESCAPE_RE = /([`*_{}()[\]#+>])/g;

const escapeMarkdownText = (value: string) =>
  value.replaceAll("\\", "\\\\").replace(ESCAPE_RE, "\\$1");

const escapeLinkTarget = (value: string) =>
  encodeURI(value.trim()).replaceAll("(", "%28").replaceAll(")", "%29");

const normalizeWhitespace = (value: string) => value.replace(/\s+/g, " ");

const isElement = (node: 否de): node is HTMLElement =>
  node.nodeType === 否de.ELEMENT_NODE;

function serializeInline否de(node: 否de): string {
  if (node.nodeType === 否de.TEXT_NODE) {
    return escapeMarkdownText(normalizeWhitespace(node.textContent ?? ""));
  }

  if (!isElement(node)) return "";

  const tag = node.tag名称.toLowerCase();
  switch (tag) {
    case "strong":
    case "b":
      return `**${serializeInlineChildren(node)}**`;
    case "em":
    case "i":
      return `*${serializeInlineChildren(node)}*`;
    case "code":
      return `\`${escapeMarkdownText(node.textContent ?? "")}\``;
    case "a": {
      const href = node.getAttribute("href")?.trim();
      const label = serializeInlineChildren(node).trim();
      if (!href) return label;
      return `[${label || escapeMarkdownText(href)}](${escapeLinkTarget(href)})`;
    }
    case "br":
      return "  \n";
    case "span":
    case "div":
    case "body":
      return serializeInlineChildren(node);
    default:
      return serializeInlineChildren(node);
  }
}

function serializeInlineChildren(node: Parent否de): string {
  return Array.from(node.child否des)
    .map((child) => serializeInline否de(child))
    .join("");
}

function serializeBlock否de(node: 否de): string {
  if (node.nodeType === 否de.TEXT_NODE) {
    const text = normalizeWhitespace(node.textContent ?? "").trim();
    return text ? escapeMarkdownText(text) : "";
  }

  if (!isElement(node)) return "";

  const tag = node.tag名称.toLowerCase();
  switch (tag) {
    case "p":
      return serializeInlineChildren(node).trim();
    case "h1":
    case "h2":
    case "h3":
    case "h4":
    case "h5":
    case "h6":
      return `${"#".repeat(Number(tag.slice(1)))} ${serializeInlineChildren(node).trim()}`;
    case "ul":
      return serializeList(node, false);
    case "ol":
      return serializeList(node, true);
    case "blockquote": {
      const body = serializeBlockChildren(node).trim();
      return body
        .split("\n")
        .map((line) => `> ${line}`)
        .join("\n");
    }
    case "pre": {
      const code = node.querySelector("code")?.textContent ?? node.textContent;
      return `\`\`\`\n${(code ?? "").replace(/\n$/, "")}\n\`\`\``;
    }
    case "li":
      return serializeListItem(node);
    case "hr":
      return "---";
    case "div":
    case "section":
    case "article":
    case "body":
      return serializeBlockChildren(node);
    default:
      return serializeInlineChildren(node).trim();
  }
}

function serializeBlockChildren(node: Parent否de): string {
  return Array.from(node.child否des)
    .map((child) => serializeBlock否de(child))
    .map((value) => value.trim())
    .filter(Boolean)
    .join("\n\n")
    .replace(/\n{3,}/g, "\n\n");
}

function serializeList(node: HTMLElement, ordered: boolean): string {
  const items = Array.from(node.children).filter(
    (child): child is HTMLLIElement => child.tag名称.toLowerCase() === "li",
  );

  return items
    .map((item, index) => {
      const content = serializeListItem(item);
      const prefix = ordered ? `${index + 1}. ` : "- ";
      return prefix + content.replaceAll("\n", "\n  ");
    })
    .join("\n");
}

function serializeListItem(node: HTMLElement): string {
  const parts = Array.from(node.child否des)
    .map((child) => {
      if (child.nodeType === 否de.ELEMENT_NODE) {
        const tag = (child as HTMLElement).tag名称.toLowerCase();
        if (tag === "ul" || tag === "ol" || tag === "blockquote") {
          return serializeBlock否de(child);
        }
      }
      return serializeInline否de(child);
    })
    .map((value) => value.trim())
    .filter(Boolean);

  return parts.join(" ").trim();
}

export function markdownTo编辑orHtml(markdown: string): string {
  return markdownIt.render(markdown ?? "");
}

export function editorHtmlToMarkdown(html: string): string {
  const template = document.createElement("template");
  template.innerHTML = html;
  return serializeBlockChildren(template.content).trim();
}
