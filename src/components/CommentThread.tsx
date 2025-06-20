import type { RedditComment } from '../types/reddit';
import { Comment } from './Comment';

interface CommentThreadProps {
  comments: RedditComment[];
}

export function CommentThread({ comments }: CommentThreadProps) {
  if (comments.length === 0) {
    return (
      <div className="comment-thread">
        <p className="no-comments">No comments yet.</p>
      </div>
    );
  }

  return (
    <div className="comment-thread">
      <h2 className="comments-header">Comments ({comments.length})</h2>
      <div className="comments-list">
        {comments.map((comment) => (
          <Comment key={comment.id} comment={comment} />
        ))}
      </div>
    </div>
  );
}
