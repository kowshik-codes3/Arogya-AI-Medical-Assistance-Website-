import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Activity, Heart, Brain, TrendingUp, AlertTriangle, CheckCircle, BarChart3, Zap, Shield, Clock, Cpu, Eye, Mic, Camera, Target } from 'lucide-react'
import { comprehensiveModelManager } from '../models/comprehensive-models'

export default function Dashboard() {
  const navigate = useNavigate()
  const [healthMetrics, setHealthMetrics] = useState(null)
  const [recentActivity, setRecentActivity] = useState([])
  const [alerts, setAlerts] = useState([])
  const [aiModelStatus, setAiModelStatus] = useState({ loaded: false, progress: 0 })

  useEffect(() => {
    const initializeAIAndLoadData = async () => {
      try {
        const progressInterval = setInterval(() => {
          const progress = comprehensiveModelManager.getModelLoadingProgress()
          setAiModelStatus(prev => ({ ...prev, progress }))
        }, 500)
        await comprehensiveModelManager.initializeAllModels()
        clearInterval(progressInterval)
        setAiModelStatus({ loaded: true, progress: 100 })
        setRecentActivity(prev => [{ id: Date.now(), type: 'ai_models', title: 'AI Models Initialized', timestamp: 'Just now', status: 'completed', icon: Cpu }, ...prev])
      } catch (error) {
        setAiModelStatus({ loaded: false, progress: 0, error: error.message })
      }
    }

    setHealthMetrics({ heartRate: 72, bloodPressure: '120/80', temperature: 36.5, oxygenSaturation: 98, lastUpdated: new Date().toLocaleTimeString() })
    setRecentActivity([
      { id: 1, type: 'vital_signs', title: 'rPPG Vital Signs Analysis', timestamp: '2 minutes ago', status: 'completed', icon: Heart },
      { id: 2, type: 'disease_prediction', title: 'AI Disease Risk Assessment', timestamp: '15 minutes ago', status: 'completed', icon: Brain },
      { id: 3, type: 'voice_analysis', title: 'Voice Biomarker Screening', timestamp: '30 minutes ago', status: 'completed', icon: Mic },
      { id: 4, type: 'eye_analysis', title: 'Eye Health Screening', timestamp: '1 hour ago', status: 'completed', icon: Eye }
    ])
    setAlerts([
      { id: 1, type: 'success', title: 'AI Health Analysis Complete', message: 'Comprehensive health screening completed. Overall health score: 85/100', timestamp: '5 minutes ago' },
      { id: 2, type: 'info', title: 'Advanced Models Ready', message: 'All TensorFlow.js health screening models are loaded and ready.', timestamp: '10 minutes ago' },
      { id: 3, type: 'warning', title: 'Regular Screening Recommended', message: 'Use AI-powered screening tools weekly for optimal health monitoring.', timestamp: '2 hours ago' }
    ])
    initializeAIAndLoadData()
  }, [])

  const quickActions = [
    { title: 'rPPG Vital Signs', description: 'AI camera-based vitals analysis', icon: Heart, color: '#ef4444', path: '/vital-signs', aiPowered: true },
    { title: 'Disease Prediction', description: 'Advanced ML risk assessment', icon: Brain, color: '#10b981', path: '/disease-prediction', aiPowered: true },
    { title: 'Voice Analysis', description: 'Respiratory & cognitive screening', icon: Mic, color: '#3b82f6', path: '/voice-analysis', aiPowered: true },
    { title: 'Eye Screening', description: 'Anemia & jaundice detection', icon: Eye, color: '#f59e0b', path: '/eye-screening', aiPowered: true },
    { title: 'Health Analytics', description: 'AI-powered insights & trends', icon: BarChart3, color: '#8b5cf6', path: '/health-analytics', aiPowered: true },
    { title: 'Symptom Checker', description: 'Check symptoms and guidance', icon: Target, color: '#06b6d4', path: '/symptom-checker', aiPowered: true },
    { title: 'Emergency Protocol', description: 'Quick emergency actions', icon: AlertTriangle, color: '#dc2626', path: '/emergency-protocol' }
  ]

  const getAlertStyle = (type) => {
    if (type === 'success') return { bg: '#dcfce7', border: '#86efac', text: '#166534' }
    if (type === 'warning') return { bg: '#fef3c7', border: '#fcd34d', text: '#92400e' }
    if (type === 'info') return { bg: '#dbeafe', border: '#93c5fd', text: '#1e40af' }
    return { bg: '#f1f5f9', border: '#cbd5e1', text: '#475569' }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #f0f9ff 100%)' }}>
      {/* Header with Logo */}
      <div style={{ padding: '20px 32px', borderBottom: '1px solid #e2e8f0', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 1400, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <img src="/logo.png" alt="Arogya AI" style={{ height: 50, width: 'auto' }} />
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Zap size={24} color="#10b981" /> Health Dashboard
              </h1>
              <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>Welcome to Arogya AI - Your comprehensive health monitoring platform</p>
            </div>
          </div>
          {aiModelStatus.loaded ? (
            <div style={{ background: '#dcfce7', border: '1px solid #86efac', borderRadius: 20, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle size={16} color="#16a34a" />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#166534' }}>AI Models Ready</span>
            </div>
          ) : (
            <div style={{ background: '#dbeafe', border: '1px solid #93c5fd', borderRadius: 20, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Cpu size={16} color="#2563eb" style={{ animation: 'pulse 1s infinite' }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#1e40af' }}>Loading {Math.round(aiModelStatus.progress)}%</span>
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: '24px 32px', maxWidth: 1400, margin: '0 auto' }}>
        {/* Vital Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 32 }}>
          <div style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', borderRadius: 20, padding: 24, color: 'white', boxShadow: '0 8px 24px rgba(16,185,129,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div><h3 style={{ fontSize: 14, margin: 0, opacity: 0.9 }}>Heart Rate</h3><div style={{ fontSize: 28, fontWeight: 700, marginTop: 8 }}>{healthMetrics?.heartRate || '--'} BPM</div></div>
              <Heart size={32} style={{ opacity: 0.8 }} />
            </div>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', borderRadius: 20, padding: 24, color: 'white', boxShadow: '0 8px 24px rgba(59,130,246,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div><h3 style={{ fontSize: 14, margin: 0, opacity: 0.9 }}>Blood Pressure</h3><div style={{ fontSize: 28, fontWeight: 700, marginTop: 8 }}>{healthMetrics?.bloodPressure || '--'}</div></div>
              <Activity size={32} style={{ opacity: 0.8 }} />
            </div>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', borderRadius: 20, padding: 24, color: 'white', boxShadow: '0 8px 24px rgba(139,92,246,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div><h3 style={{ fontSize: 14, margin: 0, opacity: 0.9 }}>Temperature</h3><div style={{ fontSize: 28, fontWeight: 700, marginTop: 8 }}>{healthMetrics?.temperature || '--'}°C</div></div>
              <TrendingUp size={32} style={{ opacity: 0.8 }} />
            </div>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', borderRadius: 20, padding: 24, color: 'white', boxShadow: '0 8px 24px rgba(245,158,11,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div><h3 style={{ fontSize: 14, margin: 0, opacity: 0.9 }}>SpO₂</h3><div style={{ fontSize: 28, fontWeight: 700, marginTop: 8 }}>{healthMetrics?.oxygenSaturation || '--'}%</div></div>
              <Shield size={32} style={{ opacity: 0.8 }} />
            </div>
          </div>
          <div style={{ background: aiModelStatus.loaded ? 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)' : 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)', border: `1px solid ${aiModelStatus.loaded ? '#86efac' : '#93c5fd'}`, borderRadius: 20, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: 14, margin: 0, color: aiModelStatus.loaded ? '#047857' : '#1e40af' }}>AI Models Status</h3>
                <div style={{ fontSize: 28, fontWeight: 700, marginTop: 8, color: aiModelStatus.loaded ? '#047857' : '#1e40af' }}>{aiModelStatus.loaded ? 'Ready' : `${Math.round(aiModelStatus.progress)}%`}</div>
              </div>
              <Cpu size={32} style={{ opacity: 0.8, color: aiModelStatus.loaded ? '#047857' : '#1e40af' }} />
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
          {/* Quick Actions */}
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: '#0f172a', marginBottom: 20 }}>Quick Actions</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {quickActions.map((action, i) => {
                const IconComponent = action.icon
                return (
                  <div key={i} onClick={() => navigate(action.path)} style={{ background: 'white', borderRadius: 16, padding: 20, cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.1)'; e.currentTarget.style.borderColor = action.color }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'; e.currentTarget.style.borderColor = '#e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'start', gap: 12 }}>
                      <div style={{ background: `${action.color}15`, borderRadius: 10, padding: 10 }}><IconComponent size={22} color={action.color} /></div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#0f172a', margin: 0 }}>{action.title}</h3>
                          {action.aiPowered && <span style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: 'white', fontSize: 9, fontWeight: 600, padding: '2px 6px', borderRadius: 6 }}>AI</span>}
                        </div>
                        <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>{action.description}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Health Alerts */}
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: '#0f172a', marginBottom: 20 }}>Health Alerts</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {alerts.map(alert => {
                const style = getAlertStyle(alert.type)
                return (
                  <div key={alert.id} style={{ background: style.bg, border: `1px solid ${style.border}`, borderRadius: 12, padding: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 6 }}>
                      <h4 style={{ fontSize: 14, fontWeight: 600, color: style.text, margin: 0 }}>{alert.title}</h4>
                      <span style={{ fontSize: 11, color: '#64748b' }}>{alert.timestamp}</span>
                    </div>
                    <p style={{ fontSize: 13, color: style.text, margin: 0, opacity: 0.9 }}>{alert.message}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
    </div>
  )
}