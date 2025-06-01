import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Truck, Plus, Search, AlertTriangle } from 'lucide-react'

export default function TruckList() {
  const { company } = useAuth()
  const [trucks, setTrucks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  
  useEffect(() => {
    const fetchTrucks = async () => {
      if (!company) return
      
      try {
        setLoading(true)
        setError('')
        
        const { data, error } = await supabase
          .from('trucks')
          .select('*')
          .eq('company_id', company.id)
          .order('created_at', { ascending: false })
        
        if (error) throw error
        
        setTrucks(data || [])
      } catch (error) {
        console.error('Error fetching trucks:', error)
        setError('Failed to load trucks. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    
    fetchTrucks()
  }, [company])
  
  // Filter trucks based on search term
  const filteredTrucks = trucks.filter(truck => {
    const searchString = searchTerm.toLowerCase()
    return (
      truck.make.toLowerCase().includes(searchString) ||
      truck.model.toLowerCase().includes(searchString) ||
      truck.vin.toLowerCase().includes(searchString) ||
      truck.license_plate.toLowerCase().includes(searchString)
    )
  })
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Trucks</h1>
        <Link
          to="/trucks/add"
          className="btn btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Truck
        </Link>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          placeholder="Search trucks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {filteredTrucks.length > 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <ul className="divide-y divide-gray-200">
            {filteredTrucks.map((truck) => (
              <li key={truck.id}>
                <Link to={`/trucks/${truck.id}`} className="block hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <Truck className="h-6 w-6 text-primary-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-primary-600">
                            {truck.year} {truck.make} {truck.model}
                          </div>
                          <div className="text-sm text-gray-500">
                            {truck.license_plate}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end text-sm text-gray-500">
                        <div>VIN: {truck.vin}</div>
                        <div>{truck.current_mileage.toLocaleString()} miles</div>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6 text-center">
          <Truck className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No trucks found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {trucks.length === 0
              ? "Get started by adding your first truck."
              : "No trucks match your search criteria."}
          </p>
          {trucks.length === 0 && (
            <div className="mt-6">
              <Link
                to="/trucks/add"
                className="btn btn-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Truck
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
