'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { fetchCompanyLoads, createLoad, updateLoad, deleteLoad, assignLoadToDriver, updateLoadStatus } from '@/utils/loads'
import { fetchCompanyDrivers } from '@/utils/drivers'
import { Load } from '@/types/trip'
import { Driver } from '@/types/driver'
import LoadModals from './LoadModals'

export default function LoadsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loads, setLoads] = useState<Load[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [currentLoad, setCurrentLoad] = useState<Load | null>(null)
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
  const [assignDriverId, setAssignDriverId] = useState<number>(0)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [companyId, setCompanyId] = useState<number>(1) // Default to company ID 1

  // Fetch loads and drivers on component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        // Get company ID from user metadata or context
        const userCompanyId = user?.user_metadata?.companyId || 1
        setCompanyId(userCompanyId)
        
        // Fetch loads for the company
        const loadsData = await fetchCompanyLoads(userCompanyId)
        setLoads(loadsData)
        
        // Fetch drivers for the company
        const driversData = await fetchCompanyDrivers(userCompanyId)
        setDrivers(driversData)
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
  }, [user])

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

  // Open add load modal
  const handleAddLoad = () => {
    setFormData({
      loadNumber: '',
      customer: '',
      pickupDate: new Date().toISOString().split('T')[0],
      deliveryDate: new Date().toISOString().split('T')[0],
      origin: '',
      destination: '',
      distance: 0,
      rate: 0,
      driverId: 0
    })
    setShowAddModal(true)
  }

  // Open edit load modal
  const handleEditLoad = (load: Load) => {
    setCurrentLoad(load)
    setFormData({
      loadNumber: load.loadNumber || '',
      customer: load.customer || '',
      pickupDate: load.pickupDate ? new Date(load.pickupDate).toISOString().split('T')[0] : '',
      deliveryDate: load.deliveryDate ? new Date(load.deliveryDate).toISOString().split('T')[0] : '',
      origin: load.origin || '',
      destination: load.destination || '',
      distance: load.distance || 0,
      rate: load.rate || 0,
      driverId: load.driverId || 0
    })
    setShowEditModal(true)
  }

  // Open delete load modal
  const handleDeleteLoadClick = (load: Load) => {
    setCurrentLoad(load)
    setShowDeleteModal(true)
  }

  // Open assign driver modal
  const handleAssignDriverClick = (load: Load) => {
    setCurrentLoad(load)
    setAssignDriverId(load.driverId || 0)
    setShowAssignModal(true)
  }

  // Submit add load form
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    try {
      const loadData = {
        companyId,
        driverId: formData.driverId || undefined,
        loadNumber: formData.loadNumber,
        customer: formData.customer,
        pickupDate: formData.pickupDate,
        deliveryDate: formData.deliveryDate,
        origin: formData.origin,
        destination: formData.destination,
        distance: formData.distance,
        rate: formData.rate,
        status: 'assigned' as 'assigned' | 'in_progress' | 'completed' | 'cancelled'
      }
      
      const { data, error } = await createLoad(loadData)
      
      if (error) {
        throw error
      }
      
      if (data) {
        setLoads(prev => [...prev, data])
        setSuccess('Load created successfully!')
        setShowAddModal(false)
      }
    } catch (err) {
      console.error('Error creating load:', err)
      setError('Failed to create load. Please try again.')
    }
  }

  // Submit edit load form
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    if (!currentLoad) return
    
    try {
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
      
      const { data, error } = await updateLoad(currentLoad.id, loadData)
      
      if (error) {
        throw error
      }
      
      if (data) {
        setLoads(prev => 
          prev.map(load => load.id === currentLoad.id ? data : load)
        )
        setSuccess('Load updated successfully!')
        setShowEditModal(false)
      }
    } catch (err) {
      console.error('Error updating load:', err)
      setError('Failed to update load. Please try again.')
    }
  }

  // Confirm delete load
  const handleDeleteConfirm = async () => {
    if (!currentLoad) return
    
    try {
      const { success, error } = await deleteLoad(currentLoad.id)
      
      if (error) {
        throw error
      }
      
      if (success) {
        setLoads(prev => prev.filter(load => load.id !== currentLoad.id))
        setSuccess('Load deleted successfully!')
        setShowDeleteModal(false)
      }
    } catch (err) {
      console.error('Error deleting load:', err)
      setError('Failed to delete load. Please try again.')
    }
  }

  // Assign driver to load
  const handleAssignDriverSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    if (!currentLoad) return
    
    try {
      const { success, error } = await assignLoadToDriver(currentLoad.id, assignDriverId)
      
      if (error) {
        throw error
      }
      
      if (success) {
        // Refresh loads
        const loadsData = await fetchCompanyLoads(companyId)
        setLoads(loadsData)
        
        setSuccess('Driver assigned successfully!')
        setShowAssignModal(false)
      }
    } catch (err) {
      console.error('Error assigning driver:', err)
      setError('Failed to assign driver. Please try again.')
    }
  }

  // Update load status
  const handleUpdateStatus = async (loadId: number, status: 'assigned' | 'in_progress' | 'completed' | 'cancelled') => {
    try {
      const { success, error } = await updateLoadStatus(loadId, status)
      
      if (error) {
        throw error
      }
      
      if (success) {
        // Refresh loads
        const loadsData = await fetchCompanyLoads(companyId)
        setLoads(loadsData)
        
        setSuccess(`Load status updated to ${status}!`)
      }
    } catch (err) {
      console.error('Error updating load status:', err)
      setError('Failed to update load status. Please try again.')
    }
  }

  // Navigate to load details
  const handleLoadClick = (load: Load) => {
    router.push(`/loads/${load.id}`)
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
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${color}`}>
        {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
      </span>
    )
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Loads Management</h1>
        <button
          onClick={handleAddLoad}
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors"
        >
          Add Load
        </button>
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
      
      {/* Modals */}
      <LoadModals
        showAddModal={showAddModal}
        showEditModal={showEditModal}
        showDeleteModal={showDeleteModal}
        showAssignModal={showAssignModal}
        currentLoad={currentLoad}
        formData={formData}
        assignDriverId={assignDriverId}
        drivers={drivers}
        setShowAddModal={setShowAddModal}
        setShowEditModal={setShowEditModal}
        setShowDeleteModal={setShowDeleteModal}
        setShowAssignModal={setShowAssignModal}
        setAssignDriverId={setAssignDriverId}
        handleInputChange={handleInputChange}
        handleAddSubmit={handleAddSubmit}
        handleEditSubmit={handleEditSubmit}
        handleDeleteConfirm={handleDeleteConfirm}
        handleAssignDriverSubmit={handleAssignDriverSubmit}
      />
      
      {/* Loads List */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-4 text-center">Loading loads...</div>
        ) : loads.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No loads found. Click "Add Load" to create one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Load #
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Driver
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Origin
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Destination
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pickup
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Delivery
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loads.map((load) => (
                  <tr 
                    key={load.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                  >
                    <td 
                      className="px-6 py-4 whitespace-nowrap"
                      onClick={() => handleLoadClick(load)}
                    >
                      <div className="text-sm font-medium text-gray-900">{load.loadNumber || 'N/A'}</div>
                    </td>
                    <td 
                      className="px-6 py-4 whitespace-nowrap"
                      onClick={() => handleLoadClick(load)}
                    >
                      <div className="text-sm text-gray-500">{load.customer || 'N/A'}</div>
                    </td>
                    <td 
                      className="px-6 py-4 whitespace-nowrap"
                      onClick={() => handleLoadClick(load)}
                    >
                      <div className="text-sm text-gray-500">{getDriverName(load.driverId)}</div>
                    </td>
                    <td 
                      className="px-6 py-4 whitespace-nowrap"
                      onClick={() => handleLoadClick(load)}
                    >
                      <div className="text-sm text-gray-500">{load.origin}</div>
                    </td>
                    <td 
                      className="px-6 py-4 whitespace-nowrap"
                      onClick={() => handleLoadClick(load)}
                    >
                      <div className="text-sm text-gray-500">{load.destination}</div>
                    </td>
                    <td 
                      className="px-6 py-4 whitespace-nowrap"
                      onClick={() => handleLoadClick(load)}
                    >
                      <div className="text-sm text-gray-500">{formatDate(load.pickupDate)}</div>
                    </td>
                    <td 
                      className="px-6 py-4 whitespace-nowrap"
                      onClick={() => handleLoadClick(load)}
                    >
                      <div className="text-sm text-gray-500">{formatDate(load.deliveryDate)}</div>
                    </td>
                    <td 
                      className="px-6 py-4 whitespace-nowrap"
                      onClick={() => handleLoadClick(load)}
                    >
                      {renderStatusBadge(load.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAssignDriverClick(load);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Assign
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditLoad(load);
                          }}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteLoadClick(load);
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                      <div className="flex justify-end space-x-2 mt-2">
                        {load.status === 'assigned' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateStatus(load.id, 'in_progress');
                            }}
                            className="text-yellow-600 hover:text-yellow-900 text-xs"
                          >
                            Start
                          </button>
                        )}
                        {load.status === 'in_progress' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateStatus(load.id, 'completed');
                            }}
                            className="text-green-600 hover:text-green-900 text-xs"
                          >
                            Complete
                          </button>
                        )}
                        {(load.status === 'assigned' || load.status === 'in_progress') && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateStatus(load.id, 'cancelled');
                            }}
                            className="text-red-600 hover:text-red-900 text-xs"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
