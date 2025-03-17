'use client'

import React, { useState, useEffect } from 'react'
import { PayStatement } from '@/types/payStatement'
import { Driver } from '@/types/driver'
import { fetchPayments, updatePaymentStatus } from '@/utils/payments'
import { fetchDrivers } from '@/utils/drivers'

export default function Payments() {
  const [payStatements, setPayStatements] = useState<PayStatement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedStatement, setSelectedStatement] = useState<PayStatement | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'zelle' | 'bank'>('zelle')
  const [paymentDetails, setPaymentDetails] = useState({
    email: '',
    phone: '',
    accountNumber: '',
    routingNumber: '',
    bankName: ''
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Mock data for drivers with payment info
  const drivers: (Driver & { paymentInfo?: any })[] = [
    { 
      id: 1, 
      companyId: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '555-123-4567',
      license: 'DL12345',
      status: 'active',
      type: 'company',
      employmentType: 'W2',
      joinDate: '2024-01-01',
      paymentInfo: {
        zelle: { email: 'john.doe@example.com', phone: '555-123-4567' },
        bank: { accountNumber: '****6789', routingNumber: '****1234', bankName: 'Chase Bank' }
      }
    },
    { 
      id: 2, 
      companyId: 1,
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '555-987-6543',
      license: 'DL67890',
      status: 'active',
      type: 'owner',
      employmentType: '1099',
      joinDate: '2024-02-01',
      paymentInfo: {
        zelle: { email: 'jane.smith@example.com', phone: '555-987-6543' },
        bank: { accountNumber: '****5432', routingNumber: '****5678', bankName: 'Bank of America' }
      }
    },
    { 
      id: 3, 
      companyId: 1,
      name: 'Mike Johnson',
      email: 'mike.johnson@example.com',
      phone: '555-456-7890',
      license: 'DL34567',
      status: 'active',
      type: 'company',
      employmentType: 'W2',
      joinDate: '2024-03-01',
      paymentInfo: {
        zelle: { email: 'mike.johnson@example.com', phone: '555-456-7890' },
        bank: { accountNumber: '****2345', routingNumber: '****9012', bankName: 'Wells Fargo' }
      }
    },
    { 
      id: 4, 
      companyId: 1,
      name: 'Sarah Williams',
      email: 'sarah.williams@example.com',
      phone: '555-789-0123',
      license: 'DL89012',
      status: 'active',
      type: 'owner',
      employmentType: '1099',
      joinDate: '2024-04-01',
      paymentInfo: {
        zelle: { email: 'sarah.williams@example.com', phone: '555-789-0123' },
        bank: { accountNumber: '****3456', routingNumber: '****7890', bankName: 'Citibank' }
      }
    },
    { 
      id: 5, 
      companyId: 1,
      name: 'David Brown',
      email: 'david.brown@example.com',
      phone: '555-234-5678',
      license: 'DL45678',
      status: 'active',
      type: 'company',
      employmentType: 'W2',
      joinDate: '2024-05-01',
      paymentInfo: {
        zelle: { email: 'david.brown@example.com', phone: '555-234-5678' },
        bank: { accountNumber: '****4567', routingNumber: '****3456', bankName: 'US Bank' }
      }
    },
  ]

  // Mock data for pay statements
  useEffect(() => {
    // Simulate API call to fetch pay statements
    const fetchPayStatements = async () => {
      setIsLoading(true)
      try {
        // In a real app, this would be an API call
        // For now, we'll use mock data
        const mockPayStatements: PayStatement[] = [
          {
            id: 1,
            companyId: 1,
            driverId: 1,
            driverName: 'John Doe',
            periodStart: '2025-02-01',
            periodEnd: '2025-02-15',
            trips: [],
            expenses: [],
            cashAdvances: [],
            deductions: [],
            tripTotal: 2450.75,
            expenseTotal: 350.25,
            cashAdvanceTotal: 200.00,
            grossPay: 2450.75,
            taxWithholding: 350.25,
            deductionsTotal: 200.00,
            netPay: 1900.50,
            generatedDate: '2025-02-16',
            status: 'finalized'
          },
          {
            id: 2,
            companyId: 1,
            driverId: 2,
            driverName: 'Jane Smith',
            periodStart: '2025-02-01',
            periodEnd: '2025-02-15',
            trips: [],
            expenses: [],
            cashAdvances: [],
            deductions: [],
            tripTotal: 3200.50,
            expenseTotal: 420.75,
            cashAdvanceTotal: 0,
            grossPay: 3200.50,
            taxWithholding: 420.75,
            deductionsTotal: 0,
            netPay: 2779.75,
            generatedDate: '2025-02-16',
            status: 'finalized'
          },
          {
            id: 3,
            companyId: 1,
            driverId: 3,
            driverName: 'Mike Johnson',
            periodStart: '2025-02-01',
            periodEnd: '2025-02-15',
            trips: [],
            expenses: [],
            cashAdvances: [],
            deductions: [],
            tripTotal: 1850.25,
            expenseTotal: 275.50,
            cashAdvanceTotal: 100.00,
            grossPay: 1850.25,
            taxWithholding: 275.50,
            deductionsTotal: 100.00,
            netPay: 1474.75,
            generatedDate: '2025-02-16',
            status: 'paid'
          },
          {
            id: 4,
            companyId: 1,
            driverId: 1,
            driverName: 'John Doe',
            periodStart: '2025-02-16',
            periodEnd: '2025-02-28',
            trips: [],
            expenses: [],
            cashAdvances: [],
            deductions: [],
            tripTotal: 2650.00,
            expenseTotal: 380.25,
            cashAdvanceTotal: 0,
            grossPay: 2650.00,
            taxWithholding: 380.25,
            deductionsTotal: 0,
            netPay: 2269.75,
            generatedDate: '2025-03-01',
            status: 'finalized'
          },
          {
            id: 5,
            companyId: 1,
            driverId: 4,
            driverName: 'Sarah Williams',
            periodStart: '2025-02-16',
            periodEnd: '2025-02-28',
            trips: [],
            expenses: [],
            cashAdvances: [],
            deductions: [],
            tripTotal: 2950.50,
            expenseTotal: 410.25,
            cashAdvanceTotal: 150.00,
            grossPay: 2950.50,
            taxWithholding: 410.25,
            deductionsTotal: 150.00,
            netPay: 2390.25,
            generatedDate: '2025-03-01',
            status: 'paid'
          },
          {
            id: 6,
            companyId: 1,
            driverId: 5,
            driverName: 'David Brown',
            periodStart: '2025-02-16',
            periodEnd: '2025-02-28',
            trips: [],
            expenses: [],
            cashAdvances: [],
            deductions: [],
            tripTotal: 3100.75,
            expenseTotal: 450.50,
            cashAdvanceTotal: 0,
            grossPay: 3100.75,
            taxWithholding: 450.50,
            deductionsTotal: 0,
            netPay: 2650.25,
            generatedDate: '2025-03-01',
            status: 'draft'
          }
        ]
        
        // Simulate network delay
        setTimeout(() => {
          setPayStatements(mockPayStatements)
          setIsLoading(false)
        }, 800)
      } catch (error) {
        console.error('Error fetching pay statements:', error)
        setIsLoading(false)
      }
    }
    
    fetchPayStatements()
  }, [])

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  // Format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' }
    return new Date(dateString).toLocaleDateString('en-US', options)
  }

  // Handle payment method change
  const handlePaymentMethodChange = (method: 'zelle' | 'bank') => {
    setPaymentMethod(method)
    
    // Pre-fill payment details if available
    if (selectedStatement) {
      const driver = drivers.find(d => d.id === selectedStatement.driverId)
      if (driver?.paymentInfo) {
        if (method === 'zelle') {
          setPaymentDetails({
            ...paymentDetails,
            email: driver.paymentInfo.zelle.email,
            phone: driver.paymentInfo.zelle.phone
          })
        } else {
          setPaymentDetails({
            ...paymentDetails,
            accountNumber: driver.paymentInfo.bank.accountNumber,
            routingNumber: driver.paymentInfo.bank.routingNumber,
            bankName: driver.paymentInfo.bank.bankName
          })
        }
      }
    }
  }

  // Handle payment submission
  const handlePaymentSubmit = () => {
    if (!selectedStatement) return
    
    setIsProcessing(true)
    
    // Simulate payment processing
    setTimeout(() => {
      // Update the pay statement status
      setPayStatements(prevStatements => 
        prevStatements.map(statement => 
          statement.id === selectedStatement.id 
            ? { ...statement, status: 'paid' } 
            : statement
        )
      )
      
      setIsProcessing(false)
      setSelectedStatement(null)
      
      // Show success message
      alert(`Payment of ${formatCurrency(selectedStatement.netPay)} sent to ${selectedStatement.driverName} successfully!`)
    }, 2000)
  }

  // Filter pay statements
  const filteredStatements = payStatements.filter(statement => {
    // Filter by status
    if (filter !== 'all' && statement.status !== filter) {
      return false
    }
    
    // Filter by search term
    if (searchTerm && !statement.driverName.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }
    
    return true
  })

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Payment Management</h1>
      
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center space-x-4">
          <div>
            <label htmlFor="filter" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Status
            </label>
            <select
              id="filter"
              className="input"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Statements</option>
              <option value="draft">Draft</option>
              <option value="pending">Pending Payment</option>
              <option value="paid">Paid</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search by Driver
            </label>
            <input
              type="text"
              id="search"
              className="input"
              placeholder="Driver name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 rounded-full bg-yellow-400 mr-1"></span>
            <span className="text-sm text-gray-600">Pending</span>
          </div>
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-1"></span>
            <span className="text-sm text-gray-600">Paid</span>
          </div>
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 rounded-full bg-gray-300 mr-1"></span>
            <span className="text-sm text-gray-600">Draft</span>
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pay Statements List */}
          <div className="card overflow-hidden">
            <h2 className="text-xl font-semibold mb-6">Pay Statements</h2>
            
            {filteredStatements.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No pay statements found matching your criteria.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredStatements.map((statement) => (
                      <tr key={statement.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{statement.driverName}</div>
                          <div className="text-sm text-gray-500">Generated: {formatDate(statement.generatedDate)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(statement.periodStart)} - {formatDate(statement.periodEnd)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{formatCurrency(statement.netPay)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            statement.status === 'paid' 
                              ? 'bg-green-100 text-green-800' 
                              : statement.status === 'finalized' 
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                          }`}>
                            {statement.status === 'paid' ? 'Paid' : statement.status === 'finalized' ? 'Pending' : 'Draft'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {statement.status !== 'paid' && (
                            <button
                              type="button"
                              className="text-primary hover:text-primary-dark font-medium"
                              onClick={() => setSelectedStatement(statement)}
                              disabled={statement.status === 'draft'}
                            >
                              Pay Now
                            </button>
                          )}
                          {statement.status === 'paid' && (
                            <span className="text-gray-500">Paid on {formatDate(statement.generatedDate)}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          {/* Payment Form */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-6">Make Payment</h2>
            
            {!selectedStatement ? (
              <div className="text-center py-12 text-gray-500">
                <div className="flex justify-center mb-4">
                  <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <p>Select a pay statement to process payment.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <h3 className="font-medium text-gray-700 mb-2">Payment Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Driver</p>
                      <p className="font-medium">{selectedStatement.driverName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Amount</p>
                      <p className="font-medium text-lg text-primary">{formatCurrency(selectedStatement.netPay)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Pay Period</p>
                      <p className="font-medium">{formatDate(selectedStatement.periodStart)} - {formatDate(selectedStatement.periodEnd)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Generated On</p>
                      <p className="font-medium">{formatDate(selectedStatement.generatedDate)}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="flex border-b border-gray-200">
                    <button
                      type="button"
                      className={`py-2 px-4 font-medium text-sm focus:outline-none ${
                        paymentMethod === 'zelle' 
                          ? 'text-primary border-b-2 border-primary' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                      onClick={() => handlePaymentMethodChange('zelle')}
                    >
                      Pay with Zelle
                    </button>
                    <button
                      type="button"
                      className={`py-2 px-4 font-medium text-sm focus:outline-none ${
                        paymentMethod === 'bank' 
                          ? 'text-primary border-b-2 border-primary' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                      onClick={() => handlePaymentMethodChange('bank')}
                    >
                      Direct Bank Transfer
                    </button>
                  </div>
                  
                  <div className="mt-4">
                    {paymentMethod === 'zelle' ? (
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address
                          </label>
                          <input
                            type="email"
                            id="email"
                            className="input w-full"
                            value={paymentDetails.email}
                            onChange={(e) => setPaymentDetails({...paymentDetails, email: e.target.value})}
                            placeholder="driver@example.com"
                          />
                        </div>
                        <div>
                          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number (Optional)
                          </label>
                          <input
                            type="tel"
                            id="phone"
                            className="input w-full"
                            value={paymentDetails.phone}
                            onChange={(e) => setPaymentDetails({...paymentDetails, phone: e.target.value})}
                            placeholder="555-123-4567"
                          />
                        </div>
                        <div className="bg-blue-50 p-4 rounded-md">
                          <div className="flex items-start">
                            <div className="flex-shrink-0">
                              <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm text-blue-700">
                                Zelle payments are typically processed within minutes. The driver will receive a notification when the payment is sent.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700 mb-1">
                            Account Number
                          </label>
                          <input
                            type="text"
                            id="accountNumber"
                            className="input w-full"
                            value={paymentDetails.accountNumber}
                            onChange={(e) => setPaymentDetails({...paymentDetails, accountNumber: e.target.value})}
                            placeholder="****6789"
                          />
                        </div>
                        <div>
                          <label htmlFor="routingNumber" className="block text-sm font-medium text-gray-700 mb-1">
                            Routing Number
                          </label>
                          <input
                            type="text"
                            id="routingNumber"
                            className="input w-full"
                            value={paymentDetails.routingNumber}
                            onChange={(e) => setPaymentDetails({...paymentDetails, routingNumber: e.target.value})}
                            placeholder="****1234"
                          />
                        </div>
                        <div>
                          <label htmlFor="bankName" className="block text-sm font-medium text-gray-700 mb-1">
                            Bank Name
                          </label>
                          <input
                            type="text"
                            id="bankName"
                            className="input w-full"
                            value={paymentDetails.bankName}
                            onChange={(e) => setPaymentDetails({...paymentDetails, bankName: e.target.value})}
                            placeholder="Chase Bank"
                          />
                        </div>
                        <div className="bg-blue-50 p-4 rounded-md">
                          <div className="flex items-start">
                            <div className="flex-shrink-0">
                              <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm text-blue-700">
                                Bank transfers typically take 1-3 business days to process. The driver will be notified once the payment is initiated.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setSelectedStatement(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={handlePaymentSubmit}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      `Send ${formatCurrency(selectedStatement.netPay)}`
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
