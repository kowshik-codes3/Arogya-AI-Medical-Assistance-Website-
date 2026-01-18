import React, { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, TrendingDown, Activity, Heart, Eye, Mic, Brain, Calendar, Clock, Target, Award, AlertCircle, CheckCircle, Info, Download, Share2, RefreshCw, Zap, Shield } from 'lucide-react'

export default function HealthAnalyticsPage() {
  const [timeRange, setTimeRange] = useState('7d')
  const [analyticsData, setAnalyticsData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadAnalytics = async () => {
      setIsLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1000))
      setAnalyticsData(generateData())
      setIsLoading(false)
    }
    loadAnalytics()
  }, [timeRange])

  const generateData = () => ({
    summary: { totalScreenings: 32, healthScore: 85, riskFactors: 2, improvements: 4 },
    vitals: [
      { date: 'Mon', heartRate: 72, oxygen: 98 },
      { date: 'Tue', heartRate: 75, oxygen: 97 },
      { date: 'Wed', heartRate: 70, oxygen: 98 },
      { date: 'Thu', heartRate: 74, oxygen: 99 },
      { date: 'Fri', heartRate: 73, oxygen: 98 },
      { date: 'Sat', heartRate: 71, oxygen: 97 },
      { date: 'Sun', heartRate: 76, oxygen: 98 }
    ],
    risks: [
      { name: 'Hypertension', risk: 0.18, trend: 'down' },
      { name: 'Diabetes', risk: 0.12, trend: 'down' },
      { name: 'Heart Disease', risk: 0.08, trend: 'stable' }
    ],
    recommendations: [
      'Continue regular cardiovascular exercise',
      'Maintain current sleep schedule',
      'Consider increasing water intake'
    ]
  })

  const getRiskColor = (r) => r > 0.5 ? '#ef4444' : r > 0.3 ? '#f59e0b' : '#10b981'
  const cardStyle = { background: 'white', borderRadius: 20, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' }
  const pageStyle = { padding: '24px 32px', maxWidth: 1400, margin: '0 auto' }

  if (isLoading) {
    return (
      <div style={{ ...pageStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <BarChart3 size={28} color="white" />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 600, color: '#0f172a', marginBottom: 12 }}>Loading Health Analytics</h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#3b82f6' }}>
            <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite' }} />
            <span>Processing your health data...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={pageStyle}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ width: 64, height: 64, background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)' }}>
          <BarChart3 size={28} color="white" />
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>Health Analytics Dashboard</h1>
        <p style={{ fontSize: 16, color: '#64748b', maxWidth: 600, margin: '0 auto' }}>Comprehensive insights into your health trends</p>

        {/* Time Range */}
        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center', gap: 8 }}>
          {['7d', '30d', '90d', '1y'].map(range => (
            <button key={range} onClick={() => setTimeRange(range)} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', fontWeight: 500, cursor: 'pointer', background: timeRange === range ? '#3b82f6' : 'white', color: timeRange === range ? 'white' : '#64748b', boxShadow: timeRange === range ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none' }}>
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : '1 Year'}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 32 }}>
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ width: 48, height: 48, background: '#dbeafe', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Activity size={24} color="#3b82f6" /></div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#0f172a' }}>{analyticsData.summary.totalScreenings}</div>
              <div style={{ fontSize: 13, color: '#64748b' }}>Total Screenings</div>
            </div>
          </div>
        </div>
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ width: 48, height: 48, background: '#dcfce7', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Shield size={24} color="#16a34a" /></div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#16a34a' }}>{analyticsData.summary.healthScore}%</div>
              <div style={{ fontSize: 13, color: '#64748b' }}>Health Score</div>
            </div>
          </div>
        </div>
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ width: 48, height: 48, background: '#fef3c7', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><AlertCircle size={24} color="#f59e0b" /></div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#0f172a' }}>{analyticsData.summary.riskFactors}</div>
              <div style={{ fontSize: 13, color: '#64748b' }}>Risk Factors</div>
            </div>
          </div>
        </div>
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ width: 48, height: 48, background: '#f3e8ff', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Award size={24} color="#9333ea" /></div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#0f172a' }}>{analyticsData.summary.improvements}</div>
              <div style={{ fontSize: 13, color: '#64748b' }}>Improvements</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 32 }}>
        {/* Vitals Chart */}
        <div style={cardStyle}>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: '#0f172a', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}><Heart size={20} color="#ef4444" /> Vital Signs Trends</h3>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 8 }}>Heart Rate (BPM)</div>
            <div style={{ display: 'flex', alignItems: 'end', gap: 12, height: 80, background: 'linear-gradient(to top, #fef2f2 0%, transparent 100%)', borderRadius: 8, padding: '8px 4px' }}>
              {analyticsData.vitals.map((v, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ background: '#ef4444', width: 16, borderRadius: 4, height: `${(v.heartRate - 60) * 3}px` }} />
                  <span style={{ fontSize: 11, color: '#64748b' }}>{v.date}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 8 }}>Oxygen Saturation (%)</div>
            <div style={{ display: 'flex', alignItems: 'end', gap: 12, height: 80, background: 'linear-gradient(to top, #dbeafe 0%, transparent 100%)', borderRadius: 8, padding: '8px 4px' }}>
              {analyticsData.vitals.map((v, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ background: '#3b82f6', width: 16, borderRadius: 4, height: `${(v.oxygen - 90) * 8}px` }} />
                  <span style={{ fontSize: 11, color: '#64748b' }}>{v.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Risk Assessment */}
        <div style={cardStyle}>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: '#0f172a', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}><Brain size={20} color="#8b5cf6" /> Risk Assessment</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {analyticsData.risks.map((risk, i) => (
              <div key={i} style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontWeight: 500, color: '#0f172a' }}>{risk.name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {risk.trend === 'down' ? <TrendingDown size={16} color="#10b981" /> : <TrendingUp size={16} color="#f59e0b" />}
                    <span style={{ fontWeight: 500, color: getRiskColor(risk.risk) }}>{Math.round(risk.risk * 100)}%</span>
                  </div>
                </div>
                <div style={{ background: '#e5e7eb', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                  <div style={{ background: getRiskColor(risk.risk), height: '100%', width: `${risk.risk * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div style={{ ...cardStyle, background: 'linear-gradient(135deg, #f3e8ff 0%, #e0e7ff 100%)' }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, color: '#0f172a', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}><Zap size={20} color="#8b5cf6" /> AI Recommendations</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {analyticsData.recommendations.map((rec, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'start', gap: 12, padding: 12, background: 'white', borderRadius: 12 }}>
              <CheckCircle size={18} color="#8b5cf6" style={{ marginTop: 2, flexShrink: 0 }} />
              <span style={{ fontSize: 14, color: '#374151' }}>{rec}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 32 }}>
        <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: 'white', fontWeight: 600, cursor: 'pointer' }}><Download size={18} /> Export Report</button>
        <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', fontWeight: 600, cursor: 'pointer' }}><Share2 size={18} /> Share with Doctor</button>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}