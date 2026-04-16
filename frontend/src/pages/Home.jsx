import { useState } from 'react'
import client from '../api/client'

export default function Home({ onNavigate, onToast }) {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!query.trim()) {
      onToast('Please enter a research question', 'warning')
      return
    }

    setError(null)
    setLoading(true)

    try {
      onToast('Starting research...', 'info')
      
      const sessionResp = await client.post('/sessions', {
        user_id: 'sharunikaa',
        name: query.trim().slice(0, 50)
      })

      const response = await client.post('/queries', {
        session_id: sessionResp.data.id,
        question: query.trim(),
        language: 'en',
        citation_style: 'apa'
      })
      
      if (response.data && response.data.id) {
        onToast('Research started! Navigating to live tracking...', 'success')
        
        // Store query info for ResearchLive page
        sessionStorage.setItem('activeQueryId', response.data.id)
        sessionStorage.setItem('activeQuestion', query)
        
        // Small delay for toast visibility
        setTimeout(() => {
          onNavigate('research')
        }, 500)
      } else {
        throw new Error('Invalid response from server')
      }
    } catch (err) {
      console.error('Error:', err)
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to start research'
      setError(errorMsg)
      onToast(errorMsg, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ 
      padding: '40px 60px',
      maxWidth: '1000px',
      margin: '0 auto'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ 
          fontSize: '40px', 
          fontWeight: '800', 
          marginBottom: '12px',
          fontFamily: "'Instrument Serif', Georgia, serif",
          color: '#1A1814'
        }}>
          New Research
        </h1>
        <p style={{ 
          fontSize: '16px', 
          color: '#6b6360',
          lineHeight: '1.6'
        }}>
          Submit your research question. Our AI agents will search academic papers and the web in parallel, 
          then synthesize findings into a comprehensive, cited report.
        </p>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} style={{ 
        background: '#ffffff',
        border: '1px solid #ede8e3',
        borderRadius: '12px',
        padding: '40px',
        marginBottom: '40px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        {/* Question Input */}
        <div style={{ marginBottom: '28px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '12px', 
            fontWeight: '700', 
            fontSize: '16px',
            color: '#1A1814'
          }}>
            Research Question
          </label>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What would you like to research? Examples: 'What are the latest advances in quantum computing?', 'How does climate change affect ocean ecosystems?'"
            style={{
              width: '100%',
              minHeight: '140px',
              padding: '14px 16px',
              border: `1.5px solid ${error ? '#e57373' : '#ede8e3'}`,
              borderRadius: '8px',
              fontFamily: 'inherit',
              fontSize: '15px',
              lineHeight: '1.6',
              resize: 'vertical',
              transition: 'all 0.2s',
              boxSizing: 'border-box',
              backgroundColor: error ? '#ffebee' : '#ffffff'
            }}
            onFocus={(e) => {
              if (!error) {
                e.target.style.borderColor = '#0F7470'
              }
            }}
            onBlur={(e) => {
              e.target.style.borderColor = error ? '#e57373' : '#ede8e3'
            }}
          />
          {error && (
            <p style={{ marginTop: '8px', fontSize: '13px', color: '#c62828' }}>
              ❌ {error}
            </p>
          )}
          <p style={{ marginTop: '10px', fontSize: '13px', color: '#6b6360' }}>
            💡 Be specific for better results. Include context, domain, or timeframe if relevant.
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !query.trim()}
          style={{
            width: '100%',
            background: loading || !query.trim() ? '#ccc' : 'linear-gradient(135deg, #0F7470 0%, #148080 100%)',
            color: loading || !query.trim() ? '#999' : 'white',
            border: 'none',
            padding: '16px 24px',
            borderRadius: '8px',
            cursor: loading || !query.trim() ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: '700',
            transition: 'all 0.2s',
            boxShadow: loading || !query.trim() ? 'none' : '0 4px 12px rgba(15, 116, 112, 0.25)'
          }}
          onMouseOver={(e) => {
            if (!loading && query.trim()) {
              e.target.style.transform = 'translateY(-2px)'
              e.target.style.boxShadow = '0 6px 20px rgba(15, 116, 112, 0.35)'
            }
          }}
          onMouseOut={(e) => {
            if (!loading && query.trim()) {
              e.target.style.transform = 'translateY(0)'
              e.target.style.boxShadow = '0 4px 12px rgba(15, 116, 112, 0.25)'
            }
          }}
        >
          {loading ? (
            <span>🔄 Initializing research agents...</span>
          ) : (
            <span>🚀 Start Research</span>
          )}
        </button>
      </form>

      {/* How It Works */}
      <div style={{
        background: '#f9f8f6',
        border: '1px solid #ede8e3',
        borderRadius: '12px',
        padding: '40px'
      }}>
        <h3 style={{ 
          fontSize: '18px', 
          fontWeight: '700', 
          marginBottom: '24px',
          color: '#1A1814'
        }}>
          ⚡ How it works
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px'
        }}>
          {[
            { num: 1, title: 'You Submit', desc: 'Enter your research question' },
            { num: 2, title: 'Agents Search', desc: 'Five agents search web + arXiv in parallel' },
            { num: 3, title: 'AI Analyzes', desc: 'Download and analyze full PDFs' },
            { num: 4, title: 'Quality Check', desc: 'AI critic validates all claims' },
            { num: 5, title: 'Get Report', desc: 'Cited report in DOCX/PDF format' }
          ].map((step) => (
            <div key={step.num} style={{
              display: 'flex',
              gap: '12px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #0F7470, #148080)',
                color: 'white',
                fontWeight: '700',
                fontSize: '14px',
                flexShrink: 0
              }}>
                {step.num}
              </div>
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#1A1814', marginBottom: '2px' }}>
                  {step.title}
                </h4>
                <p style={{ fontSize: '12px', color: '#6b6360' }}>
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
