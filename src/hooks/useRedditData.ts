import { useState, useCallback } from 'react';
import type { RedditDataState, RedditApiResponse } from '../types/reddit';
import { parseRedditUrl, fetchRedditData } from '../utils/redditApi';
import { parseImportedFile } from '../utils/importExport';

export function useRedditData() {
  const [state, setState] = useState<RedditDataState>({
    data: null,
    loading: false,
    error: null
  });

  const fetchData = useCallback(async (url: string) => {
    // Reset state and start loading
    setState({
      data: null,
      loading: true,
      error: null
    });

    try {
      // Parse the Reddit URL
      const parsed = parseRedditUrl(url);
      
      if (!parsed.isValid) {
        throw new Error('Invalid Reddit URL. Please provide a valid Reddit post URL.');
      }

      // Fetch the data
      const data = await fetchRedditData(parsed.subreddit, parsed.postId);
      
      setState({
        data,
        loading: false,
        error: null
      });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    }
  }, []);

  const clearData = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null
    });
  }, []);

  const importData = useCallback(async (file: File) => {
    setState({
      data: null,
      loading: true,
      error: null
    });

    try {
      const data = await parseImportedFile(file);
      setState({
        data,
        loading: false,
        error: null
      });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to import file'
      });
    }
  }, []);

  const setData = useCallback((data: RedditApiResponse) => {
    setState({
      data,
      loading: false,
      error: null
    });
  }, []);

  return {
    ...state,
    fetchData,
    clearData,
    importData,
    setData
  };
}
