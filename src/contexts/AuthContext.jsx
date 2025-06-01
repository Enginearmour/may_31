import { createContext, useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

// Create the context with a default value
export const AuthContext = createContext({
  user: null,
  company: null,
  loading: false, // Changed default to false to prevent initial loading state
  error: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  setCompany: () => {}
})

// Provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [company, setCompany] = useState(null)
  const [loading, setLoading] = useState(false) // Start with false to avoid initial loading state
  const [initializing, setInitializing] = useState(true) // Separate state for initial load
  const [error, setError] = useState(null)
  const isMounted = useRef(true)
  const initAttempted = useRef(false)
  
  // Safe state setter functions that check if component is still mounted
  const safeSetUser = (data) => {
    if (isMounted.current) setUser(data)
  }
  
  const safeSetCompany = (data) => {
    if (isMounted.current) setCompany(data)
  }
  
  const safeSetLoading = (data) => {
    if (isMounted.current) setLoading(data)
  }
  
  const safeSetInitializing = (data) => {
    if (isMounted.current) setInitializing(data)
  }
  
  const safeSetError = (data) => {
    if (isMounted.current) setError(data)
  }
  
  // Initialize auth state immediately
  useEffect(() => {
    console.log('AuthProvider mounted - initializing auth state')
    
    // Set isMounted ref to true when component mounts
    isMounted.current = true
    
    // Immediately set initializing to true
    safeSetInitializing(true)
    
    // Check active sessions and sets the user
    const getSession = async () => {
      if (initAttempted.current) {
        console.log('Session initialization already attempted, skipping')
        safeSetInitializing(false) // Ensure initializing is set to false
        return
      }
      
      initAttempted.current = true
      
      try {
        console.log('Getting session...')
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Session error:', error)
          safeSetError(error)
          safeSetInitializing(false)
          return
        }
        
        console.log('Session data:', data)
        const session = data.session
        
        safeSetUser(session?.user || null)
        
        if (session?.user) {
          // Fetch company information
          console.log('Fetching company data for user:', session.user.id)
          try {
            const { data: companyData, error: companyError } = await supabase
              .from('companies')
              .select('*')
              .eq('user_id', session.user.id)
              .single()
            
            if (companyError) {
              console.error('Error fetching company:', companyError)
              if (companyError.code !== 'PGRST116') { // Not found error is ok for new users
                safeSetError(companyError)
              }
            } else {
              console.log('Company data:', companyData)
              safeSetCompany(companyData)
            }
          } catch (fetchError) {
            console.error('Exception fetching company:', fetchError)
            safeSetError(fetchError)
          }
        }
      } catch (error) {
        console.error("Auth session error:", error)
        safeSetError(error)
      } finally {
        console.log('Setting initializing to false')
        safeSetInitializing(false)
      }
    }
    
    // Call getSession immediately
    getSession()
    
    // Add a timeout to ensure initializing state is eventually set to false
    const loadingTimeout = setTimeout(() => {
      if (isMounted.current && initializing) {
        console.warn('Auth initializing timeout reached, forcing initializing state to false')
        safeSetInitializing(false)
      }
    }, 3000) // 3 second timeout
    
    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session)
        
        safeSetUser(session?.user || null)
        
        if (session?.user) {
          // Fetch company information
          try {
            const { data: companyData, error: companyError } = await supabase
              .from('companies')
              .select('*')
              .eq('user_id', session.user.id)
              .single()
            
            if (companyError && companyError.code !== 'PGRST116') {
              console.error('Error fetching company on auth change:', companyError)
              safeSetError(companyError)
            } else {
              safeSetCompany(companyData || null)
            }
          } catch (error) {
            console.error("Error in auth state change:", error)
            safeSetError(error)
          }
        } else {
          safeSetCompany(null)
        }
        
        safeSetInitializing(false)
      }
    )
    
    // Cleanup function
    return () => {
      console.log('AuthProvider unmounting - cleaning up')
      isMounted.current = false
      subscription?.unsubscribe()
      clearTimeout(loadingTimeout)
    }
  }, [])
  
  // Register a new user and create a company
  const register = async (email, password, companyName, address, phone) => {
    try {
      safeSetLoading(true)
      safeSetError(null) // Clear any previous errors
      
      // First check if email already exists to provide a better error message
      const { data: existingUsers, error: checkError } = await supabase
        .from('companies')
        .select('email')
        .eq('email', email)
        .limit(1)
      
      if (checkError) {
        console.error('Error checking existing email:', checkError)
      } else if (existingUsers && existingUsers.length > 0) {
        throw new Error('An account with this email already exists')
      }
      
      // Proceed with registration
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })
      
      if (error) {
        console.error('Registration error:', error)
        throw error
      }
      
      if (!data.user) {
        throw new Error('User registration failed')
      }
      
      // Create company with required fields
      const { error: companyError } = await supabase
        .from('companies')
        .insert([
          { 
            name: companyName,
            user_id: data.user.id,
            address: address,
            phone: phone,
            email: email
          }
        ])
      
      if (companyError) {
        console.error('Company creation error:', companyError)
        throw companyError
      }
      
      // Sign out the user after registration to ensure a clean login state
      await supabase.auth.signOut()
      
      return data
    } catch (error) {
      safeSetError(error)
      throw error
    } finally {
      safeSetLoading(false)
    }
  }
  
  // Login user
  const login = async (email, password) => {
    try {
      safeSetLoading(true)
      safeSetError(null) // Clear any previous errors
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        console.error('Login error:', error)
        throw error
      }
      
      return data
    } catch (error) {
      safeSetError(error)
      throw error
    } finally {
      safeSetLoading(false)
    }
  }
  
  // Logout user
  const logout = async () => {
    try {
      safeSetLoading(true)
      
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Logout error:', error)
        throw error
      }
      
      // Clear user and company state immediately
      safeSetUser(null)
      safeSetCompany(null)
    } catch (error) {
      safeSetError(error)
      throw error
    } finally {
      safeSetLoading(false)
    }
  }
  
  const value = {
    user,
    company,
    setCompany: safeSetCompany,
    login,
    register,
    logout,
    loading: loading || initializing, // Combine both loading states
    error
  }
  
  console.log('Auth context value:', { 
    user: user ? 'exists' : 'null', 
    company: company ? 'exists' : 'null', 
    loading: loading || initializing,
    initializing,
    error: error ? 'exists' : 'null' 
  })
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
