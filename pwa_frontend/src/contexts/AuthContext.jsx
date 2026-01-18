import React, { createContext, useContext, useState, useEffect } from 'react'
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile
} from 'firebase/auth'
import { auth } from '../firebase/config'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // Listen for Firebase Auth state changes
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser({
                    id: currentUser.uid,
                    email: currentUser.email,
                    name: currentUser.displayName || currentUser.email.split('@')[0],
                    photoURL: currentUser.photoURL,
                    emailVerified: currentUser.emailVerified
                })
            } else {
                setUser(null)
            }
            setIsLoading(false)
        })

        return () => unsubscribe()
    }, [])

    const login = async (email, password) => {
        try {
            const result = await signInWithEmailAndPassword(auth, email, password)
            return result.user
        } catch (error) {
            console.error("Login Error:", error)
            throw new Error(formatFirebaseError(error.code))
        }
    }

    const register = async (name, email, password) => {
        try {
            const result = await createUserWithEmailAndPassword(auth, email, password)
            // Update profile with name
            await updateProfile(result.user, { displayName: name })

            // Force update local state immediately
            setUser({
                id: result.user.uid,
                email: result.user.email,
                name: name,
                photoURL: result.user.photoURL,
                emailVerified: result.user.emailVerified
            })

            return result.user
        } catch (error) {
            console.error("Register Error:", error)
            throw new Error(formatFirebaseError(error.code))
        }
    }

    const logout = async () => {
        try {
            await signOut(auth)
        } catch (error) {
            console.error("Logout Error:", error)
        }
    }

    const formatFirebaseError = (code) => {
        switch (code) {
            case 'auth/user-not-found': return 'No user found with this email'
            case 'auth/wrong-password': return 'Incorrect password'
            case 'auth/email-already-in-use': return 'Email already in use'
            case 'auth/weak-password': return 'Password is too weak'
            case 'auth/invalid-email': return 'Invalid email address'
            default: return 'Authentication failed. Please try again.'
        }
    }

    const value = {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout
    }

    return (
        <AuthContext.Provider value={value}>
            {!isLoading && children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

export default AuthContext
