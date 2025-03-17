'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/utils/supabase'

interface Receipt {
  id: number
  driverId: number
  driverName: string
  fileName: string
  filePath?: string
  uploadDate: string
  status: 'Processing' | 'Completed' | 'Failed'
  vendor?: string
  date?: string
  amount?: number
  category?: string
  items?: Array<{
    id: number
    receipt_id: number
    description: string
    quantity: number
    price: number
  }>
}

interface Driver {
  id: number
  name: string
}

export default function Receipts() {
  const { user } = useAuth()
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [selectedDriver, setSelectedDriver] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Get user role from metadata
  const userRole = user?.user_metadata?.role || 'user'
  const isAdminOrManager = ['admin', 'manager'].includes(userRole)
  
  // Fetch receipts on component mount
  useEffect(() => {
    const fetchReceipts = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        let response;
        
        if (isAdminOrManager) {
          // Admin/manager can see all receipts
          response = await fetch('/api/receipts')
        } else {
          // Drivers/owners can only see their own receipts
          // First get the driver ID for the current user
          const { data: driverData, error: driverError } = await supabase
            .from('drivers')
            .select('id')
            .eq('user_id', user?.id)
            .single()
          
          if (driverError) {
            console.error('Error fetching driver information:', JSON.stringify(driverError))
            setError('Failed to fetch driver information. Please contact support.')
            setIsLoading(false)
            return
          }
          
          if (!driverData) {
            console.error('No driver record found for user:', user?.id)
            setError('No driver record found for this user. Please contact support.')
            setIsLoading(false)
            return
          }
          
          response = await fetch(`/api/receipts/driver/${driverData.id}`)
        }
        
        if (!response.ok) {
          throw new Error('Failed to fetch receipts')
        }
        
        const data = await response.json()
        setReceipts(data)
      } catch (err: any) {
        console.error('Error fetching receipts:', JSON.stringify(err))
        setError(err.message || 'Failed to fetch receipts')
      } finally {
        setIsLoading(false)
      }
    }
    
    const fetchDrivers = async () => {
      if (isAdminOrManager) {
        try {
          const response = await fetch('/api/drivers')
          
          if (!response.ok) {
            throw new Error('Failed to fetch drivers')
          }
          
          const data = await response.json()
          setDrivers(data)
        } catch (err: any) {
          console.error('Error fetching drivers:', JSON.stringify(err))
        }
      } else {
        // For drivers, get their own driver record
        try {
          const { data: driverData, error: driverError } = await supabase
            .from('drivers')
            .select('id, name')
            .eq('user_id', user?.id)
            .single()
          
          if (driverError) {
            console.error('Error fetching driver:', JSON.stringify(driverError))
            setError('Failed to fetch driver information. Please contact support.')
            return
          }
          
          if (driverData) {
            setDrivers([driverData])
            setSelectedDriver(driverData.id)
          }
        } catch (err: any) {
          console.error('Error fetching driver:', JSON.stringify(err))
        }
      }
    }
    
    if (user) {
      fetchReceipts()
      fetchDrivers()
    }
  }, [user, isAdminOrManager])
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && selectedDriver) {
      setIsUploading(true)
      
      try {
        const file = e.target.files[0]
        
        // Convert file to base64
        const reader = new FileReader()
        
        reader.onload = async (event) => {
          if (event.target?.result) {
            const fileData = event.target.result.toString()
            
            // Upload the file
            const response = await fetch('/api/receipts/upload', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                driverId: selectedDriver,
                fileName: file.name,
                fileData,
              }),
            })
            
            if (!response.ok) {
              throw new Error('Failed to upload receipt')
            }
            
            const newReceipt = await response.json()
            
            // Add the new receipt to the list
            setReceipts([newReceipt, ...receipts])
            
            // Clear the file input
            if (fileInputRef.current) {
              fileInputRef.current.value = ''
            }
          }
        }
        
        reader.readAsDataURL(file)
      } catch (err: any) {
        console.error('Error uploading receipt:', JSON.stringify(err))
        alert('Failed to upload receipt: ' + (err.message || 'Unknown error'))
      } finally {
        setIsUploading(false)
      }
    }
  }
  
  const handleViewReceipt = async (receipt: Receipt) => {
    try {
      // Fetch the full receipt details including items
      const response = await fetch(`/api/receipts/${receipt.id}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch receipt details')
      }
      
      const receiptDetails = await response.json()
      setSelectedReceipt(receiptDetails)
    } catch (err: any) {
      console.error('Error fetching receipt details:', JSON.stringify(err))
      alert('Failed to fetch receipt details: ' + (err.message || 'Unknown error'))
      // Still show the receipt without items
      setSelectedReceipt(receipt)
    }
  }
  
  const handleCloseModal = () => {
    setSelectedReceipt(null)
  }
  
  const handleDeleteReceipt = async (id: number) => {
    try {
      const response = await fetch(`/api/receipts/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete receipt')
      }
      
      setReceipts(receipts.filter(receipt => receipt.id !== id))
      
      if (selectedReceipt && selectedReceipt.id === id) {
        setSelectedReceipt(null)
      }
    } catch (err: any) {
      console.error('Error deleting receipt:', JSON.stringify(err))
      alert('Failed to delete receipt: ' + (err.message || 'Unknown error'))
    }
  }
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Receipt Upload & Processing</h1>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="card mb-8">
        {isAdminOrManager && (
          <div className="mb-6">
            <label htmlFor="driver-select" className="block text-sm font-medium text-gray-700 mb-1">
              Select Driver
            </label>
            <select
              id="driver-select"
              className="input w-full"
              value={selectedDriver || ''}
              onChange={(e) => setSelectedDriver(e.target.value ? parseInt(e.target.value) : null)}
            >
              <option value="">Select a driver</option>
              {drivers.map((driver) => (
                <option key={driver.id} value={driver.id}>
                  {driver.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
          <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="mb-4 text-lg text-gray-600">Upload receipt images for AI processing</p>
          <p className="mb-6 text-sm text-gray-500">Supported formats: JPG, PNG, PDF</p>
          
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={handleFileChange}
            disabled={isUploading || !selectedDriver}
          />
          
          <button
            type="button"
            className="btn-primary"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || !selectedDriver}
          >
            {isUploading ? 'Uploading...' : 'Upload Receipt'}
          </button>
        </div>
      </div>
      
      <div className="card">
        <h2 className="text-xl font-semibold mb-6">Receipt History</h2>
        
        {isLoading ? (
          <div className="text-center py-8">
            <svg className="animate-spin h-8 w-8 text-primary mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-600">Loading receipts...</p>
          </div>
        ) : receipts.length === 0 ? (
          <p className="text-gray-500 italic text-center py-8">No receipts uploaded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Upload Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Extracted Data</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {receipts.map((receipt) => (
                  <tr key={receipt.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {receipt.fileName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {receipt.driverName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {receipt.uploadDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        receipt.status === 'Completed' 
                          ? 'bg-green-100 text-green-800' 
                          : receipt.status === 'Processing' 
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {receipt.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {receipt.status === 'Completed' ? (
                        <span>
                          {receipt.vendor} - ${receipt.amount?.toFixed(2)}
                        </span>
                      ) : receipt.status === 'Processing' ? (
                        <span className="text-yellow-600">Processing...</span>
                      ) : (
                        <span className="text-red-600">Failed to extract data</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        className="text-primary hover:text-blue-800 mr-4"
                        onClick={() => handleViewReceipt(receipt)}
                        disabled={receipt.status === 'Processing'}
                      >
                        View
                      </button>
                      <button
                        className="text-red-600 hover:text-red-800"
                        onClick={() => handleDeleteReceipt(receipt.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Receipt Details Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                Receipt Details
              </h3>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-500"
                onClick={handleCloseModal}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500">File Name</p>
                  <p className="font-medium">{selectedReceipt.fileName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Driver</p>
                  <p className="font-medium">{selectedReceipt.driverName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Upload Date</p>
                  <p className="font-medium">{selectedReceipt.uploadDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      selectedReceipt.status === 'Completed' 
                        ? 'bg-green-100 text-green-800' 
                        : selectedReceipt.status === 'Processing' 
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedReceipt.status}
                    </span>
                  </p>
                </div>
              </div>
              
              {selectedReceipt.status === 'Completed' && (
                <div>
                  <h4 className="text-lg font-medium mb-4">Extracted Data</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-sm text-gray-500">Vendor</p>
                      <p className="font-medium">{selectedReceipt.vendor}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="font-medium">{selectedReceipt.date}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Amount</p>
                      <p className="font-medium">${selectedReceipt.amount?.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Category</p>
                      <p className="font-medium">{selectedReceipt.category}</p>
                    </div>
                  </div>
                  
                  {selectedReceipt.items && selectedReceipt.items.length > 0 && (
                    <div>
                      <h5 className="text-md font-medium mb-2">Line Items</h5>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                              <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                              <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                              <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {selectedReceipt.items.map((item) => (
                              <tr key={item.id}>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{item.description}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">${item.price.toFixed(2)}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">${(item.quantity * item.price).toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {selectedReceipt.status === 'Processing' && (
                <div className="text-center py-8">
                  <svg className="animate-spin h-8 w-8 text-primary mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-gray-600">Processing receipt data...</p>
                  <p className="text-sm text-gray-500 mt-2">This may take a few moments.</p>
                </div>
              )}
              
              {selectedReceipt.status === 'Failed' && (
                <div className="text-center py-8">
                  <svg className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-600">Failed to process receipt</p>
                  <p className="text-sm text-gray-500 mt-2">Please try uploading a clearer image.</p>
                </div>
              )}
              
              {selectedReceipt.filePath && (
                <div className="mt-6">
                  <h4 className="text-lg font-medium mb-4">Receipt Image</h4>
                  <div className="flex justify-center">
                    <img 
                      src={selectedReceipt.filePath} 
                      alt="Receipt" 
                      className="max-w-full max-h-96 object-contain border border-gray-200 rounded"
                    />
                  </div>
                </div>
              )}
            </div>
            
            <div className="px-6 py-4 bg-gray-50 flex justify-end rounded-b-lg">
              <button
                type="button"
                className="btn-primary"
                onClick={handleCloseModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
