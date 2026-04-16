import { useState, useEffect } from 'react'
import client from '../api/client'

export default function ReportFull({ onNavigate, onToast }) {
  const queryId = sessionStorage.getItem('activeQueryId')
  const question = sessionStorage.getItem('activeQuestion')
  const [query, setQuery] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)

  /**
   * Detect if report has a rate limit error
   */
  const hasRateLimitError = (reportMarkdown) => {
    return reportMarkdown && reportMarkdown.includes('rate_limit_exceeded')
  }

  /**
   * Download report as text file
   */
  const downloadReport = () => {
    if (!query?.report) return
    
    const content = `
RESEARCH REPORT
===============
Question: ${question}
Generated: ${new Date().toLocaleString()}
Confidence: ${(query.report.confidence_score * 100).toFixed(0)}%

${query.report.markdown || 'No report content available'}

Sources/Citations: ${query.report.citations?.length || 0}
${query.report.citations?.map((c, i) => `${i + 1}. ${c.title || 'Untitled'}`).join('\n') || ''}
    `.trim()
    
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `research-report-${queryId}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    if (onToast) onToast('Report downloaded!', 'success')
  }

  /**
   * Retry report generation
   */
  const handleRetryReport = async () => {
    setRetryCount(prev => prev + 1)
    setLoading(true)
    onToast('Retrying report generation...', 'info')
    
    try {
      const queryResp = await client.get(`/queries/${queryId}`)
      setQuery(queryResp.data)
      setError(null)
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message
      setError(errorMsg)
      onToast('Failed to retry: ' + errorMsg, 'error')
    } finally {
      setLoading(false)
    }
  }

  // Fetch query on mount or when queryId changes
  useEffect(() => {
    const fetchQuery = async () => {
      try {
        if (!queryId) {
          setError('No active research found - please select a report from Recent Reports')
          setLoading(false)
          return
        }

        console.log('Fetching query:', queryId)
        const queryResp = await client.get(`/queries/${queryId}`)
        console.log('Query response:', queryResp.data)
        
        const queryData = queryResp.data
        if (queryData.report) {
          setQuery(queryData)
        } else {
          // Try to fetch report separately
          try {
            const reportResp = await client.get(`/queries/${queryId}/report`)
            if (reportResp?.data?.report) {
              queryData.report = reportResp.data.report
            }
          } catch (reportErr) {
            console.log('Report not ready yet:', reportErr.message)
          }
          setQuery(queryData)
        }
        setError(null)
      } catch (err) {
        console.error('Error fetching report:', err)
        const errorMsg = err.response?.data?.detail || err.message || 'Failed to load report'
        setError(errorMsg)
        if (onToast) onToast(errorMsg, 'error')
      } finally {
        setLoading(false)
      }
    }

    setLoading(true)
    fetchQuery()
  }, [queryId, onToast])

  if (loading) {
    return (
      <div style={{ padding: '60px 40px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px', animation: 'spin 2s linear infinite' }}>⟳</div>
        <p style={{ fontSize: '16px', color: '#6b6360', marginBottom: '8px' }}>Loading report...</p>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  if (error || !query) {
    return (
      <div style={{ padding: '60px 40px', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{
          background: '#ffebee',
          border: '1px solid #ef5350',
          borderRadius: '12px',
          padding: '24px'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '12px' }}>❌</div>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px', color: '#c62828' }}>
            Error Loading Report
          </h3>
          <p style={{ fontSize: '14px', marginBottom: '20px', lineHeight: '1.6', color: '#c62828' }}>
            {error || 'Failed to load the research report'}
          </p>
          <button
            onClick={() => onNavigate('home')}
            style={{
              background: '#c62828',
              color: 'white',
              border: 'none',
              padding: '10px 24px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '700'
            }}
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  const hasRateError = query?.report && hasRateLimitError(query.report.markdown)
  const isErrorOnlyReport = hasRateError || (query?.report?.word_count || 0) < 100

  return (
    <div style={{ padding: '60px 40px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <button
            onClick={() => onNavigate('research')}
            style={{
              background: 'transparent',
              border: '1px solid #ede8e3',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600'
            }}
          >
            ← Back to Live View
          </button>
          <button
            onClick={downloadReport}
            disabled={!query?.report}
            style={{
              background: query?.report ? 'linear-gradient(135deg, #0F7470 0%, #148080 100%)' : '#ccc',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: query?.report ? 'pointer' : 'not-allowed',
              fontSize: '13px',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              if (query?.report) {
                e.target.style.transform = 'translateY(-2px)'
                e.target.style.boxShadow = '0 4px 12px rgba(15, 116, 112, 0.25)'
              }
            }}
            onMouseOut={(e) => {
              if (query?.report) {
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = 'none'
              }
            }}
          >
            📥 Download Report
          </button>
        </div>
        <h1 style={{ 
          fontSize: '36px', 
          fontWeight: '800', 
          fontFamily: "'Instrument Serif', Georgia, serif",
          color: '#1A1814',
          margin: '0 0 12px 0'
        }}>
          Research Report
        </h1>
        <p style={{ fontSize: '15px', color: '#6b6360', margin: 0 }}>
          {question}
        </p>
      </div>

      {/* Rate Limit Error Alert */}
      {hasRateError && (
        <div style={{
          background: '#fff3cd',
          border: '1px solid #ffc107',
          borderRadius: '8px',
          padding: '24px',
          marginBottom: '32px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px'
        }}>
          <span style={{ fontSize: '28px', flexShrink: 0 }}>⚠️</span>
          <div style={{ flex: 1 }}>
            <h4 style={{ fontSize: '18px', fontWeight: '700', color: '#856404', margin: '0 0 8px 0' }}>
              Report Generation Failed - API Rate Limit
            </h4>
            <p style={{ fontSize: '14px', color: '#856404', margin: '0 0 4px 0', lineHeight: '1.6' }}>
              ✅ Your research gathering completed successfully
            </p>
            <p style={{ fontSize: '14px', color: '#856404', margin: '0 0 12px 0', lineHeight: '1.6' }}>
              ❌ Report synthesis hit API rate limit while generating the final document
            </p>
            <p style={{ fontSize: '14px', color: '#856404', margin: '0 0 16px 0', lineHeight: '1.6' }}>
              Please wait a few minutes for the rate limit to reset, then retry below to generate your final report.
            </p>
            <button
              onClick={handleRetryReport}
              style={{
                background: '#ffc107',
                color: '#856404',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '700',
                marginRight: '12px'
              }}
            >
              🔄 Retry Report Generation
            </button>
            <span style={{ fontSize: '13px', color: '#856404', fontWeight: '600' }}>
              Attempt {retryCount + 1}
            </span>
          </div>
        </div>
      )}

      {/* Partial Report - Show gathered data when final report failed */}
      {isErrorOnlyReport && query?.report && (
        <PartialReportView query={query} />
      )}

      {/* Research Data Summary */}
      {isErrorOnlyReport && query?.report && (
        <div style={{
          background: '#f0fffe',
          border: '1px solid #0F7470',
          borderRadius: '8px',
          padding: '24px',
          marginBottom: '32px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0F7470', margin: '0 0 16px 0' }}>
            📊 Research Data Summary (Report Pending)
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            marginBottom: '16px'
          }}>
            <SummaryField 
              icon="🧠" 
              label="Sub-Questions" 
              value={`${query.report.sub_questions?.length || 0} identified`} 
            />
            <SummaryField 
              icon="🔍" 
              label="Sources Found" 
              value={`${query.report.citations?.length || 0} sources`} 
            />
            <SummaryField 
              icon="⭐" 
              label="Confidence" 
              value={`${(query.report.confidence_score * 100).toFixed(0)}% confident`} 
            />
            <SummaryField 
              icon="📄" 
              label="Status" 
              value="Report pending..." 
            />
          </div>

          {/* Sub-Questions List */}
          {query.report.sub_questions && query.report.sub_questions.length > 0 && (
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #d4eae8' }}>
              <p style={{ fontSize: '12px', fontWeight: '700', color: '#0F7470', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Research Sub-Questions
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {query.report.sub_questions.map((sq, idx) => (
                  <div key={idx} style={{
                    background: '#ffffff',
                    border: '1px solid #e0e0e0',
                    borderRadius: '4px',
                    padding: '8px 12px',
                    fontSize: '13px',
                    color: '#1A1814'
                  }}>
                    <span style={{ fontWeight: '600' }}>Q{idx + 1}:</span> {sq.question}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Full Report Content */}
      {query?.report && !isErrorOnlyReport && (
        <div style={{
          background: '#ffffff',
          border: '1px solid #ede8e3',
          borderRadius: '12px',
          padding: '40px',
          overflow: 'auto'
        }}>
          {/* Metadata */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            marginBottom: '32px',
            paddingBottom: '32px',
            borderBottom: '1px solid #ede8e3'
          }}>
            <MetaField label="Confidence Score" value={`${(query.report.confidence_score * 100).toFixed(0)}%`} />
            <MetaField label="Word Count" value={query.report.word_count?.toLocaleString() || '—'} />
            <MetaField label="Sub-Questions" value={query.report.sub_questions?.length || 0} />
            <MetaField label="Citations" value={query.report.citations?.length || 0} />
          </div>

          {/* Markdown Content */}
          <div style={{
            fontSize: '15px',
            lineHeight: '1.8',
            color: '#1A1814'
          }}>
            <MarkdownRenderer content={query.report.markdown} citations={query.report.citations} />
          </div>

          {/* References Section */}
          {query.report.citations && query.report.citations.length > 0 && (
            <div style={{
              marginTop: '40px',
              paddingTop: '32px',
              borderTop: '2px solid #ede8e3'
            }}>
              <h2 style={{ fontSize: '24px', fontWeight: '700', margin: '0 0 20px 0', color: '#1A1814' }}>
                📚 References
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {query.report.citations.map((citation, idx) => (
                  <CitationCard key={citation.id} citation={citation} index={idx + 1} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* No Report State */}
      {!query?.report && (
        <div style={{
          background: '#f9f8f6',
          border: '1px solid #ede8e3',
          borderRadius: '12px',
          padding: '60px 40px',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '16px', color: '#6b6360', marginBottom: '8px' }}>
            📄 No report available
          </p>
          <p style={{ fontSize: '14px', color: '#9a8f85', margin: 0 }}>
            The report may still be generating. Check back in a moment.
          </p>
        </div>
      )}
    </div>
  )
}

/**
 * Summary field component for research data
 */
function SummaryField({ icon, label, value }) {
  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #d4eae8',
      borderRadius: '6px',
      padding: '12px',
      textAlign: 'center'
    }}>
      <p style={{ fontSize: '20px', margin: '0 0 4px 0' }}>
        {icon}
      </p>
      <p style={{ fontSize: '11px', fontWeight: '700', color: '#0F7470', margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {label}
      </p>
      <p style={{ fontSize: '14px', fontWeight: '600', color: '#1A1814', margin: 0 }}>
        {value}
      </p>
    </div>
  )
}

/**
 * Metadata field component
 */
function MetaField({ label, value }) {
  return (
    <div>
      <p style={{ fontSize: '12px', fontWeight: '700', color: '#6b6360', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {label}
      </p>
      <p style={{ fontSize: '16px', fontWeight: '600', color: '#1A1814', margin: 0 }}>
        {value}
      </p>
    </div>
  )
}

/**
 * Render text with clickable citation references
 */
function renderTextWithCitations(text, citations) {
  if (!text) return text

  // Pattern matches [1], [2], etc. or [1-3], or [1,2,3]
  const citationPattern = /\[(\d+(?:[-,]\d+)*)\]/g
  let lastIndex = 0
  const parts = []

  text.replace(citationPattern, (match, refStr, offset) => {
    // Add text before the citation
    if (offset > lastIndex) {
      parts.push(text.substring(lastIndex, offset))
    }

    // Parse citation numbers
    const nums = refStr.split(/[-,]/).map(n => parseInt(n.trim()) - 1).filter(n => !isNaN(n))

    // Create clickable citations
    if (nums.length > 0) {
      const citationRefs = nums.map((n, i) => (
        <a
          key={`cite-${n}-${i}`}
          href={`#citation-${n + 1}`}
          style={{
            color: '#0F7470',
            fontWeight: '600',
            textDecoration: 'none',
            cursor: 'pointer',
            padding: '2px 4px',
            borderRadius: '3px',
            background: '#f0fffe',
            transition: 'all 0.2s ease',
            ':hover': {
              background: '#0F7470',
              color: '#ffffff'
            }
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#0F7470'
            e.currentTarget.style.color = '#ffffff'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#f0fffe'
            e.currentTarget.style.color = '#0F7470'
          }}
        >
          [{n + 1}]
        </a>
      ))
      parts.push(citationRefs)
    }

    lastIndex = offset + match.length
    return match
  })

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex))
  }

  return parts.length > 0 ? parts : text
}

