'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { fetchCompany, fetchCompanyUsers, addCompanyUser, updateCompanyUserRole, removeCompanyUser } from '@/utils/companies'
import { Company, CompanyUser } from '@/types/company'

export default function CompanyDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user } = useAuth()
  const [company, setCompany] = useState<Company | null>(null)
  const [companyUsers, setCompanyUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [showEditRoleModal, setShowEditRoleModal] = useState(false)
  const [showRemoveUserModal, setShowRemoveUserModal] = useState(false)
  const [currentUser, setCurrentUser] = useState<any | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    role: 'user' as 'admin' | 'manager' | 'accountant' | 'dispatcher' | 'user'
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Fetch company and users on component mount
  useEffect(() => {
    const loadCompanyData = async () => {
      setIsLoading(true)
      try {
        const companyId = parseInt(params.id)
        const companyData = await fetchCompany(companyId)
        
        if (!companyData) {
          throw new Error('Company not found')
        }
        
        setCompany(companyData)
        
        // Fetch company users
        const usersData = await fetchCompanyUsers(companyId)
        setCompanyUsers(usersData)
      } catch (err) {
        console.error('Error loading company data:', err)
        setError('Failed to load company data. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      loadCompanyData()
    }
  }, [user, params.id])

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Open add user modal
  const handleAddUser = () => {
    setFormData({
      email: '',
      role: 'user'
    })
    setShowAddUserModal(true)
  }

  // Open edit role modal
  const handleEditRole = (companyUser: any) => {
    setCurrentUser(companyUser)
    setFormData({
      email: '',
      role: companyUser.role
    })
    setShowEditRoleModal(true)
  }

  // Open remove user modal
  const handleRemoveUserClick = (companyUser: any) => {
    setCurrentUser(companyUser)
    setShowRemoveUserModal(true)
  }

  // Submit add user form
  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    if (!company) return
    
    try {
      const { data, error } = await addCompanyUser(company.id, formData.email, formData.role)
      
      if (error) {
        throw error
      }
      
      if (data) {
        // Refresh company users
        const usersData = await fetchCompanyUsers(company.id)
        setCompanyUsers(usersData)
        
        setSuccess('User added successfully!')
        setShowAddUserModal(false)
      }
    } catch (err) {
      console.error('Error adding user:', err)
      setError('Failed to add user. Please check the email and try again.')
    }
  }

  // Submit edit role form
  const handleEditRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    if (!company || !currentUser) return
    
    try {
      const { success, error } = await updateCompanyUserRole(company.id, currentUser.userId, formData.role)
      
      if (error) {
        throw error
      }
      
      if (success) {
        // Refresh company users
        const usersData = await fetchCompanyUsers(company.id)
        setCompanyUsers(usersData)
        
        setSuccess('User role updated successfully!')
        setShowEditRoleModal(false)
      }
    } catch (err) {
      console.error('Error updating user role:', err)
      setError('Failed to update user role. Please try again.')
    }
  }

  // Confirm remove user
  const handleRemoveUserConfirm = async () => {
    if (!company || !currentUser) return
    
    try {
      const { success, error } = await removeCompanyUser(company.id, currentUser.userId)
      
      if (error) {
        throw error
      }
      
      if (success) {
        // Refresh company users
        const usersData = await fetchCompanyUsers(company.id)
        setCompanyUsers(usersData)
        
        setSuccess('User removed successfully!')
        setShowRemoveUserModal(false)
      }
    } catch (err) {
      console.error('Error removing user:', err)
      setError('Failed to remove user. Please try again.')
    }
  }

  // Render role badge
  const renderRoleBadge = (role: string) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      manager: 'bg-blue-100 text-blue-800',
      accountant: 'bg-green-100 text-green-800',
      dispatcher: 'bg-yellow-100 text-yellow-800',
      user: 'bg-gray-100 text-gray-800'
    }
    
    const color = colors[role as keyof typeof colors] || colors.user
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${color}`}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    )
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading company data...</p>
        </div>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6 text-center">
        <h2 className="text-xl font-bold mb-4">Company Not Found</h2>
        <p className="mb-4">The company you are looking for does not exist or you do not have permission to view it.</p>
        <Link href="/companies" className="text-primary hover:underline">
          Back to Companies
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center space-x-2">
            <Link href="/companies" className="text-gray-500 hover:text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </Link>
            <h1 className="text-2xl font-bold">{company.name}</h1>
            {renderStatusBadge(company.status)}
          </div>
          <p className="text-gray-500 mt-1">
            {company.city && company.state ? `${company.city}, ${company.state}` : 'No location provided'}
          </p>
        </div>
        <div>
          <Link 
            href={`/companies/${company.id}/edit`}
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors"
          >
            Edit Company
          </Link>
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
      
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'users'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab('drivers')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'drivers'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Drivers
          </button>
          <button
            onClick={() => setActiveTab('billing')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'billing'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Billing
          </button>
        </nav>
      </div>
      
      {/* Tab Content */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Company Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Contact Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm">{company.email || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm">{company.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Website</p>
                    <p className="text-sm">
                      {company.website ? (
                        <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          {company.website}
                        </a>
                      ) : (
                        'Not provided'
                      )}
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Address</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500">Street Address</p>
                    <p className="text-sm">{company.address || 'Not provided'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">City</p>
                      <p className="text-sm">{company.city || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">State</p>
                      <p className="text-sm">{company.state || 'Not provided'}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">ZIP Code</p>
                    <p className="text-sm">{company.zip || 'Not provided'}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Business Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500">Tax ID</p>
                    <p className="text-sm">{company.taxId || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <p className="text-sm">{renderStatusBadge(company.status)}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Subscription</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500">Tier</p>
                    <p className="text-sm">{renderSubscriptionBadge(company.subscriptionTier)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <p className="text-sm capitalize">{company.subscriptionStatus}</p>
                  </div>
                  {company.trialEndsAt && (
                    <div>
                      <p className="text-xs text-gray-500">Trial Ends</p>
                      <p className="text-sm">{new Date(company.trialEndsAt).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-4">Company Statistics</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Total Drivers</p>
                  <p className="text-2xl font-semibold">24</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Active Trips</p>
                  <p className="text-2xl font-semibold">12</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Total Payments</p>
                  <p className="text-2xl font-semibold">$12,456.78</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Pending Payments</p>
                  <p className="text-2xl font-semibold">$2,345.67</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Company Users</h2>
              <button
                onClick={handleAddUser}
                className="bg-primary text-white px-3 py-1 text-sm rounded-md hover:bg-primary-dark transition-colors"
              >
                Add User
              </button>
            </div>
            
            {companyUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No users found for this company.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {companyUsers.map((companyUser) => (
                      <tr key={companyUser.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {companyUser.userId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {renderRoleBadge(companyUser.role)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEditRole(companyUser)}
                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                          >
                            Edit Role
                          </button>
                          <button
                            onClick={() => handleRemoveUserClick(companyUser)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        
        {/* Drivers Tab */}
        {activeTab === 'drivers' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Company Drivers</h2>
              <Link
                href={`/drivers/new?companyId=${company.id}`}
                className="bg-primary text-white px-3 py-1 text-sm rounded-md hover:bg-primary-dark transition-colors"
              >
                Add Driver
              </Link>
            </div>
            
            <div className="text-center py-8 text-gray-500">
              Driver management is available in the Drivers section.
            </div>
          </div>
        )}
        
        {/* Billing Tab */}
        {activeTab === 'billing' && (
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Subscription & Billing</h2>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">Current Plan</p>
                  <div className="flex items-center mt-1">
                    <p className="text-lg font-semibold mr-2">{company.subscriptionTier.charAt(0).toUpperCase() + company.subscriptionTier.slice(1)}</p>
                    {renderSubscriptionBadge(company.subscriptionTier)}
                  </div>
                </div>
                <button className="bg-primary text-white px-3 py-1 text-sm rounded-md hover:bg-primary-dark transition-colors">
                  Upgrade Plan
                </button>
              </div>
              
              <div className="mt-4">
                <p className="text-sm text-gray-500">Status</p>
                <p className="text-base capitalize">{company.subscriptionStatus}</p>
              </div>
              
              {company.trialEndsAt && company.subscriptionStatus === 'trial' && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500">Trial Period</p>
                  <p className="text-base">
                    Ends on {new Date(company.trialEndsAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
            
            <h3 className="text-md font-semibold mb-3">Payment Methods</h3>
            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
              <p className="text-center text-gray-500 py-4">
                No payment methods added yet.
              </p>
              <div className="text-center">
                <button className="bg-white text-primary border border-primary px-3 py-1 text-sm rounded-md hover:bg-gray-50 transition-colors">
                  Add Payment Method
                </button>
              </div>
            </div>
            
            <h3 className="text-md font-semibold mb-3">Billing History</h3>
            <div className="bg-white border border-gray-200 rounded-lg">
              <p className="text-center text-gray-500 py-8">
                No billing history available.
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add User to Company</h2>
            <form onSubmit={handleAddUserSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">User Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    placeholder="Enter user email"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  >
                    <option value="user">User</option>
                    <option value="dispatcher">Dispatcher</option>
                    <option value="accountant">Accountant</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="bg-white text-gray-700 px-4 py-2 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark"
                >
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Edit Role Modal */}
      {showEditRoleModal && currentUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit User Role</h2>
            <form onSubmit={handleEditRoleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">User ID</label>
                  <input
                    type="text"
                    value={currentUser.userId}
                    disabled
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  >
                    <option value="user">User</option>
                    <option value="dispatcher">Dispatcher</option>
                    <option value="accountant">Accountant</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditRoleModal(false)}
                  className="bg-white text-gray-700 px-4 py-2 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark"
                >
                  Update Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Remove User Modal */}
      {showRemoveUserModal && currentUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Remove User</h2>
            <p className="mb-4">
              Are you sure you want to remove user <span className="font-semibold">{currentUser.userId}</span> from this company?
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowRemoveUserModal(false)}
                className="bg-white text-gray-700 px-4 py-2 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveUserConfirm}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
