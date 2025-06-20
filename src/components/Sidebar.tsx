import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store/types';
import { toggleSidebar, removeRecentPost, clearRecentPosts } from '../store/slices/sidebarSlice';
import { setData } from '../store/slices/appSlice';
import { ImportInput } from './ImportInput';
import { formatTimestamp } from '../utils/redditApi';
import type { RecentPost } from '../store/types';

interface SidebarProps {
  onImport: (file: File) => void;
  loading: boolean;
}

export function Sidebar({ onImport, loading }: SidebarProps) {
  const dispatch = useDispatch();
  const { isOpen, recentPosts } = useSelector((state: RootState) => state.sidebar);

  const handleToggle = () => {
    dispatch(toggleSidebar());
  };

  const handlePostClick = (post: RecentPost) => {
    dispatch(setData({
      data: post.data,
      url: post.originalUrl,
      source: post.source
    }));
  };

  const handleRemovePost = (postId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    dispatch(removeRecentPost(postId));
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all recent posts?')) {
      dispatch(clearRecentPosts());
    }
  };

  return (
    <>
      {/* Sidebar Toggle Button */}
      <button 
        className={`sidebar-toggle ${isOpen ? 'open' : ''}`}
        onClick={handleToggle}
        aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
      </button>

      {/* Sidebar Overlay for mobile */}
      {isOpen && <div className="sidebar-overlay" onClick={handleToggle}></div>}

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>Reddit Viewer</h2>
          <button 
            className="sidebar-close"
            onClick={handleToggle}
            aria-label="Close sidebar"
          >
            ×
          </button>
        </div>

        <div className="sidebar-content">
          {/* Import Section */}
          <div className="sidebar-section">
            <h3>Import Data</h3>
            <ImportInput onImport={onImport} loading={loading} />
          </div>

          {/* Recent Posts Section */}
          <div className="sidebar-section">
            <div className="section-header">
              <h3>Recent Posts</h3>
              {recentPosts.length > 0 && (
                <button 
                  className="clear-all-btn"
                  onClick={handleClearAll}
                  title="Clear all recent posts"
                >
                  Clear All
                </button>
              )}
            </div>

            {recentPosts.length === 0 ? (
              <p className="no-recent-posts">No recent posts yet</p>
            ) : (
              <div className="recent-posts-list">
                {recentPosts.map((post) => (
                  <div 
                    key={post.id}
                    className="recent-post-item"
                    onClick={() => handlePostClick(post)}
                  >
                    <div className="post-info">
                      <h4 className="post-title">{post.title}</h4>
                      <div className="post-meta">
                        <span className="post-subreddit">r/{post.subreddit}</span>
                        <span className="post-separator">•</span>
                        <span className="post-author">u/{post.author}</span>
                      </div>
                      <div className="post-timestamps">
                        <span className="post-time">
                          Posted {formatTimestamp(post.timestamp)}
                        </span>
                        <span className={`post-source ${post.source}`}>
                          {post.source === 'fetched' ? '🌐' : '📁'}
                        </span>
                      </div>
                    </div>
                    <button 
                      className="remove-post-btn"
                      onClick={(e) => handleRemovePost(post.id, e)}
                      title="Remove from recent posts"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
