import { useEffect } from 'react'

export default function Toast({ message, type = 'info', onClose, duration = 4000 }) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [onClose, duration])

  const bgColor = {
    success: '#e8f5e9',
    error: '#ffebee',
    info: '#e3f2fd',
    warning: '#fff3e0'
  }[type]

  const borderColor = {
    success: '#81c784',
    error: '#e57373',
    info: '#64b5f6',
    warning: '#ffb74d'
  }[type]

  const textColor = {
    success: '#2e7d32',
    error: '#c62828',
    info: '#1976d2',
    warning: '#e65100'
  }[type]

  const icon = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️'
  }[type]

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      background: bgColor,
      border: `1px solid ${borderColor}`,
      borderRadius: '8px',
      padding: '16px 20px',
      color: textColor,
      fontSize: '14px',
      fontWeight: '500',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      zIndex: 10000,
      maxWidth: '400px',
      animation: 'slideIn 0.3s ease-out',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    }}>
      <span style={{ fontSize: '16px' }}>{icon}</span>
      <span>{message}</span>
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}
