'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { fetchCompanyTrips, createTrip, updateTrip, deleteTrip } from '@/utils/trips'
import { Trip } from '@/types/trip'
import { fetchDrivers } from '@/utils/drivers'

interface Driver {
  id: number
  name: string
  type?: 'company' | 'owner'
}

export default function Trips() {
  const { user } = useAuth()
  const userRole = user?.user_metadata?.role || 'admin'
  const isDriver = ['driver', 'owner', 'operator'].includes(userRole)
  
  const [trips, setTrips] = useState<Trip[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDriverType, setSelectedDriverType] = useState<'company' | 'owner' | ''>('')
  
  // Fetch trips and drivers on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        
        // Fetch trips
        // Using company ID 1 as default
        const tripsData = await fetchCompanyTrips(1)
        const tripsError = null
        if (tripsError) throw tripsError
        
        // Fetch drivers for the dropdown
        const { data: driversData, error: driversError } = await fetchDrivers()
        if (driversError) throw driversError
        
        // Filter trips based on user role
        let filteredTrips = tripsData || []
        if (isDriver && user?.id) {
          // If user is a driver, only show their trips
          const driverId = user.user_metadata?.driverId || 0
          filteredTrips = filteredTrips.filter(trip => trip.driverId === driverId)
        }
        
        setTrips(filteredTrips)
        setDrivers(driversData || [])
      } catch (err: any) {
        console.error('Error loading data:', err)
        setError('Failed to load data. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }
    
    loadData()
  }, [user, isDriver])
  
  // Filter trips based on search term
  const filteredTrips = trips.filter(trip => 
    trip.driverName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trip.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trip.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trip.date.includes(searchTerm)
  )
  
  const handleAddTrip = () => {
    setCurrentTrip(null)
    setSelectedDriverType('')
    setIsModalOpen(true)
  }
  
  const handleEditTrip = (trip: Trip) => {
    setCurrentTrip(trip)
    setSelectedDriverType(trip.driverType || '')
    setIsModalOpen(true)
  }
  
  const handleCloseModal = () => {
    setIsModalOpen(false)
    setCurrentTrip(null)
    setSelectedDriverType('')
  }
  
  const handleDriverChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const driverId = parseInt(e.target.value)
    if (!driverId) {
      setSelectedDriverType('')
      return
    }
    
    const selectedDriver = drivers.find(driver => driver.id === driverId)
    setSelectedDriverType(selectedDriver?.type || '')
  }
  
  const handleSaveTrip = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const form = e.target as HTMLFormElement
      const formData = new FormData(form)
      
      const driverId = parseInt(formData.get('driverId') as string)
      const selectedDriver = drivers.find(driver => driver.id === driverId)
      const driverType = selectedDriver?.type || 'company'
      
      const distance = parseFloat(formData.get('distance') as string)
      const rate = parseFloat(formData.get('rate') as string)
      
      // Calculate amount based on driver type
      let amount = 0
      let rateType: 'per_mile' | 'percentage' = 'per_mile'
      
      if (driverType === 'company') {
        // Company drivers are paid by mile
        amount = distance * rate
        rateType = 'per_mile'
      } else {
        // Owner operators are paid by percentage
        // Assuming the rate is a percentage of the total trip value
        // For simplicity, let's assume a base trip value of $2 per mile
        const tripValue = distance * 2
        amount = tripValue * (rate / 100)
        rateType = 'percentage'
      }
      
      const tripData = {
        companyId: 1, // Default company ID
        driverId,
        driverType,
        date: formData.get('date') as string,
        origin: formData.get('origin') as string,
        destination: formData.get('destination') as string,
        distance,
        rate,
        rateType,
        amount,
        status: (formData.get('status') as 'pending' | 'completed' | 'cancelled') || 'pending'
      }
      
      if (currentTrip) {
        // Update existing trip
        const { data, error } = await updateTrip(currentTrip.id, tripData)
        
        if (error) throw error
        
        if (data) {
          setTrips(trips.map(trip => 
            trip.id === currentTrip.id ? data as Trip : trip
          ))
        }
      } else {
        // Add new trip
        const { data, error } = await createTrip(tripData)
        
        if (error) throw error
        
        if (data) {
          setTrips([...trips, data as Trip])
        }
      }
      
      handleCloseModal()
    } catch (err: any) {
      console.error('Error saving trip:', err)
      setError('Failed to save trip. Please try again.')
    }
  }
  
  const handleDeleteTrip = async (id: number) => {
    if (!confirm('Are you sure you want to delete this trip?')) return
    
    try {
      const { error } = await deleteTrip(id)
      
      if (error) throw error
      
      // Update the local state
      setTrips(trips.filter(trip => trip.id !== id))
    } catch (err: any) {
      console.error('Error deleting trip:', err)
      setError('Failed to delete trip. Please try again.')
    }
  }
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }
  
  const formatRate = (rate: number, rateType?: string) => {
    if (rateType === 'percentage') {
      return `${rate.toFixed(1)}%`
    } else {
      return `$${rate.toFixed(2)}/mile`
    }
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Trips Management</h1>
        {!isDriver && (
          <button 
            className="btn-primary"
            onClick={handleAddTrip}
            disabled={isLoading}
          >
            Add Trip
          </button>
        )}
      </div>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <button 
                className="text-sm text-red-700 underline mt-1"
                onClick={() => setError(null)}
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Search and filter */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search trips..."
            className="input w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={isLoading}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Loading state */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : trips.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">No trips found. Add your first trip to get started.</p>
        </div>
      ) : (
        /* Trips table */
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distance</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTrips.map((trip) => (
                <tr key={trip.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{trip.driverName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      trip.driverType === 'owner' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {trip.driverType === 'owner' ? 'Owner Operator' : 'Company Driver'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{new Date(trip.date).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{trip.origin}</div>
                    <div className="text-sm text-gray-500">to {trip.destination}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {trip.distance.toFixed(1)} miles
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatRate(trip.rate, trip.rateType)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(trip.amount || 0)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {!isDriver ? (
                      <>
                        <button 
                          className="text-primary hover:text-blue-800 mr-4"
                          onClick={() => handleEditTrip(trip)}
                        >
                          Edit
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-800"
                          onClick={() => handleDeleteTrip(trip.id)}
                        >
                          Delete
                        </button>
                      </>
                    ) : (
                      <span className="text-gray-400">No actions available</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Add/Edit Trip Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">
                {currentTrip ? 'Edit Trip' : 'Add New Trip'}
              </h3>
            </div>
            
            <form onSubmit={handleSaveTrip}>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label htmlFor="driverId" className="block text-sm font-medium text-gray-700">Driver</label>
                  <select 
                    id="driverId" 
                    name="driverId" 
                    className="input mt-1 w-full" 
                    defaultValue={currentTrip?.driverId || ''}
                    onChange={handleDriverChange}
                    required 
                  >
                    <option value="">Select a driver</option>
                    {drivers.map(driver => (
                      <option key={driver.id} value={driver.id}>{driver.name} ({driver.type === 'owner' ? 'Owner Operator' : 'Company Driver'})</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
                  <input 
                    type="date" 
                    id="date" 
                    name="date" 
                    className="input mt-1 w-full" 
                    defaultValue={currentTrip?.date || new Date().toISOString().split('T')[0]}
                    required 
                  />
                </div>
                
                <div>
                  <label htmlFor="origin" className="block text-sm font-medium text-gray-700">Origin</label>
                  <input 
                    type="text" 
                    id="origin" 
                    name="origin" 
                    className="input mt-1 w-full" 
                    defaultValue={currentTrip?.origin || ''}
                    required 
                  />
                </div>
                
                <div>
                  <label htmlFor="destination" className="block text-sm font-medium text-gray-700">Destination</label>
                  <input 
                    type="text" 
                    id="destination" 
                    name="destination" 
                    className="input mt-1 w-full" 
                    defaultValue={currentTrip?.destination || ''}
                    required 
                  />
                </div>
                
                <div>
                  <label htmlFor="distance" className="block text-sm font-medium text-gray-700">Distance (miles)</label>
                  <input 
                    type="number" 
                    id="distance" 
                    name="distance" 
                    step="0.1" 
                    min="0.1" 
                    className="input mt-1 w-full" 
                    defaultValue={currentTrip?.distance || ''}
                    required 
                  />
                </div>
                
                <div>
                  <label htmlFor="rate" className="block text-sm font-medium text-gray-700">
                    {selectedDriverType === 'owner' ? 'Rate (%)' : 'Rate ($/mile)'}
                  </label>
                  <input 
                    type="number" 
                    id="rate" 
                    name="rate" 
                    step="0.01" 
                    min="0.01" 
                    className="input mt-1 w-full" 
                    defaultValue={currentTrip?.rate || (selectedDriverType === 'owner' ? 65 : 0.55)}
                    required 
                  />
                  {selectedDriverType === 'owner' && (
                    <p className="mt-1 text-xs text-gray-500">
                      Owner operators are paid a percentage of the trip value.
                    </p>
                  )}
                  {selectedDriverType === 'company' && (
                    <p className="mt-1 text-xs text-gray-500">
                      Company drivers are paid per mile.
                    </p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                  <select 
                    id="status" 
                    name="status" 
                    className="input mt-1 w-full" 
                    defaultValue={currentTrip?.status || 'pending'}
                    required 
                  >
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              
              <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3 rounded-b-lg">
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
