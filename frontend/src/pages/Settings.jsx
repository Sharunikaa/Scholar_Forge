import { useState, useEffect } from 'react'

export default function Settings() {
  const [settings, setSettings] = useState({
    defaultLanguage: 'en',
    autoRefresh: true,
    showNotifications: true,
    pollingInterval: 1500,
    theme: 'light'
  })
  const [success, setSuccess] = useState(null)

  // Load settings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('userSettings')
    if (saved) {
      try {
        setSettings(JSON.parse(saved))
      } catch (e) {
        console.error('Error loading settings:', e)
      }
    }
  }, [])

  // Save settings to localStorage
  const handleSettingChange = (key, value) => {
    setSettings((prev) => {
      const updated = { ...prev, [key]: value }
      localStorage.setItem('userSettings', JSON.stringify(updated))
      return updated
    })
  }

  const handleSave = () => {
    localStorage.setItem('userSettings', JSON.stringify(settings))
    setSuccess('Settings saved successfully')
    setTimeout(() => setSuccess(null), 3000)
  }


  return (
    <div style={{ padding: '40px', maxWidth: '800px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px', fontFamily: "'Instrument Serif', Georgia, serif" }}>
          Settings
        </h1>
        <p style={{ color: '#6b6360', fontSize: '14px' }}>
          Manage your preferences and research settings
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <div style={{
          background: '#e8f5e9',
          border: '1px solid #81c784',
          borderRadius: '4px',
          padding: '12px 16px',
          color: '#2e7d32',
          marginBottom: '24px',
          fontSize: '13px'
        }}>
          ✅ {success}
        </div>
      )}

      {/* Settings Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Language Settings */}
        <div style={{
          background: '#f7f5f0',
          border: '1px solid #e6e0da',
          borderRadius: '8px',
          padding: '20px'
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
            Default Language
          </h2>
          <p style={{ fontSize: '12px', color: '#6b6360', marginBottom: '16px' }}>
            Choose your preferred language for research queries
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
            gap: '12px'
          }}>
            {['en', 'hi', 'ta'].map((lang) => (
              <label
                key={lang}
                onClick={() => handleSettingChange('defaultLanguage', lang)}
                style={{
                  padding: '12px',
                  border: `2px solid ${settings.defaultLanguage === lang ? '#0F7470' : '#e6e0da'}`,
                  borderRadius: '6px',
                  background: settings.defaultLanguage === lang ? '#e0f2f1' : 'white',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s',
                  fontWeight: settings.defaultLanguage === lang ? '600' : '500',
                  color: settings.defaultLanguage === lang ? '#0F7470' : '#1A1814'
                }}
              >
                {lang === 'en' && 'English'}
                {lang === 'hi' && 'हिंदी'}
                {lang === 'ta' && 'தமிழ்'}
              </label>
            ))}
          </div>
        </div>

        {/* Polling Settings */}
        <div style={{
          background: '#f7f5f0',
          border: '1px solid #e6e0da',
          borderRadius: '8px',
          padding: '20px'
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
            Polling Interval
          </h2>
          <p style={{ fontSize: '12px', color: '#6b6360', marginBottom: '16px' }}>
            How often to check for research updates (milliseconds)
          </p>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <input
              type="range"
              min="500"
              max="5000"
              step="500"
              value={settings.pollingInterval}
              onChange={(e) => handleSettingChange('pollingInterval', parseInt(e.target.value))}
              style={{ flex: 1 }}
            />
            <span style={{
              background: '#ffffff',
              border: '1px solid #e6e0da',
              borderRadius: '4px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: '600',
              color: '#1A1814',
              minWidth: '70px',
              textAlign: 'center'
            }}>
              {settings.pollingInterval}ms
            </span>
          </div>

          <p style={{ fontSize: '11px', color: '#6b6360', marginTop: '12px' }}>
            Lower values = more frequent updates (uses more network)
          </p>
        </div>

        {/* Notification Settings */}
        <div style={{
          background: '#f7f5f0',
          border: '1px solid #e6e0da',
          borderRadius: '8px',
          padding: '20px'
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
            Notifications
          </h2>

          {/* Toggle: Show Notifications */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px',
            paddingBottom: '12px',
            borderBottom: '1px solid #e6e0da'
          }}>
            <div>
              <p style={{ fontWeight: '500', fontSize: '13px', marginBottom: '2px' }}>
                Show Notifications
              </p>
              <p style={{ fontSize: '11px', color: '#6b6360' }}>
                Get alerts when research completes
              </p>
            </div>
            <button
              onClick={() => handleSettingChange('showNotifications', !settings.showNotifications)}
              style={{
                background: settings.showNotifications ? '#0F7470' : '#e6e0da',
                border: 'none',
                borderRadius: '20px',
                width: '50px',
                height: '26px',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
            >
              <span style={{
                display: 'inline-block',
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                background: 'white',
                marginLeft: settings.showNotifications ? '24px' : '2px',
                transition: 'margin-left 0.2s'
              }} />
            </button>
          </div>

          {/* Toggle: Auto Refresh */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <p style={{ fontWeight: '500', fontSize: '13px', marginBottom: '2px' }}>
                Auto Refresh
              </p>
              <p style={{ fontSize: '11px', color: '#6b6360' }}>
                Automatically refresh research status
              </p>
            </div>
            <button
              onClick={() => handleSettingChange('autoRefresh', !settings.autoRefresh)}
              style={{
                background: settings.autoRefresh ? '#0F7470' : '#e6e0da',
                border: 'none',
                borderRadius: '20px',
                width: '50px',
                height: '26px',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
            >
              <span style={{
                display: 'inline-block',
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                background: 'white',
                marginLeft: settings.autoRefresh ? '24px' : '2px',
                transition: 'margin-left 0.2s'
              }} />
            </button>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          style={{
            background: '#0F7470',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            alignSelf: 'flex-start'
          }}
        >
          Save Settings
        </button>
      </div>
    </div>
  )
}
