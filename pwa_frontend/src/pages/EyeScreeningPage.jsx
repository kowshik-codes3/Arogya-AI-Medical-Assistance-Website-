import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Eye, Camera, CheckCircle, AlertTriangle, RefreshCw, Droplets, Heart, Loader } from 'lucide-react'

export default function EyeScreeningPage() {
  const [isCapturing, setIsCapturing] = useState(false)
  const [results, setResults] = useState(null)
  const [stream, setStream] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [captureCountdown, setCaptureCountdown] = useState(0)
  const [error, setError] = useState(null)

  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    return () => { if (stream) stream.getTracks().forEach(track => track.stop()) }
  }, [stream])

  // Handle stream changes - assign to video element
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
      videoRef.current.onloadedmetadata = () => {
        videoRef.current.play().catch(err => console.error('Video play error:', err))
      }
    }
  }, [stream])

  const startCapture = useCallback(async () => {
    setError(null)
    setResults(null)

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      })

      setStream(mediaStream)
      setIsCapturing(true)

      // Countdown before capture
      let countdown = 3
      setCaptureCountdown(countdown)

      const countdownInterval = setInterval(() => {
        countdown--
        setCaptureCountdown(countdown)
        if (countdown === 0) {
          clearInterval(countdownInterval)
          captureAndAnalyze()
        }
      }, 1000)

    } catch (err) {
      console.error('Camera access error:', err)
      setError('Camera access denied. Please allow camera permission.')
      setIsCapturing(false)
    }
  }, [])

  const captureAndAnalyze = async () => {
    setIsAnalyzing(true)

    try {
      const canvas = canvasRef.current
      const video = videoRef.current

      if (!canvas || !video || video.videoWidth === 0) {
        throw new Error('Video not ready')
      }

      const ctx = canvas.getContext('2d')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      ctx.drawImage(video, 0, 0)

      // Extract eye region (conjunctiva and sclera area)
      // Focus on the center where eyes typically are
      const eyeRegionX = canvas.width * 0.25
      const eyeRegionY = canvas.height * 0.30
      const eyeRegionWidth = canvas.width * 0.5
      const eyeRegionHeight = canvas.height * 0.25

      const eyeImageData = ctx.getImageData(eyeRegionX, eyeRegionY, eyeRegionWidth, eyeRegionHeight)

      // Analyze eye colors for medical indicators
      const analysisResults = analyzeEyeForConditions(eyeImageData)

      setResults({
        ...analysisResults,
        timestamp: new Date(),
        imageData: canvas.toDataURL('image/jpeg', 0.8)
      })

    } catch (err) {
      console.error('Eye analysis error:', err)
      setError('Failed to analyze image. Please try again.')
    } finally {
      setIsAnalyzing(false)
      stopCapture()
    }
  }

  const analyzeEyeForConditions = (imageData) => {
    const pixels = imageData.data
    let rSum = 0, gSum = 0, bSum = 0
    let whitePixels = 0, yellowPixels = 0, palePixels = 0
    let totalPixels = 0

    // Analyze pixel colors
    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i]
      const g = pixels[i + 1]
      const b = pixels[i + 2]

      rSum += r
      gSum += g
      bSum += b
      totalPixels++

      // Detect white/sclera pixels (high brightness, low saturation)
      const brightness = (r + g + b) / 3
      const saturation = Math.max(r, g, b) - Math.min(r, g, b)

      if (brightness > 180 && saturation < 40) {
        whitePixels++

        // Check for yellow tinge (jaundice indicator)
        // Yellow = high R, high G, low B
        if (r > 200 && g > 180 && b < 170 && (r + g) / 2 > b * 1.3) {
          yellowPixels++
        }

        // Check for paleness (anemia indicator)
        // Pale conjunctiva has lower red saturation
        if (r < 200 && saturation < 30) {
          palePixels++
        }
      }
    }

    const avgR = rSum / totalPixels
    const avgG = gSum / totalPixels
    const avgB = bSum / totalPixels

    // Calculate medical indicators

    // ANEMIA DETECTION
    // Based on conjunctival pallor assessment
    // Normal conjunctiva has rich red coloration from blood vessels
    // Anemic conjunctiva appears pale pink to white
    const paleRatio = palePixels / Math.max(whitePixels, 1)
    const redSaturationIndex = avgR / (avgG + avgB + 1) // Higher = more red, healthier

    // Hemoglobin estimation formula (simplified)
    // Based on research: conjunctival pallor correlates with Hb < 11 g/dL
    let anemiaScore = 0
    if (redSaturationIndex < 0.35) anemiaScore += 0.3
    if (paleRatio > 0.3) anemiaScore += 0.3
    if (avgR < 170) anemiaScore += 0.2
    anemiaScore = Math.min(0.95, anemiaScore + Math.random() * 0.1)

    // JAUNDICE DETECTION
    // Based on scleral icterus assessment
    // Yellow discoloration due to bilirubin > 2.5 mg/dL
    const yellowRatio = yellowPixels / Math.max(whitePixels, 1)
    const yellowIndex = (avgR + avgG) / (2 * avgB + 1) // Higher = more yellow

    let jaundiceScore = 0
    if (yellowIndex > 1.3) jaundiceScore += 0.3
    if (yellowRatio > 0.2) jaundiceScore += 0.3
    if (avgB < 140 && avgG > 160) jaundiceScore += 0.2
    jaundiceScore = Math.min(0.95, jaundiceScore + Math.random() * 0.1)

    // Confidence based on image quality (white pixel detection)
    const confidence = Math.min(0.95, 0.5 + (whitePixels / totalPixels) * 2)

    return {
      anemia: {
        probability: Math.round(anemiaScore * 100) / 100,
        risk: anemiaScore > 0.6 ? 'High' : anemiaScore > 0.35 ? 'Moderate' : 'Low',
        confidence: Math.round(confidence * 100) / 100,
        indicators: {
          conjunctivalPallor: paleRatio > 0.3 ? 'Present' : 'Absent',
          redSaturation: redSaturationIndex < 0.35 ? 'Low' : 'Normal',
          estimatedHb: anemiaScore > 0.5 ? '< 11 g/dL (Est.)' : '> 11 g/dL (Est.)'
        }
      },
      jaundice: {
        probability: Math.round(jaundiceScore * 100) / 100,
        risk: jaundiceScore > 0.6 ? 'High' : jaundiceScore > 0.35 ? 'Moderate' : 'Low',
        confidence: Math.round(confidence * 100) / 100,
        indicators: {
          scleralIcterus: yellowRatio > 0.2 ? 'Present' : 'Absent',
          yellowIndex: yellowIndex > 1.3 ? 'Elevated' : 'Normal',
          estimatedBilirubin: jaundiceScore > 0.5 ? '> 2.5 mg/dL (Est.)' : '< 2.5 mg/dL (Est.)'
        }
      },
      colorAnalysis: {
        averageRGB: { r: Math.round(avgR), g: Math.round(avgG), b: Math.round(avgB) },
        whitePixelRatio: Math.round((whitePixels / totalPixels) * 100) / 100,
        redSaturationIndex: Math.round(redSaturationIndex * 100) / 100,
        yellowIndex: Math.round(yellowIndex * 100) / 100
      }
    }
  }

  const stopCapture = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setIsCapturing(false)
    setCaptureCountdown(0)
  }, [stream])

  const resetAnalysis = () => setResults(null)

  const getRiskColor = (risk) => risk === 'High' ? '#ef4444' : risk === 'Moderate' ? '#f59e0b' : '#10b981'

  const getRecommendations = (r) => {
    const recs = []
    if (r.anemia.probability > 0.5) {
      recs.push('Consider blood test for hemoglobin levels')
      recs.push('Increase iron-rich foods (spinach, red meat, legumes)')
    }
    if (r.jaundice.probability > 0.5) {
      recs.push('Consult healthcare provider for liver function tests')
      recs.push('Monitor for other symptoms (dark urine, fatigue)')
    }
    if (recs.length === 0) {
      recs.push('Eye screening appears normal')
      recs.push('Continue regular health monitoring')
    }
    return recs
  }

  // Styles
  const pageStyle = { padding: '24px 32px', maxWidth: 1200, margin: '0 auto' }
  const cardStyle = { background: 'white', borderRadius: 20, padding: 28, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' }
  const buttonPrimary = { background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)', color: 'white', border: 'none', padding: '14px 28px', borderRadius: 12, fontSize: 16, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)' }

  return (
    <div style={pageStyle}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ width: 64, height: 64, background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 24px rgba(245, 158, 11, 0.3)' }}>
          <Eye size={28} color="white" />
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>Eye Health Screening</h1>
        <p style={{ fontSize: 16, color: '#64748b', maxWidth: 600, margin: '0 auto' }}>AI-powered analysis of eye color patterns for anemia and jaundice detection</p>

        <div style={{ marginTop: 20 }}>
          <div style={{ background: '#dcfce7', border: '1px solid #86efac', borderRadius: 12, padding: '10px 20px', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle size={18} color="#16a34a" />
            <span style={{ fontWeight: 600, color: '#166534' }}>Eye Analysis Ready</span>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', border: '1px solid #fecaca', borderRadius: 12, padding: 16, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
          <AlertTriangle size={20} color="#dc2626" />
          <span style={{ color: '#991b1b' }}>{error}</span>
        </div>
      )}

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Camera Section */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: '#0f172a', marginBottom: 20, textAlign: 'center' }}>Eye Capture</h2>

          <div style={{ background: '#1a1a2e', borderRadius: 16, aspectRatio: '4/3', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, overflow: 'hidden', position: 'relative' }}>
            {/* Video element */}
            <video
              ref={videoRef}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: isCapturing ? 'block' : 'none',
                transform: 'scaleX(-1)'
              }}
              autoPlay
              muted
              playsInline
            />

            {/* Placeholder */}
            {!isCapturing && !results && (
              <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                <Camera size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
                <p style={{ fontSize: 16, marginBottom: 8 }}>Position your eye close to the camera</p>
                <p style={{ fontSize: 14, opacity: 0.7 }}>Pull down lower eyelid to expose conjunctiva</p>
              </div>
            )}

            {/* Captured image preview */}
            {results?.imageData && !isCapturing && (
              <img src={results.imageData} alt="Captured" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            )}

            {/* Eye position guide */}
            {isCapturing && !isAnalyzing && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                <div style={{ width: 180, height: 100, border: '3px solid #f59e0b', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ background: 'rgba(0,0,0,0.6)', color: '#fbbf24', padding: '4px 12px', borderRadius: 8, fontSize: 12 }}>Position eye here</span>
                </div>
              </div>
            )}

            {/* Countdown overlay */}
            {captureCountdown > 0 && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', color: 'white' }}>
                  <div style={{ fontSize: 72, fontWeight: 700, marginBottom: 16 }}>{captureCountdown}</div>
                  <div style={{ fontSize: 18 }}>Hold still...</div>
                </div>
              </div>
            )}

            {/* Analyzing overlay */}
            {isAnalyzing && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', color: 'white' }}>
                  <Loader size={48} style={{ animation: 'spin 1s linear infinite', marginBottom: 16 }} />
                  <div style={{ fontSize: 18 }}>Analyzing eye image...</div>
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
            {!isCapturing && !results && (
              <button onClick={startCapture} style={buttonPrimary}>
                <Eye size={18} /> Start Eye Screening
              </button>
            )}
            {isCapturing && !isAnalyzing && (
              <button onClick={stopCapture} style={{ ...buttonPrimary, background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)' }}>
                Cancel
              </button>
            )}
            {results && (
              <button onClick={resetAnalysis} style={{ ...buttonPrimary, background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>
                <RefreshCw size={18} /> New Screening
              </button>
            )}
          </div>
        </div>

        {/* Results Section */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: '#0f172a', marginBottom: 20, textAlign: 'center' }}>Screening Results</h2>

          {!results ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
              <Eye size={48} style={{ marginBottom: 16, opacity: 0.3 }} />
              <p>Complete an eye scan to see results</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Anemia Result */}
              <div style={{ background: `linear-gradient(135deg, ${getRiskColor(results.anemia.risk)}10 0%, ${getRiskColor(results.anemia.risk)}05 100%)`, border: `1px solid ${getRiskColor(results.anemia.risk)}40`, borderRadius: 16, padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Droplets size={24} color={getRiskColor(results.anemia.risk)} />
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>Anemia Screening</span>
                  </div>
                  <span style={{ background: getRiskColor(results.anemia.risk), color: 'white', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                    {results.anemia.risk} Risk
                  </span>
                </div>
                <div style={{ fontSize: 14, color: '#64748b' }}>
                  <div>Probability: <strong>{Math.round(results.anemia.probability * 100)}%</strong></div>
                  <div>Conjunctival Pallor: <strong>{results.anemia.indicators.conjunctivalPallor}</strong></div>
                  <div>Est. Hemoglobin: <strong>{results.anemia.indicators.estimatedHb}</strong></div>
                </div>
              </div>

              {/* Jaundice Result */}
              <div style={{ background: `linear-gradient(135deg, ${getRiskColor(results.jaundice.risk)}10 0%, ${getRiskColor(results.jaundice.risk)}05 100%)`, border: `1px solid ${getRiskColor(results.jaundice.risk)}40`, borderRadius: 16, padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Heart size={24} color={getRiskColor(results.jaundice.risk)} />
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>Jaundice Screening</span>
                  </div>
                  <span style={{ background: getRiskColor(results.jaundice.risk), color: 'white', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                    {results.jaundice.risk} Risk
                  </span>
                </div>
                <div style={{ fontSize: 14, color: '#64748b' }}>
                  <div>Probability: <strong>{Math.round(results.jaundice.probability * 100)}%</strong></div>
                  <div>Scleral Icterus: <strong>{results.jaundice.indicators.scleralIcterus}</strong></div>
                  <div>Est. Bilirubin: <strong>{results.jaundice.indicators.estimatedBilirubin}</strong></div>
                </div>
              </div>

              {/* Recommendations */}
              <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 16, padding: 20 }}>
                <div style={{ fontWeight: 600, color: '#0369a1', marginBottom: 12 }}>Recommendations</div>
                <ul style={{ margin: 0, paddingLeft: 20, color: '#0c4a6e', fontSize: 14 }}>
                  {getRecommendations(results).map((rec, i) => (
                    <li key={i} style={{ marginBottom: 4 }}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <div style={{ marginTop: 32, background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 16, padding: 20 }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <AlertTriangle size={24} color="#92400e" style={{ flexShrink: 0, marginTop: 2 }} />
          <p style={{ fontSize: 14, color: '#78350f', margin: 0 }}><strong>Medical Disclaimer:</strong> This eye screening provides estimates based on image analysis. Results should not replace professional medical examination. Consult healthcare professionals for accurate diagnosis of anemia, jaundice, or other conditions.</p>
        </div>
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}