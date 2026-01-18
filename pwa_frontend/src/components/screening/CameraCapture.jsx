import React, { useEffect, useRef, useState } from 'react'

export default function CameraCapture({ onCapture }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [error, setError] = useState(null)
  const [streamActive, setStreamActive] = useState(false)

  useEffect(() => {
    let stream

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
          setStreamActive(true)
        }
      } catch (e) {
        console.error('Camera permission or error', e)
        setError(e.message || 'Unable to access camera')
      }
    }

    startCamera()

    return () => {
      setStreamActive(false)
      if (stream) {
        stream.getTracks().forEach((t) => t.stop())
      }
    }
  }, [])

  function captureFrame() {
    if (!videoRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current || document.createElement('canvas')
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
    if (onCapture) onCapture(dataUrl)
  }

  return (
    <div>
      <div style={{ border: '1px solid #ccc', display: 'inline-block' }}>
        <video ref={videoRef} style={{ width: 320, height: 240 }} playsInline muted />
      </div>
      <div style={{ marginTop: 10 }}>
        <button onClick={captureFrame} disabled={!streamActive}>
          Scan Eye
        </button>
      </div>
      {error && <div style={{ color: 'crimson' }}>{error}</div>}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  )
}
