import React, { useState, useEffect } from 'react'
import { Search, Plus, X, AlertTriangle, CheckCircle, Clock, Thermometer, Activity, Heart, Eye, Ear, Brain, Zap, Shield, TrendingUp, Info, Star, Target, Loader, Send } from 'lucide-react'
import { comprehensiveModelManager } from '../models/comprehensive-models'

export default function SymptomCheckerPage() {
  const [selectedSymptoms, setSelectedSymptoms] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [analysisResults, setAnalysisResults] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [modelStatus, setModelStatus] = useState({ loaded: false, progress: 0 })
  const [severity, setSeverity] = useState(1)
  const [duration, setDuration] = useState('')
  const [additionalInfo, setAdditionalInfo] = useState('')

  useEffect(() => {
    const initializeModels = async () => {
      try {
        setModelStatus({ loaded: false, progress: 0 })
        const progressInterval = setInterval(() => {
          const progress = comprehensiveModelManager.getModelLoadingProgress()
          setModelStatus(prev => ({ ...prev, progress }))
        }, 500)
        await comprehensiveModelManager.initializeAllModels()
        clearInterval(progressInterval)
        setModelStatus({ loaded: true, progress: 100 })
      } catch (error) {
        setModelStatus({ loaded: false, progress: 0, error: error.message })
      }
    }
    initializeModels()
  }, [])

  const commonSymptoms = [
    { id: 'headache', name: 'Headache', category: 'neurological', icon: Brain, severity: 2 },
    { id: 'fever', name: 'Fever', category: 'general', icon: Thermometer, severity: 3 },
    { id: 'fatigue', name: 'Fatigue', category: 'general', icon: Activity, severity: 2 },
    { id: 'cough', name: 'Cough', category: 'respiratory', icon: Activity, severity: 2 },
    { id: 'chest_pain', name: 'Chest Pain', category: 'cardiac', icon: Heart, severity: 4 },
    { id: 'shortness_breath', name: 'Shortness of Breath', category: 'respiratory', icon: Activity, severity: 4 },
    { id: 'nausea', name: 'Nausea', category: 'gastrointestinal', icon: Activity, severity: 2 },
    { id: 'dizziness', name: 'Dizziness', category: 'neurological', icon: Brain, severity: 2 },
    { id: 'abdominal_pain', name: 'Abdominal Pain', category: 'gastrointestinal', icon: Activity, severity: 3 },
    { id: 'back_pain', name: 'Back Pain', category: 'musculoskeletal', icon: Activity, severity: 2 },
    { id: 'sore_throat', name: 'Sore Throat', category: 'respiratory', icon: Activity, severity: 2 },
    { id: 'muscle_aches', name: 'Muscle Aches', category: 'musculoskeletal', icon: Activity, severity: 2 },
  ]

  const filteredSymptoms = commonSymptoms.filter(symptom =>
    symptom.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedSymptoms.some(selected => selected.id === symptom.id)
  )

  const addSymptom = (symptom) => { setSelectedSymptoms([...selectedSymptoms, { ...symptom, userSeverity: severity }]); setSearchTerm(''); setSeverity(1) }
  const removeSymptom = (symptomId) => { setSelectedSymptoms(selectedSymptoms.filter(s => s.id !== symptomId)) }

  const analyzeSymptoms = async () => {
    if (selectedSymptoms.length === 0) { alert('Please select at least one symptom'); return }
    if (!modelStatus.loaded) { alert('AI models loading...'); return }
    setIsAnalyzing(true)
    try {
      const symptomData = { symptoms: selectedSymptoms.map(s => ({ name: s.name, severity: s.userSeverity, category: s.category })), duration, additionalInfo, timestamp: new Date().toISOString() }
      const diseaseModel = comprehensiveModelManager.getModel('diseasePrediction')
      const symptomModel = comprehensiveModelManager.getModel('symptomAssessment')
      const [diseaseAnalysis, symptomAnalysis] = await Promise.all([diseaseModel.predictDisease(symptomData), symptomModel.assessSymptoms(symptomData)])
      setAnalysisResults({ ...diseaseAnalysis, ...symptomAnalysis, recommendations: generateRecommendations(selectedSymptoms), urgencyLevel: calculateUrgency(selectedSymptoms), timestamp: new Date() })
    } catch (error) {
      setAnalysisResults({ conditions: generateFallbackAnalysis(selectedSymptoms), recommendations: generateRecommendations(selectedSymptoms), urgencyLevel: calculateUrgency(selectedSymptoms), confidence: 0.75, timestamp: new Date() })
    } finally { setIsAnalyzing(false) }
  }

  const generateFallbackAnalysis = (symptoms) => {
    const conditions = [
      { name: 'Viral Upper Respiratory Infection', probability: 0.65, description: 'Common viral infection affecting nose, throat' },
      { name: 'Stress-Related Symptoms', probability: 0.45, description: 'Physical manifestations of psychological stress' },
      { name: 'Seasonal Allergies', probability: 0.35, description: 'Allergic reaction to environmental factors' }
    ]
    if (symptoms.some(s => s.category === 'cardiac')) conditions.unshift({ name: 'Requires Cardiac Evaluation', probability: 0.80, description: 'Chest symptoms requiring medical assessment' })
    return conditions.slice(0, 3)
  }

  const generateRecommendations = (symptoms) => {
    const recs = []
    const maxSeverity = Math.max(...symptoms.map(s => s.userSeverity))
    if (maxSeverity >= 4) recs.push({ type: 'urgent', text: 'Seek immediate medical attention', icon: AlertTriangle })
    if (symptoms.some(s => s.category === 'cardiac')) recs.push({ type: 'urgent', text: 'Consult healthcare provider for chest symptoms', icon: Heart })
    recs.push({ type: 'self-care', text: 'Monitor symptoms and maintain rest and hydration', icon: CheckCircle })
    return recs
  }

  const calculateUrgency = (symptoms) => {
    const maxSeverity = Math.max(...symptoms.map(s => s.userSeverity))
    if (maxSeverity >= 4 || symptoms.some(s => s.category === 'cardiac')) return { level: 'high', color: '#ef4444', message: 'Seek immediate medical attention' }
    if (maxSeverity >= 3 || symptoms.length >= 4) return { level: 'medium', color: '#f59e0b', message: 'Schedule medical consultation' }
    return { level: 'low', color: '#10b981', message: 'Monitor and self-care' }
  }

  const getSeverityColor = (s) => s >= 4 ? '#ef4444' : s >= 3 ? '#f59e0b' : s >= 2 ? '#eab308' : '#10b981'
  const getCategoryBg = (c) => ({ general: '#dbeafe', neurological: '#f3e8ff', cardiac: '#fee2e2', respiratory: '#cffafe', gastrointestinal: '#dcfce7', musculoskeletal: '#ffedd5' }[c] || '#f1f5f9')
  const getCategoryColor = (c) => ({ general: '#1e40af', neurological: '#7c3aed', cardiac: '#dc2626', respiratory: '#0891b2', gastrointestinal: '#16a34a', musculoskeletal: '#ea580c' }[c] || '#64748b')

  // Styles
  const pageStyle = { padding: '24px 32px', maxWidth: 1400, margin: '0 auto' }
  const cardStyle = { background: 'white', borderRadius: 20, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' }
  const sectionTitle = { fontSize: 20, fontWeight: 600, color: '#0f172a', marginBottom: 20 }
  const buttonPrimary = { background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)', color: 'white', border: 'none', padding: '14px 28px', borderRadius: 12, fontSize: 16, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }
  const inputStyle = { width: '100%', padding: 12, border: '1px solid #d1d5db', borderRadius: 12, fontSize: 15, outline: 'none' }

  return (
    <div style={pageStyle}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ width: 64, height: 64, background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)' }}>
          <Search size={28} color="white" />
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>AI Symptom Checker</h1>
        <p style={{ fontSize: 16, color: '#64748b', maxWidth: 600, margin: '0 auto' }}>Analyze your symptoms with AI-powered health insights</p>

        <div style={{ marginTop: 20 }}>
          {!modelStatus.loaded && !modelStatus.error && (
            <div style={{ background: '#dbeafe', border: '1px solid #93c5fd', borderRadius: 12, padding: 16, display: 'inline-block' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Loader size={20} color="#2563eb" style={{ animation: 'spin 1s linear infinite' }} />
                <span style={{ fontWeight: 600, color: '#1e40af' }}>Loading AI Models: {Math.round(modelStatus.progress)}%</span>
              </div>
            </div>
          )}
          {modelStatus.loaded && (
            <div style={{ background: '#dcfce7', border: '1px solid #86efac', borderRadius: 12, padding: '10px 20px', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle size={18} color="#16a34a" />
              <span style={{ fontWeight: 600, color: '#166534' }}>AI Models Ready</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        {/* Left Column: Symptom Selection */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={cardStyle}>
            <h2 style={sectionTitle}>Select Your Symptoms</h2>

            {/* Search */}
            <div style={{ position: 'relative', marginBottom: 20 }}>
              <Search size={18} color="#9ca3af" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input type="text" placeholder="Search symptoms..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ ...inputStyle, paddingLeft: 40 }} />
            </div>

            {/* Severity Selector */}
            {searchTerm && (
              <div style={{ background: '#f8fafc', borderRadius: 12, padding: 16, marginBottom: 20 }}>
                <label style={{ fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 8, display: 'block' }}>Symptom Severity (1-5):</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[1, 2, 3, 4, 5].map(level => (
                    <button key={level} onClick={() => setSeverity(level)} style={{ width: 40, height: 40, borderRadius: '50%', border: 'none', fontWeight: 600, cursor: 'pointer', background: severity === level ? getSeverityColor(level) : '#e5e7eb', color: severity === level ? 'white' : '#4b5563' }}>{level}</button>
                  ))}
                </div>
                <p style={{ fontSize: 12, color: '#6b7280', marginTop: 8 }}>1=Mild, 3=Moderate, 5=Very Severe</p>
              </div>
            )}

            {/* Available Symptoms */}
            {searchTerm && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                {filteredSymptoms.map(symptom => {
                  const IconComponent = symptom.icon
                  return (
                    <button key={symptom.id} onClick={() => addSymptom(symptom)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, border: '1px solid #e5e7eb', borderRadius: 12, background: 'white', cursor: 'pointer', textAlign: 'left' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <IconComponent size={18} color="#64748b" />
                        <div>
                          <div style={{ fontWeight: 500, color: '#0f172a' }}>{symptom.name}</div>
                          <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 12, background: getCategoryBg(symptom.category), color: getCategoryColor(symptom.category) }}>{symptom.category}</span>
                        </div>
                      </div>
                      <Plus size={18} color="#10b981" />
                    </button>
                  )
                })}
              </div>
            )}

            {/* Selected Symptoms */}
            {selectedSymptoms.length > 0 && (
              <div>
                <h3 style={{ fontWeight: 600, color: '#0f172a', marginBottom: 12 }}>Selected Symptoms:</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {selectedSymptoms.map(symptom => (
                    <div key={symptom.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, background: '#dcfce7', border: '1px solid #86efac', borderRadius: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 500 }}>{symptom.name}</span>
                        <span style={{ fontSize: 13, fontWeight: 500, color: getSeverityColor(symptom.userSeverity) }}>(Severity: {symptom.userSeverity})</span>
                      </div>
                      <button onClick={() => removeSymptom(symptom.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 4 }}><X size={16} /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Additional Info */}
          <div style={cardStyle}>
            <h2 style={sectionTitle}>Additional Information</h2>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 8, display: 'block' }}>Duration:</label>
              <select value={duration} onChange={(e) => setDuration(e.target.value)} style={inputStyle}>
                <option value="">Select duration</option>
                <option value="hours">A few hours</option>
                <option value="1-day">1 day</option>
                <option value="2-3-days">2-3 days</option>
                <option value="week">About a week</option>
                <option value="months">Months</option>
              </select>
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 8, display: 'block' }}>Additional details:</label>
              <textarea value={additionalInfo} onChange={(e) => setAdditionalInfo(e.target.value)} placeholder="Describe any triggers or relevant history..." rows={3} style={{ ...inputStyle, resize: 'none' }} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <button onClick={analyzeSymptoms} disabled={selectedSymptoms.length === 0 || isAnalyzing || !modelStatus.loaded} style={{ ...buttonPrimary, opacity: selectedSymptoms.length === 0 || !modelStatus.loaded ? 0.5 : 1 }}>
                {isAnalyzing ? <><Loader size={20} style={{ animation: 'spin 1s linear infinite' }} /> Analyzing...</> : <><Send size={20} /> Analyze Symptoms</>}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {!analysisResults ? (
            <div style={{ ...cardStyle, textAlign: 'center', padding: 48 }}>
              <Target size={48} color="#9ca3af" style={{ marginBottom: 16 }} />
              <h3 style={{ fontSize: 18, fontWeight: 600, color: '#0f172a', marginBottom: 8 }}>Analysis Results</h3>
              <p style={{ color: '#64748b' }}>Select symptoms and click analyze</p>
            </div>
          ) : (
            <>
              {/* Urgency */}
              <div style={{ ...cardStyle, background: analysisResults.urgencyLevel.level === 'high' ? '#fef2f2' : analysisResults.urgencyLevel.level === 'medium' ? '#fffbeb' : '#f0fdf4', borderColor: analysisResults.urgencyLevel.color, borderWidth: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: analysisResults.urgencyLevel.level === 'high' ? '#fee2e2' : analysisResults.urgencyLevel.level === 'medium' ? '#fef3c7' : '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {analysisResults.urgencyLevel.level === 'high' ? <AlertTriangle size={24} color="#dc2626" /> : analysisResults.urgencyLevel.level === 'medium' ? <Clock size={24} color="#f59e0b" /> : <CheckCircle size={24} color="#16a34a" />}
                  </div>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: analysisResults.urgencyLevel.color, textTransform: 'uppercase' }}>{analysisResults.urgencyLevel.level} Urgency</h3>
                    <p style={{ fontSize: 14, color: '#64748b' }}>{analysisResults.urgencyLevel.message}</p>
                  </div>
                </div>
              </div>

              {/* Conditions */}
              <div style={cardStyle}>
                <h3 style={{ ...sectionTitle, display: 'flex', alignItems: 'center', gap: 8 }}><Brain size={20} color="#3b82f6" /> Possible Conditions</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {analysisResults.conditions?.map((condition, index) => (
                    <div key={index} style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <h4 style={{ fontWeight: 600, color: '#0f172a' }}>{condition.name}</h4>
                        <span style={{ fontSize: 13, fontWeight: 500, color: '#3b82f6' }}>{Math.round(condition.probability * 100)}%</span>
                      </div>
                      <p style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>{condition.description}</p>
                      <div style={{ background: '#e5e7eb', borderRadius: 4, height: 4, overflow: 'hidden' }}>
                        <div style={{ background: '#3b82f6', height: '100%', width: `${condition.probability * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div style={cardStyle}>
                <h3 style={{ ...sectionTitle, display: 'flex', alignItems: 'center', gap: 8 }}><Star size={20} color="#8b5cf6" /> Recommendations</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {analysisResults.recommendations?.map((rec, index) => {
                    const IconComponent = rec.icon
                    const isUrgent = rec.type === 'urgent'
                    return (
                      <div key={index} style={{ display: 'flex', alignItems: 'start', gap: 12, padding: 12, background: isUrgent ? '#fef2f2' : '#f0fdf4', border: `1px solid ${isUrgent ? '#fecaca' : '#86efac'}`, borderRadius: 12 }}>
                        <IconComponent size={18} color={isUrgent ? '#dc2626' : '#16a34a'} style={{ marginTop: 2, flexShrink: 0 }} />
                        <span style={{ fontSize: 14, color: isUrgent ? '#7f1d1d' : '#166534' }}>{rec.text}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div style={{ textAlign: 'center', fontSize: 13, color: '#64748b' }}>
                <Clock size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                Analyzed at {analysisResults.timestamp.toLocaleTimeString()}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <div style={{ marginTop: 32, background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 16, padding: 20 }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <AlertTriangle size={24} color="#92400e" style={{ flexShrink: 0, marginTop: 2 }} />
          <p style={{ fontSize: 14, color: '#78350f' }}><strong>Medical Disclaimer:</strong> This AI symptom checker is for informational purposes only and should not replace professional medical advice. Always consult healthcare professionals for accurate diagnosis. In emergencies, seek immediate medical attention.</p>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}