/**
 * Markdown renderer component (with citation support)
 */
function MarkdownRenderer({ content, citations = [] }) {
  if (!content) return <p>No content</p>

  // Split by lines and process
  const lines = content.split('\n')
  const elements = []
  let currentList = []

  lines.forEach((line, idx) => {
    if (line.startsWith('# ')) {
      if (currentList.length > 0) {
        elements.push(
          <ul key={`list-${idx}`} style={{ marginBottom: '16px', paddingLeft: '24px' }}>
            {currentList.map((item, i) => <li key={i} style={{ marginBottom: '8px' }}>{renderTextWithCitations(item, citations)}</li>)}
          </ul>
        )
        currentList = []
      }
      elements.push(
        <h2 key={`h2-${idx}`} style={{ fontSize: '24px', fontWeight: '700', margin: '24px 0 12px 0', color: '#1A1814' }}>
          {renderTextWithCitations(line.replace('# ', ''), citations)}
        </h2>
      )
    } else if (line.startsWith('## ')) {
      if (currentList.length > 0) {
        elements.push(
          <ul key={`list-${idx}`} style={{ marginBottom: '16px', paddingLeft: '24px' }}>
            {currentList.map((item, i) => <li key={i} style={{ marginBottom: '8px' }}>{renderTextWithCitations(item, citations)}</li>)}
          </ul>
        )
        currentList = []
      }
      elements.push(
        <h3 key={`h3-${idx}`} style={{ fontSize: '18px', fontWeight: '700', margin: '20px 0 12px 0', color: '#1A1814' }}>
          {renderTextWithCitations(line.replace('## ', ''), citations)}
        </h3>
      )
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      currentList.push(line.replace(/^[-*] /, ''))
    } else if (line.trim()) {
      if (currentList.length > 0) {
        elements.push(
          <ul key={`list-${idx}`} style={{ marginBottom: '16px', paddingLeft: '24px' }}>
            {currentList.map((item, i) => <li key={i} style={{ marginBottom: '8px' }}>{renderTextWithCitations(item, citations)}</li>)}
          </ul>
        )
        currentList = []
      }
      elements.push(
        <p key={`p-${idx}`} style={{ marginBottom: '12px', lineHeight: '1.8' }}>
          {renderTextWithCitations(line, citations)}
        </p>
      )
    }
  })

  if (currentList.length > 0) {
    elements.push(
      <ul key="list-end" style={{ marginBottom: '16px', paddingLeft: '24px' }}>
        {currentList.map((item, i) => <li key={i} style={{ marginBottom: '8px' }}>{item}</li>)}
      </ul>
    )
  }

  return <>{elements}</>
}

