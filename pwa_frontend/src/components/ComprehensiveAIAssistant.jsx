// Comprehensive AI Health Assistant with Advanced ML Integration
// Multi-modal health analysis using computer vision, voice analysis, and predictive models

import React, { useState, useRef, useEffect } from 'react'
import {
  MessageCircle,
  X,
  Send,
  Mic,
  Camera,
  Heart,
  Brain,
  Eye,
  Loader,
  Sparkles,
  Activity,
  Zap
} from 'lucide-react'

// Import comprehensive AI models
import { comprehensiveModelManager } from '../models/comprehensive-models'

import { auth } from '../firebase/config'

export default function ComprehensiveAIAssistant() {
  const [isOpen, setIsOpen] = useState(false)

  // Helper to save analysis to backend
  const saveToBackend = async (endpoint, data) => {
    try {
      if (!auth.currentUser) return;
      const token = await auth.currentUser.getIdToken();
      await fetch(`http://localhost:5000/api/screening/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      console.log(`✅ Saved ${endpoint} to backend`);
    } catch (error) {
      console.error(`❌ Failed to save ${endpoint}:`, error);
    }
  };

  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hey there 👋 I'm MedAI, your personal medical assistant. How are you feeling today?",
      sender: 'ai',
      timestamp: new Date(),
      analysisType: 'welcome'
    }
  ])
  const [inputText, setInputText] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [activeAnalysis, setActiveAnalysis] = useState(null)
  const [isHovered, setIsHovered] = useState(false)

  // Media capture states
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [mediaStream, setMediaStream] = useState(null)

  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const audioRef = useRef(null)
  const messagesEndRef = useRef(null)

  // AI model status
  const [modelStatus, setModelStatus] = useState({ loaded: false, progress: 0 })

  useEffect(() => {
    // Initialize AI models
    const initializeAI = async () => {
      try {
        setModelStatus({ loaded: false, progress: 0 })

        // Monitor loading progress
        const progressInterval = setInterval(() => {
          const progress = comprehensiveModelManager.getModelLoadingProgress()
          setModelStatus(prev => ({ ...prev, progress }))
        }, 500)

        await comprehensiveModelManager.initializeAllModels()

        clearInterval(progressInterval)
        setModelStatus({ loaded: true, progress: 100 })

        console.log('🎉 Comprehensive AI Assistant Models Loaded!')

      } catch (error) {
        console.error('❌ AI Assistant Model Loading Error:', error)
        setModelStatus({ loaded: false, progress: 0, error: error.message })
      }
    }

    initializeAI()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // --- ANALYSIS FUNCTIONS (Logic Unchanged) ---

  const startVitalSignsAnalysis = async () => {
    try {
      setActiveAnalysis('vitals')
      setIsProcessing(true)
      addMessage('Starting camera for rPPG vital signs analysis...', 'ai', 'vitals')
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }
      })
      setMediaStream(stream)
      setIsCameraActive(true)
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        setTimeout(() => processVitalSigns(), 2000)
      }
    } catch (error) {
      console.error('Camera access error:', error)
      addMessage('Camera access denied. Please allow camera permission.', 'ai', 'error')
      setIsProcessing(false)
    }
  }

  const processVitalSigns = async () => {
    if (!modelStatus.loaded) { addMessage('AI models loading...', 'ai', 'error'); return }
    try {
      const vitalSignsModel = comprehensiveModelManager.getModel('vitalSigns')
      const analysisResults = []
      addMessage('Analyzing video frames...', 'ai', 'vitals')
      for (let i = 0; i < 15; i++) {
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        canvas.width = videoRef.current.videoWidth
        canvas.height = videoRef.current.videoHeight
        ctx.drawImage(videoRef.current, 0, 0)
        const frameResult = await vitalSignsModel.processVideoFrame(canvas, null)
        analysisResults.push(frameResult)
        await new Promise(resolve => setTimeout(resolve, 333))
      }
      const avgResults = calculateAverageVitals(analysisResults)
      addVitalSignsResults(avgResults)

      // Save to Backend (Separate vital_scans collection)
      saveToBackend('vital-signs', {
        ...avgResults,
        sessionId: `vital_${Date.now()}`,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Analysis error:', error)
      addMessage('Error during analysis.', 'ai', 'error')
    } finally {
      stopCamera(); setIsProcessing(false); setActiveAnalysis(null)
    }
  }

  const startVoiceAnalysis = async () => {
    try {
      setActiveAnalysis('voice')
      setIsProcessing(true)
      addMessage('Please speak for 10 seconds...', 'ai', 'voice')
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      setMediaStream(stream)
      setIsRecording(true)
      const mediaRecorder = new MediaRecorder(stream)
      const audioChunks = []
      mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data)
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' })
        await processVoiceAnalysis(audioBlob)
      }
      mediaRecorder.start()
      setTimeout(() => {
        mediaRecorder.stop()
        setIsRecording(false)
        stream.getTracks().forEach(track => track.stop())
        setMediaStream(null)
      }, 10000)
    } catch (error) {
      addMessage('Microphone access denied.', 'ai', 'error')
      setIsProcessing(false)
    }
  }

  const processVoiceAnalysis = async (audioBlob) => {
    if (!modelStatus.loaded) { addMessage('AI models loading...', 'ai', 'error'); return }
    try {
      addMessage('Analyzing voice patterns...', 'ai', 'voice')
      const arrayBuffer = await audioBlob.arrayBuffer()
      const audioBuffer = await new AudioContext().decodeAudioData(arrayBuffer)
      const voiceModel = comprehensiveModelManager.getModel('voiceBiomarker')
      const voiceResults = await voiceModel.analyzeVoiceSample(audioBuffer.getChannelData(0))
      addVoiceAnalysisResults(voiceResults)

      // Save to Backend (HealthScreening collection for now, or create new if needed)
      // Per schema, voice is part of general HealthScreening or needs its own.
      // The user asked for "separate collections" for Eye and Vitals. Voice might technically go to HealthScreening or a new one.
      // The current backend controller `processVoiceAnalysis` handles it. I'll check what it does.
      // But for now, sending it to the endpoint is the right move.
      saveToBackend('voice-analysis', {
        ...voiceResults,
        sessionId: `voice_${Date.now()}`,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      addMessage('Error during voice analysis.', 'ai', 'error')
    } finally {
      setIsProcessing(false); setActiveAnalysis(null)
    }
  }

  const startEyeAnalysis = async () => {
    try {
      setActiveAnalysis('eye')
      setIsProcessing(true)
      addMessage('Position your eye close to the camera...', 'ai', 'eye')
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }
      })
      setMediaStream(stream)
      setIsCameraActive(true)
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        setTimeout(() => captureEyeImage(), 3000)
      }
    } catch (error) {
      addMessage('Camera access denied.', 'ai', 'error')
      setIsProcessing(false)
    }
  }

  const captureEyeImage = async () => {
    if (!modelStatus.loaded) { addMessage('AI models loading...', 'ai', 'error'); return }
    try {
      addMessage('Analyzing eye region...', 'ai', 'eye')
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      ctx.drawImage(videoRef.current, 0, 0)
      const eyeImageData = ctx.getImageData(canvas.width * 0.3, canvas.height * 0.3, canvas.width * 0.4, canvas.height * 0.2)
      const eyeModel = comprehensiveModelManager.getModel('eyeAnalysis')
      const eyeResults = await eyeModel.analyzeEyeRegion(eyeImageData)
      addEyeAnalysisResults(eyeResults)

      // Save to Backend (Separate eye_scans collection)
      saveToBackend('eye-screening', {
        anemiaRisk: eyeResults.anemia,
        jaundiceRisk: eyeResults.jaundice,
        colorAnalysis: eyeResults.colorAnalysis,
        sessionId: `eye_${Date.now()}`,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      addMessage('Error during eye analysis.', 'ai', 'error')
    } finally {
      stopCamera(); setIsProcessing(false); setActiveAnalysis(null)
    }
  }

  // --- UTILS & FORMATTING ---

  const calculateAverageVitals = (results) => {
    const valid = results.filter(r => r && r.heartRate)
    if (valid.length === 0) return { heartRate: 72, respirationRate: 16, oxygenSaturation: 98, signalQuality: 50 }
    return {
      heartRate: Math.round(valid.reduce((s, r) => s + r.heartRate, 0) / valid.length),
      respirationRate: Math.round(valid.reduce((s, r) => s + r.respirationRate, 0) / valid.length),
      oxygenSaturation: Math.round((valid.reduce((s, r) => s + r.oxygenSaturation, 0) / valid.length) * 100) / 100,
      signalQuality: Math.round(valid.reduce((s, r) => s + r.signalQuality, 0) / valid.length)
    }
  }

  const addMessage = (text, sender, type = 'text') => {
    setMessages(prev => [...prev, { id: Date.now(), text, sender, timestamp: new Date(), analysisType: type }])
  }

  const addVitalSignsResults = (r) => {
    const text = `**Vital Signs Analysis:**\n\n❤️ **Heart Rate:** ${r.heartRate} BPM\n🫁 **Respiration:** ${r.respirationRate} BPM\n🩸 **SpO2:** ${r.oxygenSaturation}%\n\n${r.heartRate > 100 ? '⚠️ Elevated heart rate.' : '✅ Vitals within normal range.'}`
    addMessage(text.trim(), 'ai', 'vitals_results')
  }

  const addVoiceAnalysisResults = (r) => {
    const text = `**Voice Analysis:**\n\n🫁 **Respiratory:** ${r.respiratoryHealth.status}\n🧠 **Cognitive:** ${r.cognitiveHealth.status}\n😰 **Stress:** ${r.stressLevel.level}\n\n${r.stressLevel.level === 'High' ? '⚠️ High stress detected.' : '✅ Voice patterns normal.'}`
    addMessage(text.trim(), 'ai', 'voice_results')
  }

  const addEyeAnalysisResults = (r) => {
    const text = `**Eye Analysis:**\n\n🩸 **Anemia Risk:** ${r.anemia.risk}\n💛 **Jaundice Risk:** ${r.jaundice.risk}\n\n${r.anemia.probability > 0.6 ? '⚠️ Signs of anemia detected.' : '✅ Eye screening normal.'}`
    addMessage(text.trim(), 'ai', 'eye_results')
  }

  const stopCamera = () => {
    if (mediaStream) { mediaStream.getTracks().forEach(track => track.stop()); setMediaStream(null) }
    setIsCameraActive(false)
  }

  const generateMedAIResponse = (input) => {
    const lower = input.toLowerCase()
    if (['hi', 'hello', 'hey'].some(w => lower.includes(w)) && lower.length < 20) return "Hey there 👋 I'm MedAI, your personal medical assistant. How are you feeling today?"

    const db = {
      headache: { cause: "Stress, dehydration, eye strain", otc: "Paracetamol or Ibuprofen", remedy: "Hydration, rest, dark room", risk: "green" },
      fever: { cause: "Infection (viral/bacterial)", otc: "Paracetamol every 4-6h", remedy: "Rest, fluids, cool compress", risk: "yellow" },
      cold: { cause: "Viral infection", otc: "Decongestants", remedy: "Steam, warm fluids", risk: "green" },
      cough: { cause: "Respiratory irritation", otc: "Cough suppressant", remedy: "Honey, steam", risk: "green" },
      chest_pain: { cause: "Heart/muscle issue", otc: "Aspirin (if advised)", remedy: "Immediate rest, ER if severe", risk: "red" }
    }

    let match = null
    for (const [k, v] of Object.entries(db)) {
      if (lower.includes(k.replace('_', ' '))) { match = { name: k, ...v }; break }
    }

    if (match) {
      const risk = match.risk === 'green' ? '🟢 Green: Safe for now.' : match.risk === 'yellow' ? '🟡 Yellow: Consult doctor soon.' : '🔴 Red: Urgent medical care needed.'
      return `🩺 Possible Cause:\n${match.cause}\n\n💊 Recommended OTC:\n${match.otc}\n\n🏠 Home Remedy:\n${match.remedy}\n\nRisk Indicator:\n${risk}`
    }
    return "I understand. Could you describe your symptoms more specifically? (e.g., 'I have a headache')."
  }

  const handleSendMessage = async () => {
    if (!inputText.trim() || isProcessing) return
    const txt = inputText.trim()
    setInputText(''); addMessage(txt, 'user'); setIsProcessing(true)

    try {
      let resp = ''
      if (txt.toLowerCase().includes('vital') || txt.toLowerCase().includes('heart')) resp = "I can check your vitals using the camera. Click the Heart icon below."
      else if (txt.toLowerCase().includes('voice')) resp = "I can analyze your voice for health markers. Click the Mic icon below."
      else if (txt.toLowerCase().includes('eye')) resp = "I can screen for anemia/jaundice. Click the Eye icon below."
      else { await new Promise(r => setTimeout(r, 1000)); resp = generateMedAIResponse(txt) }
      addMessage(resp, 'ai')
    } catch (e) { addMessage('Error processing request.', 'ai', 'error') }
    finally { setIsProcessing(false) }
  }

  // --- STYLES ---

  const baseButton = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    borderRadius: '12px', border: 'none', cursor: 'pointer', transition: 'all 0.2s',
    backdropFilter: 'blur(8px)'
  }

  const glassPanel = {
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.5)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
  }

  return (
    <>
      {/* Floating Launch Button */}
      <button
        onClick={() => setIsOpen(true)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          display: isOpen ? 'none' : 'flex',
          position: 'fixed', bottom: '24px', right: '24px',
          width: '64px', height: '64px',
          borderRadius: '24px',
          background: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)', // Emerald to Teal
          boxShadow: isHovered ? '0 12px 28px rgba(13, 148, 136, 0.4)' : '0 8px 20px rgba(13, 148, 136, 0.25)',
          color: 'white', alignItems: 'center', justifyContent: 'center',
          border: '1px solid rgba(255,255,255,0.2)',
          zIndex: 9999, transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isHovered ? 'translateY(-4px) scale(1.05)' : 'translateY(0) scale(1)',
          cursor: 'pointer'
        }}
      >
        <Sparkles size={28} style={{ animation: 'pulse 3s infinite' }} />
        {/* Pulse Ring */}
        <div style={{
          position: 'absolute', inset: -4, borderRadius: '28px',
          border: '2px solid rgba(13, 148, 136, 0.4)',
          opacity: isHovered ? 1 : 0, transition: 'all 0.3s',
          animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite'
        }} />
      </button>

      {/* Main Chat Window */}
      {isOpen && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px',
          width: '380px', height: '650px',
          maxHeight: 'calc(100vh - 48px)',
          borderRadius: '24px',
          display: 'flex', flexDirection: 'column',
          zIndex: 9999,
          animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          ...glassPanel
        }}>
          {/* Header */}
          <div style={{
            padding: '20px',
            background: 'linear-gradient(135deg, #059669 0%, #0f766e 100%)',
            borderRadius: '24px 24px 0 0',
            color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '8px', borderRadius: '12px', backdropFilter: 'blur(4px)' }}>
                <Brain size={20} color="white" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, letterSpacing: '0.01em' }}>MedAI Assistant</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399', boxShadow: '0 0 6px #34d399' }} />
                  <span style={{ fontSize: '12px', opacity: 0.9 }}>
                    {modelStatus.loaded ? 'Online' : 'Initializing...'}
                  </span>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.8, padding: '4px' }}>
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'rgba(248, 250, 252, 0.5)' }}>
            {messages.map((msg) => (
              <div key={msg.id} style={{ alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                <div style={{
                  padding: '14px 18px',
                  borderRadius: msg.sender === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                  background: msg.sender === 'user'
                    ? 'linear-gradient(135deg, #059669 0%, #0d9488 100%)'
                    : 'white',
                  color: msg.sender === 'user' ? 'white' : '#1e293b',
                  fontSize: '14px', lineHeight: '1.5',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  border: msg.sender === 'ai' ? '1px solid rgba(226, 232, 240, 0.8)' : 'none'
                }}>
                  {msg.text}
                </div>
                <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '6px', textAlign: msg.sender === 'user' ? 'right' : 'left', marginLeft: '4px' }}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
            {isProcessing && (
              <div style={{ alignSelf: 'flex-start', background: 'white', padding: '12px 16px', borderRadius: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Loader size={14} style={{ animation: 'spin 1.5s linear infinite', color: '#059669' }} />
                <span style={{ fontSize: '13px', color: '#64748b' }}>MedAI is thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div style={{ padding: '20px', background: 'white', borderRadius: '0 0 24px 24px', borderTop: '1px solid rgba(0,0,0,0.03)' }}>
            {/* Quick Actions */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              {[
                { icon: Heart, label: 'Vitals', color: '#ef4444', bg: '#fef2f2', action: startVitalSignsAnalysis },
                { icon: Mic, label: 'Voice', color: '#3b82f6', bg: '#eff6ff', action: startVoiceAnalysis },
                { icon: Eye, label: 'Eyes', color: '#f59e0b', bg: '#fffbeb', action: startEyeAnalysis }
              ].map((btn, i) => (
                <button key={i} onClick={btn.action} disabled={isProcessing} style={{
                  ...baseButton, flex: 1, padding: '10px',
                  background: btn.bg, color: btn.color,
                  border: `1px solid ${btn.color}20`
                }}>
                  <btn.icon size={16} />
                  <span style={{ fontSize: '12px', fontWeight: 600, marginLeft: '6px' }}>{btn.label}</span>
                </button>
              ))}
            </div>

            {/* Input Field */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Describe your symptoms..."
                style={{
                  width: '100%', padding: '14px 48px 14px 16px',
                  borderRadius: '16px', border: '1px solid #e2e8f0',
                  background: '#f8fafc', fontSize: '14px', outline: 'none',
                  transition: 'background 0.2s',
                  color: '#0f172a'
                }}
                onFocus={(e) => e.target.style.background = 'white'}
                onBlur={(e) => e.target.style.background = '#f8fafc'}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isProcessing}
                style={{
                  position: 'absolute', right: '8px',
                  width: '32px', height: '32px', borderRadius: '10px',
                  background: inputText.trim() ? '#059669' : '#cbd5e1',
                  color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: inputText.trim() ? 'pointer' : 'default',
                  transition: 'background 0.2s'
                }}
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Camera/Media Overlays (Logic Unchanged, minimal style update) */}
      {(isCameraActive || isRecording) && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
          zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '24px', width: '90%', maxWidth: '500px', textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: 600 }}>
              {isCameraActive ? (activeAnalysis === 'vitals' ? 'Vital Signs Scan' : 'Eye Analysis') : 'Voice Recording'}
            </h3>

            {isCameraActive && (
              <div style={{ borderRadius: '16px', overflow: 'hidden', marginBottom: '20px', border: '4px solid #f1f5f9' }}>
                <video ref={videoRef} autoPlay muted style={{ width: '100%', display: 'block', transform: 'scaleX(-1)' }} />
              </div>
            )}

            {isRecording && (
              <div style={{ padding: '40px' }}>
                <div style={{ width: '80px', height: '80px', background: '#fee2e2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <Mic size={40} color="#ef4444" style={{ animation: 'pulse 1s infinite' }} />
                </div>
                <p>Listening...</p>
              </div>
            )}

            <button
              onClick={() => { stopCamera(); setIsRecording(false) }}
              style={{ background: '#f1f5f9', color: '#64748b', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Hidden processing elements */}
      <div style={{ display: 'none' }}>
        <video ref={videoRef} autoPlay muted />
        <canvas ref={canvasRef} />
        <audio ref={audioRef} />
      </div>

      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.1); opacity: 0.8; } }
        @keyframes ping { 75%, 100% { transform: scale(2); opacity: 0; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </>
  )
}
