import { useState, useEffect } from 'react'
import { User as AuthUser, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Obtener sesión inicial
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setSession(session)
        setUser(session?.user ?? null)
      } catch (error) {
        console.error('Error getting session:', error)
      } finally {
        setLoading(false)
      }
    }

    getSession()

    // Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string) => {
    console.log('Attempting sign up with:', email)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    
    if (error) {
      console.error('Sign up error:', error)
    } else {
      console.log('Sign up successful:', data.user?.email)
    }
    
    return { data, error }
  }

  const signIn = async (email: string, password: string) => {
    console.log('Attempting sign in with:', email)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      console.error('Sign in error:', error)
    } else {
      console.log('Sign in successful:', data.user?.email)
    }
    
    return { data, error }
  }

  const signOut = async () => {
    console.log('Signing out...')
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('Sign out error:', error)
    } else {
      console.log('Sign out successful')
    }
    
    return { error }
  }

  const resetPassword = async (email: string) => {
    console.log('Resetting password for:', email)
    const { data, error } = await supabase.auth.resetPasswordForEmail(email)
    
    if (error) {
      console.error('Reset password error:', error)
    } else {
      console.log('Reset password email sent')
    }
    
    return { data, error }
  }

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
  }
} 