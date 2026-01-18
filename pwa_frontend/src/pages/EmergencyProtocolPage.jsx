import React, { useState, useEffect } from 'react'
import { AlertTriangle, Phone, MapPin, Clock, Heart, Activity, Thermometer, Droplets, Zap, Navigation, Volume2, Camera, User, Shield, Send, Info, CheckCircle, RefreshCw, Target } from 'lucide-react'

export default function EmergencyProtocolPage() {
  const [selectedEmergency, setSelectedEmergency] = useState(null)
  const [isActive, setIsActive] = useState(false)
  const [countdown, setCountdown] = useState(30)
  const [location, setLocation] = useState(null)

  const emergencyTypes = [
    { id: 'cardiac', name: 'Cardiac Emergency', icon: Heart, color: '#ef4444', description: 'Chest pain, heart attack symptoms', instructions: ['Call 911 immediately', 'Chew aspirin if available', 'Lie down and stay calm', 'Loosen tight clothing'] },
    { id: 'breathing', name: 'Breathing Difficulty', icon: Activity, color: '#3b82f6', description: 'Severe shortness of breath', instructions: ['Sit upright', 'Use inhaler if prescribed', 'Stay calm, breathe slowly', 'Call emergency if severe'] },
    { id: 'bleeding', name: 'Severe Bleeding', icon: Droplets, color: '#dc2626', description: 'Uncontrolled bleeding injury', instructions: ['Apply direct pressure', 'Elevate injured area', 'Keep victim calm', 'Call 911 for severe cases'] },
    { id: 'allergic', name: 'Allergic Reaction', icon: Zap, color: '#f59e0b', description: 'Severe allergic response', instructions: ['Use EpiPen if available', 'Call 911 immediately', 'Remove allergen source', 'Monitor breathing'] }
  ]

  const emergencyContacts = [
    { name: 'Emergency Services', number: '911', primary: true },
    { name: 'Poison Control', number: '1-800-222-1222', primary: false },
    { name: 'Personal Emergency', number: '555-0100', primary: false }
  ]

  useEffect(() => {
    if (isActive && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [isActive, countdown])

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(pos => setLocation({ lat: pos.coords.latitude.toFixed(4), lng: pos.coords.longitude.toFixed(4) }))
  }, [])

  const initiateEmergency = (type) => { setSelectedEmergency(type); setIsActive(true); setCountdown(30) }
  const cancelEmergency = () => { setIsActive(false); setSelectedEmergency(null); setCountdown(30) }
  const callNumber = (number) => window.open(`tel:${number}`, '_self')

  const cardStyle = { background: 'white', borderRadius: 20, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' }
  const pageStyle = { padding: '24px 32px', maxWidth: 1200, margin: '0 auto' }

  return (
    <div style={pageStyle}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ width: 80, height: 80, background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 24px rgba(239, 68, 68, 0.3)' }}>
          <AlertTriangle size={36} color="white" />
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>Emergency Protocol</h1>
        <p style={{ fontSize: 16, color: '#64748b' }}>Quick access to emergency procedures and contacts</p>
      </div>

      {/* Active Emergency Alert */}
      {isActive && selectedEmergency && (
        <div style={{ background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)', border: '2px solid #ef4444', borderRadius: 20, padding: 32, marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 60, height: 60, background: '#ef4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'pulse 1s infinite' }}>
                {React.createElement(selectedEmergency.icon, { size: 28, color: 'white' })}
              </div>
              <div>
                <h2 style={{ fontSize: 24, fontWeight: 700, color: '#dc2626' }}>{selectedEmergency.name} Active</h2>
                <p style={{ color: '#7f1d1d' }}>Emergency services will be contacted in {countdown} seconds</p>
              </div>
            </div>
            <button onClick={cancelEmergency} style={{ padding: '12px 24px', borderRadius: 12, border: 'none', background: '#fecaca', color: '#dc2626', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          </div>

          <div style={{ background: 'white', borderRadius: 16, padding: 20 }}>
            <h3 style={{ fontWeight: 600, color: '#0f172a', marginBottom: 12 }}>Follow These Steps:</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {selectedEmergency.instructions.map((inst, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ width: 24, height: 24, background: '#dc2626', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600 }}>{i + 1}</span>
                  <span style={{ color: '#374151' }}>{inst}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        {/* Emergency Types */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#0f172a', marginBottom: 24 }}>Select Emergency Type</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {emergencyTypes.map(type => {
              const IconComponent = type.icon
              return (
                <button key={type.id} onClick={() => initiateEmergency(type)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 24, border: `2px solid ${type.color}30`, borderRadius: 16, background: `${type.color}08`, cursor: 'pointer', textAlign: 'center' }}>
                  <div style={{ width: 56, height: 56, background: `${type.color}20`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                    <IconComponent size={28} color={type.color} />
                  </div>
                  <h3 style={{ fontWeight: 600, color: '#0f172a', marginBottom: 4 }}>{type.name}</h3>
                  <p style={{ fontSize: 13, color: '#64748b' }}>{type.description}</p>
                </button>
              )
            })}
          </div>
        </div>

        {/* Emergency Contacts & Location */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={cardStyle}>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: '#0f172a', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}><Phone size={20} color="#10b981" /> Emergency Contacts</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {emergencyContacts.map((contact, i) => (
                <button key={i} onClick={() => callNumber(contact.number)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 12, border: 'none', background: contact.primary ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : '#f1f5f9', cursor: 'pointer' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: contact.primary ? 'white' : '#0f172a' }}>{contact.name}</div>
                    <div style={{ fontSize: 13, color: contact.primary ? 'rgba(255,255,255,0.8)' : '#64748b' }}>{contact.number}</div>
                  </div>
                  <Phone size={20} color={contact.primary ? 'white' : '#10b981'} />
                </button>
              ))}
            </div>
          </div>

          <div style={cardStyle}>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: '#0f172a', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}><MapPin size={20} color="#3b82f6" /> Your Location</h2>
            {location ? (
              <div style={{ padding: 16, background: '#f0f9ff', borderRadius: 12, border: '1px solid #bae6fd' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Navigation size={16} color="#0284c7" />
                  <span style={{ fontWeight: 500, color: '#0c4a6e' }}>Location Available</span>
                </div>
                <div style={{ fontSize: 13, color: '#0369a1' }}>Lat: {location.lat}, Lng: {location.lng}</div>
              </div>
            ) : (
              <div style={{ padding: 16, background: '#fef3c7', borderRadius: 12, border: '1px solid #fcd34d', color: '#92400e', fontSize: 14 }}>
                <AlertTriangle size={16} style={{ display: 'inline', marginRight: 8 }} />
                Enable location for emergency services
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Safety Tips */}
      <div style={{ ...cardStyle, marginTop: 24, background: 'linear-gradient(135deg, #dcfce7 0%, #d1fae5 100%)' }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: '#166534', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}><Shield size={20} /> General Safety Tips</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {['Stay calm and assess the situation', 'Call emergency services if in doubt', 'Keep emergency contacts accessible'].map((tip, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'start', gap: 10, padding: 12, background: 'white', borderRadius: 12 }}>
              <CheckCircle size={18} color="#16a34a" style={{ marginTop: 2, flexShrink: 0 }} />
              <span style={{ fontSize: 14, color: '#166534' }}>{tip}</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.8; transform: scale(1.05); } }`}</style>
    </div>
  )
}