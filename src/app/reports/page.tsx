'use client'

import React, { useState } from 'react'

interface Report {
  id: number
  name: string
  type: 'expense' | 'revenue' | 'driver' | 'vehicle' | 'custom'
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom'
  lastRun: string
  createdBy: string
  status: 'ready' | 'scheduled' | 'processing' | 'completed'
}

export default function Reports() {
  // Mock data for reports
  const initialReports: Report[] = [
    {
      id: 1,
      name: 'Monthly Expense Summary',
      type: 'expense',
      period: 'monthly',
      lastRun: '2025-03-01',
      createdBy: 'John Doe',
      status: 'completed'
    },
    {
      id: 2,
      name: 'Driver Performance Q1',
      type: 'driver',
      period: 'quarterly',
      lastRun: '2025-02-15',
      createdBy: 'Jane Smith',
      status: 'completed'
    },
    {
      id: 3,
      name: 'Annual Revenue Analysis',
      type: 'revenue',
      period: 'yearly',
      lastRun: '2025-01-05',
      createdBy: 'Mike Johnson',
      status: 'scheduled'
    },
    {
      id: 4,
      name: 'Vehicle Maintenance Costs',
      type: 'vehicle',
      period: 'monthly',
      lastRun: '2025-02-28',
      createdBy: 'Sarah Williams',
      status: 'ready'
    },
    {
      id: 5,
      name: 'Custom Fuel Efficiency Report',
      type: 'custom',
      period: 'custom',
      lastRun: '2025-02-20',
      createdBy: 'David Brown',
      status: 'completed'
    }
  ]
  
  const [reports, setReports] = useState<Report[]>(initialReports)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [periodFilter, setPeriodFilter] = useState<string>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Filter reports based on search term, type, and period
  const filteredReports = reports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === 'all' || report.type === typeFilter
    const matchesPeriod = periodFilter === 'all' || report.period === periodFilter
    
    return matchesSearch && matchesType && matchesPeriod
  })
  
  // Get unique types and periods for filters
  const types = ['all', 'expense', 'revenue', 'driver', 'vehicle', 'custom']
  const periods = ['all', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom']
  
  // Format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }
  
  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'ready':
        return 'bg-blue-100 text-blue-800'
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800'
      case 'processing':
        return 'bg-purple-100 text-purple-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }
  
  // Get type badge color
  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'expense':
        return 'bg-red-100 text-red-800'
      case 'revenue':
        return 'bg-green-100 text-green-800'
      case 'driver':
        return 'bg-blue-100 text-blue-800'
      case 'vehicle':
        return 'bg-yellow-100 text-yellow-800'
      case 'custom':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }
  
  // Handle running a report
  const handleRunReport = (id: number) => {
    setReports(reports.map(report => {
      if (report.id === id) {
        return {
          ...report,
          status: 'processing',
          lastRun: new Date().toISOString().split('T')[0]
        }
      }
      return report
    }))
    
    // Simulate report completion after 2 seconds
    setTimeout(() => {
      setReports(reports.map(report => {
        if (report.id === id) {
          return {
            ...report,
            status: 'completed'
          }
        }
        return report
      }))
    }, 2000)
  }
  
  // Handle deleting a report
  const handleDeleteReport = (id: number) => {
    setReports(reports.filter(report => report.id !== id))
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Reports</h1>
          <p className="text-gray-600">Generate and manage fleet reports</p>
        </div>
        
        <button 
          className="btn-primary"
          onClick={() => setIsModalOpen(true)}
        >
          Create New Report
        </button>
      </div>
      
      {/* Search and filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search reports..."
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
        
        <div>
          <select
            className="input w-full"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            {types.map((type, index) => (
              <option key={index} value={type}>
                {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <select
            className="input w-full"
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value)}
          >
            {periods.map((period, index) => (
              <option key={index} value={period}>
                {period === 'all' ? 'All Periods' : period.charAt(0).toUpperCase() + period.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Reports table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Run</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReports.map((report) => (
                <tr key={report.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{report.name}</div>
                    <div className="text-sm text-gray-500">Created by {report.createdBy}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeBadgeColor(report.type)}`}>
                      {report.type.charAt(0).toUpperCase() + report.type.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {report.period.charAt(0).toUpperCase() + report.period.slice(1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(report.lastRun)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(report.status)}`}>
                      {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      className="text-primary hover:text-blue-800 mr-3"
                      onClick={() => handleRunReport(report.id)}
                      disabled={report.status === 'processing'}
                    >
                      Run
                    </button>
                    <button 
                      className="text-gray-600 hover:text-gray-800 mr-3"
                    >
                      View
                    </button>
                    <button 
                      className="text-red-600 hover:text-red-800"
                      onClick={() => handleDeleteReport(report.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredReports.length === 0 && (
          <div className="text-center py-12">
            <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No reports found</h3>
            <p className="text-gray-500">Try adjusting your search or filters to find what you're looking for.</p>
          </div>
        )}
      </div>
      
      {/* Create Report Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">Create New Report</h3>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault()
              const form = e.target as HTMLFormElement
              const formData = new FormData(form)
              
              const newReport: Report = {
                id: reports.length + 1,
                name: formData.get('name') as string,
                type: formData.get('type') as any,
                period: formData.get('period') as any,
                lastRun: new Date().toISOString().split('T')[0],
                createdBy: 'John Doe', // In a real app, this would be the current user
                status: 'ready'
              }
              
              setReports([...reports, newReport])
              setIsModalOpen(false)
            }}>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Report Name</label>
                  <input 
                    type="text" 
                    id="name" 
                    name="name" 
                    className="input w-full" 
                    required 
                  />
                </div>
                
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
                  <select 
                    id="type" 
                    name="type" 
                    className="input w-full" 
                    required
                  >
                    <option value="expense">Expense</option>
                    <option value="revenue">Revenue</option>
                    <option value="driver">Driver</option>
                    <option value="vehicle">Vehicle</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="period" className="block text-sm font-medium text-gray-700 mb-1">Report Period</label>
                  <select 
                    id="period" 
                    name="period" 
                    className="input w-full" 
                    required
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                
                <div className="pt-2">
                  <p className="text-sm text-gray-500">
                    Reports will be generated based on the selected parameters and will be available for download once completed.
                  </p>
                </div>
              </div>
              
              <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3 rounded-b-lg">
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                >
                  Create Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
