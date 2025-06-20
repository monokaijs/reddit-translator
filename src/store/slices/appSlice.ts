import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AppState } from '../types';
import type { RedditApiResponse } from '../../types/reddit';

const initialState: AppState = {
  currentData: null,
  currentUrl: '',
  dataSource: null,
  loading: false,
  error: null,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    setData: (state, action: PayloadAction<{
      data: RedditApiResponse;
      url?: string;
      source: 'fetched' | 'imported';
    }>) => {
      state.currentData = action.payload.data;
      state.currentUrl = action.payload.url || '';
      state.dataSource = action.payload.source;
      state.loading = false;
      state.error = null;
    },
    clearData: (state) => {
      state.currentData = null;
      state.currentUrl = '';
      state.dataSource = null;
      state.loading = false;
      state.error = null;
    },
    updatePostContent: (state, action: PayloadAction<{
      postId: string;
      title?: string;
      selftext?: string;
    }>) => {
      if (state.currentData && state.currentData.post.id === action.payload.postId) {
        if (action.payload.title !== undefined) {
          state.currentData.post.title = action.payload.title;
        }
        if (action.payload.selftext !== undefined) {
          state.currentData.post.selftext = action.payload.selftext;
          // Clear HTML version when text is edited
          state.currentData.post.selftext_html = null;
        }
        state.currentData.post.edited = true;
        state.currentData.post.edited_at = Date.now();
      }
    },
    updateCommentContent: (state, action: PayloadAction<{
      commentId: string;
      body: string;
    }>) => {
      if (state.currentData) {
        const comment = state.currentData.comments.find(c => c.id === action.payload.commentId);
        if (comment) {
          comment.body = action.payload.body;
          // Clear HTML version when text is edited
          comment.body_html = '';
          comment.edited = true;
          comment.edited_at = Date.now();
        }
      }
    },
    setPostTranslating: (state, action: PayloadAction<{
      postId: string;
      translating: boolean;
    }>) => {
      if (state.currentData && state.currentData.post.id === action.payload.postId) {
        state.currentData.post.translating = action.payload.translating;
      }
    },
    translatePost: (state, action: PayloadAction<{
      postId: string;
      translatedTitle?: string;
      translatedSelftext?: string;
    }>) => {
      if (state.currentData && state.currentData.post.id === action.payload.postId) {
        const post = state.currentData.post;

        if (action.payload.translatedTitle !== undefined) {
          if (!post.original_title) {
            post.original_title = post.title;
          }
          post.title = action.payload.translatedTitle;
        }

        if (action.payload.translatedSelftext !== undefined) {
          if (!post.original_selftext) {
            post.original_selftext = post.selftext;
          }
          post.selftext = action.payload.translatedSelftext;
        }

        post.translated = true;
        post.translating = false;
      }
    },
    revertPostTranslation: (state, action: PayloadAction<string>) => {
      if (state.currentData && state.currentData.post.id === action.payload) {
        const post = state.currentData.post;

        if (post.original_title) {
          post.title = post.original_title;
          delete post.original_title;
        }

        if (post.original_selftext) {
          post.selftext = post.original_selftext;
          delete post.original_selftext;
        }

        post.translated = false;
        post.translating = false;
      }
    },
    setCommentTranslating: (state, action: PayloadAction<{
      commentId: string;
      translating: boolean;
    }>) => {
      if (state.currentData) {
        const comment = state.currentData.comments.find(c => c.id === action.payload.commentId);
        if (comment) {
          comment.translating = action.payload.translating;
        }
      }
    },
    translateComment: (state, action: PayloadAction<{
      commentId: string;
      translatedBody: string;
    }>) => {
      if (state.currentData) {
        const comment = state.currentData.comments.find(c => c.id === action.payload.commentId);
        if (comment) {
          if (!comment.original_body) {
            comment.original_body = comment.body;
          }
          comment.body = action.payload.translatedBody;
          comment.translated = true;
          comment.translating = false;
        }
      }
    },
    revertCommentTranslation: (state, action: PayloadAction<string>) => {
      if (state.currentData) {
        const comment = state.currentData.comments.find(c => c.id === action.payload);
        if (comment && comment.original_body) {
          comment.body = comment.original_body;
          delete comment.original_body;
          comment.translated = false;
          comment.translating = false;
        }
      }
    },
    deleteComment: (state, action: PayloadAction<string>) => {
      if (state.currentData) {
        const commentId = action.payload;
        const commentToDeleteIndex = state.currentData.comments.findIndex(c => c.id === commentId);

        if (commentToDeleteIndex !== -1) {
          const commentToDelete = state.currentData.comments[commentToDeleteIndex];
          const commentsToDelete = [commentId];

          // Find all child comments by looking at comments that come after this one
          // and have greater depth until we hit a comment with equal or lesser depth
          for (let i = commentToDeleteIndex + 1; i < state.currentData.comments.length; i++) {
            const comment = state.currentData.comments[i];

            // If we encounter a comment with depth <= parent depth, we've left the child tree
            if (comment.depth <= commentToDelete.depth) {
              break;
            }

            // This comment is a child (has greater depth and comes after parent)
            commentsToDelete.push(comment.id);
          }

          // Remove all comments (parent and children)
          state.currentData.comments = state.currentData.comments.filter(
            comment => !commentsToDelete.includes(comment.id)
          );
        }
      }
    },
  },
});

export const {
  setLoading,
  setError,
  setData,
  clearData,
  updatePostContent,
  updateCommentContent,
  setPostTranslating,
  translatePost,
  revertPostTranslation,
  setCommentTranslating,
  translateComment,
  revertCommentTranslation,
  deleteComment
} = appSlice.actions;
export default appSlice.reducer;
