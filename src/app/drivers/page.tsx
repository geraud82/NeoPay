'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { fetchDrivers, createDriver, updateDriver, deleteDriver } from '@/utils/drivers'
import { Driver } from '@/types/driver'

export default function Drivers() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentDriver, setCurrentDriver] = useState<Driver | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Fetch drivers on component mount
  useEffect(() => {
    const getDrivers = async () => {
      try {
        setIsLoading(true)
        const { data, error } = await fetchDrivers()
        
        if (error) throw error
        
        setDrivers(data || [])
      } catch (err: any) {
        console.error('Error fetching drivers:', err)
        setError('Failed to load drivers. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }
    
    getDrivers()
  }, [])
  
  // Filter drivers based on search term
  const filteredDrivers = drivers.filter(driver => 
    driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.phone.includes(searchTerm) ||
    driver.license.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  const handleAddDriver = () => {
    setCurrentDriver(null)
    setIsModalOpen(true)
  }
  
  const handleEditDriver = (driver: Driver) => {
    setCurrentDriver(driver)
    setIsModalOpen(true)
  }
  
  const handleCloseModal = () => {
    setIsModalOpen(false)
    setCurrentDriver(null)
  }
  
  const handleSaveDriver = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const form = e.target as HTMLFormElement
      const formData = new FormData(form)
      
      const driverData = {
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        phone: formData.get('phone') as string,
        license: formData.get('license') as string,
        status: formData.get('status') as 'active' | 'inactive',
        joinDate: formData.get('joinDate') as string,
        type: formData.get('type') as 'company' | 'owner',
        employmentType: formData.get('employmentType') as 'W2' | '1099',
      }
      
      if (currentDriver) {
        // Update existing driver
        const { data, error } = await updateDriver(currentDriver.id, driverData)
        
        if (error) throw error
        
        if (data && !Array.isArray(data)) {
          setDrivers(drivers.map(driver => 
            driver.id === currentDriver.id ? data as unknown as Driver : driver
          ))
        }
      } else {
        // Add new driver
        const { data, error } = await createDriver(driverData)
        
        if (error) throw error
        
        if (data && !Array.isArray(data)) {
          setDrivers([...drivers, data as unknown as Driver])
        }
      }
      
      handleCloseModal()
    } catch (err: any) {
      console.error('Error saving driver:', err)
      setError('Failed to save driver. Please try again.')
    }
  }
  
  const handleToggleStatus = async (id: number) => {
    try {
      const driver = drivers.find(d => d.id === id)
      
      if (!driver) return
      
      const newStatus = driver.status === 'active' ? 'inactive' : 'active'
      
      const { data, error } = await updateDriver(id, {
        ...driver,
        status: newStatus
      })
      
      if (error) throw error
      
      // Update the local state regardless of the API response
      // This provides a more responsive UI experience
      setDrivers(drivers.map(d => 
        d.id === id ? { ...d, status: newStatus } : d
      ))
    } catch (err: any) {
      console.error('Error updating driver status:', err)
      setError('Failed to update driver status. Please try again.')
    }
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Driver Management</h1>
        <button 
          className="btn-primary"
          onClick={handleAddDriver}
          disabled={isLoading}
        >
          Add Driver
        </button>
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
            placeholder="Search drivers..."
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
      ) : drivers.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">No drivers found. Add your first driver to get started.</p>
        </div>
      ) : (
        /* Drivers table */
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">License</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employment</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Join Date</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredDrivers.map((driver) => (
              <tr key={driver.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{driver.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{driver.email}</div>
                  <div className="text-sm text-gray-500">{driver.phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {driver.license}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${driver.type === 'company' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'}`}>
                    {driver.type === 'company' ? 'Company Driver' : 'Owner Operator'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${driver.employmentType === 'W2' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}`}>
                    {driver.employmentType}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${driver.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {driver.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {driver.joinDate}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button 
                    className="text-primary hover:text-blue-800 mr-4"
                    onClick={() => handleEditDriver(driver)}
                  >
                    Edit
                  </button>
                  <button 
                    className={`${driver.status === 'active' ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}`}
                    onClick={() => handleToggleStatus(driver.id)}
                  >
                    {driver.status === 'active' ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
      
      {/* Add/Edit Driver Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">
                {currentDriver ? 'Edit Driver' : 'Add New Driver'}
              </h3>
            </div>
            
            <form onSubmit={handleSaveDriver}>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input 
                    type="text" 
                    id="name" 
                    name="name" 
                    className="input mt-1 w-full" 
                    defaultValue={currentDriver?.name || ''}
                    required 
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    className="input mt-1 w-full" 
                    defaultValue={currentDriver?.email || ''}
                    required 
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
                  <input 
                    type="tel" 
                    id="phone" 
                    name="phone" 
                    className="input mt-1 w-full" 
                    defaultValue={currentDriver?.phone || ''}
                    required 
                  />
                </div>
                
                <div>
                  <label htmlFor="license" className="block text-sm font-medium text-gray-700">License Number</label>
                  <input 
                    type="text" 
                    id="license" 
                    name="license" 
                    className="input mt-1 w-full" 
                    defaultValue={currentDriver?.license || ''}
                    required 
                  />
                </div>
                
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700">Driver Type</label>
                  <select 
                    id="type" 
                    name="type" 
                    className="input mt-1 w-full" 
                    defaultValue={currentDriver?.type || 'company'}
                  >
                    <option value="company">Company Driver</option>
                    <option value="owner">Owner Operator</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Company drivers are paid per mile. Owner operators are paid a percentage of the trip value.
                  </p>
                </div>
                
                <div>
                  <label htmlFor="employmentType" className="block text-sm font-medium text-gray-700">Employment Type</label>
                  <select 
                    id="employmentType" 
                    name="employmentType" 
                    className="input mt-1 w-full" 
                    defaultValue={currentDriver?.employmentType || 'W2'}
                  >
                    <option value="W2">W2 Employee</option>
                    <option value="1099">1099 Contractor</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    W2 employees have taxes withheld. 1099 contractors are responsible for their own taxes.
                  </p>
                </div>
                
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                  <select 
                    id="status" 
                    name="status" 
                    className="input mt-1 w-full" 
                    defaultValue={currentDriver?.status || 'active'}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="joinDate" className="block text-sm font-medium text-gray-700">Join Date</label>
                  <input 
                    type="date" 
                    id="joinDate" 
                    name="joinDate" 
                    className="input mt-1 w-full" 
                    defaultValue={currentDriver?.joinDate || new Date().toISOString().split('T')[0]}
                    required 
                  />
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
