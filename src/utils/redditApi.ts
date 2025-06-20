import type {
  RedditPost,
  RedditComment,
  RedditApiResponse,
  ParsedRedditUrl,
  RedditCommentListing
} from '../types/reddit';

/**
 * Parse Reddit URL to extract subreddit and post ID
 */
export function parseRedditUrl(url: string): ParsedRedditUrl {
  try {
    const urlObj = new URL(url);

    // Match pattern: /r/{subreddit}/comments/{postId}/{title}/
    const pathMatch = urlObj.pathname.match(/^\/r\/([^\/]+)\/comments\/([^\/]+)/);

    if (pathMatch) {
      return {
        subreddit: pathMatch[1],
        postId: pathMatch[2],
        isValid: true
      };
    }

    return { subreddit: '', postId: '', isValid: false };
  } catch {
    return { subreddit: '', postId: '', isValid: false };
  }
}

/**
 * Flatten nested comment structure
 */
function flattenComments(commentListing: RedditCommentListing, depth = 0): RedditComment[] {
  const comments: RedditComment[] = [];

  if (!commentListing?.data?.children) {
    return comments;
  }

  for (const child of commentListing.data.children) {
    if (child.kind === 't1' && child.data) {
      const comment = { ...child.data, depth };
      comments.push(comment);

      // Recursively process replies
      if (comment.replies && typeof comment.replies === 'object') {
        const nestedComments = flattenComments(comment.replies, depth + 1);
        comments.push(...nestedComments);
      }
    }
  }

  return comments;
}

/**
 * Fetch Reddit post and comments data
 */
export async function fetchRedditData(subreddit: string, postId: string): Promise<RedditApiResponse> {
  const url = `https://www.reddit.com/r/${subreddit}/comments/${postId}.json`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'RedditClone/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length < 2) {
      throw new Error('Invalid Reddit API response format');
    }

    // Extract post data
    const postListing = data[0];
    if (!postListing?.data?.children?.[0]?.data) {
      throw new Error('No post data found');
    }

    const post: RedditPost = postListing.data.children[0].data;

    // Extract and flatten comments
    const commentListing = data[1];
    const comments = flattenComments(commentListing);

    return {
      post,
      comments
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch Reddit data: ${error.message}`);
    }
    throw new Error('Failed to fetch Reddit data: Unknown error');
  }
}

/**
 * Format timestamp for display
 */
export function formatTimestamp(utcTimestamp: number): string {
  const date = new Date(utcTimestamp * 1000);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) {
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    return `${diffMinutes}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else {
    return date.toLocaleDateString();
  }
}
