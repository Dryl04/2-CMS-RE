/**
 * HTML Sanitizer for Rich Text Content
 *
 * Allows only safe inline HTML tags (bold, italic, links, etc.)
 * and strips everything else. Used by widgets to safely render
 * user-authored rich text content.
 */

import React from "react";

const ALLOWED_TAGS = new Set([
  "b",
  "strong",
  "i",
  "em",
  "u",
  "s",
  "a",
  "br",
  "mark",
  "sup",
  "sub",
  "span",
]);

const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(["href", "target", "rel", "title"]),
  span: new Set(["style", "class"]),
  mark: new Set(["style"]),
};

function escapeHTML(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function sanitizeAttributes(el: Element, tag: string): string {
  const allowed = ALLOWED_ATTRS[tag];
  if (!allowed) return "";

  const attrs: string[] = [];
  for (const attr of Array.from(el.attributes)) {
    if (allowed.has(attr.name)) {
      // For href, block javascript: protocol
      if (attr.name === "href") {
        const val = attr.value.trim().toLowerCase();
        if (val.startsWith("javascript:") || val.startsWith("data:")) continue;
      }
      attrs.push(` ${attr.name}="${escapeHTML(attr.value)}"`);
    }
  }

  if (tag === "a") {
    if (!el.hasAttribute("target")) {
      attrs.push(' target="_blank"');
    }
    if (!el.hasAttribute("rel")) {
      attrs.push(' rel="noopener noreferrer"');
    }
    attrs.push(' class="rich-text-link"');
  }

  return attrs.join("");
}

function sanitizeNode(node: Node): string {
  let result = "";
  for (const child of Array.from(node.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) {
      result += escapeHTML(child.textContent || "");
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      const el = child as Element;
      const tag = el.tagName.toLowerCase();
      if (tag === "br") {
        result += "<br />";
      } else if (ALLOWED_TAGS.has(tag)) {
        const attrs = sanitizeAttributes(el, tag);
        result += `<${tag}${attrs}>${sanitizeNode(el)}</${tag}>`;
      } else {
        // Strip forbidden tag but keep inner content
        result += sanitizeNode(el);
      }
    }
  }
  return result;
}

/**
 * Sanitize an HTML string, allowing only safe inline tags.
 * Returns clean HTML string safe for dangerouslySetInnerHTML.
 */
export function sanitizeHTML(html: string): string {
  if (!html) return "";
  const doc = new DOMParser().parseFromString(html, "text/html");
  return sanitizeNode(doc.body);
}

const HTML_TAG_REGEX = /<[a-z][^>]*>/i;

/**
 * Check if a string contains HTML tags.
 */
export function containsHTML(text: string): boolean {
  if (!text) return false;
  return HTML_TAG_REGEX.test(text);
}

/**
 * Render text that may contain HTML as a React node.
 * If the text contains HTML, it is sanitized and rendered via dangerouslySetInnerHTML.
 * Otherwise, it is returned as plain text.
 *
 * @param text - The text to render (may contain HTML)
 * @param fallback - Optional fallback if text is empty
 * @returns React node (either plain string or span with sanitized HTML)
 */
export function renderRichText(
  text: string | undefined | null,
  fallback?: string,
): React.ReactNode {
  const content = text || fallback || "";
  if (!content) return null;
  if (containsHTML(content)) {
    return React.createElement("span", {
      dangerouslySetInnerHTML: { __html: sanitizeHTML(content) },
    });
  }
  return content;
}
