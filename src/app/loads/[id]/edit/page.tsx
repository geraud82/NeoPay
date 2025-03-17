'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { fetchLoad, updateLoad } from '@/utils/loads'
import { fetchCompanyDrivers } from '@/utils/drivers'
import { Load } from '@/types/trip'
import { Driver } from '@/types/driver'

export default function EditLoadPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user } = useAuth()
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    loadNumber: '',
    customer: '',
    pickupDate: '',
    deliveryDate: '',
    origin: '',
    destination: '',
    distance: 0,
    rate: 0,
    driverId: 0
  })
  
  // Fetch load and drivers data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const loadId = parseInt(params.id)
        if (isNaN(loadId)) {
          throw new Error('Invalid load ID')
        }
        
        // Fetch load details
        const loadData = await fetchLoad(loadId)
        if (!loadData) {
          throw new Error('Load not found')
        }
        
        // Set form data
        setFormData({
          loadNumber: loadData.loadNumber || '',
          customer: loadData.customer || '',
          pickupDate: loadData.pickupDate ? new Date(loadData.pickupDate).toISOString().split('T')[0] : '',
          deliveryDate: loadData.deliveryDate ? new Date(loadData.deliveryDate).toISOString().split('T')[0] : '',
          origin: loadData.origin || '',
          destination: loadData.destination || '',
          distance: loadData.distance || 0,
          rate: loadData.rate || 0,
          driverId: loadData.driverId || 0
        })
        
        // Fetch company drivers
        if (user) {
          const companyId = user.user_metadata?.companyId || loadData.companyId
          const driversData = await fetchCompanyDrivers(companyId)
          setDrivers(driversData)
        }
      } catch (err) {
        console.error('Error loading data:', err)
        setError('Failed to load data. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }
    
    if (user) {
      loadData()
    }
  }, [params.id, user])
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'distance' || name === 'rate' || name === 'driverId'
        ? parseFloat(value) || 0
        : value
    }))
  }
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    try {
      const loadId = parseInt(params.id)
      if (isNaN(loadId)) {
        throw new Error('Invalid load ID')
      }
      
      const loadData = {
        loadNumber: formData.loadNumber,
        customer: formData.customer,
        pickupDate: formData.pickupDate,
        deliveryDate: formData.deliveryDate,
        origin: formData.origin,
        destination: formData.destination,
        distance: formData.distance,
        rate: formData.rate,
        driverId: formData.driverId || undefined
      }
      
      const { data, error } = await updateLoad(loadId, loadData)
      
      if (error) {
        throw error
      }
      
      if (data) {
        setSuccess('Load updated successfully!')
        // Navigate back to load details after a short delay
        setTimeout(() => {
          router.push(`/loads/${loadId}`)
        }, 1500)
      }
    } catch (err) {
      console.error('Error updating load:', err)
      setError('Failed to update load. Please try again.')
    }
  }
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading load data...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center">
        <button
          onClick={() => router.push(`/loads/${params.id}`)}
          className="mr-4 p-2 rounded-full hover:bg-gray-100"
        >
          <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold">Edit Load</h1>
      </div>
      
      {/* Error and Success Messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
          {success}
        </div>
      )}
      
      {/* Edit Form */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Load Number</label>
              <input
                type="text"
                name="loadNumber"
                value={formData.loadNumber}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Customer</label>
              <input
                type="text"
                name="customer"
                value={formData.customer}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Pickup Date</label>
              <input
                type="date"
                name="pickupDate"
                value={formData.pickupDate}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Delivery Date</label>
              <input
                type="date"
                name="deliveryDate"
                value={formData.deliveryDate}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Origin</label>
              <input
                type="text"
                name="origin"
                value={formData.origin}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Destination</label>
              <input
                type="text"
                name="destination"
                value={formData.destination}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Distance (miles)</label>
              <input
                type="number"
                name="distance"
                value={formData.distance}
                onChange={handleInputChange}
                required
                min="0"
                step="0.1"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Rate ($)</label>
              <input
                type="number"
                name="rate"
                value={formData.rate}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Assign Driver</label>
              <select
                name="driverId"
                value={formData.driverId}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              >
                <option value={0}>Unassign</option>
                {drivers.map(driver => (
                  <option key={driver.id} value={driver.id}>{driver.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.push(`/loads/${params.id}`)}
              className="bg-white text-gray-700 px-4 py-2 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
