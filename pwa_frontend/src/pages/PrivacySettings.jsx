import React, { useEffect, useState } from 'react'

export default function PrivacySettings() {
  const [onDeviceOnly, setOnDeviceOnly] = useState(false)
  const [researchOptIn, setResearchOptIn] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const odo = localStorage.getItem('privacy.onDeviceOnly') === 'true'
    const roi = localStorage.getItem('privacy.researchOptIn') === 'true'
    setOnDeviceOnly(odo)
    setResearchOptIn(roi)
  }, [])

  const save = () => {
    localStorage.setItem('privacy.onDeviceOnly', String(onDeviceOnly))
    localStorage.setItem('privacy.researchOptIn', String(researchOptIn))
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  const resetConsent = () => {
    localStorage.removeItem('consent.accepted.v1')
    alert('Consent has been reset. You will be prompted again next time.')
  }

  const viewDisclaimer = () => {
    window.dispatchEvent(new CustomEvent('app:showDisclaimer'))
  }

  return (
    <div style={{ padding: 24, maxWidth: 900 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Privacy & Consent</h1>
      <p style={{ color: '#475569', marginBottom: 24 }}>Control how your data is processed and shared.</p>

      <div style={{ display: 'grid', gap: 16 }}>
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: 12,
          padding: 16
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 600 }}>On-device processing only</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>Process supported analyses locally; do not upload raw media.</div>
            </div>
            <input type="checkbox" checked={onDeviceOnly} onChange={(e) => setOnDeviceOnly(e.target.checked)} />
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: 12,
          padding: 16
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 600 }}>Research data opt-in</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>Share de-identified results to improve models.</div>
            </div>
            <input type="checkbox" checked={researchOptIn} onChange={(e) => setResearchOptIn(e.target.checked)} />
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <button onClick={save} style={{
            background: 'linear-gradient(135deg, var(--primary-green), #16a34a)',
            color: 'white',
            border: 'none',
            padding: '10px 16px',
            borderRadius: 12,
            fontSize: 14,
            cursor: 'pointer'
          }}>Save</button>
          {saved && (
            <span style={{ marginLeft: 8, fontSize: 12, color: '#16a34a' }}>Saved</span>
          )}
        </div>

        <div style={{
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 12,
          padding: 16
        }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Safety Disclaimer</div>
          <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.6 }}>
            This app provides wellness and health insights based on non-invasive signals and AI models. It does not diagnose, treat, cure, or prevent any disease and is not a substitute for professional medical advice. Always seek the advice of your physician or other qualified health provider with any questions regarding a medical condition. If you believe you may be experiencing a medical emergency, call your local emergency number immediately.
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button onClick={resetConsent} style={{
              backgroundColor: '#e2e8f0',
              border: '1px solid #cbd5e1',
              color: '#0f172a',
              padding: '8px 12px',
              borderRadius: 8,
              fontSize: 12,
              cursor: 'pointer'
            }}>Reset consent</button>
            <button onClick={viewDisclaimer} style={{
              backgroundColor: '#2563eb',
              border: '1px solid #1d4ed8',
              color: 'white',
              padding: '8px 12px',
              borderRadius: 8,
              fontSize: 12,
              cursor: 'pointer'
            }}>View disclaimer</button>
          </div>
        </div>
      </div>
    </div>
  )
}


