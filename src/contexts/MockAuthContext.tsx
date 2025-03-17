'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signIn, signInWithGoogle, signUp, signOut, getCurrentUser, supabase } from '@/utils/mockSupabase'

interface User {
  id: string
  email: string
  user_metadata: {
    role: string
    full_name?: string
    avatar_url?: string
    driverId?: number
    companyId?: number
    phone?: string
    company_name?: string
    address?: string
    bio?: string
    notifications?: {
      email: boolean
      sms: boolean
      push: boolean
    }
  }
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signInWithGoogle: () => Promise<{ error: any, data: any }>
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: any }>
  signOut: () => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check for active session on mount
    const checkUser = async () => {
      try {
        const { user: currentUser } = await getCurrentUser()
        setUser(currentUser as User)
      } catch (error) {
        console.error('Error checking auth state:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkUser()

    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event: string, session: any) => {
        if (session?.user) {
          setUser(session.user as User)
        } else {
          setUser(null)
          if (event === 'SIGNED_OUT') {
            router.push('/login')
          }
        }
        setIsLoading(false)
      }
    )

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [router])

  const handleSignIn = async (email: string, password: string) => {
    setIsLoading(true)
    const { error } = await signIn(email, password)
    setIsLoading(false)
    
    if (!error) {
      router.push('/dashboard')
    }
    
    return { error }
  }

  const handleSignUp = async (email: string, password: string, metadata: any = {}) => {
    setIsLoading(true)
    const { error } = await signUp(email, password, metadata)
    setIsLoading(false)
    
    if (!error) {
      router.push('/dashboard')
    }
    
    return { error }
  }

  const handleSignInWithGoogle = async () => {
    setIsLoading(true)
    const { data, error } = await signInWithGoogle()
    setIsLoading(false)
    
    return { data, error }
  }

  const handleSignOut = async () => {
    setIsLoading(true)
    const { error } = await signOut()
    setIsLoading(false)
    
    if (!error) {
      router.push('/login')
    }
    
    return { error }
  }

  const value = {
    user,
    isLoading,
    signIn: handleSignIn,
    signInWithGoogle: handleSignInWithGoogle,
    signUp: handleSignUp,
    signOut: handleSignOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