/**
 * Partial Report View - Show research data when report synthesis fails
 */
function PartialReportView({ query }) {
  if (!query?.report) return null

  return (
    <div style={{
      background: '#f9f8f6',
      border: '1px solid #ede8e3',
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '32px'
    }}>
      <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1A1814', margin: '0 0 16px 0' }}>
        📑 Research Findings (Report Pending Synthesis)
      </h3>
      <p style={{ fontSize: '13px', color: '#6b6360', margin: '0 0 12px 0' }}>
        While the final report is being synthesized, here's what our research agents found:
      </p>

      {/* Summary Statistics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
        marginBottom: '16px'
      }}>
        <div style={{ background: '#ffffff', padding: '12px', borderRadius: '6px', border: '1px solid #ede8e3' }}>
          <p style={{ fontSize: '11px', color: '#6b6360', margin: 0, textTransform: 'uppercase' }}>Research Depth</p>
          <p style={{ fontSize: '16px', fontWeight: '700', color: '#1A1814', margin: 0 }}>
            {query.report.sub_questions?.length || 0} Questions
          </p>
        </div>
        <div style={{ background: '#ffffff', padding: '12px', borderRadius: '6px', border: '1px solid #ede8e3' }}>
          <p style={{ fontSize: '11px', color: '#6b6360', margin: 0, textTransform: 'uppercase' }}>Sources</p>
          <p style={{ fontSize: '16px', fontWeight: '700', color: '#1A1814', margin: 0 }}>
            {query.report.citations?.length || 0} Found
          </p>
        </div>
      </div>

      {/* Sub-Questions */}
      {query.report.sub_questions && query.report.sub_questions.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <p style={{ fontSize: '12px', fontWeight: '700', color: '#6b6360', margin: '0 0 8px 0', textTransform: 'uppercase' }}>
            Research Questions
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {query.report.sub_questions.map((sq, idx) => (
              <div key={idx} style={{
                background: '#ffffff',
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid #e0e0e0',
                fontSize: '13px'
              }}>
                <span style={{ fontWeight: '600', color: '#856404' }}>Q{idx + 1}:</span> {sq.question}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Citation Card Component - Clickable citation with redirect
 */
function CitationCard({ citation, index }) {
  const handleCitationClick = () => {
    if (citation.url) {
      window.open(citation.url, '_blank')
    }
  }

  const getSourceBadge = () => {
    if (citation.source_type === 'arxiv' || citation.domain?.includes('arxiv')) {
      return <span style={{ fontSize: '12px', background: '#e3f2fd', color: '#1976d2', padding: '4px 8px', borderRadius: '4px', fontWeight: '600' }}>arXiv</span>
    } else if (citation.source_type === 'web' || !citation.source_type) {
      return <span style={{ fontSize: '12px', background: '#f3e5f5', color: '#7b1fa2', padding: '4px 8px', borderRadius: '4px', fontWeight: '600' }}>Web</span>
    }
    return <span style={{ fontSize: '12px', background: '#f0f0f0', color: '#666', padding: '4px 8px', borderRadius: '4px', fontWeight: '600' }}>{citation.source_type}</span>
  }

  return (
    <div
      id={`citation-${index}`}
      onClick={handleCitationClick}
      style={{
        background: '#ffffff',
        border: '1px solid #ede8e3',
        borderRadius: '8px',
        padding: '16px',
        cursor: citation.url ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        ':hover': citation.url ? {
          background: '#f9f8f6',
          borderColor: '#d4cfc7'
        } : {}
      }}
      onMouseEnter={(e) => {
        if (citation.url) {
          e.currentTarget.style.background = '#f9f8f6'
          e.currentTarget.style.borderColor = '#d4cfc7'
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = '#ffffff'
        e.currentTarget.style.borderColor = '#ede8e3'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        {/* Number Badge */}
        <div style={{
          background: '#0F7470',
          color: '#ffffff',
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: '700',
          fontSize: '14px',
          flexShrink: 0
        }}>
          {index}
        </div>

        {/* Citation Content */}
        <div style={{ flex: 1 }}>
          {/* Title */}
          <p style={{ fontSize: '14px', fontWeight: '600', color: '#1A1814', margin: '0 0 8px 0' }}>
            {citation.title || citation.name || 'Untitled Source'}
          </p>

          {/* Authors / Source */}
          <p style={{ fontSize: '12px', color: '#6b6360', margin: '0 0 8px 0' }}>
            {citation.authors ? citation.authors.slice(0, 2).join(', ') + (citation.authors.length > 2 ? ' et al.' : '') : citation.domain || 'Unknown'}
          </p>

          {/* Year / Publication Info */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '8px' }}>
            {citation.year && (
              <span style={{ fontSize: '12px', color: '#6b6360' }}>
                📅 {citation.year}
              </span>
            )}
            {citation.venue && (
              <span style={{ fontSize: '12px', color: '#6b6360' }}>
                📰 {citation.venue}
              </span>
            )}
            {getSourceBadge()}
          </div>

          {/* Citation Format Toggle */}
          {(citation.apa || citation.mla || citation.ieee) && (
            <details style={{ marginTop: '8px' }}>
              <summary style={{ fontSize: '12px', fontWeight: '600', color: '#0F7470', cursor: 'pointer' }}>
                📋 Citation Formats
              </summary>
              <div style={{ marginTop: '8px', fontSize: '12px', color: '#6b6360', fontFamily: 'monospace', padding: '8px', background: '#f9f8f6', borderRadius: '4px' }}>
                {citation.apa && (
                  <div style={{ marginBottom: '8px' }}>
                    <p style={{ fontWeight: '600', margin: '0 0 4px 0' }}>APA:</p>
                    <p style={{ margin: 0, wordBreak: 'break-word' }}>{citation.apa}</p>
                  </div>
                )}
                {citation.mla && (
                  <div style={{ marginBottom: '8px' }}>
                    <p style={{ fontWeight: '600', margin: '0 0 4px 0' }}>MLA:</p>
                    <p style={{ margin: 0, wordBreak: 'break-word' }}>{citation.mla}</p>
                  </div>
                )}
                {citation.ieee && (
                  <div>
                    <p style={{ fontWeight: '600', margin: '0 0 4px 0' }}>IEEE:</p>
                    <p style={{ margin: 0, wordBreak: 'break-word' }}>{citation.ieee}</p>
                  </div>
                )}
              </div>
            </details>
          )}

          {/* Click to Open Hint */}
          {citation.url && (
            <p style={{ fontSize: '11px', color: '#0F7470', margin: '8px 0 0 0', fontWeight: '600' }}>
              🔗 Click to open source
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
