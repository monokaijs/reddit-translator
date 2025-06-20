import { useState, useRef, useEffect } from 'react';
import type { RedditApiResponse } from '../types/reddit';
import { exportRedditData, exportRedditDataAsText } from '../utils/importExport';

interface ExportButtonProps {
  data: RedditApiResponse;
  originalUrl?: string;
}

export function ExportButton({ data, originalUrl = '' }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [showFormatMenu, setShowFormatMenu] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowFormatMenu(false);
      }
    };

    if (showFormatMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFormatMenu]);

  const handleExport = async (format: 'json' | 'text') => {
    setIsExporting(true);
    setShowFormatMenu(false);

    try {
      if (format === 'json') {
        exportRedditData(data, originalUrl);
      } else {
        exportRedditDataAsText(data, originalUrl);
      }
      // Small delay to show the loading state
      setTimeout(() => setIsExporting(false), 500);
    } catch (error) {
      console.error('Export failed:', error);
      setIsExporting(false);
    }
  };

  const toggleFormatMenu = () => {
    setShowFormatMenu(!showFormatMenu);
  };

  return (
    <div className="export-container" ref={containerRef}>
      <button
        onClick={toggleFormatMenu}
        disabled={isExporting}
        className="export-button"
        title="Export post and comments"
      >
        {isExporting ? (
          <>
            <span className="export-icon">⏳</span>
            Exporting...
          </>
        ) : (
          <>
            <span className="export-icon">💾</span>
            Export Data
            <span className="dropdown-arrow">▼</span>
          </>
        )}
      </button>

      {showFormatMenu && !isExporting && (
        <div className="export-format-menu">
          <button
            onClick={() => handleExport('json')}
            className="export-format-option"
            title="Export as JSON file for importing back into the app"
          >
            <span className="format-icon">📄</span>
            JSON Format
            <span className="format-description">For re-importing</span>
          </button>
          <button
            onClick={() => handleExport('text')}
            className="export-format-option"
            title="Export as formatted text file for sharing or reading"
          >
            <span className="format-icon">📝</span>
            Formatted Text
            <span className="format-description">For sharing/reading</span>
          </button>
        </div>
      )}
    </div>
  );
}
