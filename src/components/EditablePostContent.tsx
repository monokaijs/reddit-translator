import {useEffect, useRef, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import type {RootState} from '../store';
import {updatePostContent} from '../store/slices/appSlice';
import {updateRecentPostContent} from '../store/slices/sidebarSlice';
import {processTextForEdit} from '../utils/textUtils';
import {TranslateButton} from './TranslateButton';
import type {RedditPost} from '../types/reddit';
import Markdown from "react-markdown";
import remarkGfm from 'remark-gfm'

interface EditablePostContentProps {
  post: RedditPost;
  field: 'title' | 'selftext';
  className?: string;
  placeholder?: string;
}

export function EditablePostContent({
                                      post,
                                      field,
                                      className = '',
                                      placeholder = 'Click to edit...'
                                    }: EditablePostContentProps) {
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentData = useSelector((state: RootState) => state.app.currentData);
  const currentPost = currentData?.post.id === post.id ? currentData.post : post;

  const originalValue = field === 'title' ? currentPost.title : currentPost.selftext;
  const isMultiline = field === 'selftext';

  useEffect(() => {
    if (isEditing) {
      const ref = isMultiline ? textareaRef.current : inputRef.current;
      if (ref) {
        ref.focus();
        ref.select();
      }
    }
  }, [isEditing, isMultiline]);

  const handleStartEdit = async () => {
    if (isSaving) return;
    // Process text the same way as translation (markdown to plain text)
    const processedValue = await processTextForEdit(originalValue);
    setEditValue(processedValue);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (isSaving || editValue.trim() === originalValue) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);

    try {
      // Update current data
      dispatch(updatePostContent({
        postId: post.id,
        [field]: editValue.trim()
      }));

      // Update recent posts
      dispatch(updateRecentPostContent({
        postId: post.id,
        [field]: editValue.trim()
      }));

      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save edit:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = async () => {
    // Use the same processing logic as handleStartEdit
    const processedValue = await processTextForEdit(originalValue);
    setEditValue(processedValue);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel();
    } else if (e.key === 'Enter' && !isMultiline && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Enter' && isMultiline && e.ctrlKey) {
      e.preventDefault();
      handleSave();
    }
  };

  if (isEditing) {
    return (
      <div className={`editable-content editing ${className}`}>
        {isMultiline ? (
          <textarea
            ref={textareaRef}
            placeholder={placeholder}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="edit-textarea"
            rows={Math.max(3, editValue.split('\n').length)}
            disabled={isSaving}
          />
        ) : (
          <input
            ref={inputRef}
            placeholder={placeholder}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="edit-input"
            disabled={isSaving}
          />
        )}

        <div className="edit-controls">
          <button
            onClick={handleSave}
            disabled={isSaving || editValue.trim() === originalValue}
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
          {isMultiline && (
            <span className="edit-hint">Ctrl+Enter to save</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`editable-content-wrapper ${className}`}>
      <div
        className={`editable-content ${originalValue ? '' : 'empty'}`}
        onClick={handleStartEdit}
        title="Click to edit"
      >
        <Markdown remarkPlugins={[remarkGfm]}>
          {isMultiline ? currentPost.selftext : currentPost.title}
        </Markdown>
        {currentPost.edited || currentPost.translated && (
          <div className="content-badges">
            {currentPost.edited && (
              <span className="edited-badge" title={`Edited ${new Date(currentPost.edited_at || 0).toLocaleString()}`}>
              edited
            </span>
            )}
            {currentPost.translated && (
              <span className="translated-badge" title="Content has been translated">
              translated
            </span>
            )}
          </div>
        )}
      </div>
      <div className="content-actions">
        <TranslateButton
          content={currentPost}
          type="post"
          className="content-translate-btn"
          compact={true}
        />
      </div>
    </div>
  );
}
