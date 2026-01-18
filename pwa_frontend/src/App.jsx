import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Navigation from './components/layout/Navigation'
import ComprehensiveAIAssistant from './components/ComprehensiveAIAssistant'
import ConsentModal from './components/common/ConsentModal'
import ProtectedRoute from './components/common/ProtectedRoute'
import { AuthProvider } from './contexts/AuthContext'

// Import pages
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import Dashboard from './pages/Dashboard'
import DiseasePrediction from './pages/DiseasePrediction'
import VitalSignsCapture from './components/screening/VitalSignsCapture'
import VitalSignsPage from './pages/VitalSignsPage'
import VoiceAnalysisPage from './pages/VoiceAnalysisPage'
import EyeScreeningPage from './pages/EyeScreeningPage'
import HealthAnalyticsPage from './pages/HealthAnalyticsPage'
import EmergencyProtocolPage from './pages/EmergencyProtocolPage'
import SymptomCheckerPage from './pages/SymptomCheckerPage'
import HealthProfilePage from './pages/HealthProfilePage'
import Journal from './pages/Journal'
import PrivacySettings from './pages/PrivacySettings'

// Layout component for protected pages with sidebar
function ProtectedLayout({ children }) {
  const [consentAccepted, setConsentAccepted] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('consent.accepted.v1')
    setConsentAccepted(stored === 'true')
    const showHandler = () => setConsentAccepted(false)
    window.addEventListener('app:showDisclaimer', showHandler)
    return () => window.removeEventListener('app:showDisclaimer', showHandler)
  }, [])

  const handleAccept = () => {
    localStorage.setItem('consent.accepted.v1', 'true')
    setConsentAccepted(true)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, var(--primary-green-50) 0%, var(--white) 50%, var(--primary-green-50) 100%)'
    }}>
      {/* Sidebar Navigation - overlays content */}
      <Navigation />

      {/* Main Content Area - full width */}
      <div style={{
        overflowY: 'auto',
        position: 'relative',
        minHeight: '100vh'
      }}>
        {children}

        {/* Comprehensive AI Assistant - Fixed position */}
        <ComprehensiveAIAssistant />
        <ConsentModal visible={!consentAccepted} onAccept={handleAccept} />
      </div>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes - no sidebar */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes - with sidebar */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <ProtectedLayout><Dashboard /></ProtectedLayout>
            </ProtectedRoute>
          } />
          <Route path="/disease-prediction" element={
            <ProtectedRoute>
              <ProtectedLayout><DiseasePrediction /></ProtectedLayout>
            </ProtectedRoute>
          } />
          <Route path="/vital-signs" element={
            <ProtectedRoute>
              <ProtectedLayout><VitalSignsPage /></ProtectedLayout>
            </ProtectedRoute>
          } />
          <Route path="/voice-analysis" element={
            <ProtectedRoute>
              <ProtectedLayout><VoiceAnalysisPage /></ProtectedLayout>
            </ProtectedRoute>
          } />
          <Route path="/eye-screening" element={
            <ProtectedRoute>
              <ProtectedLayout><EyeScreeningPage /></ProtectedLayout>
            </ProtectedRoute>
          } />
          <Route path="/health-analytics" element={
            <ProtectedRoute>
              <ProtectedLayout><HealthAnalyticsPage /></ProtectedLayout>
            </ProtectedRoute>
          } />
          <Route path="/emergency-protocol" element={
            <ProtectedRoute>
              <ProtectedLayout><EmergencyProtocolPage /></ProtectedLayout>
            </ProtectedRoute>
          } />
          <Route path="/symptom-checker" element={
            <ProtectedRoute>
              <ProtectedLayout><SymptomCheckerPage /></ProtectedLayout>
            </ProtectedRoute>
          } />
          <Route path="/health-profile" element={
            <ProtectedRoute>
              <ProtectedLayout><HealthProfilePage /></ProtectedLayout>
            </ProtectedRoute>
          } />
          <Route path="/journal" element={
            <ProtectedRoute>
              <ProtectedLayout><Journal /></ProtectedLayout>
            </ProtectedRoute>
          } />
          <Route path="/settings/privacy" element={
            <ProtectedRoute>
              <ProtectedLayout><PrivacySettings /></ProtectedLayout>
            </ProtectedRoute>
          } />

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
