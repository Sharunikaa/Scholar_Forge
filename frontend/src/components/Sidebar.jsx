import { useState, useEffect } from 'react'
import client from '../api/client'

export default function Sidebar({ activePage, onPageChange }) {
  const [recents, setRecents] = useState([])
  const [loading, setLoading] = useState(true)

  const menuItems = [
    { id: 'home', label: 'New Research', icon: '🔭' },
    { id: 'sessions', label: 'Sessions', icon: '📋' },
  ]

  const tools = [
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ]

  // Fetch recent queries
  useEffect(() => {
    const fetchRecents = async () => {
      try {
        const response = await client.get('/queries')
        const queries = Array.isArray(response.data) ? response.data : []
        
        // Get last 5 completed queries
        const completed = queries
          .filter(q => q.status === 'completed' || q.status === 'done')
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 5)

        setRecents(completed)
      } catch (err) {
        console.error('Error fetching recents:', err)
        setRecents([])
      } finally {
        setLoading(false)
      }
    }

    fetchRecents()
  }, [])

  const handleOpenReport = (queryId, question) => {
    console.log('Opening report:', { queryId, question })
    sessionStorage.setItem('activeQueryId', queryId)
    sessionStorage.setItem('activeQuestion', question || 'Research Report')
    // Add small delay to ensure sessionStorage is set before navigation
    setTimeout(() => onPageChange('report'), 100)
  }

  const getTimeAgo = (date) => {
    const now = new Date()
    const then = new Date(date)
    const diff = now - then
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (hours < 1) return 'Just now'
    if (hours < 24) return `${hours}h ago`
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days}d ago`
    return then.toLocaleDateString()
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-section">Workspace</div>
      {menuItems.map((item) => (
        <div 
          key={item.id} 
          className={`sidebar-item ${activePage === item.id ? 'active' : ''}`} 
          onClick={() => onPageChange(item.id)}
        >
          <div className="sidebar-icon">{item.icon}</div>
          <span>{item.label}</span>
        </div>
      ))}

      <div className="sidebar-divider"></div>
      <div className="sidebar-section">Recent Reports</div>
      {loading ? (
        <div style={{ padding: '12px', fontSize: '12px', color: 'var(--ink4)' }}>Loading...</div>
      ) : recents.length === 0 ? (
        <div style={{ padding: '12px', fontSize: '12px', color: 'var(--ink4)' }}>No reports yet</div>
      ) : (
        recents.map((query) => (
          <div 
            key={query.id}
            className="sidebar-item" 
            style={{ 
              flexDirection: 'column', 
              alignItems: 'flex-start', 
              gap: '3px',
              cursor: 'pointer',
              opacity: 0.8,
              transition: 'opacity 0.2s'
            }}
            onClick={() => handleOpenReport(query.id, query.question)}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
          >
            <div style={{ fontSize: '12px', color: 'var(--ink)', fontWeight: 500, lineHeight: 1.2 }}>
              {query.question?.substring(0, 35) || 'Untitled'}
              {query.question?.length > 35 ? '…' : ''}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--ink4)' }}>
              {getTimeAgo(query.created_at)} · {query.status === 'completed' ? '✓' : query.status}
            </div>
          </div>
        ))
      )}

      <div className="sidebar-divider"></div>
      <div className="sidebar-section">Tools</div>
      {tools.map((item) => (
        <div 
          key={item.id} 
          className={`sidebar-item ${activePage === item.id ? 'active' : ''}`} 
          onClick={() => onPageChange(item.id)}
        >
          <div className="sidebar-icon">{item.icon}</div>
          <span>{item.label}</span>
        </div>
      ))}

      <div className="sidebar-footer">
      </div>
    </aside>
  )
}
