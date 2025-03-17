'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import type { Company } from '@/types/company'

interface UserMenuProps {
  userData: {
    name: string
    email: string
    role: string
    avatar: string | null
    company?: Company | null
  }
}

export default function UserMenu({ userData }: UserMenuProps) {
  const { signOut, userCompany } = useAuth()
  const company = userData.company || userCompany
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])
  
  const handleSignOut = async () => {
    try {
      console.log('Signing out from UserMenu...');
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
    <div className="relative" ref={menuRef}>
      <button
        className="flex items-center max-w-xs rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary transition-all"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="sr-only">Open user menu</span>
        {userData.avatar ? (
          <img
            className="h-8 w-8 rounded-full object-cover border border-gray-200"
            src={userData.avatar}
            alt={userData.name}
          />
        ) : (
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-gradient-to-br from-secondary to-primary text-white flex items-center justify-center">
              <span className="text-xs sm:text-sm font-medium">{getInitials(userData.name)}</span>
            </div>
        )}
      </button>
      
      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-48 sm:w-56 rounded-xl shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-50 overflow-hidden">
          <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-100 bg-gray-50">
            <p className="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-[180px] sm:max-w-[200px]">{userData.name}</p>
            <p className="text-xs text-gray-500 truncate max-w-[180px] sm:max-w-[200px]">{userData.email}</p>
            <div className="mt-1 flex flex-wrap gap-1">
              <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded text-xs font-medium bg-secondary/10 text-secondary">
                {userData.role}
              </span>
              {company && (
                <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  {company.name}
                </span>
              )}
            </div>
          </div>
          <a href="/profile" className="block px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            <div className="flex items-center">
              <svg className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Your Profile
            </div>
          </a>
          <a href="/settings" className="block px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            <div className="flex items-center">
              <svg className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              </svg>
              Settings
            </div>
          </a>
          <div className="border-t border-gray-100 mt-1 pt-1">
            <button 
              className="block w-full text-left px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-red-600 hover:bg-red-50 transition-colors"
              onClick={handleSignOut}
            >
              <div className="flex items-center">
                <svg className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign out
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
