import { useTranslation } from '../hooks/useTranslation';
import type { RedditPost, RedditComment } from '../types/reddit';

interface TranslateButtonProps {
  content: RedditPost | RedditComment;
  type: 'post' | 'comment';
  className?: string;
  compact?: boolean;
}

export function TranslateButton({ 
  content, 
  type, 
  className = '', 
  compact = false 
}: TranslateButtonProps) {
  const { 
    translatePostContent, 
    revertPostTranslation,
    translateCommentContent,
    revertCommentTranslation
  } = useTranslation();

  const isPost = type === 'post';
  const isTranslated = content.translated || false;
  const isTranslating = content.translating || false;

  // Check if content has text to translate
  const hasContent = isPost 
    ? !!(content as RedditPost).title || !!(content as RedditPost).selftext
    : !!(content as RedditComment).body;

  if (!hasContent) return null;

  const handleTranslate = async () => {
    if (isTranslating) return;

    try {
      if (isPost) {
        await translatePostContent(content.id, { to: 'vi' });
      } else {
        await translateCommentContent(content.id, { to: 'vi' });
      }
    } catch (error) {
      console.error('Translation failed:', error);
    }
  };

  const handleRevert = () => {
    if (isTranslating) return;

    if (isPost) {
      revertPostTranslation(content.id);
    } else {
      revertCommentTranslation(content.id);
    }
  };

  if (isTranslated) {
    return (
      <button
        onClick={handleRevert}
        disabled={isTranslating}
        className={`translate-btn revert-btn ${className} ${compact ? 'compact' : ''}`}
        title="Revert to original text"
      >
        {compact ? (
          <span className="translate-icon">↩️</span>
        ) : (
          <>
            <span className="translate-icon">↩️</span>
            Revert
          </>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleTranslate}
      disabled={isTranslating}
      className={`translate-btn ${className} ${compact ? 'compact' : ''}`}
      title="Translate to Vietnamese"
    >
      {isTranslating ? (
        compact ? (
          <span className="translate-icon">⏳</span>
        ) : (
          <>
            <span className="translate-icon">⏳</span>
            Translating...
          </>
        )
      ) : (
        compact ? (
          <span className="translate-icon">🌐</span>
        ) : (
          <>
            <span className="translate-icon">🌐</span>
            Translate
          </>
        )
      )}
    </button>
  );
}
