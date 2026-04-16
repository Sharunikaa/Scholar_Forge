import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { exportReport } from '../api/client'

/**
 * ReportViewer Component
 * 
 * Displays the final research report with:
 * - Confidence score
 * - Word count & source count
 * - Markdown content
 * - Citation list
 * - Export buttons (DOCX/PDF)
 */
export function ReportViewer({ report, sessionId, onExport }) {
  const [exporting, setExporting] = useState(null)
  const [exportError, setExportError] = useState(null)

  if (!report) {
    return (
      <div className="report-empty">
        <p>📋 Report will appear here once research completes</p>
      </div>
    )
  }

  const handleExport = async (format) => {
    setExporting(format)
    setExportError(null)

    try {
      console.log(`📥 Exporting as ${format.toUpperCase()}...`)
      const { data } = await exportReport(sessionId, format)
      
      // Create download link
      const url = URL.createObjectURL(new Blob([data]))
      const link = document.createElement('a')
      link.href = url
      link.download = `arxiviq_report.${format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      console.log(`✅ ${format.toUpperCase()} exported successfully`)
      if (onExport) onExport(format)
    } catch (error) {
      console.error(`Failed to export ${format}:`, error)
      setExportError(`Failed to export ${format}: ${error.message}`)
    } finally {
      setExporting(null)
    }
  }

  const confidencePercent = Math.round((report.critique_score || 0.7) * 100)

  return (
    <div className="report-viewer">
      {/* Report Header with Stats */}
      <div className="report-header">
        <div className="report-stats">
          <div className="stat-box confidence">
            <div className="stat-value">{confidencePercent}%</div>
            <div className="stat-label">Confidence</div>
            <div className="confidence-bar">
              <div 
                className="confidence-fill" 
                style={{ 
                  width: `${confidencePercent}%`,
                  backgroundColor: confidencePercent >= 75 ? '#10B981' : confidencePercent >= 60 ? '#F59E0B' : '#EF4444'
                }}
              />
            </div>
          </div>

          <div className="stat-box">
            <div className="stat-value">{report.word_count || 0}</div>
            <div className="stat-label">Words</div>
          </div>

          <div className="stat-box">
            <div className="stat-value">{(report.citations || []).length}</div>
            <div className="stat-label">Sources</div>
          </div>

          <div className="stat-box">
            <div className="stat-value">{report.language.toUpperCase()}</div>
            <div className="stat-label">Language</div>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="export-buttons">
          <button
            onClick={() => handleExport('docx')}
            disabled={exporting !== null}
            className={`btn-export ${exporting === 'docx' ? 'loading' : ''}`}
          >
            {exporting === 'docx' ? '⟳ Exporting...' : '📄 DOCX'}
          </button>
          <button
            onClick={() => handleExport('pdf')}
            disabled={exporting !== null}
            className={`btn-export ${exporting === 'pdf' ? 'loading' : ''}`}
          >
            {exporting === 'pdf' ? '⟳ Exporting...' : '📕 PDF'}
          </button>
        </div>

        {exportError && (
          <div className="export-error">
            <span>❌ {exportError}</span>
          </div>
        )}
      </div>

      {/* Markdown Content */}
      <div className="report-content">
        <article className="markdown-article">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {report.markdown || '*(No content)*'}
          </ReactMarkdown>
        </article>
      </div>

      {/* Citations */}
      {report.citations && report.citations.length > 0 && (
        <div className="citations-section">
          <h2>📚 References</h2>
          <ol className="citations-list">
            {report.citations.map((citation, idx) => (
              <li key={citation.id || idx} className="citation-item">
                <div className="citation-text">{citation.apa || citation.text}</div>
                {citation.url && (
                  <a 
                    href={citation.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="citation-link"
                  >
                    🔗 View Source
                  </a>
                )}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}

export default ReportViewer
