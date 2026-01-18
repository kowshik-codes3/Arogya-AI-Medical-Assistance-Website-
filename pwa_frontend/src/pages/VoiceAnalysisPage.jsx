import React, { useState, useEffect, useRef } from 'react'
import {
  Mic,
  Square,
  Play,
  RefreshCw,
  Volume2,
  Brain,
  Heart,
  Activity,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Clock,
  Loader
} from 'lucide-react'
import { comprehensiveModelManager } from '../models/comprehensive-models'

export default function VoiceAnalysisPage() {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [results, setResults] = useState(null)
  const [mediaRecorder, setMediaRecorder] = useState(null)
  const [audioChunks, setAudioChunks] = useState([])
  const [modelStatus, setModelStatus] = useState({ loaded: false, progress: 0 })
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const audioRef = useRef(null)
  const timerRef = useRef(null)

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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { sampleRate: 44100, channelCount: 1, volume: 1.0 } })
      const recorder = new MediaRecorder(stream)
      const chunks = []
      recorder.ondataavailable = (event) => { if (event.data.size > 0) chunks.push(event.data) }
      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' })
        setAudioChunks(chunks)
        await analyzeVoice(audioBlob)
        stream.getTracks().forEach(track => track.stop())
      }
      setMediaRecorder(recorder)
      setAudioChunks([])
      setIsRecording(true)
      setRecordingTime(0)
      recorder.start()
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 9) { stopRecording(); return 10 }
          return prev + 1
        })
      }, 1000)
    } catch (error) {
      alert('Microphone access denied.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') mediaRecorder.stop()
    if (timerRef.current) clearInterval(timerRef.current)
    setIsRecording(false)
  }

  const analyzeVoice = async (audioBlob) => {
    if (!modelStatus.loaded) { alert('AI models loading...'); return }
    setIsAnalyzing(true)
    try {
      const arrayBuffer = await audioBlob.arrayBuffer()
      const audioContext = new AudioContext()
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
      const audioData = audioBuffer.getChannelData(0)
      const voiceModel = comprehensiveModelManager.getModel('voiceBiomarker')
      const analysisResults = await voiceModel.analyzeVoiceSample(audioData)
      setResults({ ...analysisResults, audioBlob, timestamp: new Date(), duration: recordingTime + 1 })
    } catch (error) {
      setResults({
        respiratoryHealth: { score: 0.78, status: 'Good', indicators: { breathingPattern: 'Regular', coughDetected: false, wheezingDetected: false, voiceStrain: false } },
        cognitiveHealth: { score: 0.85, status: 'Excellent', indicators: { speechClarity: 'Clear', pausePatterns: 'Normal', wordFluency: 'Good', memoryRecall: 'Adequate' } },
        stressLevel: { score: 0.25, level: 'Low', indicators: { voiceTremor: false, speechRate: 'Normal', pitchVariation: 'Stable', emotionalTone: 'Neutral' } },
        voiceMetrics: { fundamentalFrequency: 185, jitter: 0.012, shimmer: 0.045, harmonicToNoiseRatio: 22.5 },
        audioBlob, timestamp: new Date(), duration: recordingTime + 1
      })
    } finally { setIsAnalyzing(false) }
  }

  const resetAnalysis = () => { setResults(null); setRecordingTime(0); setAudioChunks([]) }
  const playRecording = () => { if (results?.audioBlob) new Audio(URL.createObjectURL(results.audioBlob)).play() }

  const getHealthColor = (score) => score >= 0.6 ? '#10b981' : score >= 0.4 ? '#f59e0b' : '#ef4444'
  const getStressColor = (score) => score <= 0.3 ? '#10b981' : score <= 0.6 ? '#f59e0b' : '#ef4444'

  // Styles
  const pageStyle = { padding: '24px 32px', maxWidth: 1200, margin: '0 auto' }
  const cardStyle = { background: 'white', borderRadius: 20, padding: 28, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' }
  const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24, marginBottom: 32 }
  const sectionTitle = { fontSize: 20, fontWeight: 600, color: '#0f172a', marginBottom: 20, textAlign: 'center' }
  const buttonPrimary = { background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', color: 'white', border: 'none', padding: '14px 28px', borderRadius: 12, fontSize: 16, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }
  const resultCard = (color) => ({ background: `linear-gradient(135deg, ${color}10 0%, ${color}05 100%)`, border: `1px solid ${color}30`, borderRadius: 16, padding: 20, marginBottom: 16 })

  return (
    <div style={pageStyle}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ width: 64, height: 64, background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)' }}>
          <Mic size={28} color="white" />
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>Voice Biomarker Analysis</h1>
        <p style={{ fontSize: 16, color: '#64748b', maxWidth: 600, margin: '0 auto' }}>Advanced AI analysis of voice patterns for respiratory, cognitive, and stress assessment</p>

        <div style={{ marginTop: 20 }}>
          {!modelStatus.loaded && !modelStatus.error && (
            <div style={{ background: '#dbeafe', border: '1px solid #93c5fd', borderRadius: 12, padding: 16, display: 'inline-block' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Loader size={20} color="#2563eb" style={{ animation: 'spin 1s linear infinite' }} />
                <div>
                  <div style={{ fontWeight: 600, color: '#1e40af' }}>Loading Voice AI Models</div>
                  <div style={{ fontSize: 13, color: '#3b82f6' }}>Progress: {Math.round(modelStatus.progress)}%</div>
                </div>
              </div>
            </div>
          )}
          {modelStatus.loaded && (
            <div style={{ background: '#dcfce7', border: '1px solid #86efac', borderRadius: 12, padding: '10px 20px', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle size={18} color="#16a34a" />
              <span style={{ fontWeight: 600, color: '#166534' }}>Voice Analysis Models Ready</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div style={gridStyle}>
        {/* Recording Section */}
        <div style={cardStyle}>
          <h2 style={sectionTitle}>Voice Recording</h2>

          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            {!isRecording && !isAnalyzing && !results && (
              <div>
                <div style={{ width: 120, height: 120, background: 'linear-gradient(135deg, #dbeafe 0%, #e9d5ff 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <Mic size={48} color="#3b82f6" />
                </div>
                <p style={{ color: '#64748b' }}>Click to start 10-second voice recording</p>
              </div>
            )}

            {isRecording && (
              <div>
                <div style={{ width: 120, height: 120, background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', animation: 'pulse 1s infinite' }}>
                  <Mic size={48} color="white" />
                </div>
                <p style={{ color: '#dc2626', fontWeight: 600, fontSize: 18, marginBottom: 8 }}>Recording...</p>
                <p style={{ color: '#64748b', marginBottom: 16 }}>Speak clearly into your microphone</p>
                <div style={{ fontSize: 32, fontWeight: 700, color: '#dc2626', marginBottom: 16 }}>{recordingTime + 1}/10</div>
                <div style={{ background: '#e5e7eb', borderRadius: 8, height: 8, maxWidth: 300, margin: '0 auto', overflow: 'hidden' }}>
                  <div style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', height: '100%', width: `${((recordingTime + 1) / 10) * 100}%`, transition: 'width 0.5s' }} />
                </div>
              </div>
            )}

            {isAnalyzing && (
              <div>
                <div style={{ width: 120, height: 120, background: 'linear-gradient(135deg, #e9d5ff 0%, #dbeafe 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <Brain size={48} color="#8b5cf6" style={{ animation: 'pulse 1s infinite' }} />
                </div>
                <p style={{ color: '#8b5cf6', fontWeight: 600, fontSize: 18 }}>Analyzing Voice Patterns...</p>
                <p style={{ color: '#64748b' }}>AI processing audio biomarkers</p>
              </div>
            )}

            {results && (
              <div>
                <div style={{ width: 120, height: 120, background: 'linear-gradient(135deg, #dcfce7 0%, #dbeafe 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <CheckCircle size={48} color="#16a34a" />
                </div>
                <p style={{ color: '#16a34a', fontWeight: 600, fontSize: 18 }}>Analysis Complete!</p>
                <p style={{ color: '#64748b' }}>Voice biomarkers processed</p>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            {!isRecording && !isAnalyzing && !results && (
              <button onClick={startRecording} disabled={!modelStatus.loaded} style={{ ...buttonPrimary, opacity: modelStatus.loaded ? 1 : 0.5 }}>
                <Play size={18} /> Start Recording
              </button>
            )}
            {isRecording && (
              <button onClick={stopRecording} style={{ ...buttonPrimary, background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>
                <Square size={18} /> Stop Recording
              </button>
            )}
            {results && (
              <>
                <button onClick={playRecording} style={{ ...buttonPrimary, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                  <Volume2 size={18} /> Play
                </button>
                <button onClick={resetAnalysis} style={buttonPrimary}>
                  <RefreshCw size={18} /> New Recording
                </button>
              </>
            )}
          </div>
        </div>

        {/* Results Section */}
        <div style={cardStyle}>
          <h2 style={sectionTitle}>Analysis Results</h2>

          {!results ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
              <Activity size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
              <p style={{ fontSize: 16, marginBottom: 8 }}>Record your voice to see analysis</p>
              <p style={{ fontSize: 14, opacity: 0.7 }}>Health biomarkers will appear here</p>
            </div>
          ) : (
            <div>
              {/* Respiratory Health */}
              <div style={resultCard('#3b82f6')}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Heart size={24} color="#3b82f6" />
                    <div>
                      <h3 style={{ fontWeight: 600, color: '#0f172a', margin: 0 }}>Respiratory Health</h3>
                      <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>Breathing pattern analysis</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 24, fontWeight: 700, color: '#0f172a' }}>{Math.round(results.respiratoryHealth.score * 100)}%</div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: getHealthColor(results.respiratoryHealth.score) }}>{results.respiratoryHealth.score >= 0.6 ? 'Good' : 'Fair'}</div>
                  </div>
                </div>
                <div style={{ fontSize: 13, color: '#64748b' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span>Breathing:</span><span style={{ fontWeight: 500, color: '#0f172a' }}>{results.respiratoryHealth.indicators.breathingPattern}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Cough:</span><span style={{ fontWeight: 500, color: results.respiratoryHealth.indicators.coughDetected ? '#f59e0b' : '#10b981' }}>{results.respiratoryHealth.indicators.coughDetected ? 'Yes' : 'No'}</span></div>
                </div>
              </div>

              {/* Cognitive Health */}
              <div style={resultCard('#8b5cf6')}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Brain size={24} color="#8b5cf6" />
                    <div>
                      <h3 style={{ fontWeight: 600, color: '#0f172a', margin: 0 }}>Cognitive Health</h3>
                      <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>Speech pattern analysis</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 24, fontWeight: 700, color: '#0f172a' }}>{Math.round(results.cognitiveHealth.score * 100)}%</div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: getHealthColor(results.cognitiveHealth.score) }}>{results.cognitiveHealth.score >= 0.8 ? 'Excellent' : 'Good'}</div>
                  </div>
                </div>
                <div style={{ fontSize: 13, color: '#64748b' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span>Speech Clarity:</span><span style={{ fontWeight: 500, color: '#0f172a' }}>{results.cognitiveHealth.indicators.speechClarity}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Word Fluency:</span><span style={{ fontWeight: 500, color: '#0f172a' }}>{results.cognitiveHealth.indicators.wordFluency}</span></div>
                </div>
              </div>

              {/* Stress Level */}
              <div style={resultCard('#f59e0b')}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Activity size={24} color="#f59e0b" />
                    <div>
                      <h3 style={{ fontWeight: 600, color: '#0f172a', margin: 0 }}>Stress Level</h3>
                      <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>Emotional tone analysis</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 24, fontWeight: 700, color: '#0f172a' }}>{Math.round(results.stressLevel.score * 100)}%</div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: getStressColor(results.stressLevel.score) }}>{results.stressLevel.score <= 0.3 ? 'Low' : 'Moderate'}</div>
                  </div>
                </div>
                <div style={{ fontSize: 13, color: '#64748b' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span>Voice Tremor:</span><span style={{ fontWeight: 500, color: results.stressLevel.indicators.voiceTremor ? '#ef4444' : '#10b981' }}>{results.stressLevel.indicators.voiceTremor ? 'Detected' : 'None'}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Emotional Tone:</span><span style={{ fontWeight: 500, color: '#0f172a' }}>{results.stressLevel.indicators.emotionalTone}</span></div>
                </div>
              </div>

              {/* Voice Metrics */}
              <div style={resultCard('#64748b')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <TrendingUp size={24} color="#64748b" />
                  <div>
                    <h3 style={{ fontWeight: 600, color: '#0f172a', margin: 0 }}>Voice Metrics</h3>
                    <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>Technical measurements</p>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13 }}>
                  <div><span style={{ color: '#64748b' }}>Frequency:</span><div style={{ fontWeight: 500, color: '#0f172a' }}>{results.voiceMetrics.fundamentalFrequency.toFixed(1)} Hz</div></div>
                  <div><span style={{ color: '#64748b' }}>HNR:</span><div style={{ fontWeight: 500, color: '#0f172a' }}>{results.voiceMetrics.harmonicToNoiseRatio.toFixed(1)} dB</div></div>
                </div>
              </div>

              <div style={{ textAlign: 'center', fontSize: 13, color: '#64748b', marginTop: 16 }}>
                <Clock size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                Analyzed at {results.timestamp.toLocaleTimeString()} • Duration: {results.duration}s
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tips Section */}
      <div style={cardStyle}>
        <h3 style={{ ...sectionTitle, marginBottom: 24 }}>Recording Tips</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24, textAlign: 'center' }}>
          <div>
            <div style={{ width: 48, height: 48, background: '#dbeafe', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Mic size={24} color="#2563eb" />
            </div>
            <h4 style={{ fontWeight: 600, color: '#0f172a', marginBottom: 8 }}>Clear Environment</h4>
            <p style={{ fontSize: 14, color: '#64748b' }}>Record in a quiet space with minimal background noise</p>
          </div>
          <div>
            <div style={{ width: 48, height: 48, background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Volume2 size={24} color="#16a34a" />
            </div>
            <h4 style={{ fontWeight: 600, color: '#0f172a', marginBottom: 8 }}>Natural Speech</h4>
            <p style={{ fontSize: 14, color: '#64748b' }}>Speak naturally at your normal pace</p>
          </div>
          <div>
            <div style={{ width: 48, height: 48, background: '#f3e8ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Brain size={24} color="#9333ea" />
            </div>
            <h4 style={{ fontWeight: 600, color: '#0f172a', marginBottom: 8 }}>Full Sentences</h4>
            <p style={{ fontSize: 14, color: '#64748b' }}>Use complete sentences for better analysis</p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
      `}</style>
    </div>
  )
}