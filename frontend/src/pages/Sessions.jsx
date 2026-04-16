import { useState, useEffect } from 'react'
import client from '../api/client'

export default function Sessions({ onNavigate }) {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await client.get('/queries')
        setSessions(response.data || [])
        setError(null)
      } catch (err) {
        console.error('Error fetching sessions:', err)
        setError(err.response?.data?.detail || 'Failed to load sessions')
      } finally {
        setLoading(false)
      }
    }

    fetchSessions()
  }, [])

  const handleOpenSession = (sessionId) => {
    sessionStorage.setItem('activeQueryId', sessionId)
    onNavigate('research')
  }

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '32px', marginBottom: '16px' }}>⟳</div>
        <p>Loading sessions...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '40px' }}>
        <div style={{
          background: '#ffebee',
          border: '1px solid #c62828',
          borderRadius: '4px',
          padding: '16px',
          color: '#c62828'
        }}>
          <p><strong>Error:</strong> {error}</p>
        </div>
      </div>
    )
  }

  const statusEmoji = {
    pending: '⏳',
    processing: '🔵',
    completed: '✅',
    failed: '❌'
  }

  const formatDate = (isoString) => {
    if (!isoString) return '-'
    const date = new Date(isoString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
  }

  return (
    <div style={{ padding: '40px', maxWidth: '1200px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px', fontFamily: "'Instrument Serif', Georgia, serif" }}>
          Research Sessions
        </h1>
        <p style={{ color: '#6b6360', fontSize: '14px' }}>
          View your research history
        </p>
      </div>

      {/* Session Table */}
      {sessions.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: '#6b6360'
        }}>
          <p style={{ fontSize: '16px', marginBottom: '12px' }}>No research sessions yet</p>
          <p style={{ fontSize: '14px' }}>
            Go to <strong>Home</strong> and start a research to create a session.
          </p>
        </div>
      ) : (
        <div style={{
          background: '#f7f5f0',
          borderRadius: '8px',
          border: '1px solid #e6e0da',
          overflow: 'hidden'
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '13px'
          }}>
            <thead>
              <tr style={{ background: '#e6e0da' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#1A1814' }}>
                  Research Question
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#1A1814' }}>
                  Status
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#1A1814' }}>
                  Created
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600', color: '#1A1814' }}>
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr
                  key={session.id}
                  style={{
                    borderTop: '1px solid #e6e0da',
                    background: '#ffffff',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f9f7f2'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
                >
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{
                      maxWidth: '400px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {session.question || 'Untitled'}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '16px' }}>
                        {statusEmoji[session.status] || '❓'}
                      </span>
                      <span style={{ color: '#6b6360', textTransform: 'capitalize' }}>
                        {session.status}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#6b6360' }}>
                    {formatDate(session.created_at)}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <button
                      onClick={() => handleOpenSession(session.id)}
                      style={{
                        background: '#0F7470',
                        color: 'white',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}
                    >
                      Open
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
