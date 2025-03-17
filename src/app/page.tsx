'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function Home() {
  const { user } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Landing Page Navbar */}
      <nav className="bg-white shadow-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-secondary to-primary text-white flex items-center justify-center shadow-md mr-2">
                  <span className="text-sm font-bold">NP</span>
                </div>
                <span className="text-xl font-bold text-primary">NeoPay</span>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:space-x-6">
              <Link href="/blog" className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Blog
              </Link>
              <Link href="#features" className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Features
              </Link>
              <Link href="#contact" className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Contact
              </Link>
              
              {/* Show these links if user is not logged in */}
              {!user && (
                <>
                  <Link href="/login" className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    Login
                  </Link>
                  <Link href="/register" className="bg-accent text-primary px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent/90 transition-all shadow-sm hover:shadow-md">
                    Sign Up
                  </Link>
                </>
              )}
              
              {/* Show dashboard link if user is logged in */}
              {user && (
                <Link href="/dashboard" className="bg-accent text-primary px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent/90 transition-all shadow-sm hover:shadow-md">
                  Dashboard
                </Link>
              )}
            </div>
            
            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-primary hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-secondary transition-colors"
              >
                <span className="sr-only">Open main menu</span>
                {isMenuOpen ? (
                  <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="pt-2 pb-3 space-y-1">
              <Link href="/blog" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-primary hover:bg-gray-50 hover:border-secondary transition-colors">
                Blog
              </Link>
              <Link href="#features" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-primary hover:bg-gray-50 hover:border-secondary transition-colors">
                Features
              </Link>
              <Link href="#contact" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-primary hover:bg-gray-50 hover:border-secondary transition-colors">
                Contact
              </Link>
              
              {!user && (
                <>
                  <Link href="/login" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-primary hover:bg-gray-50 hover:border-secondary transition-colors">
                    Login
                  </Link>
                  <div className="px-4 py-2">
                    <Link href="/register" className="block w-full text-center bg-accent text-primary px-4 py-2 rounded-lg text-base font-medium hover:bg-accent/90 transition-all shadow-sm">
                      Sign Up
                    </Link>
                  </div>
                </>
              )}
              
              {user && (
                <div className="px-4 py-2">
                  <Link href="/dashboard" className="block w-full text-center bg-accent text-primary px-4 py-2 rounded-lg text-base font-medium hover:bg-accent/90 transition-all shadow-sm">
                    Dashboard
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-primary/90 to-secondary min-h-[600px] flex items-center overflow-hidden">
        {/* Abstract background shapes */}
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-accent/30 blur-3xl"></div>
          <div className="absolute top-1/2 right-1/4 w-64 h-64 rounded-full bg-secondary/40 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-accent/20 blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-6 py-20 relative z-10 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 text-white mb-12 md:mb-0">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Fleet Management <span className="text-accent">Reimagined</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-100 max-w-xl">
              The professional solution for modern fleet management and seamless driver payments
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/register" className="bg-accent text-primary px-8 py-4 rounded-lg font-semibold hover:bg-accent/90 transition-all shadow-lg hover:shadow-accent/20 hover:translate-y-[-2px]">
                Get Started
              </Link>
              <Link href="/login" className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/20 transition-all">
                Login
              </Link>
            </div>
          </div>
          
          <div className="md:w-1/2 flex justify-center">
            <div className="relative w-full max-w-md h-80 bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-white/20">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-accent/20"></div>
              <div className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-accent"></div>
                    <div className="w-3 h-3 rounded-full bg-secondary"></div>
                    <div className="w-3 h-3 rounded-full bg-white"></div>
                  </div>
                  <div className="text-white/80 text-sm">NeoPay Dashboard</div>
                </div>
                <div className="space-y-4">
                  <div className="h-8 bg-white/20 rounded-md w-3/4"></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="h-20 bg-white/20 rounded-md"></div>
                    <div className="h-20 bg-white/20 rounded-md"></div>
                    <div className="h-20 bg-white/20 rounded-md"></div>
                    <div className="h-20 bg-white/20 rounded-md"></div>
                  </div>
                  <div className="h-24 bg-white/20 rounded-md"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Stats Section */}
      <section className="py-12 bg-white relative z-10">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 -mt-16">
            <div className="bg-white rounded-xl shadow-xl p-6 transform transition-all hover:scale-105">
              <div className="text-accent text-4xl font-bold mb-2">98%</div>
              <div className="text-gray-600">Payment Accuracy</div>
            </div>
            <div className="bg-white rounded-xl shadow-xl p-6 transform transition-all hover:scale-105">
              <div className="text-accent text-4xl font-bold mb-2">3.5x</div>
              <div className="text-gray-600">Faster Processing</div>
            </div>
            <div className="bg-white rounded-xl shadow-xl p-6 transform transition-all hover:scale-105">
              <div className="text-accent text-4xl font-bold mb-2">24/7</div>
              <div className="text-gray-600">System Availability</div>
            </div>
            <div className="bg-white rounded-xl shadow-xl p-6 transform transition-all hover:scale-105">
              <div className="text-accent text-4xl font-bold mb-2">5,000+</div>
              <div className="text-gray-600">Drivers Managed</div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Professional Fleet Management Features</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Streamline your operations with our comprehensive suite of tools designed for modern fleet management
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-all">
              <div className="h-2 bg-secondary group-hover:bg-accent transition-colors"></div>
              <div className="p-8">
                <div className="w-14 h-14 rounded-lg bg-secondary/10 flex items-center justify-center mb-6 group-hover:bg-accent/10 transition-colors">
                  <svg className="h-8 w-8 text-secondary group-hover:text-accent transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-secondary transition-colors">Comprehensive Dashboard</h3>
                <p className="text-gray-600 mb-6">Get a complete overview of your fleet's performance, payments, and expenses at a glance.</p>
                <Link href="/login" className="inline-flex items-center text-secondary group-hover:text-accent transition-colors font-medium">
                  Explore Dashboard
                  <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-all">
              <div className="h-2 bg-secondary group-hover:bg-accent transition-colors"></div>
              <div className="p-8">
                <div className="w-14 h-14 rounded-lg bg-secondary/10 flex items-center justify-center mb-6 group-hover:bg-accent/10 transition-colors">
                  <svg className="h-8 w-8 text-secondary group-hover:text-accent transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-secondary transition-colors">Driver Management</h3>
                <p className="text-gray-600 mb-6">Easily add, edit, and track drivers in your fleet with comprehensive profiles and performance metrics.</p>
                <Link href="/login" className="inline-flex items-center text-secondary group-hover:text-accent transition-colors font-medium">
                  Manage Drivers
                  <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-all">
              <div className="h-2 bg-secondary group-hover:bg-accent transition-colors"></div>
              <div className="p-8">
                <div className="w-14 h-14 rounded-lg bg-secondary/10 flex items-center justify-center mb-6 group-hover:bg-accent/10 transition-colors">
                  <svg className="h-8 w-8 text-secondary group-hover:text-accent transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-secondary transition-colors">AI-Powered Pay Statements</h3>
                <p className="text-gray-600 mb-6">Generate accurate pay statements with AI assistance that automatically calculates trips, expenses, and deductions.</p>
                <Link href="/login" className="inline-flex items-center text-secondary group-hover:text-accent transition-colors font-medium">
                  View Pay Statements
                  <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            </div>
            
            {/* Feature 4 */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-all">
              <div className="h-2 bg-secondary group-hover:bg-accent transition-colors"></div>
              <div className="p-8">
                <div className="w-14 h-14 rounded-lg bg-secondary/10 flex items-center justify-center mb-6 group-hover:bg-accent/10 transition-colors">
                  <svg className="h-8 w-8 text-secondary group-hover:text-accent transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-secondary transition-colors">Smart Receipt Processing</h3>
                <p className="text-gray-600 mb-6">Upload receipts and let our AI extract relevant details automatically, saving time and reducing errors.</p>
                <Link href="/login" className="inline-flex items-center text-secondary group-hover:text-accent transition-colors font-medium">
                  Process Receipts
                  <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            </div>
            
            {/* Feature 5 */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-all">
              <div className="h-2 bg-secondary group-hover:bg-accent transition-colors"></div>
              <div className="p-8">
                <div className="w-14 h-14 rounded-lg bg-secondary/10 flex items-center justify-center mb-6 group-hover:bg-accent/10 transition-colors">
                  <svg className="h-8 w-8 text-secondary group-hover:text-accent transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-secondary transition-colors">Comprehensive Reports</h3>
                <p className="text-gray-600 mb-6">Generate detailed reports on expenses, revenue, driver performance, and more to make informed decisions.</p>
                <Link href="/login" className="inline-flex items-center text-secondary group-hover:text-accent transition-colors font-medium">
                  View Reports
                  <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            </div>
            
            {/* Feature 6 */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-all">
              <div className="h-2 bg-secondary group-hover:bg-accent transition-colors"></div>
              <div className="p-8">
                <div className="w-14 h-14 rounded-lg bg-secondary/10 flex items-center justify-center mb-6 group-hover:bg-accent/10 transition-colors">
                  <svg className="h-8 w-8 text-secondary group-hover:text-accent transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-secondary transition-colors">Customizable Settings</h3>
                <p className="text-gray-600 mb-6">Configure payment preferences, AI settings, and system parameters to match your specific business needs.</p>
                <Link href="/login" className="inline-flex items-center text-secondary group-hover:text-accent transition-colors font-medium">
                  Configure Settings
                  <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section id="contact" className="relative py-20 bg-gradient-to-br from-primary to-secondary overflow-hidden">
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-accent/30 blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-accent/30 blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-6 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">Ready to Transform Your Fleet Management?</h2>
          <p className="text-xl text-gray-100 mb-10 max-w-3xl mx-auto">
            Join thousands of fleet managers who are saving time and money with NeoPay's professional solution.
          </p>
          <Link href="/register" className="bg-accent text-primary px-10 py-4 rounded-lg font-semibold text-lg hover:bg-accent/90 transition-all shadow-lg hover:shadow-accent/20 hover:translate-y-[-2px]">
            Get Started Today
          </Link>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 shadow-inner mt-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-secondary to-primary text-white flex items-center justify-center shadow-md">
                <span className="text-sm font-bold">NP</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">NeoPay Fleet Management</p>
                <p className="text-xs text-gray-500">© {new Date().getFullYear()} All rights reserved</p>
              </div>
            </div>
            
            <div className="flex space-x-6">
              <a href="#" className="text-gray-500 hover:text-gray-900">
                <span className="sr-only">Privacy Policy</span>
                <span className="text-sm">Privacy Policy</span>
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-900">
                <span className="sr-only">Terms of Service</span>
                <span className="text-sm">Terms of Service</span>
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-900">
                <span className="sr-only">Contact</span>
                <span className="text-sm">Contact</span>
              </a>
            </div>
            
            <div className="flex space-x-4">
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
  )
}
