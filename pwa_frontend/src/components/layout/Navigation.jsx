import React, { useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  Heart,
  Eye,
  Mic,
  Brain,
  Activity,
  BarChart3,
  Settings,
  Home,
  FileText,
  Stethoscope,
  Menu,
  X,
  Shield,
  User,
  LogOut
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const navigationItems = [
    {
      section: 'Main',
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: Home, description: 'Overview & insights' },
        { name: 'Disease Prediction', path: '/disease-prediction', icon: Brain, description: 'AI-powered health assessment' }
      ]
    },
    {
      section: 'Screening Modules',
      items: [
        { name: 'Vital Signs (rPPG)', path: '/vital-signs-analysis', icon: Heart, description: 'Heart rate, respiration, SpO2' },
        { name: 'Eye Screening', path: '/eye-screening', icon: Eye, description: 'Anemia, jaundice detection' },
        { name: 'Voice Analysis', path: '/voice-analysis', icon: Mic, description: 'Respiratory & vocal health' },
        { name: 'Symptom Checker', path: '/symptom-checker', icon: Stethoscope, description: 'Multi-symptom assessment' }
      ]
    },
    {
      section: 'Analytics & Emergency',
      items: [
        { name: 'Health Analytics', path: '/health-analytics', icon: BarChart3, description: 'Trends & data insights' },
        { name: 'Journal', path: '/journal', icon: FileText, description: 'Timeline of scans & results' },
        { name: 'Health Profile', path: '/health-profile', icon: User, description: 'Personal health information' },
        { name: 'Emergency Protocol', path: '/emergency-protocol', icon: Shield, description: 'Quick emergency response' }
      ]
    },
    {
      section: 'Settings',
      items: [
        { name: 'Privacy', path: '/settings/privacy', icon: Settings, description: 'Consent & privacy controls' }
      ]
    },
    {
      section: 'Legacy',
      items: [
        { name: 'Legacy Vital Signs', path: '/vital-signs', icon: Activity, description: 'Original vital signs module' }
      ]
    }
  ]

  const isActivePath = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-blue-600 text-white p-2 rounded-lg shadow-lg"
        style={{
          position: 'fixed',
          top: 16,
          left: 16,
          zIndex: 1000,
          backgroundColor: '#2563eb',
          color: 'white',
          padding: 8,
          borderRadius: 8,
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar Navigation */}
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: isOpen ? 0 : '-320px',
          width: 320,
          height: '100vh',
          backgroundColor: 'var(--white)',
          borderRight: '1px solid var(--primary-green-200)',
          boxShadow: '4px 0 20px rgba(16, 185, 129, 0.1)',
          transition: 'left var(--transition-normal)',
          zIndex: 999,
          overflowY: 'auto'
        }}
        className={`lg:left-0 ${isOpen ? 'shadow-xl' : ''}`}
      >
        {/* Header */}
        <div style={{
          padding: '24px 20px',
          borderBottom: '1px solid var(--primary-green-100)',
          background: 'var(--gradient-primary)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 100,
            height: 100,
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            transform: 'translate(30px, -30px)'
          }} />
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: 8,
            position: 'relative',
            zIndex: 1
          }}>
            <Activity size={28} style={{ color: 'white', marginRight: 12 }} />
            <h1 style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: 'white',
              margin: 0
            }}>
              Arogya AI
            </h1>
          </div>
          <p style={{
            fontSize: 12,
            color: 'rgba(255, 255, 255, 0.9)',
            margin: 0,
            position: 'relative',
            zIndex: 1
          }}>
            Advanced Biometric Health Screening
          </p>
        </div>

        {/* Navigation Items */}
        <div style={{ padding: '16px 0' }}>
          {navigationItems.map((section, sectionIndex) => (
            <div key={section.section} style={{ marginBottom: 24 }}>
              {/* Section Header */}
              <div style={{
                padding: '8px 20px',
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--primary-green-600)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                {section.section}
              </div>

              {/* Section Items */}
              {section.items.map((item) => {
                const Icon = item.icon
                const isActive = isActivePath(item.path)

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    style={{
                      display: 'block',
                      padding: '12px 20px',
                      textDecoration: 'none',
                      color: isActive ? 'var(--primary-green-700)' : 'var(--gray-600)',
                      backgroundColor: isActive ? 'var(--primary-green-50)' : 'transparent',
                      borderRight: isActive ? '3px solid var(--primary-green)' : '3px solid transparent',
                      transition: 'var(--transition-fast)',
                      borderRadius: '0 var(--radius-md) var(--radius-md) 0',
                      margin: '2px 0'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.target.style.backgroundColor = 'var(--primary-green-50)'
                        e.target.style.transform = 'translateX(4px)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.target.style.backgroundColor = 'transparent'
                        e.target.style.transform = 'translateX(0)'
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Icon
                        size={18}
                        style={{
                          marginRight: 12,
                          color: isActive ? 'var(--primary-green)' : 'var(--gray-400)'
                        }}
                      />
                      <div>
                        <div style={{
                          fontSize: 14,
                          fontWeight: isActive ? 600 : 500,
                          marginBottom: 2
                        }}>
                          {item.name}
                        </div>
                        <div style={{
                          fontSize: 11,
                          color: 'var(--gray-400)',
                          lineHeight: '1.3'
                        }}>
                          {item.description}
                        </div>
                      </div>
                    </div>
                  </NavLink>
                )
              })}
            </div>
          ))}
        </div>

        {/* Footer with User Info */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '16px 20px',
          borderTop: '1px solid var(--primary-green-100)',
          background: 'linear-gradient(135deg, var(--primary-green-50) 0%, var(--white) 100%)'
        }}>
          {user && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 12
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36,
                  height: 36,
                  background: 'var(--gradient-primary)',
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: 14
                }}>
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-700)' }}>
                    {user.name || 'User'}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>
                    {user.email}
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: 8,
                  borderRadius: 8,
                  cursor: 'pointer',
                  color: 'var(--gray-500)',
                  transition: 'all 0.2s ease'
                }}
                title="Sign out"
              >
                <LogOut size={18} />
              </button>
            </div>
          )}
          <div style={{ fontSize: 11, color: 'var(--gray-400)', textAlign: 'center' }}>
            <div style={{ fontWeight: 500, color: 'var(--primary-green-600)' }}>
              Arogya AI v0.4.0
            </div>
            <div>For screening purposes only</div>
          </div>
        </div>
      </nav>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 998
          }}
          onClick={() => setIsOpen(false)}
          className="lg:hidden"
        />
      )}
    </>
  )
}