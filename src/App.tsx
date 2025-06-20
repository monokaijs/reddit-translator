import {useRedditDataRedux} from './hooks/useRedditDataRedux'
import {UrlInput} from './components/UrlInput'
import {RedditPost} from './components/RedditPost'
import {CommentThread} from './components/CommentThread'
import {ExampleUrls} from './components/ExampleUrls'
import {ExportButton} from './components/ExportButton'
import {TranslateAllButton} from './components/TranslateAllButton'
import {Sidebar} from './components/Sidebar'
import './index.css'
import './components/Reddit.css'

function App() {
  const {data, url, dataSource, loading, error, fetchData, importData} = useRedditDataRedux()

  return (
    <div className="reddit-app">
      <Sidebar onImport={importData} loading={loading}/>

      <main className="main-content">
        <div className="main-content-inner">
          <header>
            <h1>Reddit Translator</h1>
            <p>Enter a Reddit post URL to load the post and comments</p>
          </header>

          <div className="input-section">
            <UrlInput onSubmit={fetchData} loading={loading}/>
          </div>

          {!data && !loading && !error && (
            <ExampleUrls/>
          )}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {loading && (
            <div className="loading-message">
              Loading Reddit data...
            </div>
          )}

          {data && (
            <>
              <div className="post-actions">
                <div className="data-source-info">
                  {dataSource === 'imported' && (
                    <span className="data-source-badge imported">📁 Imported Data</span>
                  )}
                  {dataSource === 'fetched' && url && (
                    <span className="data-source-badge fetched">🌐 Fetched from Reddit</span>
                  )}
                </div>
                <div className="action-buttons">
                  <TranslateAllButton className="translate-all-action"/>
                  <ExportButton data={data} originalUrl={url}/>
                </div>
              </div>
              <RedditPost post={data.post}/>
              <CommentThread comments={data.comments}/>
            </>
          )}
          <div style={{fontSize: 12}}>
            Made by <a style={{color: 'white'}} href={'https://github.com/monokaijs'}>@monokaijs</a>. Fork me on <a
            href={'https://github.com/monokaijs/reddit-translator'} style={{color: 'white'}}>GitHub</a>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
