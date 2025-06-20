import type { RedditComment } from '../types/reddit';
import { formatTimestamp } from '../utils/redditApi';
import { EditableCommentContent } from './EditableCommentContent';

interface CommentProps {
  comment: RedditComment;
}

export function Comment({ comment }: CommentProps) {
  const renderCommentBody = () => {
    return (
      <EditableCommentContent
        comment={comment}
        className=""
      />
    );
  };

  return (
    <div 
      className={`comment ${comment.stickied ? 'stickied' : ''} ${comment.distinguished ? 'distinguished' : ''}`}
      style={{ marginLeft: `${comment.depth * 20}px` }}
    >
      <div className="comment-header">
        <span className={`comment-author ${comment.is_submitter ? 'op' : ''}`}>
          u/{comment.author}
          {comment.is_submitter && <span className="op-badge">OP</span>}
          {comment.distinguished && (
            <span className={`distinguished-badge ${comment.distinguished}`}>
              {comment.distinguished}
            </span>
          )}
        </span>
        <span className="comment-separator">•</span>
        <span className="comment-score">{comment.score} points</span>
        <span className="comment-separator">•</span>
        <span className="comment-time">{formatTimestamp(comment.created_utc)}</span>
      </div>
      
      {renderCommentBody()}
    </div>
  );
}
