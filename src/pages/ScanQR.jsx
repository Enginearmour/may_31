import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { QrCode, AlertTriangle } from 'lucide-react'

export default function ScanQR() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [scanResult, setScanResult] = useState('')
  
  // This is a placeholder for QR code scanning functionality
  // In a real implementation, you would use a library like react-qr-reader
  // or integrate with a mobile device's camera API
  
  const handleManualEntry = (e) => {
    e.preventDefault()
    const truckId = e.target.truckId.value
    if (truckId) {
      navigate(`/trucks/${truckId}`)
    } else {
      setError('Please enter a valid truck ID')
    }
  }
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Scan QR Code</h1>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6 text-center">
          <QrCode className="mx-auto h-16 w-16 text-primary-600" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">Scan a Truck QR Code</h3>
          <p className="mt-1 text-sm text-gray-500">
            Point your camera at a truck's QR code to quickly access its maintenance records.
          </p>
          <div className="mt-6 border-2 border-dashed border-gray-300 rounded-lg p-12 flex justify-center">
            <div className="text-center">
              <AlertTriangle className="mx-auto h-12 w-12 text-yellow-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">QR Scanner Not Available</h3>
              <p className="mt-1 text-sm text-gray-500">
                QR code scanning is not available in this demo version.
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Please use the manual entry form below instead.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Manual Entry</h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>If you can't scan the QR code, you can manually enter the truck ID.</p>
          </div>
          <form onSubmit={handleManualEntry} className="mt-5 sm:flex sm:items-center">
            <div className="w-full sm:max-w-xs">
              <label htmlFor="truckId" className="sr-only">Truck ID</label>
              <input
                type="text"
                name="truckId"
                id="truckId"
                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Enter truck ID"
              />
            </div>
            <button
              type="submit"
              className="mt-3 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Go to Truck
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
