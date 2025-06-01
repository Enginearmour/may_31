import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { Wrench, ArrowLeft, AlertTriangle } from 'lucide-react'

const MaintenanceSchema = Yup.object().shape({
  maintenance_type: Yup.string()
    .required('Maintenance type is required'),
  performed_at: Yup.date()
    .required('Date is required')
    .max(new Date(), 'Date cannot be in the future'),
  mileage: Yup.number()
    .required('Mileage is required')
    .min(0, 'Mileage cannot be negative'),
  next_due_mileage: Yup.number()
    .nullable()
    .min(0, 'Next due mileage cannot be negative'),
  part_make_model: Yup.string(),
  notes: Yup.string()
})

export default function AddMaintenanceRecord() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { company } = useAuth()
  const [truck, setTruck] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  useEffect(() => {
    const fetchTruck = async () => {
      if (!company || !id) return
      
      try {
        setLoading(true)
        setError('')
        
        const { data, error } = await supabase
          .from('trucks')
          .select('*')
          .eq('id', id)
          .eq('company_id', company.id)
          .single()
        
        if (error) throw error
        
        setTruck(data)
      } catch (error) {
        console.error('Error fetching truck:', error)
        setError('Failed to load truck data. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    
    fetchTruck()
  }, [id, company])
  
  const handleSubmit = async (values, { setSubmitting }) => {
    if (!company || !truck) return
    
    try {
      setError('')
      
      // Format date to ISO string
      const formattedValues = {
        ...values,
        performed_at: new Date(values.performed_at).toISOString(),
      }
      
      // Add maintenance record
      const { error } = await supabase
        .from('maintenance_records')
        .insert([
          { 
            ...formattedValues,
            company_id: company.id,
            truck_id: truck.id
          }
        ])
      
      if (error) throw error
      
      // Update truck's current mileage if maintenance mileage is higher
      if (values.mileage > truck.current_mileage) {
        const { error: updateError } = await supabase
          .from('trucks')
          .update({ current_mileage: values.mileage })
          .eq('id', truck.id)
          .eq('company_id', company.id)
        
        if (updateError) throw updateError
      }
      
      // Redirect to truck detail page
      navigate(`/trucks/${id}`)
    } catch (error) {
      console.error('Error adding maintenance record:', error)
      setError('Failed to add maintenance record. Please try again.')
    } finally {
      setSubmitting(false)
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
          <button
            onClick={() => navigate('/trucks')}
            className="btn btn-primary"
          >
            Back to Trucks
          </button>
        </div>
      </div>
    )
  }
  
  const initialValues = {
    maintenance_type: '',
    performed_at: new Date().toISOString().split('T')[0],
    mileage: truck.current_mileage,
    next_due_mileage: '',
    part_make_model: '',
    notes: ''
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <button
          onClick={() => navigate(`/trucks/${id}`)}
          className="mr-4 text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-semibold text-gray-900">
          Add Maintenance Record
        </h1>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {truck.year} {truck.make} {truck.model}
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Current mileage: {truck.current_mileage.toLocaleString()} miles
          </p>
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
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <Formik
            initialValues={initialValues}
            validationSchema={MaintenanceSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, errors, touched }) => (
              <Form className="space-y-6">
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label htmlFor="maintenance_type" className="block text-sm font-medium text-gray-700">
                      Maintenance Type
                    </label>
                    <div className="mt-1">
                      <Field
                        as="select"
                        name="maintenance_type"
                        id="maintenance_type"
                        className={`shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                          errors.maintenance_type && touched.maintenance_type ? 'border-red-300' : ''
                        }`}
                      >
                        <option value="">Select a type</option>
                        <option value="Oil Change">Oil Change</option>
                        <option value="Tire Rotation">Tire Rotation</option>
                        <option value="Brake Service">Brake Service</option>
                        <option value="Air Filter">Air Filter</option>
                        <option value="Fuel Filter">Fuel Filter</option>
                        <option value="Transmission Service">Transmission Service</option>
                        <option value="Coolant Flush">Coolant Flush</option>
                        <option value="Battery Replacement">Battery Replacement</option>
                        <option value="Wiper Blades">Wiper Blades</option>
                        <option value="Lights">Lights</option>
                        <option value="Other">Other</option>
                      </Field>
                      <ErrorMessage name="maintenance_type" component="div" className="mt-1 text-sm text-red-600" />
                    </div>
                  </div>
                  
                  <div className="sm:col-span-3">
                    <label htmlFor="performed_at" className="block text-sm font-medium text-gray-700">
                      Date Performed
                    </label>
                    <div className="mt-1">
                      <Field
                        type="date"
                        name="performed_at"
                        id="performed_at"
                        className={`shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                          errors.performed_at && touched.performed_at ? 'border-red-300' : ''
                        }`}
                      />
                      <ErrorMessage name="performed_at" component="div" className="mt-1 text-sm text-red-600" />
                    </div>
                  </div>
                  
                  <div className="sm:col-span-3">
                    <label htmlFor="mileage" className="block text-sm font-medium text-gray-700">
                      Mileage at Service
                    </label>
                    <div className="mt-1">
                      <Field
                        type="number"
                        name="mileage"
                        id="mileage"
                        className={`shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                          errors.mileage && touched.mileage ? 'border-red-300' : ''
                        }`}
                      />
                      <ErrorMessage name="mileage" component="div" className="mt-1 text-sm text-red-600" />
                    </div>
                  </div>
                  
                  <div className="sm:col-span-3">
                    <label htmlFor="next_due_mileage" className="block text-sm font-medium text-gray-700">
                      Next Due Mileage (optional)
                    </label>
                    <div className="mt-1">
                      <Field
                        type="number"
                        name="next_due_mileage"
                        id="next_due_mileage"
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                      <ErrorMessage name="next_due_mileage" component="div" className="mt-1 text-sm text-red-600" />
                    </div>
                  </div>
                  
                  <div className="sm:col-span-6">
                    <label htmlFor="part_make_model" className="block text-sm font-medium text-gray-700">
                      Part Make/Model (optional)
                    </label>
                    <div className="mt-1">
                      <Field
                        type="text"
                        name="part_make_model"
                        id="part_make_model"
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                      <ErrorMessage name="part_make_model" component="div" className="mt-1 text-sm text-red-600" />
                    </div>
                  </div>
                  
                  <div className="sm:col-span-6">
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                      Notes (optional)
                    </label>
                    <div className="mt-1">
                      <Field
                        as="textarea"
                        name="notes"
                        id="notes"
                        rows={3}
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                      <ErrorMessage name="notes" component="div" className="mt-1 text-sm text-red-600" />
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      Add any additional information about this maintenance.
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => navigate(`/trucks/${id}`)}
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 mr-3"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Record'}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  )
}
