import React from 'react'

export default function ConsentModal({ visible, onAccept }) {
  if (!visible) return null

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000
    }}>
      <div style={{
        width: 'min(720px, 92vw)',
        maxHeight: '85vh',
        overflowY: 'auto',
        backgroundColor: 'white',
        borderRadius: 16,
        border: '1px solid #e2e8f0',
        boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
      }}>
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #f1f5f9',
          background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)'
        }}>
          <h2 style={{ margin: 0, fontSize: 20, color: '#065f46' }}>Important Safety Information</h2>
        </div>
        <div style={{ padding: 24, color: '#0f172a' }}>
          <p style={{ fontSize: 14, lineHeight: 1.6, marginTop: 0 }}>
            This app provides wellness and health insights based on non-invasive signals and AI models. It does not diagnose, treat, cure, or prevent any disease and is not a substitute for professional medical advice.
          </p>
          <p style={{ fontSize: 14, lineHeight: 1.6 }}>
            Always seek the advice of your physician or other qualified health provider with any questions regarding a medical condition. Do not ignore professional medical advice or delay seeking it because of information provided by this app. If you believe you may be experiencing a medical emergency, call your local emergency number immediately.
          </p>
          <div style={{
            marginTop: 16,
            padding: 12,
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 8
          }}>
            <ul style={{ margin: 0, paddingLeft: 16, fontSize: 13, color: '#334155' }}>
              <li>Results are estimates with confidence scores and may be inaccurate.</li>
              <li>For privacy, processing may occur on-device when possible; you control data sharing.</li>
              <li>By continuing, you acknowledge you have read and understood this information.</li>
            </ul>
          </div>
        </div>
        <div style={{
          padding: 16,
          borderTop: '1px solid #f1f5f9',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 12
        }}>
          <button
            onClick={onAccept}
            style={{
              background: 'linear-gradient(135deg, var(--primary-green), #16a34a)',
              color: 'white',
              border: 'none',
              padding: '10px 16px',
              borderRadius: 12,
              fontSize: 14,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
            }}
          >
            I Understand and Agree
          </button>
        </div>
      </div>
    </div>
  )
}


