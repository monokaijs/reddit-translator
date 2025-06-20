import {createSlice, type PayloadAction} from '@reduxjs/toolkit';
import type {RecentPost, SidebarState} from '../types';
import type {RedditApiResponse} from '../../types/reddit';

const initialState: SidebarState = {
  isOpen: true,
  recentPosts: [],
};

const MAX_RECENT_POSTS = 15;

const sidebarSlice = createSlice({
  name: 'sidebar',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.isOpen = !state.isOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.isOpen = action.payload;
    },
    addRecentPost: (state, action: PayloadAction<{
      data: RedditApiResponse;
      url?: string;
      source: 'fetched' | 'imported';
    }>) => {
      const {data, url, source} = action.payload;
      const postId = data.post.id;

      state.recentPosts = state.recentPosts.filter(post => post.id !== postId);

      const recentPost: RecentPost = {
        id: postId,
        title: data.post.title,
        subreddit: data.post.subreddit,
        author: data.post.author,
        timestamp: data.post.created_utc,
        loadedAt: Date.now(),
        source,
        originalUrl: url,
        data,
      };

      // Add to beginning of array
      state.recentPosts.unshift(recentPost);

      // Keep only the most recent posts
      if (state.recentPosts.length > MAX_RECENT_POSTS) {
        state.recentPosts = state.recentPosts.slice(0, MAX_RECENT_POSTS);
      }
    },
    removeRecentPost: (state, action: PayloadAction<string>) => {
      state.recentPosts = state.recentPosts.filter(post => post.id !== action.payload);
    },
    clearRecentPosts: (state) => {
      state.recentPosts = [];
    },
    updateRecentPostContent: (state, action: PayloadAction<{
      postId: string;
      title?: string;
      selftext?: string;
    }>) => {
      const recentPost = state.recentPosts.find(post => post.id === action.payload.postId);
      if (recentPost) {
        if (action.payload.title !== undefined) {
          recentPost.title = action.payload.title;
          recentPost.data.post.title = action.payload.title;
        }
        if (action.payload.selftext !== undefined) {
          recentPost.data.post.selftext = action.payload.selftext;
          recentPost.data.post.selftext_html = null;
        }
        recentPost.data.post.edited = true;
        recentPost.data.post.edited_at = Date.now();
      }
    },
    updateRecentCommentContent: (state, action: PayloadAction<{
      postId: string;
      commentId: string;
      body: string;
    }>) => {
      const recentPost = state.recentPosts.find(post => post.id === action.payload.postId);
      if (recentPost) {
        const comment = recentPost.data.comments.find(c => c.id === action.payload.commentId);
        if (comment) {
          comment.body = action.payload.body;
          comment.body_html = '';
          comment.edited = true;
          comment.edited_at = Date.now();
        }
      }
    },
    saveTranslationsToRecent: (state, action: PayloadAction<{
      postId: string;
      postTranslations?: {
        title?: string;
        selftext?: string;
        originalTitle?: string;
        originalSelftext?: string;
      };
      commentTranslations?: Array<{
        commentId: string;
        body: string;
        originalBody?: string;
      }>;
    }>) => {
      const recentPost = state.recentPosts.find(post => post.id === action.payload.postId);
      if (recentPost) {
        // Update post translations
        if (action.payload.postTranslations) {
          const { title, selftext, originalTitle, originalSelftext } = action.payload.postTranslations;

          if (title !== undefined) {
            if (originalTitle && !recentPost.data.post.original_title) {
              recentPost.data.post.original_title = originalTitle;
            }
            recentPost.data.post.title = title;
            recentPost.data.post.translated = true;
          }

          if (selftext !== undefined) {
            if (originalSelftext && !recentPost.data.post.original_selftext) {
              recentPost.data.post.original_selftext = originalSelftext;
            }
            recentPost.data.post.selftext = selftext;
            recentPost.data.post.translated = true;
          }
        }

        // Update comment translations
        if (action.payload.commentTranslations) {
          action.payload.commentTranslations.forEach(({ commentId, body, originalBody }) => {
            const comment = recentPost.data.comments.find(c => c.id === commentId);
            if (comment) {
              if (originalBody && !comment.original_body) {
                comment.original_body = originalBody;
              }
              comment.body = body;
              comment.translated = true;
            }
          });
        }
      }
    },
    deleteRecentComment: (state, action: PayloadAction<{
      postId: string;
      commentId: string;
    }>) => {
      const recentPost = state.recentPosts.find(post => post.id === action.payload.postId);
      if (recentPost) {
        const commentToDeleteIndex = recentPost.data.comments.findIndex(c => c.id === action.payload.commentId);

        if (commentToDeleteIndex !== -1) {
          const commentToDelete = recentPost.data.comments[commentToDeleteIndex];
          const commentsToDelete = [action.payload.commentId];

          // Find all child comments by looking at comments that come after this one
          // and have greater depth until we hit a comment with equal or lesser depth
          for (let i = commentToDeleteIndex + 1; i < recentPost.data.comments.length; i++) {
            const comment = recentPost.data.comments[i];

            // If we encounter a comment with depth <= parent depth, we've left the child tree
            if (comment.depth <= commentToDelete.depth) {
              break;
            }

            // This comment is a child (has greater depth and comes after parent)
            commentsToDelete.push(comment.id);
          }

          // Remove all comments (parent and children)
          recentPost.data.comments = recentPost.data.comments.filter(
            comment => !commentsToDelete.includes(comment.id)
          );
        }
      }
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  addRecentPost,
  removeRecentPost,
  clearRecentPosts,
  updateRecentPostContent,
  updateRecentCommentContent,
  saveTranslationsToRecent,
  deleteRecentComment
} = sidebarSlice.actions;
export default sidebarSlice.reducer;
