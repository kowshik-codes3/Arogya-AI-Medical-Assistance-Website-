import React from 'react'

export default function Journal() {
  const entries = [
    {
      id: 1,
      type: 'vitals',
      title: 'rPPG Scan',
      summary: 'HR 72 BPM, HRV stable, SpO₂ 98%'
    },
    {
      id: 2,
      type: 'eye',
      title: 'Eye Screening',
      summary: 'No signs of jaundice; image quality good'
    },
    {
      id: 3,
      type: 'symptom',
      title: 'Symptom Check: Headache',
      summary: 'Likely tension-type; OTC guidance provided'
    }
  ]

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Health Journal</h1>
      <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={async () => {
            try {
              const res = await fetch('/api/analytics/reports/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ range: '7d' })
              })
              const data = await res.json()
              alert(`Report requested (id: ${data.reportId}). Status: ${data.status}`)
            } catch (e) {
              alert('Failed to request report')
            }
          }}
          style={{
            background: 'linear-gradient(135deg, var(--primary-green), #16a34a)',
            color: 'white',
            border: 'none',
            padding: '8px 12px',
            borderRadius: 10,
            fontSize: 13,
            cursor: 'pointer'
          }}
        >Generate PDF (stub)</button>
      </div>
      <div style={{
        backgroundColor: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: 12,
        overflow: 'hidden'
      }}>
        {entries.map((e, i) => (
          <div key={e.id} style={{
            padding: 16,
            borderBottom: i < entries.length - 1 ? '1px solid #f1f5f9' : 'none'
          }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{e.title}</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>{e.summary}</div>
          </div>
        ))}
      </div>
    </div>
  )
}


