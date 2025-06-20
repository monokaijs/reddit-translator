import type { RedditApiResponse } from '../types/reddit';

export interface RecentPost {
  id: string;
  title: string;
  subreddit: string;
  author: string;
  timestamp: number;
  loadedAt: number;
  source: 'fetched' | 'imported';
  originalUrl?: string;
  data: RedditApiResponse;
}

export interface AppState {
  currentData: RedditApiResponse | null;
  currentUrl: string;
  dataSource: 'fetched' | 'imported' | null;
  loading: boolean;
  error: string | null;
}

export interface SidebarState {
  isOpen: boolean;
  recentPosts: RecentPost[];
}

export interface RootState {
  app: AppState;
  sidebar: SidebarState;
}
