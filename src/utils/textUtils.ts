import parse from 'remark-parse';
import stringify from 'remark-stringify';
import strip from 'strip-markdown';
import {unified} from "unified";

/**
 * Clean text for textarea input by converting HTML entities and br tags to proper format
 */
export function cleanTextForTextarea(text: string): string {
  if (!text) return text;
  
  return text
    // Convert any remaining br tags to newlines
    .replace(/<br\s*\/?>/gi, '\n')
    // Convert common HTML entities
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    // Clean up multiple consecutive newlines
    .replace(/\n{3,}/g, '\n\n')
    // Remove leading/trailing whitespace from each line while preserving structure
    .split('\n')
    .map(line => line.trim())
    .join('\n')
    .trim();
}

/**
 * Process text for editing the same way as translation does:
 * 1. Convert markdown to plain text
 * 2. Clean HTML entities and br tags
 * This ensures consistency between edit mode and translation processing
 */
export async function processTextForEdit(text: string): Promise<string> {
  if (!text) return text;

  // First convert markdown to plain text (same as translation service)
  const plainText = await markdownToText(text);

  // Then clean for textarea (convert br tags and HTML entities)
  return cleanTextForTextarea(plainText);
}

/**
 * Convert markdown content to plain text using the same logic as translation service
 */
async function markdownToText(text: string): Promise<string> {
  const r = await unified()
    .use(parse)
    .use(strip, {
      keep: ['list', 'listItem'] // preserve list structure
    })
    .use(stringify, {
      bullet: '-', // keep `-` for bullets
      listItemIndent: 'one', // proper indentation
    })
    .process(text);
  return String(r).replace(/\\\[/g, '[').replace(/\\\]/g, ']');
}

/**
 * Decode HTML entities in text (for display purposes)
 */
export function decodeHtmlEntities(text: string): string {
  if (!text) return text;

  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
}
