import { useState } from 'react';

interface UrlInputProps {
  onSubmit: (url: string) => void;
  loading: boolean;
}

export function UrlInput({ onSubmit, loading }: UrlInputProps) {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onSubmit(url.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="url-input-form">
      <div className="input-group">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter Reddit post URL (e.g., https://www.reddit.com/r/redditdev/comments/...)"
          className="url-input"
          disabled={loading}
        />
        <button 
          type="submit" 
          disabled={loading || !url.trim()}
          className="fetch-button"
        >
          {loading ? 'Loading...' : 'Fetch Post'}
        </button>
      </div>
    </form>
  );
}
