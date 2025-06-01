import { useContext } from 'react'
import { AuthContext } from '../contexts/AuthContext'

// This is a separate hook file to improve HMR compatibility
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
