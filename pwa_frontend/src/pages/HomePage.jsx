import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
    Heart,
    Brain,
    Eye,
    Mic,
    Shield,
    Activity,
    ArrowRight,
    CheckCircle,
    Zap,
    Users,
    Smartphone,
    Lock
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import ComprehensiveAIAssistant from '../components/ComprehensiveAIAssistant'

export default function HomePage() {
    const navigate = useNavigate()
    const { isAuthenticated } = useAuth()

    const features = [
        {
            icon: Heart,
            title: 'rPPG Vital Signs',
            description: 'AI-powered camera-based heart rate, blood pressure, and SpO2 monitoring using remote photoplethysmography.',
            color: '#ef4444'
        },
        {
            icon: Brain,
            title: 'Disease Prediction',
            description: 'Advanced machine learning models for early detection of diabetes, heart disease, and other conditions.',
            color: '#8b5cf6'
        },
        {
            icon: Eye,
            title: 'Eye Health Screening',
            description: 'Computer vision analysis for detecting signs of anemia, jaundice, and other health indicators.',
            color: '#f59e0b'
        },
        {
            icon: Mic,
            title: 'Voice Biomarkers',
            description: 'Analyze voice patterns for respiratory health, cognitive assessment, and stress detection.',
            color: '#3b82f6'
        }
    ]

    const benefits = [
        { icon: Smartphone, text: 'Works on any device with a camera' },
        { icon: Lock, text: 'Privacy-first: all processing on-device' },
        { icon: Zap, text: 'Instant AI-powered health insights' },
        { icon: Users, text: 'Track health for your whole family' }
    ]

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #ecfdf5 0%, #ffffff 50%, #f0fdf4 100%)',
            position: 'relative' // Ensure relative positioning for absolute/fixed children if needed
        }}>
            {/* Navigation Bar */}
            <nav style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '20px 40px',
                maxWidth: 1400,
                margin: '0 auto'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                        width: 44,
                        height: 44,
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        borderRadius: 12,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                        overflow: 'hidden'
                    }}>
                        <img src="/logo.png" alt="Arogya AI" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <span style={{
                        fontSize: 24,
                        fontWeight: 700,
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        Arogya AI
                    </span>
                </div>

                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    {isAuthenticated ? (
                        <button
                            onClick={() => navigate('/dashboard')}
                            style={{
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                color: 'white',
                                border: 'none',
                                padding: '12px 28px',
                                borderRadius: 12,
                                fontSize: 15,
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            Go to Dashboard
                            <ArrowRight size={18} />
                        </button>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                style={{
                                    color: '#374151',
                                    textDecoration: 'none',
                                    fontSize: 15,
                                    fontWeight: 500,
                                    padding: '10px 20px',
                                    borderRadius: 10,
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                Sign In
                            </Link>
                            <Link
                                to="/register"
                                style={{
                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                    color: 'white',
                                    textDecoration: 'none',
                                    padding: '12px 28px',
                                    borderRadius: 12,
                                    fontSize: 15,
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                Get Started
                                <ArrowRight size={18} />
                            </Link>
                        </>
                    )}
                </div>
            </nav>

            {/* Hero Section */}
            <section style={{
                maxWidth: 1400,
                margin: '0 auto',
                padding: '80px 40px 100px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 80,
                alignItems: 'center'
            }}>
                <div>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        padding: '8px 16px',
                        borderRadius: 100,
                        marginBottom: 24
                    }}>
                        <Zap size={16} color="#10b981" />
                        <span style={{ fontSize: 14, fontWeight: 600, color: '#059669' }}>
                            AI-Powered Health Screening
                        </span>
                    </div>

                    <h1 style={{
                        fontSize: 56,
                        fontWeight: 800,
                        lineHeight: 1.1,
                        color: '#0f172a',
                        marginBottom: 24
                    }}>
                        Your Personal
                        <span style={{
                            display: 'block',
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            Health Guardian
                        </span>
                    </h1>

                    <p style={{
                        fontSize: 20,
                        color: '#4b5563',
                        lineHeight: 1.7,
                        marginBottom: 40,
                        maxWidth: 500
                    }}>
                        Advanced biometric health screening using your device's camera.
                        Get instant AI-powered insights for vital signs, disease risk,
                        and wellness monitoring.
                    </p>

                    <div style={{ display: 'flex', gap: 16, marginBottom: 48 }}>
                        <Link
                            to={isAuthenticated ? '/dashboard' : '/register'}
                            style={{
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                color: 'white',
                                textDecoration: 'none',
                                padding: '16px 32px',
                                borderRadius: 14,
                                fontSize: 17,
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            Start Free Screening
                            <ArrowRight size={20} />
                        </Link>
                        <button
                            onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                            style={{
                                background: 'white',
                                color: '#374151',
                                border: '2px solid #e5e7eb',
                                padding: '16px 32px',
                                borderRadius: 14,
                                fontSize: 17,
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            Learn More
                        </button>
                    </div>

                    {/* Trust Indicators */}
                    <div style={{ display: 'flex', gap: 32 }}>
                        {benefits.slice(0, 2).map((benefit, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <benefit.icon size={18} color="#10b981" />
                                <span style={{ fontSize: 14, color: '#6b7280' }}>{benefit.text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Hero Visual */}
                <div style={{
                    position: 'relative',
                    display: 'flex',
                    justifyContent: 'center'
                }}>
                    <div style={{
                        width: 400,
                        height: 400,
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        borderRadius: '50%',
                        opacity: 0.1,
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)'
                    }} />
                    <div style={{
                        width: 320,
                        height: 320,
                        background: 'white',
                        borderRadius: 32,
                        boxShadow: '0 32px 64px rgba(0, 0, 0, 0.1)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        zIndex: 1
                    }}>
                        <div style={{
                            width: 100,
                            height: 100,
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            borderRadius: 28,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: 24,
                            boxShadow: '0 12px 32px rgba(16, 185, 129, 0.35)'
                        }}>
                            <Heart size={48} color="white" />
                        </div>
                        <div style={{ fontSize: 48, fontWeight: 800, color: '#0f172a' }}>72</div>
                        <div style={{ fontSize: 16, color: '#6b7280', fontWeight: 500 }}>BPM</div>
                        <div style={{
                            marginTop: 16,
                            padding: '8px 16px',
                            background: '#dcfce7',
                            borderRadius: 100,
                            fontSize: 14,
                            fontWeight: 600,
                            color: '#16a34a'
                        }}>
                            ✓ Healthy Range
                        </div>
                    </div>

                    {/* Floating Cards */}
                    <div style={{
                        position: 'absolute',
                        top: 40,
                        right: 20,
                        background: 'white',
                        padding: 16,
                        borderRadius: 16,
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12
                    }}>
                        <Brain size={24} color="#8b5cf6" />
                        <div>
                            <div style={{ fontSize: 12, color: '#6b7280' }}>AI Analysis</div>
                            <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Active</div>
                        </div>
                    </div>

                    <div style={{
                        position: 'absolute',
                        bottom: 60,
                        left: 0,
                        background: 'white',
                        padding: 16,
                        borderRadius: 16,
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12
                    }}>
                        <Shield size={24} color="#10b981" />
                        <div>
                            <div style={{ fontSize: 12, color: '#6b7280' }}>Data Privacy</div>
                            <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>On-Device</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" style={{
                background: 'white',
                padding: '100px 40px'
            }}>
                <div style={{ maxWidth: 1400, margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: 64 }}>
                        <h2 style={{
                            fontSize: 40,
                            fontWeight: 800,
                            color: '#0f172a',
                            marginBottom: 16
                        }}>
                            Advanced Health Screening
                        </h2>
                        <p style={{
                            fontSize: 18,
                            color: '#6b7280',
                            maxWidth: 600,
                            margin: '0 auto'
                        }}>
                            Powered by state-of-the-art AI models running directly on your device
                            for maximum privacy and instant results.
                        </p>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: 32
                    }}>
                        {features.map((feature, i) => (
                            <div key={i} style={{
                                padding: 32,
                                borderRadius: 20,
                                background: '#f9fafb',
                                border: '1px solid #e5e7eb',
                                transition: 'all 0.3s ease'
                            }}>
                                <div style={{
                                    width: 64,
                                    height: 64,
                                    background: `${feature.color}15`,
                                    borderRadius: 16,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: 20
                                }}>
                                    <feature.icon size={32} color={feature.color} />
                                </div>
                                <h3 style={{
                                    fontSize: 20,
                                    fontWeight: 700,
                                    color: '#0f172a',
                                    marginBottom: 12
                                }}>
                                    {feature.title}
                                </h3>
                                <p style={{
                                    fontSize: 15,
                                    color: '#6b7280',
                                    lineHeight: 1.6
                                }}>
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section style={{
                padding: '100px 40px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
            }}>
                <div style={{
                    maxWidth: 800,
                    margin: '0 auto',
                    textAlign: 'center'
                }}>
                    <h2 style={{
                        fontSize: 40,
                        fontWeight: 800,
                        color: 'white',
                        marginBottom: 20
                    }}>
                        Start Your Health Journey Today
                    </h2>
                    <p style={{
                        fontSize: 18,
                        color: 'rgba(255, 255, 255, 0.9)',
                        marginBottom: 40,
                        maxWidth: 500,
                        margin: '0 auto 40px'
                    }}>
                        Join thousands using AI-powered health screening for early detection
                        and proactive wellness monitoring.
                    </p>
                    <Link
                        to={isAuthenticated ? '/dashboard' : '/register'}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 10,
                            background: 'white',
                            color: '#059669',
                            textDecoration: 'none',
                            padding: '18px 40px',
                            borderRadius: 14,
                            fontSize: 18,
                            fontWeight: 700,
                            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        Get Started Free
                        <ArrowRight size={22} />
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer style={{
                padding: '40px',
                background: '#0f172a',
                textAlign: 'center'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 16 }}>
                    <Activity size={24} color="#10b981" />
                    <span style={{ fontSize: 20, fontWeight: 700, color: 'white' }}>Arogya AI</span>
                </div>
                <p style={{ color: '#64748b', fontSize: 14, marginBottom: 8 }}>
                    Advanced Biometric Health Screening Platform
                </p>
                <p style={{ color: '#475569', fontSize: 12 }}>
                    For screening purposes only. Not a substitute for professional medical advice.
                </p>
            </footer>

            {/* AI Assistant */}
            <ComprehensiveAIAssistant />
        </div>
    )
}
