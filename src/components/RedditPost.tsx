import type { RedditPost as RedditPostType } from '../types/reddit';
import { formatTimestamp } from '../utils/redditApi';
import { EditablePostContent } from './EditablePostContent';

interface RedditPostProps {
  post: RedditPostType;
}

export function RedditPost({ post }: RedditPostProps) {
  const renderContent = () => {
    if (post.is_self) {
      // For text posts, render editable selftext
      return (
        <EditablePostContent
          post={post}
          field="selftext"
          className="post-content"
          placeholder="No content. Click to add..."
        />
      );
    } else if (!post.is_self && post.url) {
      // For link posts, show the URL (not editable)
      return (
        <div className="post-content">
          <a
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            className="external-link"
          >
            {post.url}
          </a>
        </div>
      );
    }
    return null;
  };

  return (
    <article className="reddit-post">
      <div className="post-votes">
        <div className="vote-score">{post.score}</div>
        <div className="vote-ratio">{Math.round(post.upvote_ratio * 100)}%</div>
      </div>
      
      <div className="post-main">
        <header className="post-header">
          <EditablePostContent
            post={post}
            field="title"
            className="post-title"
            placeholder="No title"
          />
          <div className="post-meta">
            <span className="post-subreddit">{post.subreddit_name_prefixed}</span>
            <span className="post-separator">•</span>
            <span className="post-author">u/{post.author}</span>
            <span className="post-separator">•</span>
            <span className="post-time">{formatTimestamp(post.created_utc)}</span>
          </div>
        </header>
        
        {renderContent()}
        
        <footer className="post-footer">
          <div className="post-stats">
            <span className="comment-count">{post.num_comments} comments</span>
            <a 
              href={`https://reddit.com${post.permalink}`}
              target="_blank"
              rel="noopener noreferrer"
              className="original-link"
            >
              View on Reddit
            </a>
          </div>
        </footer>
      </div>
    </article>
  );
}
