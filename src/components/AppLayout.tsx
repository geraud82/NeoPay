'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'
import { useAuth } from '@/contexts/AuthContext'

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { user, isLoading } = useAuth()
  const pathname = usePathname()
  
  // Public routes that don't require authentication
  const isPublicRoute = pathname === '/login' || pathname === '/register' || pathname === '/' || pathname === '/blog' || pathname.startsWith('/blog/')
  
  // If on a public route or authenticated, render the page
  // Otherwise, we'll handle redirection in the AuthContext
  
  // For public routes, don't show the sidebar and navbar
  if (isPublicRoute) {
    return <>{children}</>
  }
  
  // For authenticated routes, show the sidebar and navbar
  // In a real app, userRole would come from the user object
  const userRole = user?.user_metadata?.role || 'admin'
  
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar userRole={userRole as any} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 sm:p-5 md:p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-secondary"></div>
            </div>
          ) : (
            <div className="w-full max-w-7xl mx-auto">
              {children}
            </div>
          )}
        </main>
        
        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 shadow-inner">
          <div className="max-w-7xl mx-auto py-4 sm:py-5 md:py-6 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-br from-secondary to-primary text-white flex items-center justify-center shadow-md">
                  <span className="text-xs sm:text-sm font-bold">NP</span>
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-900">NeoPay Fleet Management</p>
                  <p className="text-xs text-gray-500">© {new Date().getFullYear()} All rights reserved</p>
                </div>
              </div>
              
              <div className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-6">
                <a href="#" className="text-gray-500 hover:text-gray-900">
                  <span className="sr-only">Privacy Policy</span>
                  <span className="text-xs sm:text-sm">Privacy Policy</span>
                </a>
                <a href="#" className="text-gray-500 hover:text-gray-900">
                  <span className="sr-only">Terms of Service</span>
                  <span className="text-xs sm:text-sm">Terms of Service</span>
                </a>
                <a href="#" className="text-gray-500 hover:text-gray-900">
                  <span className="sr-only">Contact</span>
                  <span className="text-xs sm:text-sm">Contact</span>
                </a>
              </div>
              
              <div className="flex space-x-3 sm:space-x-4">
                <a href="#" className="text-gray-500 hover:text-gray-900">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-500 hover:text-gray-900">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-500 hover:text-gray-900">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
