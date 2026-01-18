import React, { useState } from 'react'
import { User, Calendar, Heart, Activity, Eye, Mic, Brain, Shield, Edit, Save, X, Plus, AlertTriangle, CheckCircle, Clock, TrendingUp, Target, Zap, Info } from 'lucide-react'

export default function HealthProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState({
    name: 'John Doe',
    age: 35,
    gender: 'Male',
    bloodType: 'O+',
    height: '175 cm',
    weight: '72 kg',
    allergies: ['Peanuts', 'Penicillin'],
    conditions: ['Mild Asthma'],
    medications: ['Ventolin (as needed)']
  })
  const [editedProfile, setEditedProfile] = useState({ ...profile })

  const screeningHistory = [
    { type: 'Vital Signs', date: '2024-01-15', result: 'Normal', icon: Heart },
    { type: 'Eye Screening', date: '2024-01-14', result: 'Low Risk', icon: Eye },
    { type: 'Voice Analysis', date: '2024-01-12', result: 'Good', icon: Mic },
    { type: 'Disease Risk', date: '2024-01-10', result: 'Low Risk', icon: Brain }
  ]

  const healthGoals = [
    { goal: 'Exercise 3x/week', progress: 67, color: '#10b981' },
    { goal: 'Sleep 7+ hours', progress: 85, color: '#3b82f6' },
    { goal: 'Drink 8 glasses water', progress: 50, color: '#8b5cf6' }
  ]

  const handleSave = () => { setProfile(editedProfile); setIsEditing(false) }
  const handleCancel = () => { setEditedProfile({ ...profile }); setIsEditing(false) }

  const cardStyle = { background: 'white', borderRadius: 20, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' }
  const pageStyle = { padding: '24px 32px', maxWidth: 1200, margin: '0 auto' }
  const inputStyle = { width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: 10, fontSize: 14 }

  return (
    <div style={pageStyle}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ width: 80, height: 80, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)' }}>
          <User size={36} color="white" />
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>Health Profile</h1>
        <p style={{ fontSize: 16, color: '#64748b' }}>Manage your personal health information</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Personal Info */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: '#0f172a' }}>Personal Information</h2>
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, border: 'none', background: '#dbeafe', color: '#2563eb', fontWeight: 500, cursor: 'pointer' }}><Edit size={16} /> Edit</button>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 16px', borderRadius: 10, border: 'none', background: '#10b981', color: 'white', fontWeight: 500, cursor: 'pointer' }}><Save size={16} /> Save</button>
                <button onClick={handleCancel} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 16px', borderRadius: 10, border: 'none', background: '#f1f5f9', color: '#64748b', fontWeight: 500, cursor: 'pointer' }}><X size={16} /> Cancel</button>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { label: 'Full Name', field: 'name' },
              { label: 'Age', field: 'age' },
              { label: 'Gender', field: 'gender' },
              { label: 'Blood Type', field: 'bloodType' },
              { label: 'Height', field: 'height' },
              { label: 'Weight', field: 'weight' }
            ].map(({ label, field }) => (
              <div key={field}>
                <label style={{ fontSize: 13, fontWeight: 500, color: '#64748b', display: 'block', marginBottom: 6 }}>{label}</label>
                {isEditing ? (
                  <input value={editedProfile[field]} onChange={(e) => setEditedProfile({ ...editedProfile, [field]: e.target.value })} style={inputStyle} />
                ) : (
                  <div style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: 10, fontWeight: 500, color: '#0f172a' }}>{profile[field]}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Health Goals */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#0f172a', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}><Target size={20} color="#8b5cf6" /> Health Goals</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {healthGoals.map((goal, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontWeight: 500, color: '#0f172a' }}>{goal.goal}</span>
                  <span style={{ fontWeight: 600, color: goal.color }}>{goal.progress}%</span>
                </div>
                <div style={{ background: '#e5e7eb', borderRadius: 8, height: 8, overflow: 'hidden' }}>
                  <div style={{ background: goal.color, height: '100%', width: `${goal.progress}%`, borderRadius: 8, transition: 'width 0.5s' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Medical Info */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#0f172a', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}><AlertTriangle size={20} color="#f59e0b" /> Medical Information</h2>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 8, display: 'block' }}>Allergies</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {profile.allergies.map((allergy, i) => (
                <span key={i} style={{ background: '#fef2f2', color: '#dc2626', padding: '6px 12px', borderRadius: 20, fontSize: 13, fontWeight: 500 }}>{allergy}</span>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 8, display: 'block' }}>Medical Conditions</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {profile.conditions.map((cond, i) => (
                <span key={i} style={{ background: '#fef3c7', color: '#92400e', padding: '6px 12px', borderRadius: 20, fontSize: 13, fontWeight: 500 }}>{cond}</span>
              ))}
            </div>
          </div>
          <div>
            <label style={{ fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 8, display: 'block' }}>Medications</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {profile.medications.map((med, i) => (
                <span key={i} style={{ background: '#dbeafe', color: '#1e40af', padding: '6px 12px', borderRadius: 20, fontSize: 13, fontWeight: 500 }}>{med}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Screening History */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#0f172a', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}><Activity size={20} color="#3b82f6" /> Recent Screenings</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {screeningHistory.map((screen, i) => {
              const IconComponent = screen.icon
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, background: '#f8fafc', borderRadius: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, background: '#e0f2fe', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconComponent size={20} color="#0284c7" /></div>
                    <div>
                      <div style={{ fontWeight: 500, color: '#0f172a' }}>{screen.type}</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>{screen.date}</div>
                    </div>
                  </div>
                  <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 12px', borderRadius: 12, fontSize: 12, fontWeight: 500 }}>{screen.result}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}