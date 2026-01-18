import React, { useEffect, useRef, useState, useCallback } from 'react'
import { webWorkerService } from '../../services/WebWorkerService'

/**
 * VitalSignsCapture - Advanced rPPG-based vital signs monitoring
 * 
 * This component orchestrates the rPPG pipeline:
 * 1. Camera capture with face detection
 * 2. Signal processing via Web Worker
 * 3. Real-time vital signs display (HR, RR, SpO2)
 */
export default function VitalSignsCapture({ onVitalSigns, onError }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const intervalRef = useRef(null)

  // Component state
  const [isCapturing, setIsCapturing] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState({ phase: 'idle', frameCount: 0, message: '' })
  const [vitalSigns, setVitalSigns] = useState({
    heartRate: null,
    respirationRate: null,
    spO2: null,
    confidence: null,
    timestamp: null
  })
  const [error, setError] = useState(null)
  const [cameraReady, setCameraReady] = useState(false)

  // Configuration
  const CAPTURE_DURATION = 30 // seconds
  const CAPTURE_FPS = 30
  const FRAME_INTERVAL = 1000 / CAPTURE_FPS

  /**
   * Initialize camera and Web Worker
   */
  useEffect(() => {
    initializeCapture()
    
    return () => {
      cleanup()
    }
  }, [])

  /**
   * Set up progress callback for Web Worker
   */
  useEffect(() => {
    webWorkerService.setProgressCallback((workerName, progressData) => {
      if (workerName === 'rppg') {
        setProgress(progressData)
      }
    })

    webWorkerService.setErrorCallback((workerName, error) => {
      if (workerName === 'rppg') {
        handleError(`Worker error: ${error.message}`)
      }
    })
  }, [])

  /**
   * Initialize camera and rPPG worker
   */
  const initializeCapture = async () => {
    try {
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: CAPTURE_FPS },
          facingMode: 'user' // Front camera for face capture
        },
        audio: false
      })

      streamRef.current = stream
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setCameraReady(true)
      }

      // Initialize rPPG Web Worker
      await webWorkerService.createWorker('rppg', '../workers/rppg.worker.js')
      await webWorkerService.sendMessage('rppg', 'initialize')

    } catch (err) {
      handleError(`Camera initialization failed: ${err.message}`)
    }
  }

  /**
   * Start vital signs capture process
   */
  const startCapture = useCallback(async () => {
    if (!cameraReady || isCapturing) return

    try {
      setIsCapturing(true)
      setIsProcessing(false)
      setError(null)
      setProgress({ phase: 'preparing', frameCount: 0, message: 'Preparing capture...' })

      // Reset worker state
      await webWorkerService.sendMessage('rppg', 'reset')

      // Start frame capture
      let frameCount = 0
      const maxFrames = CAPTURE_DURATION * CAPTURE_FPS

      intervalRef.current = setInterval(async () => {
        if (frameCount >= maxFrames) {
          // Capture complete, process signals
          clearInterval(intervalRef.current)
          await processVitalSigns()
          return
        }

        await captureFrame(frameCount++)
      }, FRAME_INTERVAL)

    } catch (err) {
      handleError(`Capture failed: ${err.message}`)
      setIsCapturing(false)
    }
  }, [cameraReady, isCapturing])

  /**
   * Capture a single video frame and send to worker
   */
  const captureFrame = async (frameIndex) => {
    if (!videoRef.current || !canvasRef.current) return

    try {
      const video = videoRef.current
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')

      // Set canvas size to match video
      canvas.width = video.videoWidth || 640
      canvas.height = video.videoHeight || 480

      // Draw current video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Get ImageData for processing
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

      // Send frame to rPPG worker (transfer ArrayBuffer for performance)
      const buffer = imageData.data.buffer.slice()
      await webWorkerService.sendTransferableMessage(
        'rppg',
        'processFrame',
        {
          frameData: { ...imageData, data: new Uint8ClampedArray(buffer) },
          timestamp: performance.now()
        },
        [buffer]
      )

    } catch (err) {
      console.error('Frame capture error:', err)
    }
  }

  /**
   * Process collected signals to calculate vital signs
   */
  const processVitalSigns = async () => {
    try {
      setIsProcessing(true)
      setProgress({ phase: 'analyzing', message: 'Calculating vital signs...' })

      const result = await webWorkerService.sendMessage('rppg', 'calculateVitalSigns', {
        fps: CAPTURE_FPS
      })

      if (result.vitalSigns) {
        setVitalSigns(result.vitalSigns)
        onVitalSigns?.(result.vitalSigns)
        setProgress({ 
          phase: 'complete', 
          message: `Analysis complete - HR: ${result.vitalSigns.heartRate} BPM` 
        })
      } else {
        throw new Error('No vital signs calculated')
      }

    } catch (err) {
      handleError(`Analysis failed: ${err.message}`)
    } finally {
      setIsCapturing(false)
      setIsProcessing(false)
    }
  }

  /**
   * Stop current capture
   */
  const stopCapture = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsCapturing(false)
    setIsProcessing(false)
    setProgress({ phase: 'stopped', message: 'Capture stopped' })
  }, [])

  /**
   * Handle errors
   */
  const handleError = (errorMessage) => {
    setError(errorMessage)
    onError?.(errorMessage)
    setIsCapturing(false)
    setIsProcessing(false)
    console.error('VitalSignsCapture error:', errorMessage)
  }

  /**
   * Cleanup resources
   */
  const cleanup = () => {
    stopCapture()
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    
    webWorkerService.terminateWorker('rppg')
  }

  /**
   * Get status color based on vital signs
   */
  const getStatusColor = () => {
    if (error) return '#ff4444'
    if (isProcessing) return '#ff9500'
    if (vitalSigns.heartRate) return '#00aa00'
    return '#666'
  }

  /**
   * Format vital signs display
   */
  const formatVitalSign = (value, unit) => {
    return value !== null ? `${value} ${unit}` : '--'
  }

  return (
    <div style={{ 
      border: '2px solid #ddd', 
      borderRadius: 8, 
      padding: 20, 
      maxWidth: 600,
      backgroundColor: '#f9f9f9'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <h3 style={{ margin: 0, color: '#333' }}>rPPG Vital Signs Monitor</h3>
        <p style={{ margin: 0, color: '#666', fontSize: 14 }}>
          Position your face in the camera for 30-second analysis
        </p>
      </div>

      {/* Video Feed */}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ 
          position: 'relative', 
          display: 'inline-block',
          border: '2px solid #ccc',
          borderRadius: 8,
          overflow: 'hidden'
        }}>
          <video
            ref={videoRef}
            style={{ 
              width: 320, 
              height: 240,
              display: 'block'
            }}
            playsInline
            muted
          />
          {!cameraReady && (
            <div style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0,0,0,0.7)',
              color: 'white'
            }}>
              Initializing camera...
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <button
          onClick={startCapture}
          disabled={!cameraReady || isCapturing || isProcessing}
          style={{
            padding: '12px 24px',
            fontSize: 16,
            backgroundColor: isCapturing ? '#ff9500' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            cursor: cameraReady && !isCapturing && !isProcessing ? 'pointer' : 'not-allowed',
            marginRight: 10
          }}
        >
          {isCapturing ? 'Capturing...' : isProcessing ? 'Processing...' : 'Start Vital Signs Scan'}
        </button>
        
        {(isCapturing || isProcessing) && (
          <button
            onClick={stopCapture}
            style={{
              padding: '12px 24px',
              fontSize: 16,
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer'
            }}
          >
            Stop
          </button>
        )}
      </div>

      {/* Progress Indicator */}
      {(isCapturing || isProcessing) && (
        <div style={{ 
          backgroundColor: '#e9ecef', 
          borderRadius: 4, 
          padding: 10, 
          marginBottom: 20,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 14, marginBottom: 5 }}>
            Phase: <strong>{progress.phase}</strong>
          </div>
          {progress.frameCount > 0 && (
            <div style={{ fontSize: 12, color: '#666' }}>
              Frames: {progress.frameCount} / {CAPTURE_DURATION * CAPTURE_FPS}
            </div>
          )}
          <div style={{ fontSize: 12, color: '#666' }}>
            {progress.message}
          </div>
        </div>
      )}

      {/* Vital Signs Display */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
        gap: 15,
        marginBottom: 15
      }}>
        <div style={{ 
          textAlign: 'center', 
          padding: 15, 
          backgroundColor: 'white', 
          borderRadius: 6,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: 12, color: '#666', marginBottom: 5 }}>Heart Rate</div>
          <div style={{ fontSize: 24, fontWeight: 'bold', color: getStatusColor() }}>
            {formatVitalSign(vitalSigns.heartRate, 'BPM')}
          </div>
        </div>

        <div style={{ 
          textAlign: 'center', 
          padding: 15, 
          backgroundColor: 'white', 
          borderRadius: 6,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: 12, color: '#666', marginBottom: 5 }}>Respiration</div>
          <div style={{ fontSize: 24, fontWeight: 'bold', color: getStatusColor() }}>
            {formatVitalSign(vitalSigns.respirationRate, 'BrPM')}
          </div>
        </div>

        <div style={{ 
          textAlign: 'center', 
          padding: 15, 
          backgroundColor: 'white', 
          borderRadius: 6,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: 12, color: '#666', marginBottom: 5 }}>SpO₂ (Est.)</div>
          <div style={{ fontSize: 24, fontWeight: 'bold', color: getStatusColor() }}>
            {formatVitalSign(vitalSigns.spO2, '%')}
          </div>
        </div>
      </div>

      {/* Confidence and Timestamp */}
      {vitalSigns.confidence && (
        <div style={{ 
          textAlign: 'center', 
          fontSize: 12, 
          color: '#666',
          marginBottom: 10
        }}>
          Confidence: {Math.round(vitalSigns.confidence)}% | 
          {vitalSigns.timestamp && 
            ` Measured: ${new Date(vitalSigns.timestamp).toLocaleTimeString()}`
          }
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div style={{ 
          backgroundColor: '#f8d7da', 
          color: '#721c24', 
          padding: 10, 
          borderRadius: 4,
          fontSize: 14,
          textAlign: 'center'
        }}>
          Error: {error}
        </div>
      )}

      {/* Hidden canvas for frame capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Instructions */}
      <div style={{ 
        fontSize: 12, 
        color: '#666', 
        textAlign: 'center',
        marginTop: 15,
        lineHeight: 1.4
      }}>
        <strong>Instructions:</strong><br/>
        • Ensure good lighting and stable position<br/>
        • Keep face centered and still during capture<br/>
        • Results are estimates for screening purposes only
      </div>
    </div>
  )
}