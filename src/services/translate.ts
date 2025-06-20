import parse from 'remark-parse';
import stringify from 'remark-stringify';
import strip from 'strip-markdown';
import {unified} from "unified";

export interface TranslateOptions {
  from?: string;
  to?: string;
  host?: string;
  fetchOptions?: Partial<RequestInit>;
}

class TranslateService {
  /**
   * Convert markdown content to plain text using markdown-to-txt library
   */
  private async markdownToText(text: string): Promise<string> {
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
   * Convert newlines to HTML br tags for translation API
   */
  private newlinesToBr(text: string): string {
    return text.replace(/\n/g, '<br/>');
  }

  /**
   * Convert HTML br tags back to newlines
   */
  private brToNewlines(text: string): string {
    return text
      .replace(/<br\s*\/?>/gi, '\n')
      .trim()
      .split('\n').map(line => line.trim()).join('\n');
  }

  /**
   * Pre-process text before translation
   */
  private async preprocessText(text: string) {
    const plainText = await this.markdownToText(text);
    return this.newlinesToBr(plainText);
  }

  /**
   * Post-process text after translation
   */
  private postprocessText(text: string): string {
    // Convert br tags back to newlines
    return this.brToNewlines(text);
  }

  async translate(text: string, options: TranslateOptions = {}): Promise<string> {
    if (!text || !text.trim()) {
      return text;
    }
    const processedText = await this.preprocessText(text);

    const response = await fetch(`https://translate-pa.googleapis.com/v1/translateHtml`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json+protobuf',
        'X-Goog-API-Key': 'AIzaSyATBXajvzQLTDHEQbcpq0Ihe0vWDHmO520'
      },
      body: JSON.stringify([[[processedText], options?.from || "auto", options?.to || 'vi'], "wt_lib"]),
    });

    if (!response.ok) {
      throw new Error(`Translation API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const translatedText = data[0][0] as string;

    // Post-process the translated text
    return this.postprocessText(translatedText);
  }
}

export const translateService = new TranslateService();
