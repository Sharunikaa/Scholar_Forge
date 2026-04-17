import { useState } from 'react'
import { useResearch } from '../hooks/useResearch'

/**
 * QueryInput Component
 * 
 * Allows users to enter a research query and configure:
 * - Language (English, Tamil, Hindi)
 * - Citation style (APA, MLA, IEEE)
 * 
 * Submits to backend and returns session ID
 */
export function QueryInput({ onSubmitted }) {
  const [query, setQuery] = useState('')
  const [language, setLanguage] = useState('en')
  const [citationStyle, setCitationStyle] = useState('apa')
  const [wordCount, setWordCount] = useState(1500)
  const [numHeadings, setNumHeadings] = useState(5)
  const [localError, setLocalError] = useState(null)
  
  const { submit, isLoading, error: hookError } = useResearch()

  const error = localError || hookError

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!query.trim()) {
      setLocalError('Please enter a research query')
      return
    }

    setLocalError(null)
    const sessionId = await submit(query, language, citationStyle, wordCount, numHeadings)
    
    if (sessionId && onSubmitted) {
      onSubmitted(sessionId)
    }
  }

  const handleKeyDown = (e) => {
    // Allow Cmd/Ctrl + Enter to submit
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleSubmit(e)
    }
  }

  return (
    <div className="query-input-container">
      <form onSubmit={handleSubmit} className="query-form">
        {/* Header */}
        <div className="qp-header">
          <h1>What do you want to research?</h1>
          <p>Ask anything about papers, policy, people, or phenomena. ArXivIQ will search arXiv + the web, read PDFs, and synthesize a report.</p>
        </div>

        {/* Query Input Textarea */}
        <div className="query-input-group">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. 'What are the long-term health impacts of PM2.5 air pollution in South Indian cities?'"
            className={`query-textarea ${error ? 'error' : ''}`}
            disabled={isLoading}
          />
        </div>

        {/* Error Display */}
        {error && (
          <div className="error-message">
            <span>❌ {error}</span>
          </div>
        )}

        {/* Settings */}
        <div className="query-settings">
          <div className="settings-group">
            <label>Language</label>
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)}
              disabled={isLoading}
            >
              <option value="en">English</option>
              <option value="ta">Tamil</option>
              <option value="hi">Hindi</option>
            </select>
          </div>

          <div className="settings-group">
            <label>Citation Style</label>
            <select 
              value={citationStyle} 
              onChange={(e) => setCitationStyle(e.target.value)}
              disabled={isLoading}
            >
              <option value="apa">APA</option>
              <option value="mla">MLA</option>
              <option value="ieee">IEEE</option>
            </select>
          </div>
          <div className="settings-group">
            <label>Report Length (words)</label>
            <input
              type="number"
              value={wordCount}
              onChange={(e) => setWordCount(Math.max(500, Math.min(5000, parseInt(e.target.value) || 1500)))}
              disabled={isLoading}
              min="500"
              max="5000"
              step="100"
              className="number-input"
            />
            <small>500 - 5000 words</small>
          </div>

          <div className="settings-group">
            <label>Number of Sections</label>
            <input
              type="number"
              value={numHeadings}
              onChange={(e) => setNumHeadings(Math.max(3, Math.min(10, parseInt(e.target.value) || 5)))}
              disabled={isLoading}
              min="3"
              max="10"
              className="number-input"
            />
            <small>3 - 10 sections</small>
          </div>
          <button 
            type="submit" 
            className={`submit-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading || !query.trim()}
          >
            {isLoading ? (
              <>
                <span className="spinner">⟳</span> Researching...
              </>
            ) : (
              <>Research <span>→</span></>
            )}
          </button>
        </div>

        {/* Keyboard Hint */}
        <div className="keyboard-hint">
          💡 Tip: Press <kbd>Cmd</kbd>/<kbd>Ctrl</kbd> + <kbd>Enter</kbd> to submit
        </div>
      </form>
    </div>
  )
}

export default QueryInput
