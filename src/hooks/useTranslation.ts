import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store/types';
import {
  setPostTranslating,
  translatePost,
  revertPostTranslation,
  setCommentTranslating,
  translateComment,
  revertCommentTranslation
} from '../store/slices/appSlice';
import { saveTranslationsToRecent } from '../store/slices/sidebarSlice';
import { translateService } from '../services/translate';
import type { TranslateOptions } from '../services/translate';

export function useTranslation() {
  const dispatch = useDispatch();
  const currentData = useSelector((state: RootState) => state.app.currentData);

  const translatePostContent = useCallback(async (
    postId: string, 
    options: TranslateOptions = { to: 'vi' }
  ) => {
    if (!currentData || currentData.post.id !== postId) return;

    const post = currentData.post;
    dispatch(setPostTranslating({ postId, translating: true }));

    try {
      const promises: Promise<string>[] = [];
      
      // Translate title if it exists
      if (post.title && post.title.trim()) {
        promises.push(translateService.translate(post.title, options));
      } else {
        promises.push(Promise.resolve(''));
      }
      
      // Translate selftext if it exists
      if (post.selftext && post.selftext.trim()) {
        promises.push(translateService.translate(post.selftext, options));
      } else {
        promises.push(Promise.resolve(''));
      }

      const [translatedTitle, translatedSelftext] = await Promise.all(promises);

      dispatch(translatePost({
        postId,
        translatedTitle: post.title ? translatedTitle : undefined,
        translatedSelftext: post.selftext ? translatedSelftext : undefined
      }));
    } catch (error) {
      console.error('Translation failed:', error);
      dispatch(setPostTranslating({ postId, translating: false }));
    }
  }, [dispatch, currentData]);

  const revertPostTranslationAction = useCallback((postId: string) => {
    dispatch(revertPostTranslation(postId));
  }, [dispatch]);

  const translateCommentContent = useCallback(async (
    commentId: string,
    options: TranslateOptions = { to: 'vi' }
  ) => {
    if (!currentData) return;

    const comment = currentData.comments.find(c => c.id === commentId);
    if (!comment || !comment.body || !comment.body.trim()) return;

    dispatch(setCommentTranslating({ commentId, translating: true }));

    try {
      const translatedBody = await translateService.translate(comment.body, options);
      
      dispatch(translateComment({
        commentId,
        translatedBody
      }));
    } catch (error) {
      console.error('Comment translation failed:', error);
      dispatch(setCommentTranslating({ commentId, translating: false }));
    }
  }, [dispatch, currentData]);

  const revertCommentTranslationAction = useCallback((commentId: string) => {
    dispatch(revertCommentTranslation(commentId));
  }, [dispatch]);

  const translateAllContent = useCallback(async (options: TranslateOptions = { to: 'vi' }) => {
    if (!currentData) return;

    // Store original values before translation
    const originalPost = {
      title: currentData.post.title,
      selftext: currentData.post.selftext
    };

    const originalComments = currentData.comments
      .filter(comment => comment.body && comment.body.trim() && !comment.translated)
      .map(comment => ({
        id: comment.id,
        body: comment.body
      }));

    // Translate post first
    await translatePostContent(currentData.post.id, options);

    // Then translate all comments
    const commentPromises = currentData.comments
      .filter(comment => comment.body && comment.body.trim() && !comment.translated)
      .map(comment => translateCommentContent(comment.id, options));

    await Promise.all(commentPromises);

    // After all translations are complete, save to recent posts for persistence
    const postTranslations = {
      title: currentData.post.title,
      selftext: currentData.post.selftext,
      originalTitle: originalPost.title,
      originalSelftext: originalPost.selftext
    };

    const commentTranslations = originalComments.map(originalComment => {
      const translatedComment = currentData.comments.find(c => c.id === originalComment.id);
      return {
        commentId: originalComment.id,
        body: translatedComment?.body || originalComment.body,
        originalBody: originalComment.body
      };
    });

    // Save all translations to recent posts for persistence
    dispatch(saveTranslationsToRecent({
      postId: currentData.post.id,
      postTranslations,
      commentTranslations
    }));
  }, [currentData, translatePostContent, translateCommentContent, dispatch]);

  const revertAllTranslations = useCallback(() => {
    if (!currentData) return;

    // Revert post translation
    if (currentData.post.translated) {
      revertPostTranslationAction(currentData.post.id);
    }

    // Revert all comment translations
    currentData.comments
      .filter(comment => comment.translated)
      .forEach(comment => revertCommentTranslationAction(comment.id));
  }, [currentData, revertPostTranslationAction, revertCommentTranslationAction]);

  const getTranslationStats = useCallback(() => {
    if (!currentData) return { total: 0, translated: 0, translating: 0 };

    let total = 0;
    let translated = 0;
    let translating = 0;

    // Count post
    if (currentData.post.title || currentData.post.selftext) {
      total++;
      if (currentData.post.translated) translated++;
      if (currentData.post.translating) translating++;
    }

    // Count comments
    currentData.comments.forEach(comment => {
      if (comment.body && comment.body.trim()) {
        total++;
        if (comment.translated) translated++;
        if (comment.translating) translating++;
      }
    });

    return { total, translated, translating };
  }, [currentData]);

  return {
    translatePostContent,
    revertPostTranslation: revertPostTranslationAction,
    translateCommentContent,
    revertCommentTranslation: revertCommentTranslationAction,
    translateAllContent,
    revertAllTranslations,
    getTranslationStats
  };
}
