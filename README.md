# Reddit Translator

A React application that fetches and displays Reddit posts and comments in a Reddit-like interface.

## Features

- **URL Parsing**: Extracts subreddit and post ID from Reddit URLs
- **Data Fetching**: Fetches post data and comments using Reddit's JSON API
- **Reddit-like UI**: Displays posts and nested comments with proper styling
- **Inline Editing**: Click-to-edit functionality for post titles, content, and comments
- **Translation**: Translate posts and comments individually or all at once
- **Import/Export**: Save and load Reddit discussions as JSON files
- **Sidebar Navigation**: Collapsible sidebar with recent posts and import functionality
- **Data Persistence**: Recent posts saved across browser sessions using Redux Persist
- **Responsive Design**: Works on desktop and mobile devices
- **Error Handling**: Graceful error handling for invalid URLs or API failures

## Usage

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Open your browser** and navigate to `http://localhost:5173`

3. **Enter a Reddit post URL** in the input field. For example:
   ```
   https://www.reddit.com/r/redditdev/comments/14nbw6g/updated_rate_limits_going_into_effect_over_the
   ```

4. **Click "Fetch Post"** to load the post and comments

## Sidebar Features

### Recent Posts
- **Automatic Tracking**: All loaded posts (fetched or imported) are automatically saved to recent posts
- **Quick Access**: Click any recent post to reload it instantly
- **Post Information**: Shows title, subreddit, author, and source type
- **Persistent Storage**: Recent posts are saved across browser sessions
- **Management**: Remove individual posts or clear all recent posts

### Sidebar Navigation
1. **Open Sidebar**: Click the hamburger menu (☰) in the top-left corner
2. **Browse Recent Posts**: View up to 15 most recent posts
3. **Quick Reload**: Click any recent post to view it again
4. **Import Data**: Use the import functionality directly from the sidebar
5. **Close Sidebar**: Click the × button or click outside the sidebar (mobile)

## Inline Editing

### Editing Posts and Comments
- **Click to Edit**: Click on any post title, post content, or comment text to start editing
- **Visual Feedback**: Editable content shows hover effects and edit mode styling
- **Save Changes**: Click "Save" button or use keyboard shortcuts to save
- **Cancel Edits**: Click "Cancel" button or press Escape to discard changes

### Keyboard Shortcuts
- **Enter**: Save single-line edits (post titles)
- **Ctrl+Enter**: Save multi-line edits (post content, comments)
- **Escape**: Cancel editing and revert to original content

### Edit Indicators
- **Edited Badge**: Shows "edited" badge on modified content with timestamp
- **Persistent Changes**: Edits are saved in current session and recent posts
- **Export Integration**: Edited content is included in exported JSON files

## Translation Features

### Bulk Translation
- **Translate All Button**: Located in the post actions area when content is loaded
- **Language Selection**: Choose target language from dropdown (defaults to Vietnamese)
- **Progress Tracking**: Shows translation progress and completion status
- **Revert All**: Quickly revert all translations back to original text

### Individual Translation
- **Per-Content Translation**: Translate button appears on hover for each post/comment
- **Individual Control**: Translate or revert each piece of content independently
- **Visual Indicators**: "translated" badges show which content has been translated
- **Instant Translation**: Click translate button for immediate translation

### Translation Management
- **Original Text Preservation**: Original text is always preserved for reverting
- **Translation Status**: Clear visual indicators for translated vs original content
- **Language Support**: Supports 14+ languages including Vietnamese, English, Spanish, French, etc.
- **Markdown Processing**: Automatically handles markdown formatting and preserves line breaks
- **Error Handling**: Graceful handling of translation failures with retry options

### Advanced Translation Features
- **Professional Markdown Processing**: Uses `markdown-to-txt` library for comprehensive markdown removal
- **Line Break Preservation**: Maintains paragraph structure and line breaks in translated content
- **Content Processing**: Handles headers, bold/italic text, links, code blocks, tables, and lists
- **Format Restoration**: Ensures translated content displays properly with correct formatting
- **Robust Conversion**: Handles complex markdown including tables, nested lists, and code blocks

## Import/Export Functionality

### Exporting Data
1. **Load a Reddit post** using the URL input
2. **Click the "Export Data" button** (appears when data is loaded)
3. **Save the JSON file** to your computer

The exported file contains:
- Complete post data (title, content, author, metadata)
- All comments with nested structure preserved
- Export timestamp and original Reddit URL
- Metadata for validation

### Importing Data
1. **Open the sidebar** and locate the "Import Data" section
2. **Click "Import Data"** or drag & drop a JSON file onto the drop zone
3. **Select a previously exported Reddit JSON file**
4. **View the imported data** in the main interface

The import feature:
- Validates file format and structure
- Shows error messages for invalid files
- Clears existing data before loading imported data
- Supports drag & drop for easy file selection
- Automatically adds imported posts to recent posts list

## Supported URL Formats

The application supports standard Reddit post URLs:
- `https://www.reddit.com/r/{subreddit}/comments/{postId}/{title}/`
- `https://reddit.com/r/{subreddit}/comments/{postId}/{title}/`

## Technical Details

### Architecture

- **React 19** with TypeScript
- **Redux Toolkit** for state management
- **Redux Persist** for data persistence
- **Vite** for build tooling
- **Custom hooks** for data fetching and state management
- **Component-based architecture** for UI
- **CSS modules** for styling

### Key Components

- `Sidebar`: Collapsible sidebar with recent posts and import functionality
- `UrlInput`: Input form for Reddit URLs
- `ImportInput`: File input with drag & drop support for importing data
- `ExportButton`: Button to export current data as JSON
- `TranslateAllButton`: Bulk translation with language selection
- `TranslateButton`: Individual content translation controls
- `EditablePostContent`: Inline editing wrapper for post titles and content
- `EditableCommentContent`: Inline editing wrapper for comment text
- `RedditPost`: Displays post content and metadata
- `CommentThread`: Renders the comment list
- `Comment`: Individual comment component with nesting support

### State Management

- `appSlice`: Manages current post data, loading states, errors, and content editing
- `sidebarSlice`: Manages sidebar state, recent posts list, and recent post updates
- `useRedditDataRedux`: Custom hook for Redux-based data operations and editing
- **Redux Persist**: Automatically saves recent posts to localStorage
- **Edit Actions**: `updatePostContent` and `updateCommentContent` for inline editing

### API Integration

Uses Reddit's public JSON API by appending `.json` to post URLs. No authentication required for public posts.

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```
