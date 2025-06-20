import type { RedditApiResponse, ExportedRedditData, RedditPost } from '../types/reddit';

/**
 * Export Reddit data to JSON file
 */
export function exportRedditData(data: RedditApiResponse, originalUrl: string): void {
  const exportData: ExportedRedditData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    originalUrl,
    post: data.post,
    comments: data.comments,
    metadata: {
      totalComments: data.comments.length,
      exportTimestamp: Date.now()
    }
  };

  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  // Create download link
  const link = document.createElement('a');
  link.href = url;
  link.download = `reddit-post-${data.post.id}-${new Date().toISOString().split('T')[0]}.json`;
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up
  URL.revokeObjectURL(url);
}

/**
 * Validate imported JSON data structure
 */
export function validateImportedData(data: unknown): data is ExportedRedditData {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const obj = data as Record<string, unknown>;

  // Check required top-level properties
  if (
    typeof obj.version !== 'string' ||
    typeof obj.exportedAt !== 'string' ||
    typeof obj.originalUrl !== 'string' ||
    !obj.post ||
    !Array.isArray(obj.comments) ||
    !obj.metadata
  ) {
    return false;
  }

  // Validate post structure
  const post = obj.post as Record<string, unknown>;
  if (
    typeof post.id !== 'string' ||
    typeof post.title !== 'string' ||
    typeof post.author !== 'string' ||
    typeof post.subreddit !== 'string' ||
    typeof post.created_utc !== 'number'
  ) {
    return false;
  }

  // Validate comments structure (basic check)
  const comments = obj.comments as unknown[];
  for (const comment of comments) {
    if (
      !comment ||
      typeof comment !== 'object' ||
      typeof (comment as Record<string, unknown>).id !== 'string' ||
      typeof (comment as Record<string, unknown>).author !== 'string' ||
      typeof (comment as Record<string, unknown>).body !== 'string'
    ) {
      return false;
    }
  }

  // Validate metadata
  const metadata = obj.metadata as Record<string, unknown>;
  if (
    typeof metadata.totalComments !== 'number' ||
    typeof metadata.exportTimestamp !== 'number'
  ) {
    return false;
  }

  return true;
}

/**
 * Parse imported file and return Reddit data
 */
export async function parseImportedFile(file: File): Promise<RedditApiResponse> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const data = JSON.parse(text);
        
        if (!validateImportedData(data)) {
          reject(new Error('Invalid file format. Please select a valid Reddit export file.'));
          return;
        }
        
        // Convert to RedditApiResponse format
        const redditData: RedditApiResponse = {
          post: data.post,
          comments: data.comments
        };
        
        resolve(redditData);
      } catch (error) {
        if (error instanceof SyntaxError) {
          reject(new Error('Invalid JSON file. Please select a valid Reddit export file.'));
        } else {
          reject(error);
        }
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file. Please try again.'));
    };
    
    reader.readAsText(file);
  });
}

/**
 * Export Reddit data as formatted text
 */
export function exportRedditDataAsText(data: RedditApiResponse, originalUrl: string): void {
  const formattedText = formatRedditDataAsText(data, originalUrl);
  const blob = new Blob([formattedText], { type: 'text/plain; charset=utf-8' });
  const url = URL.createObjectURL(blob);

  // Create download link
  const link = document.createElement('a');
  link.href = url;
  link.download = `reddit-post-${data.post.id}-${new Date().toISOString().split('T')[0]}.txt`;

  // Trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up
  URL.revokeObjectURL(url);
}

/**
 * Format Reddit data as readable text
 */
function formatRedditDataAsText(data: RedditApiResponse, originalUrl: string): string {
  const { post, comments } = data;

  // Helper function to format points
  const formatPoints = (score: number): string => {
    if (score >= 1000) {
      return `${(score / 1000).toFixed(1)}k points`;
    }
    return `${score} points`;
  };

  // Helper function to clean and format text content
  const cleanText = (text: string): string => {
    return text
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&#x27;/g, "'")
      .replace(/&#x2F;/g, '/')
      .replace(/<br\s*\/?>/gi, '\n')
      .trim();
  };

  // Start building the formatted text
  let result = '';

  // Subreddit header
  result += `r/${post.subreddit}\n`;

  // Post author and score
  result += `u/${post.author} (${formatPoints(post.score)})\n`;

  // Post title
  result += `${cleanText(post.title)}\n`;

  // Separator
  result += '_____________________\n';

  // Original Reddit link
  const redditUrl = originalUrl || `https://redd.it/${post.id}`;
  result += `Link Reddit: ${redditUrl}\n`;

  // Another separator
  result += '_____________________\n';

  // Post content (if it's a text post)
  if (post.is_self && post.selftext && post.selftext.trim()) {
    result += `${cleanText(post.selftext)}\n`;
    result += '_____________________\n';
  }

  // Process comments
  let lastDepth = -1;

  comments.forEach((comment, index) => {
    // Skip deleted/removed comments
    if (!comment.body || comment.body === '[deleted]' || comment.body === '[removed]') {
      return;
    }

    // Add separator between top-level comments
    if (comment.depth === 0 && index > 0) {
      result += '_____________________\n';
    }

    // Add indentation based on depth
    const indent = comment.depth > 0 ? '>'.repeat(comment.depth) : '';

    // Comment author and score
    result += `${indent}u/${comment.author} (${formatPoints(comment.score)})\n`;

    // Comment body
    const commentText = cleanText(comment.body);
    if (comment.depth > 0) {
      // For replies, indent the content
      const indentedText = commentText
        .split('\n')
        .map(line => `${indent}${line}`)
        .join('\n');
      result += `${indentedText}\n`;
    } else {
      // For top-level comments, no additional indentation
      result += `${commentText}\n`;
    }

    lastDepth = comment.depth;
  });

  return result;
}

/**
 * Generate filename for export
 */
export function generateExportFilename(post: RedditPost): string {
  const date = new Date().toISOString().split('T')[0];
  const safeTitle = post.title
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);

  return `reddit-${post.subreddit}-${safeTitle}-${date}.json`;
}
