import { lazy, Suspense, useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { useAuth } from './hooks/useAuth'
import { checkSupabaseConnection } from './lib/supabase'
import LoadingFallback from './components/LoadingFallback'

// Error boundary component
const ErrorDisplay = ({ error, onRetry }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
    <div className="bg-white shadow-lg rounded-lg p-6 max-w-lg w-full">
      <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
      <p className="mb-4 text-gray-700">{error?.message || 'An unexpected error occurred.'}</p>
      
      <div className="bg-gray-100 p-4 rounded mb-4 overflow-auto max-h-40">
        <p className="font-mono text-sm text-gray-800">
          {error?.toString()}
        </p>
      </div>
      
      <button
        onClick={onRetry}
        className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded"
      >
        Retry
      </button>
    </div>
  </div>
)

// Lazy load components to improve initial load time
const Layout = lazy(() => import('./components/Layout'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Trucks = lazy(() => import('./pages/Trucks'))
const TruckDetail = lazy(() => import('./pages/TruckDetail'))
const AddTruck = lazy(() => import('./pages/AddTruck'))
const ScanQR = lazy(() => import('./pages/ScanQR'))
const Company = lazy(() => import('./pages/Company'))
const NotFound = lazy(() => import('./pages/NotFound'))

// Protected route component
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return <LoadingFallback message="Checking authentication..." />
  }
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

// Public route component (accessible only when not logged in)
function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return <LoadingFallback message="Checking authentication..." />
  }
  
  if (user) {
    return <Navigate to="/" replace />
  }
  
  return children
}

// Main router component
function AppRouter() {
  const { loading } = useAuth()
  const location = useLocation()
  
  // Log navigation for debugging
  useEffect(() => {
    console.log('App navigation to:', location.pathname)
  }, [location])
  
  if (loading) {
    return <LoadingFallback message="Loading application..." />
  }
  
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Public routes */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } 
        />
        
        {/* Protected routes */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="trucks" element={<Trucks />} />
          <Route path="trucks/:id" element={<TruckDetail />} />
          <Route path="trucks/add" element={<AddTruck />} />
          <Route path="scan" element={<ScanQR />} />
          <Route path="company" element={<Company />} />
        </Route>
        
        {/* 404 route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}

// App initialization component
function AppInitializer() {
  const [isReady, setIsReady] = useState(false)
  const [connectionError, setConnectionError] = useState(null)
  
  useEffect(() => {
    const checkConnection = async () => {
      try {
        console.log('Checking Supabase connection...')
        const { connected, error } = await checkSupabaseConnection()
        
        if (!connected) {
          console.warn('Supabase connection issue:', error)
          setConnectionError(error)
        } else {
          console.log('Supabase connection successful')
        }
        
        // Mark as ready regardless of connection status
        // We'll handle connection errors in the UI
        setIsReady(true)
      } catch (error) {
        console.error('Error checking connection:', error)
        setConnectionError(error)
        setIsReady(true)
      }
    }
    
    checkConnection()
  }, [])
  
  if (!isReady) {
    return <LoadingFallback message="Initializing application..." />
  }
  
  if (connectionError) {
    return (
      <ErrorDisplay 
        error={connectionError} 
        onRetry={() => window.location.reload()} 
      />
    )
  }
  
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </BrowserRouter>
  )
}

// Main App component with error handling
export default function App() {
  const [hasError, setHasError] = useState(false)
  const [error, setError] = useState(null)
  
  // Simple error boundary using state
  useEffect(() => {
    const errorHandler = (event) => {
      console.error('Global error caught:', event.error)
      setError(event.error)
      setHasError(true)
      event.preventDefault()
    }
    
    window.addEventListener('error', errorHandler)
    
    return () => {
      window.removeEventListener('error', errorHandler)
    }
  }, [])
  
  if (hasError) {
    return (
      <ErrorDisplay 
        error={error} 
        onRetry={() => window.location.reload()} 
      />
    )
  }
  
  return <AppInitializer />
}
