import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Truck, AlertTriangle, CheckCircle, Calendar, Clock } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import LoadingFallback from '../components/LoadingFallback'

export default function Dashboard() {
  const { company } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState({
    totalTrucks: 0,
    trucksNeedingMaintenance: 0,
    recentMaintenanceCount: 0
  })
  const [recentMaintenance, setRecentMaintenance] = useState([])
  const [upcomingMaintenance, setUpcomingMaintenance] = useState([])
  
  useEffect(() => {
    console.log("Dashboard useEffect running, company:", company)
    if (!company) {
      console.log("No company data available yet")
      return
    }
    
    async function fetchDashboardData() {
      try {
        console.log("Fetching dashboard data for company:", company.id)
        setLoading(true)
        setError(null)
        
        // Fetch total trucks count
        const { data: trucks, error: trucksError } = await supabase
          .from('trucks')
          .select('id, name, make, model, year, last_maintenance_date')
          .eq('company_id', company.id)
        
        if (trucksError) {
          console.error("Error fetching trucks:", trucksError)
          setError(trucksError.message)
          throw trucksError
        }
        
        console.log("Fetched trucks:", trucks?.length || 0)
        
        // Calculate trucks needing maintenance (simplified logic - could be more complex in real app)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        
        const needMaintenance = trucks ? trucks.filter(truck => {
          if (!truck.last_maintenance_date) return true
          const lastMaintDate = new Date(truck.last_maintenance_date)
          return lastMaintDate < thirtyDaysAgo
        }) : []
        
        // Fetch recent maintenance records
        const { data: maintenance, error: maintError } = await supabase
          .from('maintenance_records')
          .select(`
            id, 
            maintenance_date, 
            maintenance_type,
            notes,
            trucks (
              id,
              name
            )
          `)
          .eq('company_id', company.id)
          .order('maintenance_date', { ascending: false })
          .limit(5)
        
        if (maintError) {
          console.error("Error fetching maintenance records:", maintError)
          setError(maintError.message)
          throw maintError
        }
        
        console.log("Fetched maintenance records:", maintenance?.length || 0)
        
        // Set stats
        setStats({
          totalTrucks: trucks?.length || 0,
          trucksNeedingMaintenance: needMaintenance?.length || 0,
          recentMaintenanceCount: maintenance?.length || 0
        })
        
        // Set recent maintenance
        setRecentMaintenance(maintenance || [])
        
        // Calculate upcoming maintenance (simplified example)
        const upcoming = trucks ? trucks
          .filter(truck => truck.last_maintenance_date)
          .map(truck => {
            const lastDate = new Date(truck.last_maintenance_date)
            const nextDate = new Date(lastDate)
            nextDate.setDate(nextDate.getDate() + 90) // Assuming 90-day maintenance cycle
            
            return {
              id: truck.id,
              truckName: truck.name,
              truckInfo: `${truck.make} ${truck.model} (${truck.year})`,
              dueDate: nextDate,
              daysUntil: Math.ceil((nextDate - new Date()) / (1000 * 60 * 60 * 24))
            }
          })
          .filter(item => item.daysUntil > 0 && item.daysUntil <= 30) // Show only upcoming in next 30 days
          .sort((a, b) => a.daysUntil - b.daysUntil)
          .slice(0, 5) : []
        
        setUpcomingMaintenance(upcoming)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        setError(error.message || "Failed to load dashboard data")
      } finally {
        setLoading(false)
      }
    }
    
    fetchDashboardData()
  }, [company])
  
  if (loading) {
    return <LoadingFallback message="Loading dashboard data..." />
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 my-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              Error loading dashboard: {error}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-2 px-4 py-2 bg-red-100 text-red-800 rounded-md text-sm font-medium hover:bg-red-200"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Dashboard
          </h2>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            type="button"
            onClick={() => navigate('/trucks/add')}
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Truck className="w-4 h-4 mr-2" />
            Add Truck
          </button>
        </div>
      </div>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Total trucks */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Truck className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Trucks
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {stats.totalTrucks}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  navigate('/trucks')
                }}
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                View all
              </a>
            </div>
          </div>
        </div>
        
        {/* Trucks needing maintenance */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Trucks Needing Maintenance
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {stats.trucksNeedingMaintenance}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  navigate('/trucks')
                }}
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                View all
              </a>
            </div>
          </div>
        </div>
        
        {/* Recent maintenance */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Recent Maintenance Records
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {stats.recentMaintenanceCount}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  // This would go to a maintenance history page if you had one
                  navigate('/trucks')
                }}
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                View all
              </a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent maintenance section */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Recent Maintenance
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Latest maintenance records across your fleet
          </p>
        </div>
        
        {recentMaintenance.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {recentMaintenance.map((record) => (
              <li key={record.id}>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    navigate(`/trucks/${record.trucks.id}`)
                  }}
                  className="block hover:bg-gray-50"
                >
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-primary-600 truncate">
                          {record.trucks.name}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {record.maintenance_type}
                          </p>
                        </div>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex items-center text-sm text-gray-500">
                        <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        {new Date(record.maintenance_date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      {record.notes ? record.notes.substring(0, 100) + (record.notes.length > 100 ? '...' : '') : 'No notes provided'}
                    </div>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-4 py-5 sm:px-6 text-center text-gray-500">
            No maintenance records found. Add maintenance records to your trucks to see them here.
          </div>
        )}
      </div>
      
      {/* Upcoming maintenance section */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Upcoming Maintenance
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Trucks due for maintenance in the next 30 days
          </p>
        </div>
        
        {upcomingMaintenance.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {upcomingMaintenance.map((item) => (
              <li key={item.id}>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    navigate(`/trucks/${item.id}`)
                  }}
                  className="block hover:bg-gray-50"
                >
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-primary-600 truncate">
                          {item.truckName}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            item.daysUntil <= 7 
                              ? 'bg-red-100 text-red-800' 
                              : item.daysUntil <= 14 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-blue-100 text-blue-800'
                          }`}>
                            {item.daysUntil <= 7 
                              ? 'Urgent' 
                              : item.daysUntil <= 14 
                                ? 'Soon' 
                                : 'Upcoming'}
                          </p>
                        </div>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex items-center text-sm text-gray-500">
                        <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        {item.daysUntil} days
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      <div className="flex justify-between">
                        <span>{item.truckInfo}</span>
                        <span>Due: {item.dueDate.toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-4 py-5 sm:px-6 text-center text-gray-500">
            No upcoming maintenance due in the next 30 days.
          </div>
        )}
      </div>
    </div>
  )
}
