import { useState, useEffect } from 'react'
import client from '../api/client'

/**
 * Helper component to display trace detail sections
 */
function TraceDetailSection({ label, value, color }) {
  return (
    <div style={{ marginBottom: '12px' }}>
      <p style={{ fontSize: '11px', fontWeight: '700', color: '#6b6360', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {label}
      </p>
      <p style={{
        fontSize: '12px',
        color: color || '#1A1814',
        background: '#fafaf8',
        border: '1px solid #e5e0d8',
        borderRadius: '4px',
        padding: '8px 10px',
        wordBreak: 'break-word',
        fontWeight: color ? '600' : '500'
      }}>
        {value || '—'}
      </p>
    </div>
  )
}

/**
 * Helper component for detail modal fields
 */
function DetailField({ label, value, color, fullWidth }) {
  return (
    <div style={{ gridColumn: fullWidth ? '1 / -1' : 'auto' }}>
      <p style={{ fontSize: '11px', fontWeight: '700', color: '#6b6360', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {label}
      </p>
      <p style={{
        fontSize: '12px',
        color: color || '#1A1814',
        background: '#fafaf8',
        border: '1px solid #e5e0d8',
        borderRadius: '6px',
        padding: '10px 12px',
        wordBreak: 'break-word',
        margin: 0,
        fontWeight: color ? '600' : '500'
      }}>
        {value || '—'}
      </p>
    </div>
  )
}

export default function ResearchLive({ onNavigate, onToast }) {
  const queryId = sessionStorage.getItem('activeQueryId')
  const question = sessionStorage.getItem('activeQuestion')
  const [query, setQuery] = useState(null)
  const [traces, setTraces] = useState([])
  const [expandedAgent, setExpandedAgent] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pollingActive, setPollingActive] = useState(true)
  const [retryCount, setRetryCount] = useState(0)
  const [retryCountdown, setRetryCountdown] = useState(0)

  /**
   * Detect if report has a rate limit error
   */
  const hasRateLimitError = (reportMarkdown) => {
    return reportMarkdown && reportMarkdown.includes('rate_limit_exceeded')
  }

  /**
   * Parse rate limit error message
   */
  const getRateLimitInfo = (reportMarkdown) => {
    if (!reportMarkdown) return null
    const match = reportMarkdown.match(/Please try again in ([0-9.]+)/)
    const timeMatch = match ? match[1] : null
    return {
      hasError: true,
      waitTime: timeMatch ? parseFloat(timeMatch) : 10
    }
  }

  /**
   * Retry report generation
   */
  const handleRetryReport = async () => {
    setRetryCount(prev => prev + 1)
    setRetryCountdown(60) // 60 second cooldown
    setPollingActive(true)
    onToast('Retrying report generation...', 'info')
    
    // Force refetch
    try {
      const queryResp = await client.get(`/queries/${queryId}`)
      setQuery(queryResp.data)
    } catch (err) {
      onToast('Failed to retry: ' + (err.response?.data?.detail || err.message), 'error')
    }
  }

  // Retry countdown timer
  useEffect(() => {
    if (retryCountdown <= 0) return
    const timer = setInterval(() => {
      setRetryCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [retryCountdown])

  // Polling mechanism
  useEffect(() => {
    if (!queryId || !pollingActive) return

    const fetchData = async () => {
      try {
        // Fetch query status
        const queryResp = await client.get(`/queries/${queryId}`)
        setQuery(queryResp.data)

        // Fetch traces with expandable details
        const tracesResp = await client.get(`/queries/${queryId}/traces`)
        const newTraces = tracesResp.data.traces || []
        setTraces(newTraces)

        // Check if research is complete
        if (queryResp.data.status === 'done' || queryResp.data.status === 'completed') {
          setPollingActive(false)
          onToast('Research completed! You can now view the full report.', 'success')
        }

        setError(null)
      } catch (err) {
        console.error('Error fetching data:', err)
        setError(err.response?.data?.detail || 'Failed to fetch research status')
        if (err.response?.status !== 404) {
          onToast('Failed to fetch research status', 'error')
        }
      } finally {
        if (loading) setLoading(false)
      }
    }

    fetchData()

    // Poll every 1.5 seconds
    const interval = setInterval(fetchData, 1500)
    return () => clearInterval(interval)
  }, [queryId, pollingActive, loading, onToast])

  if (!queryId) {
    return (
      <div style={{ padding: '60px 40px', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '12px', color: '#1A1814' }}>
          No Active Research
        </h2>
        <p style={{ fontSize: '15px', color: '#6b6360', marginBottom: '24px', lineHeight: '1.6' }}>
          Go back to Home and submit a research question to get started.
        </p>
        <button
          onClick={() => onNavigate('home')}
          style={{
            background: '#0F7470',
            color: 'white',
            border: 'none',
            padding: '12px 28px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '15px',
            fontWeight: '700'
          }}
        >
          ← Back to Home
        </button>
      </div>
    )
  }

  if (loading && !query) {
    return (
      <div style={{ padding: '60px 40px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px', animation: 'spin 2s linear infinite' }}>⟳</div>
        <p style={{ fontSize: '16px', color: '#6b6360', marginBottom: '8px' }}>Loading research status...</p>
        <p style={{ fontSize: '13px', color: '#9a8f85' }}>This may take a moment</p>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  if (error && !query) {
    return (
      <div style={{ padding: '60px 40px', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{
          background: '#ffebee',
          border: '1px solid #ef5350',
          borderRadius: '12px',
          padding: '24px',
          color: '#c62828'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '12px' }}>❌</div>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px' }}>
            Error Loading Research
          </h3>
          <p style={{ fontSize: '14px', marginBottom: '20px', lineHeight: '1.6' }}>
            {error}
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
            Start New Research
          </button>
        </div>
      </div>
    )
  }

  const statusEmoji = {
    pending: '⏳',
    running: '🔵',
    done: '✅',
    completed: '✅',
    error: '❌'
  }

  const agentEmoji = {
    planner: '🧠',
    web_search: '🔍',
    arxiv_search: '📚',
    pdf_download: '📄',
    pdf_chunks: '📑',
    summarizer: '📝',
    critic: '⚖️',
    writer: '✍️'
  }

  const statusColor = {
    pending: '#9a8f85',
    running: '#0F7470',
    done: '#2e7d32',
    completed: '#2e7d32',
    error: '#c62828'
  }

  const progress = query?.progress || 0

  return (
    <div style={{ padding: '60px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <button
            onClick={() => onNavigate('home')}
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
            ← Back
          </button>
          <h1 style={{ 
            fontSize: '36px', 
            fontWeight: '800', 
            fontFamily: "'Instrument Serif', Georgia, serif",
            color: '#1A1814'
          }}>
            Live Research
          </h1>
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <p style={{ fontSize: '16px', color: '#1A1814', fontWeight: '600', marginBottom: '8px' }}>
            {question ? question.substring(0, 100) : 'Your research question'}
          </p>
          <p style={{ 
            fontSize: '14px', 
            color: '#6b6360',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '14px' }}>{statusEmoji[query?.status] || '❓'}</span>
            Status: <span style={{ color: statusColor[query?.status], fontWeight: '700' }}>
              {(query?.status || 'pending').toUpperCase()}
            </span>
            · Progress: <span style={{ fontWeight: '700' }}>{progress}%</span>
          </p>
        </div>

        {/* Progress Bar */}
        <div style={{
          width: '100%',
          height: '8px',
          background: '#ede8e3',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: `linear-gradient(90deg, #0F7470, #148080)`,
            transition: 'width 0.3s',
            borderRadius: '4px'
          }} />
        </div>
      </div>

      {/* Agent Timeline */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #ede8e3',
        borderRadius: '12px',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '24px 32px',
          borderBottom: '1px solid #ede8e3',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1A1814' }}>
            🤖 Agent Execution Timeline
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setShowDetailModal(true)}
              title="View detailed execution structure"
              style={{
                background: 'transparent',
                border: '1px solid #ede8e3',
                padding: '6px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600',
                color: '#0F7470',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s',
                hover: { background: '#f0fffe' }
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#f0fffe';
                e.target.style.borderColor = '#0F7470';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.borderColor = '#ede8e3';
              }}
            >
              📋 Details
            </button>
            {pollingActive && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#0F7470', fontWeight: '600' }}>
                <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#0F7470', animation: 'pulse 2s infinite' }} />
                Live tracking
                <style>{`
                  @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                  }
                `}</style>
              </div>
            )}
          </div>
        </div>

        <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {traces.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6b6360' }}>
              <p style={{ fontSize: '14px', marginBottom: '8px' }}>⏳ Waiting for agents to start...</p>
              <p style={{ fontSize: '12px', color: '#9a8f85' }}>Research pipeline initializing...</p>
            </div>
          ) : (
            traces.map((trace, idx) => (
              <div
                key={trace.id || idx}
                onClick={() => setExpandedAgent(expandedAgent === trace.id ? null : trace.id)}
                style={{
                  background: expandedAgent === trace.id ? '#f0fffe' : '#f9f8f6',
                  border: `1.5px solid ${expandedAgent === trace.id ? '#0F7470' : '#ede8e3'}`,
                  borderRadius: '8px',
                  padding: '14px 16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {/* Agent Row */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: '20px', flexShrink: 0 }}>
                      {agentEmoji[trace.agent] || '🤖'}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ 
                        fontWeight: '700', 
                        fontSize: '13px', 
                        marginBottom: '2px',
                        color: '#1A1814',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        {trace.agent.replace(/_/g, ' ')}
                      </div>
                      <div style={{ 
                        fontSize: '12px', 
                        color: '#6b6360',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {trace.message || 'Processing...'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
                    <span style={{ fontSize: '16px' }}>
                      {statusEmoji[trace.status] || '❓'}
                    </span>
                    {trace.duration_ms && trace.duration_ms > 0 && (
                      <span style={{ fontSize: '12px', color: '#6b6360', minWidth: '40px', textAlign: 'right' }}>
                        {(trace.duration_ms / 1000).toFixed(1)}s
                      </span>
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedAgent === trace.id && (
                  <div style={{
                    marginTop: '12px',
                    paddingTop: '12px',
                    borderTop: '1px solid #ede8e3',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '16px'
                  }}>
                    {/* Left Column - Core Info */}
                    <div>
                      <TraceDetailSection label="Status" value={trace.status} color={statusColor[trace.status]} />
                      <TraceDetailSection label="Message" value={trace.message} />
                      {trace.timestamp && (
                        <TraceDetailSection 
                          label="Timestamp" 
                          value={new Date(trace.timestamp).toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit', 
                            second: '2-digit',
                            fractionalSecondDigits: 3 
                          })} 
                        />
                      )}
                      {trace.duration_ms !== undefined && trace.duration_ms > 0 && (
                        <TraceDetailSection 
                          label="Duration" 
                          value={`${(trace.duration_ms / 1000).toFixed(2)}s`} 
                        />
                      )}
                    </div>

                    {/* Right Column - Result */}
                    {trace.result && (
                      <div>
                        <p style={{ fontSize: '11px', fontWeight: '700', color: '#6b6360', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Result
                        </p>
                        <div style={{
                          background: '#fafaf8',
                          border: '1px solid #e5e0d8',
                          borderRadius: '6px',
                          padding: '10px 12px',
                          fontSize: '12px',
                          color: '#1A1814',
                          lineHeight: '1.5',
                          maxHeight: '150px',
                          overflow: 'auto',
                          fontFamily: 'monospace',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word'
                        }}>
                          {trace.result}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {query?.status === 'done' || query?.status === 'completed' ? (
          <>
            {/* Rate Limit Error Alert */}
            {query?.report && hasRateLimitError(query.report.markdown) && (
              <div style={{
                background: '#fff3cd',
                border: '1px solid #ffc107',
                borderRadius: '8px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}>
                <span style={{ fontSize: '20px', flexShrink: 0 }}>⚠️</span>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#856404', margin: '0 0 8px 0' }}>
                    API Rate Limit Exceeded
                  </h4>
                  <p style={{ fontSize: '13px', color: '#856404', margin: '0 0 12px 0', lineHeight: '1.5' }}>
                    The report generation hit a token rate limit. Please wait a few minutes and try again. Your research data is saved and will be used.
                  </p>
                  <button
                    onClick={handleRetryReport}
                    disabled={retryCountdown > 0}
                    style={{
                      background: '#ffc107',
                      color: '#856404',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      cursor: retryCountdown > 0 ? 'not-allowed' : 'pointer',
                      fontSize: '13px',
                      fontWeight: '600',
                      opacity: retryCountdown > 0 ? 0.6 : 1
                    }}
                  >
                    {retryCountdown > 0 ? `Retry in ${retryCountdown}s` : `🔄 Retry Now (Attempt ${retryCount + 1})`}
                  </button>
                </div>
              </div>
            )}

            {/* Report Button */}
            <button
              onClick={() => onNavigate('report')}
              disabled={query?.report && hasRateLimitError(query.report.markdown)}
              style={{
                background: query?.report && hasRateLimitError(query.report.markdown) 
                  ? '#cccccc' 
                  : 'linear-gradient(135deg, #0F7470, #148080)',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: query?.report && hasRateLimitError(query.report.markdown) ? 'not-allowed' : 'pointer',
                fontSize: '15px',
                fontWeight: '700',
                flex: 1
              }}
            >
              📄 View Full Report
            </button>
          </>
        ) : (
          <p style={{ color: '#6b6360', fontSize: '14px' }}>
            Research in progress. Live updates every 1.5 seconds.
          </p>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(26, 24, 20, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            maxWidth: '900px',
            width: '100%',
            maxHeight: '85vh',
            overflow: 'auto',
            boxShadow: '0 20px 60px rgba(26, 24, 20, 0.15)'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '24px 32px',
              borderBottom: '1px solid #ede8e3',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'sticky',
              top: 0,
              background: '#ffffff'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1A1814', margin: 0 }}>
                📋 Execution Details
              </h3>
              <button
                onClick={() => setShowDetailModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '0',
                  color: '#6b6360'
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '32px' }}>
              {/* Query Overview */}
              <div style={{ marginBottom: '32px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#1A1814', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  📊 Query Overview
                </h4>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px'
                }}>
                  <DetailField label="Query ID" value={query?.id} />
                  <DetailField label="Session ID" value={query?.session_id?.slice(0, 16) + '...'} />
                  <DetailField label="Question" value={query?.question} fullWidth />
                  <DetailField label="Status" value={query?.status?.toUpperCase()} color={statusColor[query?.status]} />
                  <DetailField label="Progress" value={`${query?.progress}%`} />
                  <DetailField label="Language" value={query?.language?.toUpperCase()} />
                  <DetailField label="Citation Style" value={query?.citation_style?.toUpperCase()} />
                </div>
              </div>

              {/* Timing Information */}
              <div style={{ marginBottom: '32px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#1A1814', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  ⏱️ Timing Information
                </h4>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px'
                }}>
                  {query?.created_at && (
                    <DetailField 
                      label="Created At" 
                      value={new Date(query.created_at).toLocaleString()} 
                    />
                  )}
                  {query?.started_at && (
                    <DetailField 
                      label="Started At" 
                      value={new Date(query.started_at).toLocaleString()} 
                    />
                  )}
                  {query?.completed_at && (
                    <DetailField 
                      label="Completed At" 
                      value={new Date(query.completed_at).toLocaleString()} 
                    />
                  )}
                  {query?.execution_time_seconds && (
                    <DetailField 
                      label="Execution Time" 
                      value={`${query.execution_time_seconds.toFixed(2)}s`} 
                    />
                  )}
                </div>
              </div>

              {/* Error Information */}
              {query?.error && (
                <div style={{ marginBottom: '32px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#c62828', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    ❌ Error
                  </h4>
                  <div style={{
                    background: '#ffebee',
                    border: '1px solid #ef5350',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    fontSize: '12px',
                    color: '#1A1814',
                    lineHeight: '1.6',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    fontFamily: 'monospace'
                  }}>
                    {query.error}
                  </div>
                </div>
              )}

              {/* Trace Events Timeline */}
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#1A1814', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  🔄 Agent Trace Events ({traces.length})
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {traces.map((trace, idx) => (
                    <details key={trace.id || idx} style={{
                      border: '1px solid #ede8e3',
                      borderRadius: '8px',
                      padding: '0'
                    }}>
                      <summary style={{
                        padding: '12px 16px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#1A1814',
                        background: '#f9f8f6',
                        userSelect: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span>{agentEmoji[trace.agent] || '🤖'}</span>
                        <span style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          {trace.agent.replace(/_/g, ' ')}
                        </span>
                        <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#6b6360' }}>
                          {statusEmoji[trace.status]} {(trace.duration_ms / 1000).toFixed(2)}s
                        </span>
                      </summary>
                      <div style={{ padding: '12px 16px', borderTop: '1px solid #ede8e3', background: '#fafaf8' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px' }}>
                          <div>
                            <p style={{ fontSize: '11px', fontWeight: '700', color: '#6b6360', marginBottom: '4px' }}>Status</p>
                            <p style={{ color: '#1A1814', margin: 0 }}>{trace.status}</p>
                          </div>
                          <div>
                            <p style={{ fontSize: '11px', fontWeight: '700', color: '#6b6360', marginBottom: '4px' }}>Duration</p>
                            <p style={{ color: '#1A1814', margin: 0 }}>{(trace.duration_ms / 1000).toFixed(3)}s</p>
                          </div>
                          {trace.timestamp && (
                            <div style={{ gridColumn: '1 / -1' }}>
                              <p style={{ fontSize: '11px', fontWeight: '700', color: '#6b6360', marginBottom: '4px' }}>Timestamp</p>
                              <p style={{ color: '#1A1814', margin: 0, fontFamily: 'monospace' }}>
                                {new Date(trace.timestamp).toLocaleString()}
                              </p>
                            </div>
                          )}
                          <div style={{ gridColumn: '1 / -1' }}>
                            <p style={{ fontSize: '11px', fontWeight: '700', color: '#6b6360', marginBottom: '4px' }}>Message</p>
                            <p style={{ color: '#1A1814', margin: 0, lineHeight: '1.5' }}>{trace.message}</p>
                          </div>
                          {trace.result && (
                            <div style={{ gridColumn: '1 / -1' }}>
                              <p style={{ fontSize: '11px', fontWeight: '700', color: '#6b6360', marginBottom: '4px' }}>Result</p>
                              <pre style={{
                                color: '#1A1814',
                                margin: 0,
                                background: '#ffffff',
                                padding: '8px 12px',
                                borderRadius: '4px',
                                border: '1px solid #ede8e3',
                                overflow: 'auto',
                                fontSize: '11px',
                                lineHeight: '1.4'
                              }}>
                                {trace.result}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
