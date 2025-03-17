'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { fetchLoad, updateLoadStatus, assignLoadToDriver } from '@/utils/loads'
import { fetchCompanyDrivers } from '@/utils/drivers'
import { Load } from '@/types/trip'
import { Driver } from '@/types/driver'

export default function LoadDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user } = useAuth()
  const [load, setLoad] = useState<Load | null>(null)
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedDriverId, setSelectedDriverId] = useState<number>(0)
  
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
        
        setLoad(loadData)
        
        // Set initial selected driver
        if (loadData.driverId) {
          setSelectedDriverId(loadData.driverId)
        }
        
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
  
  // Handle status update
  const handleUpdateStatus = async (status: 'assigned' | 'in_progress' | 'completed' | 'cancelled') => {
    if (!load) return
    
    try {
      const { success, error } = await updateLoadStatus(load.id, status)
      
      if (error) {
        throw error
      }
      
      if (success) {
        // Update local state
        setLoad(prev => prev ? { ...prev, status } : null)
        setSuccess(`Load status updated to ${status}!`)
      }
    } catch (err) {
      console.error('Error updating load status:', err)
      setError('Failed to update load status. Please try again.')
    }
  }
  
  // Handle driver assignment
  const handleAssignDriver = async () => {
    if (!load) return
    
    try {
      const { success, error } = await assignLoadToDriver(load.id, selectedDriverId)
      
      if (error) {
        throw error
      }
      
      if (success) {
        // Update local state
        setLoad(prev => prev ? { ...prev, driverId: selectedDriverId } : null)
        setSuccess('Driver assigned successfully!')
        setShowAssignModal(false)
      }
    } catch (err) {
      console.error('Error assigning driver:', err)
      setError('Failed to assign driver. Please try again.')
    }
  }
  
  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString()
  }
  
  // Get driver name by ID
  const getDriverName = (driverId: number | null | undefined) => {
    if (!driverId) return 'Unassigned'
    const driver = drivers.find(d => d.id === driverId)
    return driver ? driver.name : 'Unknown'
  }
  
  // Render status badge
  const renderStatusBadge = (status: string) => {
    const colors = {
      assigned: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    
    const color = colors[status as keyof typeof colors] || colors.assigned
    
    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${color}`}>
        {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
      </span>
    )
  }
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading load details...</p>
        </div>
      </div>
    )
  }
  
  if (error && !load) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        <h2 className="text-lg font-semibold mb-2">Error</h2>
        <p>{error}</p>
        <button
          onClick={() => router.push('/loads')}
          className="mt-4 bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark"
        >
          Back to Loads
        </button>
      </div>
    )
  }
  
  if (!load) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-700">Load Not Found</h2>
        <p className="text-gray-500 mt-2">The load you're looking for doesn't exist or you don't have permission to view it.</p>
        <button
          onClick={() => router.push('/loads')}
          className="mt-6 bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark"
        >
          Back to Loads
        </button>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => router.push('/loads')}
            className="mr-4 p-2 rounded-full hover:bg-gray-100"
          >
            <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold">
            Load Details {load.loadNumber && `- ${load.loadNumber}`}
          </h1>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => router.push(`/loads/${load.id}/edit`)}
            className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
          <button
            onClick={() => setShowAssignModal(true)}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Assign Driver
          </button>
        </div>
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
      
      {/* Load Status */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Status</h2>
            <div className="mt-2">
              {renderStatusBadge(load.status)}
            </div>
          </div>
          <div className="flex space-x-2">
            {load.status === 'assigned' && (
              <button
                onClick={() => handleUpdateStatus('in_progress')}
                className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600"
              >
                Start Load
              </button>
            )}
            {load.status === 'in_progress' && (
              <button
                onClick={() => handleUpdateStatus('completed')}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
              >
                Complete Load
              </button>
            )}
            {(load.status === 'assigned' || load.status === 'in_progress') && (
              <button
                onClick={() => handleUpdateStatus('cancelled')}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
              >
                Cancel Load
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Load Details */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Load Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Load Number</h3>
            <p className="mt-1 text-base text-gray-900">{load.loadNumber || 'N/A'}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Customer</h3>
            <p className="mt-1 text-base text-gray-900">{load.customer || 'N/A'}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Assigned Driver</h3>
            <p className="mt-1 text-base text-gray-900">{getDriverName(load.driverId)}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Rate</h3>
            <p className="mt-1 text-base text-gray-900">${load.rate?.toFixed(2) || '0.00'}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Pickup Date</h3>
            <p className="mt-1 text-base text-gray-900">{formatDate(load.pickupDate)}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Delivery Date</h3>
            <p className="mt-1 text-base text-gray-900">{formatDate(load.deliveryDate)}</p>
          </div>
        </div>
      </div>
      
      {/* Route Information */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Route Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Origin</h3>
            <p className="mt-1 text-base text-gray-900">{load.origin}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Destination</h3>
            <p className="mt-1 text-base text-gray-900">{load.destination}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Distance</h3>
            <p className="mt-1 text-base text-gray-900">{load.distance} miles</p>
          </div>
        </div>
      </div>
      
      {/* Assign Driver Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Assign Driver to Load</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Load</label>
                <input
                  type="text"
                  value={load.loadNumber || `Load #${load.id}`}
                  disabled
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Select Driver</label>
                <select
                  value={selectedDriverId}
                  onChange={(e) => setSelectedDriverId(parseInt(e.target.value))}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                >
                  <option value={0}>Unassign</option>
                  {drivers.map(driver => (
                    <option key={driver.id} value={driver.id}>{driver.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowAssignModal(false)}
                className="bg-white text-gray-700 px-4 py-2 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignDriver}
                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark"
              >
                Assign Driver
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
