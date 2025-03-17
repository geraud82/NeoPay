'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/utils/supabase'
import Link from 'next/link'

interface UserProfile {
  name: string
  email: string
  role: string
  phone: string
  company: string
  address: string
  bio: string
  avatar: string | null
  notifications: {
    email: boolean
    sms: boolean
    push: boolean
  }
}

export default function Profile() {
  const { user, signOut, isLoading: authLoading } = useAuth()
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateError, setUpdateError] = useState<string | null>(null)
  
  // Default profile data
  const defaultProfile: UserProfile = {
    name: 'User',
    email: '',
    role: 'User',
    phone: '',
    company: '',
    address: '',
    bio: '',
    avatar: null,
    notifications: {
      email: true,
      sms: false,
      push: true
    }
  }
  
  const [profile, setProfile] = useState<UserProfile>(defaultProfile)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<UserProfile>(defaultProfile)
  
  // Update profile when user data is available
  useEffect(() => {
    if (user) {
      const userProfile: UserProfile = {
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        email: user.email || '',
        role: user.user_metadata?.role || 'User',
        phone: user.user_metadata?.phone || '',
        company: user.user_metadata?.company_name || '',
        address: user.user_metadata?.address || '',
        bio: user.user_metadata?.bio || '',
        avatar: user.user_metadata?.avatar_url || null,
        notifications: {
          email: user.user_metadata?.notifications?.email !== false,
          sms: user.user_metadata?.notifications?.sms === true,
          push: user.user_metadata?.notifications?.push !== false
        }
      }
      
      setProfile(userProfile)
      setFormData(userProfile)
    }
  }, [user])
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setFormData({
      ...formData,
      notifications: {
        ...formData.notifications,
        [name]: checked
      }
    })
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)
    setUpdateError(null)
    
    try {
      // Prepare metadata for update
      const metadata = {
        full_name: formData.name,
        company_name: formData.company,
        role: formData.role,
        phone: formData.phone,
        address: formData.address,
        bio: formData.bio,
        notifications: formData.notifications
      }
      
      // Update user metadata in Supabase
      const { error } = await supabase.auth.updateUser({
        data: metadata
      })
      
      if (error) {
        throw error
      }
      
      // Update local state
      setProfile(formData)
      setIsEditing(false)
    } catch (err: any) {
      console.error('Error updating profile:', err)
      setUpdateError(err.message || 'Failed to update profile. Please try again.')
    } finally {
      setIsUpdating(false)
    }
  }
  
  const handleCancel = () => {
    setFormData(profile)
    setIsEditing(false)
  }
  
  // Get user initials for avatar placeholder
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">User Profile</h1>
        <p className="text-gray-600">Manage your account information and settings</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Profile header */}
        <div className="p-6 bg-gray-50 border-b flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="mr-4">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-primary text-white flex items-center justify-center text-xl font-medium">
                  {getInitials(profile.name)}
                </div>
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold">{profile.name}</h2>
              <p className="text-gray-600">{profile.email}</p>
              <p className="text-sm text-primary font-medium">{profile.role}</p>
            </div>
          </div>
          
          {!isEditing && (
            <button
              className="btn-primary"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </button>
          )}
        </div>
        
        {/* Profile content */}
        {isEditing ? (
          <form onSubmit={handleSubmit} className="p-6">
            {updateError && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{updateError}</p>
                  </div>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="input w-full"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="input w-full"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="input w-full"
                />
              </div>
              
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  className="input w-full"
                />
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="input w-full"
                />
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={4}
                  value={formData.bio}
                  onChange={handleInputChange}
                  className="input w-full"
                />
              </div>
              
              <div className="md:col-span-2">
                <h3 className="text-lg font-medium mb-2">Notification Preferences</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="email-notifications"
                      name="email"
                      checked={formData.notifications.email}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <label htmlFor="email-notifications" className="ml-2 block text-sm text-gray-700">
                      Email Notifications
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="sms-notifications"
                      name="sms"
                      checked={formData.notifications.sms}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <label htmlFor="sms-notifications" className="ml-2 block text-sm text-gray-700">
                      SMS Notifications
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="push-notifications"
                      name="push"
                      checked={formData.notifications.push}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <label htmlFor="push-notifications" className="ml-2 block text-sm text-gray-700">
                      Push Notifications
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                className="btn-secondary"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </div>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Contact Information</h3>
                <div className="mt-2 space-y-2">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">Email:</span> {profile.email}
                  </p>
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">Phone:</span> {profile.phone}
                  </p>
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">Company:</span> {profile.company}
                  </p>
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">Address:</span> {profile.address}
                  </p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">About</h3>
                <p className="mt-2 text-sm text-gray-900">{profile.bio}</p>
              </div>
              
              <div className="md:col-span-2">
                <h3 className="text-sm font-medium text-gray-500">Notification Preferences</h3>
                <div className="mt-2 space-y-2">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">Email Notifications:</span> {profile.notifications.email ? 'Enabled' : 'Disabled'}
                  </p>
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">SMS Notifications:</span> {profile.notifications.sms ? 'Enabled' : 'Disabled'}
                  </p>
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">Push Notifications:</span> {profile.notifications.push ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <div className="mb-4 sm:mb-0">
                  <Link 
                    href="/settings" 
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary"
                  >
                    <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    </svg>
                    Settings
                  </Link>
                </div>
                <div>
                  <button
                    onClick={async () => {
                      try {
                        console.log('Signing out from profile page...');
                        const { error } = await signOut();
                        if (error) {
                          console.error('Error signing out:', error);
                          alert('Failed to sign out. Please try again.');
                        } else {
                          console.log('Sign out successful');
                          window.location.href = '/login';
                        }
                      } catch (err) {
                        console.error('Unexpected error during sign out:', err);
                        alert('An unexpected error occurred. Please try again.');
                      }
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
