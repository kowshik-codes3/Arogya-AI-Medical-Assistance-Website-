import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Lock, Eye, EyeOff, Loader } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function RegisterPage() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const { register } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        setIsLoading(true)

        try {
            await register(name, email, password)
            navigate('/dashboard', { replace: true })
        } catch (err) {
            setError(err.message || 'Registration failed. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const inputStyle = {
        width: '100%',
        padding: '14px 16px',
        border: '1px solid #e5e7eb',
        borderRadius: 10,
        fontSize: 15,
        color: '#1f2937',
        outline: 'none',
        transition: 'border-color 0.2s',
        boxSizing: 'border-box'
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
                <div style={{ padding: '36px 36px 40px' }}>
                    <h1 style={{
                        fontSize: 28,
                        fontWeight: 700,
                        color: '#0f172a',
                        marginBottom: 8
                    }}>
                        Create new account
                    </h1>
                    <p style={{
                        fontSize: 15,
                        color: '#64748b',
                        marginBottom: 28
                    }}>
                        Fill in all the details to get started
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
                        {/* Name Field */}
                        <div style={{ marginBottom: 18 }}>
                            <label style={{
                                display: 'block',
                                fontSize: 14,
                                fontWeight: 500,
                                color: '#374151',
                                marginBottom: 8
                            }}>
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter your full name"
                                required
                                style={inputStyle}
                                onFocus={(e) => e.target.style.borderColor = '#10b981'}
                                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                            />
                        </div>

                        {/* Email Field */}
                        <div style={{ marginBottom: 18 }}>
                            <label style={{
                                display: 'block',
                                fontSize: 14,
                                fontWeight: 500,
                                color: '#374151',
                                marginBottom: 8
                            }}>
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                required
                                style={inputStyle}
                                onFocus={(e) => e.target.style.borderColor = '#10b981'}
                                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                            />
                        </div>

                        {/* Password Field */}
                        <div style={{ marginBottom: 18 }}>
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
                                    placeholder="Create a password"
                                    required
                                    minLength={6}
                                    style={{ ...inputStyle, paddingRight: 48 }}
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

                        {/* Confirm Password Field */}
                        <div style={{ marginBottom: 24 }}>
                            <label style={{
                                display: 'block',
                                fontSize: 14,
                                fontWeight: 500,
                                color: '#374151',
                                marginBottom: 8
                            }}>
                                Confirm Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm your password"
                                    required
                                    style={{ ...inputStyle, paddingRight: 48 }}
                                    onFocus={(e) => e.target.style.borderColor = '#10b981'}
                                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
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
                                    Creating account...
                                </>
                            ) : (
                                'Create New Account'
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        margin: '24px 0',
                        gap: 16
                    }}>
                        <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
                        <span style={{ fontSize: 13, color: '#9ca3af' }}>Already have an account?</span>
                        <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
                    </div>

                    {/* Login Link */}
                    <Link
                        to="/login"
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
                            transition: 'all 0.2s',
                            boxSizing: 'border-box'
                        }}
                    >
                        Login
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
