export default function Navigation({ currentPage, onPageChange }) {
  return (
    <nav className="nav">
      <div className="nav-logo" onClick={() => onPageChange('landing')} style={{ cursor: 'pointer' }}>
        <div className="nav-logo-mark">
          <svg viewBox="0 0 24 24" style={{ fill: 'none', stroke: '#D4A017', strokeWidth: 1.5 }}>
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        <span className="nav-logo-text">ArXivIQ</span>
      </div>

      {currentPage === 'landing' && (
        <div className="nav-links">
          <span className="nav-link" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Home</span>
          <span className="nav-link">How it works</span>
          <span className="nav-link">Compare</span>
        </div>
      )}

      <div className="nav-right">
        {currentPage === 'app' && (
          <button className="btn-sm btn-ghost" onClick={() => onPageChange('landing')}>← Landing</button>
        )}
        <button className="btn-sm btn-ghost" onClick={() => onPageChange('landing')}>Sign in</button>
        <button className="btn-sm btn-primary" onClick={() => onPageChange(currentPage === 'landing' ? 'app' : 'landing')}>
          {currentPage === 'landing' ? 'Open App →' : '← Back'}
        </button>
      </div>
    </nav>
  )
}
