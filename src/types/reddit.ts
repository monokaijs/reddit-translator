// Reddit API response types
export interface RedditPost {
  id: string;
  title: string;
  selftext: string;
  selftext_html: string | null;
  author: string;
  subreddit: string;
  subreddit_name_prefixed: string;
  score: number;
  upvote_ratio: number;
  num_comments: number;
  created_utc: number;
  permalink: string;
  url: string;
  is_self: boolean;
  thumbnail: string;
  edited?: boolean;
  edited_at?: number;
  // Translation fields
  original_title?: string;
  original_selftext?: string;
  translated?: boolean;
  translating?: boolean;
  preview?: {
    images: Array<{
      source: {
        url: string;
        width: number;
        height: number;
      };
    }>;
  };
}

export interface RedditComment {
  id: string;
  author: string;
  body: string;
  body_html: string;
  score: number;
  created_utc: number;
  depth: number;
  parent_id: string;
  permalink: string;
  replies?: RedditCommentListing;
  is_submitter: boolean;
  stickied: boolean;
  distinguished: string | null;
  edited?: boolean;
  edited_at?: number;
  // Translation fields
  original_body?: string;
  translated?: boolean;
  translating?: boolean;
}

export interface RedditCommentListing {
  kind: string;
  data: {
    children: Array<{
      kind: string;
      data: RedditComment;
    }>;
  };
}

export interface RedditPostResponse {
  kind: string;
  data: {
    children: Array<{
      kind: string;
      data: RedditPost;
    }>;
  };
}

export interface RedditApiResponse {
  post: RedditPost;
  comments: RedditComment[];
}

export interface ParsedRedditUrl {
  subreddit: string;
  postId: string;
  isValid: boolean;
}

export interface RedditDataState {
  data: RedditApiResponse | null;
  loading: boolean;
  error: string | null;
}

export interface ExportedRedditData {
  version: string;
  exportedAt: string;
  originalUrl: string;
  post: RedditPost;
  comments: RedditComment[];
  metadata: {
    totalComments: number;
    exportTimestamp: number;
  };
}
