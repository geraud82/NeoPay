'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, getCurrentUser, signIn, signInWithGoogle, signOut, signUp } from '@/utils/supabase'
import type { User } from '@supabase/supabase-js'
import { fetchCompany } from '@/utils/companies'
import type { Company } from '@/types/company'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  userRole: string | null
  isAdmin: boolean
  userCompany: Company | null
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signInWithGoogle: () => Promise<{ error: any, data: any }>
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: any }>
  signOut: () => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [userCompany, setUserCompany] = useState<Company | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check for active session on mount
    const checkUser = async () => {
      try {
        const { user: currentUser } = await getCurrentUser()
        setUser(currentUser)
        
        if (currentUser) {
          // Check user role from metadata
          const role = currentUser.user_metadata?.role || 'user'
          setUserRole(role)
          setIsAdmin(role === 'admin')
          
          // Fetch company information if user is a driver or owner
          if (currentUser.user_metadata?.company_id && 
              (role === 'driver' || role === 'owner')) {
            const companyId = parseInt(currentUser.user_metadata.company_id)
            const company = await fetchCompany(companyId)
            setUserCompany(company)
          }
        }
      } catch (error) {
        console.error('Error checking auth state:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkUser()

    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user)
          
          // Check user role from metadata
          const role = session.user.user_metadata?.role || 'user'
          setUserRole(role)
          setIsAdmin(role === 'admin')
          
          // Fetch company information if user is a driver or owner
          if (session.user.user_metadata?.company_id && 
              (role === 'driver' || role === 'owner')) {
            const companyId = parseInt(session.user.user_metadata.company_id)
            const company = await fetchCompany(companyId)
            setUserCompany(company)
          }
        } else {
          setUser(null)
          setUserRole(null)
          setIsAdmin(false)
          setUserCompany(null)
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
      // If the user is registering as a company admin or manager, redirect to companies page
      if (metadata.registration_type === 'company') {
        router.push('/companies')
      } else {
        router.push('/dashboard')
      }
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
    userRole,
    isAdmin,
    userCompany,
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
