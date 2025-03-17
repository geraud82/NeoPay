'use client'

import React, { useState } from 'react'

interface User {
  id: number
  name: string
  email: string
  role: 'driver' | 'owner' | 'operator' | 'admin' | 'manager'
  status: 'active' | 'inactive'
  createdAt: string
}

export default function UserManagement() {
  // Mock data for users
  const initialUsers: User[] = [
    { id: 1, name: 'John Doe', email: 'john.doe@example.com', role: 'driver', status: 'active', createdAt: '2025-01-15' },
    { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', role: 'manager', status: 'active', createdAt: '2025-02-20' },
    { id: 3, name: 'Mike Johnson', email: 'mike.johnson@example.com', role: 'driver', status: 'inactive', createdAt: '2025-03-10' },
    { id: 4, name: 'Sarah Williams', email: 'sarah.williams@example.com', role: 'owner', status: 'active', createdAt: '2025-04-05' },
    { id: 5, name: 'David Brown', email: 'david.brown@example.com', role: 'operator', status: 'active', createdAt: '2025-05-12' },
    { id: 6, name: 'Emily Davis', email: 'emily.davis@example.com', role: 'admin', status: 'active', createdAt: '2025-01-10' },
  ]
  
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  
  // Filter users based on search term and role filter
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    
    return matchesSearch && matchesRole
  })
  
  const handleAddUser = () => {
    setCurrentUser(null)
    setIsModalOpen(true)
  }
  
  const handleEditUser = (user: User) => {
    setCurrentUser(user)
    setIsModalOpen(true)
  }
  
  const handleCloseModal = () => {
    setIsModalOpen(false)
    setCurrentUser(null)
  }
  
  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would save to the database
    // For now, we'll just update the local state
    
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)
    
    const newUser: User = {
      id: currentUser ? currentUser.id : users.length + 1,
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      role: formData.get('role') as any,
      status: formData.get('status') as any,
      createdAt: currentUser ? currentUser.createdAt : new Date().toISOString().split('T')[0],
    }
    
    if (currentUser) {
      // Update existing user
      setUsers(users.map(user => user.id === currentUser.id ? newUser : user))
    } else {
      // Add new user
      setUsers([...users, newUser])
    }
    
    handleCloseModal()
  }
  
  const handleToggleStatus = (id: number) => {
    setUsers(users.map(user => {
      if (user.id === id) {
        return {
          ...user,
          status: user.status === 'active' ? 'inactive' : 'active'
        }
      }
      return user
    }))
  }
  
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800'
      case 'manager':
        return 'bg-blue-100 text-blue-800'
      case 'owner':
        return 'bg-indigo-100 text-indigo-800'
      case 'operator':
        return 'bg-yellow-100 text-yellow-800'
      case 'driver':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
        <button 
          className="btn-primary"
          onClick={handleAddUser}
        >
          Add User
        </button>
      </div>
      
      {/* Search and filter */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search users..."
            className="input w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        <div className="w-full md:w-64">
          <select
            className="input w-full"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="admin">Company Admin</option>
            <option value="manager">Company Manager</option>
            <option value="owner">Owner Operator</option>
            <option value="driver">Company Driver</option>
          </select>
        </div>
      </div>
      
      {/* Users table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                    {user.role === 'admin' ? 'Company Admin' : 
                     user.role === 'manager' ? 'Company Manager' : 
                     user.role === 'owner' ? 'Owner Operator' : 
                     user.role === 'driver' ? 'Company Driver' : 
                     user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.createdAt}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button 
                    className="text-primary hover:text-blue-800 mr-4"
                    onClick={() => handleEditUser(user)}
                  >
                    Edit
                  </button>
                  <button 
                    className={`${user.status === 'active' ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}`}
                    onClick={() => handleToggleStatus(user.id)}
                  >
                    {user.status === 'active' ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Add/Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">
                {currentUser ? 'Edit User' : 'Add New User'}
              </h3>
            </div>
            
            <form onSubmit={handleSaveUser}>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input 
                    type="text" 
                    id="name" 
                    name="name" 
                    className="input mt-1 w-full" 
                    defaultValue={currentUser?.name || ''}
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
                    defaultValue={currentUser?.email || ''}
                    required 
                  />
                </div>
                
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
                  <select 
                    id="role" 
                    name="role" 
                    className="input mt-1 w-full" 
                    defaultValue={currentUser?.role || 'driver'}
                  >
                    <option value="admin">Company Admin</option>
                    <option value="manager">Company Manager</option>
                    <option value="owner">Owner Operator</option>
                    <option value="driver">Company Driver</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                  <select 
                    id="status" 
                    name="status" 
                    className="input mt-1 w-full" 
                    defaultValue={currentUser?.status || 'active'}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
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
