import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store/types';
import { setLoading, setError, setData, clearData, updatePostContent, updateCommentContent } from '../store/slices/appSlice';
import { addRecentPost, updateRecentPostContent, updateRecentCommentContent } from '../store/slices/sidebarSlice';
import { parseRedditUrl, fetchRedditData } from '../utils/redditApi';
import { parseImportedFile } from '../utils/importExport';
import type { RedditApiResponse } from '../types/reddit';

export function useRedditDataRedux() {
  const dispatch = useDispatch();
  const { currentData, currentUrl, dataSource, loading, error } = useSelector(
    (state: RootState) => state.app
  );

  const fetchData = useCallback(async (url: string) => {
    dispatch(setLoading(true));

    try {
      const parsed = parseRedditUrl(url);
      
      if (!parsed.isValid) {
        throw new Error('Invalid Reddit URL. Please provide a valid Reddit post URL.');
      }

      const data = await fetchRedditData(parsed.subreddit, parsed.postId);
      
      dispatch(setData({
        data,
        url,
        source: 'fetched'
      }));
      
      dispatch(addRecentPost({
        data,
        url,
        source: 'fetched'
      }));
    } catch (error) {
      dispatch(setError(error instanceof Error ? error.message : 'An unknown error occurred'));
    }
  }, [dispatch]);

  const importData = useCallback(async (file: File) => {
    dispatch(setLoading(true));

    try {
      const data = await parseImportedFile(file);
      
      dispatch(setData({
        data,
        source: 'imported'
      }));
      
      dispatch(addRecentPost({
        data,
        source: 'imported'
      }));
    } catch (error) {
      dispatch(setError(error instanceof Error ? error.message : 'Failed to import file'));
    }
  }, [dispatch]);

  const loadRecentPost = useCallback((data: RedditApiResponse, url?: string, source: 'fetched' | 'imported' = 'fetched') => {
    dispatch(setData({
      data,
      url,
      source
    }));
  }, [dispatch]);

  const clearCurrentData = useCallback(() => {
    dispatch(clearData());
  }, [dispatch]);

  const editPostContent = useCallback((postId: string, title?: string, selftext?: string) => {
    dispatch(updatePostContent({ postId, title, selftext }));
    dispatch(updateRecentPostContent({ postId, title, selftext }));
  }, [dispatch]);

  const editCommentContent = useCallback((commentId: string, body: string) => {
    if (currentData) {
      dispatch(updateCommentContent({ commentId, body }));
      dispatch(updateRecentCommentContent({
        postId: currentData.post.id,
        commentId,
        body
      }));
    }
  }, [dispatch, currentData]);

  return {
    data: currentData,
    url: currentUrl,
    dataSource,
    loading,
    error,
    fetchData,
    importData,
    loadRecentPost,
    clearData: clearCurrentData,
    editPostContent,
    editCommentContent
  };
}
