import { createClient } from '@supabase/supabase-js'

// Initialize the Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
  alert('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Function to check if Supabase connection is working
export const checkSupabaseConnection = async () => {
  try {
    // Simple query to check if we can connect to Supabase
    const { data, error } = await supabase.from('companies').select('id').limit(1)
    
    if (error) {
      console.error('Supabase connection check failed:', error)
      return { connected: false, error }
    }
    
    return { connected: true, data }
  } catch (error) {
    console.error('Supabase connection check exception:', error)
    return { connected: false, error }
  }
}
