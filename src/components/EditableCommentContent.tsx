import {useEffect, useRef, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import type {RootState} from '../store/types';
import {deleteComment, updateCommentContent} from '../store/slices/appSlice';
import {deleteRecentComment, updateRecentCommentContent} from '../store/slices/sidebarSlice';
import {processTextForEdit} from '../utils/textUtils';
import {TranslateButton} from './TranslateButton';
import type {RedditComment} from '../types/reddit';
import Markdown from "react-markdown";
import remarkGfm from 'remark-gfm';

interface EditableCommentContentProps {
  comment: RedditComment;
  className?: string;
}

export function EditableCommentContent({
                                         comment,
                                         className = ''
                                       }: EditableCommentContentProps) {
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Get current comment data from Redux state to reflect translations
  const currentData = useSelector((state: RootState) => state.app.currentData);
  const currentComment = currentData?.comments.find(c => c.id === comment.id) || comment;

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleStartEdit = async () => {
    if (isSaving || !currentComment.body) return;
    // Process text the same way as translation (markdown to plain text)
    const processedValue = await processTextForEdit(currentComment.body);
    setEditValue(processedValue);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (isSaving || editValue.trim() === currentComment.body || !editValue.trim()) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);

    try {
      // Update current data
      dispatch(updateCommentContent({
        commentId: currentComment.id,
        body: editValue.trim()
      }));

      // Update recent posts
      if (currentData) {
        dispatch(updateRecentCommentContent({
          postId: currentData.post.id,
          commentId: currentComment.id,
          body: editValue.trim()
        }));
      }

      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save comment edit:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = async () => {
    // Use the same processing logic as handleStartEdit
    const processedValue = await processTextForEdit(currentComment.body);
    setEditValue(processedValue);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (isSaving) return;

    const confirmDelete = window.confirm(
      'Are you sure you want to delete this comment? This will also delete all replies to this comment and cannot be undone.'
    );

    if (confirmDelete) {
      // Delete from current data
      dispatch(deleteComment(currentComment.id));

      // Delete from recent posts for persistence
      if (currentData) {
        dispatch(deleteRecentComment({
          postId: currentData.post.id,
          commentId: currentComment.id
        }));
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel();
    } else if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSave();
    }
  };

  if (isEditing) {
    return (
      <div className={`editable-content editing ${className}`}>
        <textarea
          ref={textareaRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="edit-textarea"
          rows={Math.max(2, editValue.split('\n').length)}
          disabled={isSaving}
        />

        <div className="edit-controls">
          <button
            onClick={handleSave}
            disabled={isSaving || editValue.trim() === currentComment.body || !editValue.trim()}
            className="save-btn"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={handleCancel}
            disabled={isSaving}
            className="cancel-btn"
          >
            Cancel
          </button>
          <span className="edit-hint">Ctrl+Enter to save</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`editable-content-wrapper comment-body ${className}`}>
      <div
        className="editable-content"
        onClick={handleStartEdit}
        title="Click to edit"
      >
        <Markdown remarkPlugins={[remarkGfm]}>
          {currentComment.body}
        </Markdown>
        <div className="content-badges">
          {currentComment.edited && (
            <span className="edited-badge" title={`Edited ${new Date(currentComment.edited_at || 0).toLocaleString()}`}>
              edited
            </span>
          )}
          {currentComment.translated && (
            <span className="translated-badge" title="Content has been translated">
              translated
            </span>
          )}
        </div>
      </div>
      <div className="content-actions">
        <TranslateButton
          content={currentComment}
          type="comment"
          className="content-translate-btn"
          compact={true}
        />
        <button
          onClick={handleDelete}
          disabled={isSaving}
          className="delete-comment-btn"
          title="Delete comment and all replies"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}
