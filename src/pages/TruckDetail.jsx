import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Truck, Wrench, ArrowLeft, Plus, QrCode, AlertTriangle, Trash } from 'lucide-react'
import SimpleQRCode from '../components/SimpleQRCode'

export default function TruckDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { company } = useAuth()
  const [truck, setTruck] = useState(null)
  const [maintenanceRecords, setMaintenanceRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showQR, setShowQR] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  
  useEffect(() => {
    const fetchTruckData = async () => {
      if (!company || !id) return
      
      try {
        setLoading(true)
        setError('')
        
        // Fetch truck details
        const { data: truckData, error: truckError } = await supabase
          .from('trucks')
          .select('*')
          .eq('id', id)
          .eq('company_id', company.id)
          .single()
        
        if (truckError) throw truckError
        
        setTruck(truckData)
        
        // Fetch maintenance records
        const { data: recordsData, error: recordsError } = await supabase
          .from('maintenance_records')
          .select('*')
          .eq('truck_id', id)
          .eq('company_id', company.id)
          .order('performed_at', { ascending: false })
        
        if (recordsError) throw recordsError
        
        setMaintenanceRecords(recordsData || [])
      } catch (error) {
        console.error('Error fetching truck data:', error)
        setError('Failed to load truck data. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    
    fetchTruckData()
  }, [id, company])
  
  const handleDelete = async () => {
    try {
      setError('')
      
      // Delete truck
      const { error: deleteError } = await supabase
        .from('trucks')
        .delete()
        .eq('id', id)
        .eq('company_id', company.id)
      
      if (deleteError) throw deleteError
      
      navigate('/trucks')
    } catch (error) {
      console.error('Error deleting truck:', error)
      setError('Failed to delete truck. Please try again.')
      setShowDeleteModal(false)
    }
  }
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }
  
  if (!truck) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Truck not found</h3>
        <p className="mt-1 text-sm text-gray-500">
          The truck you're looking for doesn't exist or you don't have permission to view it.
        </p>
        <div className="mt-6">
          <Link
            to="/trucks"
            className="btn btn-primary"
          >
            Back to Trucks
          </Link>
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/trucks')}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-semibold text-gray-900">
            {truck.year} {truck.make} {truck.model}
          </h1>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowQR(!showQR)}
            className="btn btn-white"
          >
            <QrCode className="h-4 w-4 mr-2" />
            {showQR ? 'Hide QR' : 'Show QR'}
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="btn btn-white text-red-600 hover:text-red-700"
          >
            <Trash className="h-4 w-4 mr-2" />
            Delete
          </button>
        </div>
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
      
      {showQR && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6 text-center">
          <div className="mx-auto w-48 h-48">
            <SimpleQRCode 
              value={`${window.location.origin}/trucks/${truck.id}`}
              size={192}
            />
          </div>
          <p className="mt-4 text-sm text-gray-500">
            Scan this QR code to quickly access this truck's maintenance records.
          </p>
          <p className="mt-1 text-sm text-gray-500">
            You can print this QR code and place it on the truck for easy access.
          </p>
        </div>
      )}
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Truck Details
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Information about this truck.
          </p>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">VIN</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{truck.vin}</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">License Plate</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{truck.license_plate}</dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Year</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{truck.year}</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Make</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{truck.make}</dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Model</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{truck.model}</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Current Mileage</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{truck.current_mileage.toLocaleString()} miles</dd>
            </div>
            {truck.notes && (
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Notes</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{truck.notes}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Maintenance Records
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              History of maintenance performed on this truck.
            </p>
          </div>
          <Link
            to={`/trucks/${id}/maintenance`}
            className="btn btn-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Record
          </Link>
        </div>
        
        {maintenanceRecords.length > 0 ? (
          <div className="border-t border-gray-200">
            <ul className="divide-y divide-gray-200">
              {maintenanceRecords.map((record) => (
                <li key={record.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <Wrench className="h-6 w-6 text-primary-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-primary-600">
                          {record.maintenance_type}
                        </div>
                        <div className="text-sm text-gray-500">
                          Performed on {new Date(record.performed_at).toLocaleDateString()} at {record.mileage.toLocaleString()} miles
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      {record.next_due_mileage && (
                        <div className={`text-sm ${
                          truck.current_mileage >= record.next_due_mileage
                            ? 'text-red-600 font-medium'
                            : 'text-gray-500'
                        }`}>
                          Next due: {record.next_due_mileage.toLocaleString()} miles
                          {truck.current_mileage >= record.next_due_mileage && (
                            <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                              Overdue
                            </span>
                          )}
                        </div>
                      )}
                      {record.part_make_model && (
                        <div className="text-sm text-gray-500">
                          Part: {record.part_make_model}
                        </div>
                      )}
                    </div>
                  </div>
                  {record.notes && (
                    <div className="mt-2 ml-14 text-sm text-gray-500">
                      <p>{record.notes}</p>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6 text-center">
            <Wrench className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No maintenance records</h3>
            <p className="mt-1 text-sm text-gray-500">
              No maintenance has been recorded for this truck yet.
            </p>
            <div className="mt-6">
              <Link
                to={`/trucks/${id}/maintenance`}
                className="btn btn-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Record
              </Link>
            </div>
          </div>
        )}
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Delete Truck
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete this truck? All maintenance records associated with this truck will also be deleted. This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
