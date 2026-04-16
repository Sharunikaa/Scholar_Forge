import { useState, useEffect } from 'react'
import client from '../api/client'

export default function Analytics() {
  const [sessions, setSessions] = useState([])
  const [selectedSession, setSelectedSession] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await client.get('/sessions')
        const allSessions = Array.isArray(response.data) ? response.data : []
        setSessions(allSessions)

        // Compute analytics from sessions
        const totalSessions = allSessions.length
        const totalQueries = allSessions.reduce((sum, s) => sum + (s.total_queries || 0), 0)
        const completedQueries = allSessions.reduce((sum, s) => sum + (s.completed_queries || 0), 0)
        
        const stats = {
          totalSessions,
          totalQueries,
          completedQueries,
          completionRate: totalQueries > 0 ? Math.round((completedQueries / totalQueries) * 100) : 0,
          avgQueriesPerSession: totalSessions > 0 ? (totalQueries / totalSessions).toFixed(1) : 0,
          avgSuccessRate: totalSessions > 0 ? Math.round((completedQueries / totalQueries) * 100) : 0
        }

        setAnalytics(stats)
        setError(null)
      } catch (err) {
        console.error('Error fetching analytics:', err)
        setError(err.response?.data?.detail || 'Failed to load analytics')
        setAnalytics({
          totalSessions: 0,
          totalQueries: 0,
          completedQueries: 0,
          completionRate: 0,
          avgQueriesPerSession: 0,
          avgSuccessRate: 0
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  if (loading) {
    return (
      <div style={{ padding: '60px 40px', textAlign: 'center' }}>
        <div style={{ fontSize: '32px', marginBottom: '16px', animation: 'spin 2s linear infinite' }}>⟳</div>
        <p style={{ fontSize: '16px', color: '#6b6360' }}>Loading analytics...</p>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div style={{ padding: '60px 40px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{
          fontSize: '40px',
          fontWeight: '800',
          marginBottom: '12px',
          fontFamily: "'Instrument Serif', Georgia, serif",
          color: '#1A1814'
        }}>
          Research Analytics
        </h1>
        <p style={{ fontSize: '16px', color: '#6b6360', lineHeight: '1.6' }}>
          Track your research activity, completion rates, and performance metrics across all sessions.
        </p>
      </div>

      {error && (
        <div style={{
          background: '#ffebee',
          border: '1px solid #ef5350',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px',
          color: '#c62828',
          fontSize: '14px'
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Key Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        {[
          { icon: '📊', label: 'Total Sessions', value: analytics?.totalSessions || 0 },
          { icon: '❓', label: 'Total Queries', value: analytics?.totalQueries || 0 },
          { icon: '✅', label: 'Completed', value: analytics?.completedQueries || 0 },
          { icon: '📈', label: 'Completion Rate', value: `${analytics?.completionRate || 0}%` },
          { icon: '⚡', label: 'Avg Queries/Session', value: analytics?.avgQueriesPerSession || 0 },
          { icon: '🎯', label: 'Success Rate', value: `${analytics?.avgSuccessRate || 0}%` }
        ].map((metric, idx) => (
          <div
            key={idx}
            style={{
              background: '#ffffff',
              border: '1px solid #ede8e3',
              borderRadius: '12px',
              padding: '24px',
              textAlign: 'center',
              transition: 'all 0.3s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = '#0F7470'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(15, 116, 112, 0.15)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = '#ede8e3'
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'
            }}
          >
            <div style={{ fontSize: '28px', marginBottom: '12px' }}>{metric.icon}</div>
            <div style={{ fontSize: '12px', color: '#6b6360', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
              {metric.label}
            </div>
            <div style={{ fontSize: '32px', fontWeight: '800', color: '#0F7470' }}>
              {metric.value}
            </div>
          </div>
        ))}
      </div>

      {/* Progress Bars */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #ede8e3',
        borderRadius: '12px',
        padding: '32px',
        marginBottom: '40px'
      }}>
        <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '24px', color: '#1A1814' }}>
          📊 Performance Metrics
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Completion Rate */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#1A1814' }}>Query Completion Rate</span>
              <span style={{ fontSize: '14px', fontWeight: '700', color: '#0F7470' }}>
                {analytics?.completionRate || 0}%
              </span>
            </div>
            <div style={{
              width: '100%',
              height: '10px',
              background: '#ede8e3',
              borderRadius: '5px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${analytics?.completionRate || 0}%`,
                background: `linear-gradient(90deg, #0F7470, #148080)`,
                transition: 'width 0.5s'
              }} />
            </div>
          </div>

          {/* Success Rate */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#1A1814' }}>Overall Success Rate</span>
              <span style={{ fontSize: '14px', fontWeight: '700', color: '#2e7d32' }}>
                {analytics?.avgSuccessRate || 0}%
              </span>
            </div>
            <div style={{
              width: '100%',
              height: '10px',
              background: '#ede8e3',
              borderRadius: '5px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${analytics?.avgSuccessRate || 0}%`,
                background: `linear-gradient(90deg, #2e7d32, #43a047)`,
                transition: 'width 0.5s'
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* Sessions List */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #ede8e3',
        borderRadius: '12px',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '24px 32px',
          borderBottom: '1px solid #ede8e3',
          background: '#f9f8f6'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1A1814', margin: 0 }}>
            📋 Research Sessions
          </h2>
        </div>

        {sessions.length === 0 ? (
          <div style={{ padding: '40px 32px', textAlign: 'center', color: '#6b6360' }}>
            <p style={{ fontSize: '14px' }}>No research sessions yet. Start your first research to see analytics.</p>
          </div>
        ) : (
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {sessions.map((session, idx) => {
              const completionRate = session.total_queries > 0 
                ? Math.round((session.completed_queries / session.total_queries) * 100)
                : 0
              
              return (
                <div
                  key={session.id || idx}
                  onClick={() => setSelectedSession(selectedSession?.id === session.id ? null : session)}
                  style={{
                    padding: '16px 32px',
                    borderBottom: idx < sessions.length - 1 ? '1px solid #ede8e3' : 'none',
                    cursor: 'pointer',
                    background: selectedSession?.id === session.id ? '#f0fffe' : '#ffffff',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = '#f9f8f6'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = selectedSession?.id === session.id ? '#f0fffe' : '#ffffff'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#1A1814', margin: 0 }}>
                      {session.name || `Session ${idx + 1}`}
                    </h3>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: '700',
                      background: completionRate === 100 ? '#e8f5e9' : completionRate > 50 ? '#fff3e0' : '#ede8e3',
                      color: completionRate === 100 ? '#2e7d32' : completionRate > 50 ? '#e65100' : '#6b6360',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {completionRate}% Complete
                    </span>
                  </div>
                  
                  <div style={{ fontSize: '12px', color: '#6b6360', marginBottom: '8px' }}>
                    {session.total_queries || 0} queries · {session.completed_queries || 0} completed
                  </div>

                  <div style={{
                    width: '100%',
                    height: '4px',
                    background: '#ede8e3',
                    borderRadius: '2px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${completionRate}%`,
                      background: completionRate === 100 ? '#2e7d32' : '#0F7470',
                      transition: 'width 0.3s'
                    }} />
                  </div>

                  {/* Expanded Session Details */}
                  {selectedSession?.id === session.id && (
                    <div style={{
                      marginTop: '16px',
                      paddingTop: '16px',
                      borderTop: '1px solid #ede8e3'
                    }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                          <p style={{ fontSize: '11px', color: '#6b6360', margin: '0 0 4px 0', textTransform: 'uppercase', fontWeight: '600' }}>
                            Created
                          </p>
                          <p style={{ fontSize: '12px', color: '#1A1814', margin: 0 }}>
                            {new Date(session.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p style={{ fontSize: '11px', color: '#6b6360', margin: '0 0 4px 0', textTransform: 'uppercase', fontWeight: '600' }}>
                            Status
                          </p>
                          <p style={{ fontSize: '12px', color: '#1A1814', margin: 0 }}>
                            {session.total_queries === session.completed_queries ? '✅ All Complete' : `🔄 ${session.total_queries - session.completed_queries} Pending`}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

