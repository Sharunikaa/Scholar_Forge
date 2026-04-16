import { useState, useEffect } from 'react'
import './styles/globals.css'
import './styles/app.css'
import Navigation from './components/Navigation'
import Sidebar from './components/Sidebar'
import Toast from './components/Toast'
import Home from './pages/Home'
import ResearchLive from './pages/ResearchLive'
import ReportFull from './pages/ReportFull'
import Sessions from './pages/Sessions'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import Landing from './pages/Landing'

export default function App() {
  // Check if user has visited before
  const [currentPage, setCurrentPage] = useState(() => {
    const savedPage = localStorage.getItem('lastVisitedPage')
    // If they've visited before, skip landing page
    return savedPage || 'landing'
  })
  
  const [innerPage, setInnerPage] = useState(() => {
    const savedInnerPage = localStorage.getItem('lastInnerPage')
    return savedInnerPage || 'home'
  })
  
  const [toast, setToast] = useState(null)

  // Save page state to localStorage
  useEffect(() => {
    localStorage.setItem('lastVisitedPage', currentPage)
  }, [currentPage])

  useEffect(() => {
    localStorage.setItem('lastInnerPage', innerPage)
  }, [innerPage])

  const showToast = (message, type = 'info') => {
    setToast({ message, type })
  }

  // Handle app open - mark as visited
  const handleOpenApp = () => {
    localStorage.setItem('isFirstVisit', 'false')
    setCurrentPage('app')
  }

  return (
    <div>
      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />

      {currentPage === 'landing' && (
        <div className="page active">
          <Landing onOpenApp={handleOpenApp} />
        </div>
      )}

      {currentPage === 'app' && (
        <div className="page active with-nav">
          <div className="app-shell">
            <Sidebar activePage={innerPage} onPageChange={setInnerPage} />
            <div className="main-content">
              {innerPage === 'home' && <Home onNavigate={setInnerPage} onToast={showToast} />}
              {innerPage === 'research' && <ResearchLive onNavigate={setInnerPage} onToast={showToast} />}
              {innerPage === 'report' && <ReportFull onNavigate={setInnerPage} onToast={showToast} />}
              {innerPage === 'sessions' && <Sessions onNavigate={setInnerPage} />}
              {innerPage === 'analytics' && <Analytics />}
              {innerPage === 'settings' && <Settings />}
            </div>
          </div>
        </div>
      )}

      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  )
}
