import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, Loader } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const { login } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    const from = location.state?.from?.pathname || '/dashboard'

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        try {
            await login(email, password)
            navigate(from, { replace: true })
        } catch (err) {
            setError(err.message || 'Login failed. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #d1fae5 0%, #ecfdf5 50%, #f0fdf4 100%)',
            padding: 24
        }}>
            {/* Card Container */}
            <div style={{
                width: '100%',
                maxWidth: 420,
                background: 'white',
                borderRadius: 24,
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.12)',
                overflow: 'hidden'
            }}>
                {/* Gradient Header */}
                <div style={{
                    height: 120,
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 40%, #047857 100%)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {/* Decorative circles */}
                    <div style={{
                        position: 'absolute',
                        top: -30,
                        right: -30,
                        width: 120,
                        height: 120,
                        background: 'rgba(255, 255, 255, 0.15)',
                        borderRadius: '50%'
                    }} />
                    <div style={{
                        position: 'absolute',
                        bottom: -40,
                        left: -20,
                        width: 100,
                        height: 100,
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '50%'
                    }} />
                    <div style={{
                        position: 'absolute',
                        top: 20,
                        left: 40,
                        width: 60,
                        height: 60,
                        background: 'rgba(255, 255, 255, 0.08)',
                        borderRadius: '50%'
                    }} />
                </div>

                {/* Form Section */}
                <div style={{ padding: '40px 36px' }}>
                    <h1 style={{
                        fontSize: 28,
                        fontWeight: 700,
                        color: '#0f172a',
                        marginBottom: 8
                    }}>
                        Welcome back
                    </h1>
                    <p style={{
                        fontSize: 15,
                        color: '#64748b',
                        marginBottom: 32
                    }}>
                        Sign in to continue to Arogya AI
                    </p>

                    {/* Error Message */}
                    {error && (
                        <div style={{
                            padding: 14,
                            background: '#fef2f2',
                            border: '1px solid #fecaca',
                            borderRadius: 10,
                            marginBottom: 20,
                            fontSize: 14,
                            color: '#dc2626'
                        }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Email Field */}
                        <div style={{ marginBottom: 20 }}>
                            <label style={{
                                display: 'block',
                                fontSize: 14,
                                fontWeight: 500,
                                color: '#374151',
                                marginBottom: 8
                            }}>
                                Email Address
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '14px 16px',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: 10,
                                        fontSize: 15,
                                        color: '#1f2937',
                                        outline: 'none',
                                        transition: 'border-color 0.2s',
                                        boxSizing: 'border-box'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#10b981'}
                                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div style={{ marginBottom: 28 }}>
                            <label style={{
                                display: 'block',
                                fontSize: 14,
                                fontWeight: 500,
                                color: '#374151',
                                marginBottom: 8
                            }}>
                                Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '14px 48px 14px 16px',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: 10,
                                        fontSize: 15,
                                        color: '#1f2937',
                                        outline: 'none',
                                        transition: 'border-color 0.2s',
                                        boxSizing: 'border-box'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#10b981'}
                                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: 14,
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: 4,
                                        color: '#9ca3af'
                                    }}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{
                                width: '100%',
                                padding: 16,
                                background: isLoading
                                    ? '#9ca3af'
                                    : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: 12,
                                fontSize: 16,
                                fontWeight: 600,
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 8,
                                transition: 'all 0.2s'
                            }}
                        >
                            {isLoading ? (
                                <>
                                    <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} />
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        margin: '28px 0',
                        gap: 16
                    }}>
                        <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
                        <span style={{ fontSize: 13, color: '#9ca3af' }}>Don't have an account?</span>
                        <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
                    </div>

                    {/* Register Link */}
                    <Link
                        to="/register"
                        style={{
                            display: 'block',
                            width: '100%',
                            padding: 14,
                            background: 'transparent',
                            color: '#10b981',
                            border: '2px solid #10b981',
                            borderRadius: 12,
                            fontSize: 15,
                            fontWeight: 600,
                            textAlign: 'center',
                            textDecoration: 'none',
                            transition: 'all 0.2s'
                        }}
                    >
                        Create Account
                    </Link>
                </div>
            </div>

            <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    )
}
