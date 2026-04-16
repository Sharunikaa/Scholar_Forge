import { useEffect } from 'react'

/**
 * AgentTracePanel Component
 * 
 * Displays live trace events from the research agents
 * Updates in real-time as agents work through the pipeline
 */

const AGENT_META = {
  planner:       { icon: '🧠', label: 'Planner Agent',    color: '#8B5CF6' },
  web_search:    { icon: '🔍', label: 'Web Search',       color: '#3B82F6' },
  arxiv_search:  { icon: '📚', label: 'arXiv Search',     color: '#14B8A6' },
  pdf_ingestion: { icon: '📄', label: 'PDF Ingestion',    color: '#10B981' },
  summarizer:    { icon: '✏️',  label: 'Summarizer',      color: '#F59E0B' },
  critic:        { icon: '⚖️',  label: 'Critic Agent',    color: '#EF4444' },
  writer:        { icon: '✍️',  label: 'Writer Agent',    color: '#F97316' },
}

export function AgentTracePanel({ events, status, sessionId }) {
  // Auto-scroll to bottom when new events arrive
  useEffect(() => {
    const container = document.querySelector('.trace-events-container')
    if (container) {
      setTimeout(() => {
        container.scrollTop = container.scrollHeight
      }, 100)
    }
  }, [events])

  if (!sessionId) {
    return null
  }

  return (
    <div className="agent-trace-panel">
      <div className="trace-header">
        <h3>🔴 Live Agent Activity</h3>
        <div className="trace-meta">
          <span className="session-id">Session: {sessionId.slice(0, 8)}...</span>
          <span className={`status-badge ${status}`}>
            {status === 'running' && '⟳ In Progress'}
            {status === 'done' && '✅ Complete'}
            {status === 'failed' && '❌ Failed'}
          </span>
        </div>
      </div>

      <div className="trace-events-container">
        {events.length === 0 ? (
          <div className="trace-empty">
            <p>Waiting for agents to start...</p>
          </div>
        ) : (
          events.map((event) => <AgentStep key={event.id} event={event} />)
        )}

        {status === 'running' && events.length > 0 && (
          <div className="trace-loading">
            <div className="pulse-dot"></div>
            <span>Agents working...</span>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * AgentStep Component
 * Individual trace event display
 */
function AgentStep({ event }) {
  const meta = AGENT_META[event.agent] || { 
    icon: '⚙️', 
    label: event.agent, 
    color: '#6B7280' 
  }

  const isDone = event.status === 'done'

  return (
    <div className="agent-step">
      <div className="step-icon" style={{ color: meta.color }}>
        {meta.icon}
      </div>

      <div className="step-content">
        <div className="step-header">
          <span className="agent-name">{meta.label}</span>
          <span className={`step-status ${event.status}`}>
            {event.status === 'running' && '⟳'}
            {event.status === 'done' && '✅'}
            {event.status === 'error' && '❌'}
          </span>
        </div>

        {event.message && (
          <p className="step-message">{event.message}</p>
        )}

        {event.result && (
          <p className="step-result" style={{ color: meta.color }}>
            {event.result}
          </p>
        )}
      </div>
    </div>
  )
}

export default AgentTracePanel
