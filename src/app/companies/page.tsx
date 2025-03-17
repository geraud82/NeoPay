'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { fetchUserCompanies, createCompany, updateCompany, deleteCompany, fetchCompany } from '@/utils/companies'
import { Company } from '@/types/company'

export default function CompaniesPage() {
  const router = useRouter()
  const { user, isAdmin, userRole } = useAuth()
  const [companies, setCompanies] = useState<Company[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [accessDenied, setAccessDenied] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
    email: '',
    website: '',
    taxId: '',
    status: 'Active' as 'Active' | 'Inactive' | 'Suspended',
    subscriptionTier: 'basic' as 'basic' | 'premium' | 'enterprise',
    subscriptionStatus: 'trial' as 'active' | 'trial' | 'expired' | 'cancelled'
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Check user access and fetch companies on component mount
  useEffect(() => {
    const checkAccessAndLoadData = async () => {
      setIsLoading(true)
      
      if (!user) {
        return;
      }
      
      // If user is not an admin, check if they belong to a company
      if (!isAdmin) {
        try {
          // Get the user's company
          const companiesData = await fetchUserCompanies();
          
          if (companiesData.length === 1) {
            // If user belongs to exactly one company, redirect to that company's page
            router.push(`/companies/${companiesData[0].id}`);
            return;
          } else if (companiesData.length === 0) {
            // If user doesn't belong to any company, show access denied
            setAccessDenied(true);
            setIsLoading(false);
            return;
          }
          // If user belongs to multiple companies (unusual case), show them all
          setCompanies(companiesData);
        } catch (err) {
          console.error('Error checking user company:', err);
          setError('Failed to verify access. Please try again.');
          setAccessDenied(true);
        } finally {
          setIsLoading(false);
        }
      } else {
        // Admin can see all companies
        try {
          const companiesData = await fetchUserCompanies();
          setCompanies(companiesData);
        } catch (err) {
          console.error('Error loading companies:', err);
          setError('Failed to load companies. Please try again.');
        } finally {
          setIsLoading(false);
        }
      }
    };

    checkAccessAndLoadData();
  }, [user, isAdmin, router]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Open add company modal
  const handleAddCompany = () => {
    setFormData({
      name: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      phone: '',
      email: '',
      website: '',
      taxId: '',
      status: 'Active',
      subscriptionTier: 'basic',
      subscriptionStatus: 'trial'
    })
    setShowAddModal(true)
  }

  // Open edit company modal
  const handleEditCompany = (company: Company) => {
    setCurrentCompany(company)
    setFormData({
      name: company.name,
      address: company.address || '',
      city: company.city || '',
      state: company.state || '',
      zip: company.zip || '',
      phone: company.phone || '',
      email: company.email || '',
      website: company.website || '',
      taxId: company.taxId || '',
      status: company.status,
      subscriptionTier: company.subscriptionTier,
      subscriptionStatus: company.subscriptionStatus
    })
    setShowEditModal(true)
  }

  // Open delete company modal
  const handleDeleteCompanyClick = (company: Company) => {
    setCurrentCompany(company)
    setShowDeleteModal(true)
  }

  // Submit add company form
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    try {
      if (!user?.id) {
        throw new Error('User not authenticated')
      }
      
      const newCompany = {
        ...formData,
        ownerId: user.id
      }
      
      const { data, error } = await createCompany(newCompany)
      
      if (error) {
        throw error
      }
      
      if (data) {
        setCompanies(prev => [...prev, data])
        setSuccess('Company created successfully!')
        setShowAddModal(false)
      }
    } catch (err) {
      console.error('Error creating company:', err)
      setError('Failed to create company. Please try again.')
    }
  }

  // Submit edit company form
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    if (!currentCompany) return
    
    try {
      const { data, error } = await updateCompany(currentCompany.id, formData)
      
      if (error) {
        throw error
      }
      
      if (data) {
        setCompanies(prev => 
          prev.map(company => company.id === currentCompany.id ? data : company)
        )
        setSuccess('Company updated successfully!')
        setShowEditModal(false)
      }
    } catch (err) {
      console.error('Error updating company:', err)
      setError('Failed to update company. Please try again.')
    }
  }

  // Confirm delete company
  const handleDeleteConfirm = async () => {
    if (!currentCompany) return
    
    try {
      const { success, error } = await deleteCompany(currentCompany.id)
      
      if (error) {
        throw error
      }
      
      if (success) {
        setCompanies(prev => prev.filter(company => company.id !== currentCompany.id))
        setSuccess('Company deleted successfully!')
        setShowDeleteModal(false)
      }
    } catch (err) {
      console.error('Error deleting company:', err)
      setError('Failed to delete company. Please try again.')
    }
  }

  // Navigate to company details
  const handleCompanyClick = (company: Company) => {
    router.push(`/companies/${company.id}`)
  }

  // Render subscription tier badge
  const renderSubscriptionBadge = (tier: string) => {
    const colors = {
      basic: 'bg-gray-100 text-gray-800',
      premium: 'bg-blue-100 text-blue-800',
      enterprise: 'bg-purple-100 text-purple-800'
    }
    
    const color = colors[tier as keyof typeof colors] || colors.basic
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${color}`}>
        {tier.charAt(0).toUpperCase() + tier.slice(1)}
      </span>
    )
  }

  // Render status badge
  const renderStatusBadge = (status: string) => {
    const colors = {
      Active: 'bg-green-100 text-green-800',
      Inactive: 'bg-yellow-100 text-yellow-800',
      Suspended: 'bg-red-100 text-red-800'
    }
    
    const color = colors[status as keyof typeof colors] || colors.Active
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${color}`}>
        {status}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {accessDenied ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p>You do not have permission to view this page. Please contact your administrator if you believe this is an error.</p>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Companies</h1>
            <button
              onClick={handleAddCompany}
              className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors"
            >
              Add Company
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
          
          {/* Companies List */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            {isLoading ? (
              <div className="p-4 text-center">Loading companies...</div>
            ) : companies.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No companies found. Click "Add Company" to create one.
              </div>
            ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subscription
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
                {companies.map((company) => (
                  <tr 
                    key={company.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                  >
                    <td 
                      className="px-6 py-4 whitespace-nowrap"
                      onClick={() => handleCompanyClick(company)}
                    >
                      <div className="text-sm font-medium text-gray-900">{company.name}</div>
                    </td>
                    <td 
                      className="px-6 py-4 whitespace-nowrap"
                      onClick={() => handleCompanyClick(company)}
                    >
                      <div className="text-sm text-gray-500">
                        {company.city && company.state ? `${company.city}, ${company.state}` : 'N/A'}
                      </div>
                    </td>
                    <td 
                      className="px-6 py-4 whitespace-nowrap"
                      onClick={() => handleCompanyClick(company)}
                    >
                      <div className="text-sm text-gray-500">{company.email || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{company.phone || 'N/A'}</div>
                    </td>
                    <td 
                      className="px-6 py-4 whitespace-nowrap"
                      onClick={() => handleCompanyClick(company)}
                    >
                      {renderSubscriptionBadge(company.subscriptionTier)}
                    </td>
                    <td 
                      className="px-6 py-4 whitespace-nowrap"
                      onClick={() => handleCompanyClick(company)}
                    >
                      {renderStatusBadge(company.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditCompany(company);
                        }}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCompanyClick(company);
                        }}
                        className="text-red-600 hover:text-red-900"
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
      
          {/* Add Company Modal */}
          {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add Company</h2>
            <form onSubmit={handleAddSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Company Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">State</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">ZIP Code</label>
                    <input
                      type="text"
                      name="zip"
                      value={formData.zip}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Website</label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tax ID</label>
                    <input
                      type="text"
                      name="taxId"
                      value={formData.taxId}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Subscription Tier</label>
                    <select
                      name="subscriptionTier"
                      value={formData.subscriptionTier}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    >
                      <option value="basic">Basic</option>
                      <option value="premium">Premium</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Subscription Status</label>
                  <select
                    name="subscriptionStatus"
                    value={formData.subscriptionStatus}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  >
                    <option value="trial">Trial</option>
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-white text-gray-700 px-4 py-2 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark"
                >
                  Add Company
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
          {/* Edit Company Modal */}
          {showEditModal && currentCompany && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit Company</h2>
            <form onSubmit={handleEditSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Company Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">State</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">ZIP Code</label>
                    <input
                      type="text"
                      name="zip"
                      value={formData.zip}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Website</label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tax ID</label>
                    <input
                      type="text"
                      name="taxId"
                      value={formData.taxId}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Subscription Tier</label>
                    <select
                      name="subscriptionTier"
                      value={formData.subscriptionTier}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    >
                      <option value="basic">Basic</option>
                      <option value="premium">Premium</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Subscription Status</label>
                  <select
                    name="subscriptionStatus"
                    value={formData.subscriptionStatus}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  >
                    <option value="trial">Trial</option>
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="bg-white text-gray-700 px-4 py-2 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark"
                >
                  Update Company
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
          {/* Delete Confirmation Modal */}
          {showDeleteModal && currentCompany && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Delete Company</h2>
            <p className="mb-4">
              Are you sure you want to delete <span className="font-semibold">{currentCompany.name}</span>? 
              This action cannot be undone and will remove all associated data.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="bg-white text-gray-700 px-4 py-2 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  )
}
