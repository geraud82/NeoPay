'use client'

import React, { useState, useEffect } from 'react'
import { PayStatement, Deduction } from '@/types/payStatement'
import { Trip } from '@/types/trip'
import { Expense } from '@/types/expense'
import { CashAdvance } from '@/types/cashAdvance'
import { Driver } from '@/types/driver'
import { fetchCompanyDrivers } from '@/utils/drivers'
import { 
  fetchDriverTrips, 
  fetchDriverExpenses, 
  fetchDriverCashAdvances, 
  fetchDriverDeductions,
  generatePayStatementData,
  savePayStatement
} from '@/utils/payStatements'

// Mock data for generated pay statements
const MOCK_PAY_STATEMENTS: PayStatement[] = [
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
    tripTotal: 2470.00,
    expenseTotal: 214.00,
    cashAdvanceTotal: 200.00,
    grossPay: 2470.00,
    taxWithholding: 0,
    deductionsTotal: 0,
    netPay: 2056.00,
    generatedDate: '2025-02-16',
    status: 'paid',
    deductions: []
  },
  {
    id: 2,
    companyId: 1,
    driverId: 1,
    driverName: 'John Doe',
    periodStart: '2025-02-16',
    periodEnd: '2025-02-28',
    trips: [],
    expenses: [],
    cashAdvances: [],
    tripTotal: 2210.50,
    expenseTotal: 175.25,
    cashAdvanceTotal: 0,
    grossPay: 2210.50,
    taxWithholding: 0,
    deductionsTotal: 0,
    netPay: 2035.25,
    generatedDate: '2025-03-01',
    status: 'finalized',
    deductions: []
  },
  {
    id: 3,
    companyId: 1,
    driverId: 2,
    driverName: 'Jane Smith',
    periodStart: '2025-02-01',
    periodEnd: '2025-02-15',
    trips: [],
    expenses: [],
    cashAdvances: [],
    tripTotal: 1950.75,
    expenseTotal: 142.30,
    cashAdvanceTotal: 100.00,
    grossPay: 1950.75,
    taxWithholding: 0,
    deductionsTotal: 0,
    netPay: 1708.45,
    generatedDate: '2025-02-16',
    status: 'paid',
    deductions: []
  }
];

export default function PayStatements() {
  // State for modals
  const [selectedStatement, setSelectedStatement] = useState<PayStatement | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState<boolean>(false);
  
  // State for form data
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    companyId: 1, // Default company ID
    driverId: 0,
    periodStart: '',
    periodEnd: '',
    taxWithholdingPercent: 15
  });
  
  // Fetch drivers on component mount
  useEffect(() => {
    async function loadDrivers() {
      try {
        const companyDrivers = await fetchCompanyDrivers(1); // Default company ID
        setDrivers(companyDrivers);
        
        // Set default driver if available
        if (companyDrivers.length > 0) {
          setFormData(prev => ({
            ...prev,
            driverId: companyDrivers[0].id
          }));
        }
      } catch (error) {
        console.error('Error loading drivers:', error);
      }
    }
    
    loadDrivers();
  }, []);
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };
  
  // Get status badge class
  const getStatusBadgeClass = (status?: 'draft' | 'finalized' | 'paid') => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'finalized':
        return 'bg-blue-100 text-blue-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Handle view statement
  const handleViewStatement = (statement: PayStatement) => {
    setSelectedStatement(statement);
    setIsModalOpen(true);
  };
  
  // Handle close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  
  // Handle open generate modal
  const handleOpenGenerateModal = () => {
    setIsGenerateModalOpen(true);
    
    // Set default dates for the form (current month)
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    setFormData(prev => ({
      ...prev,
      periodStart: firstDay.toISOString().split('T')[0],
      periodEnd: lastDay.toISOString().split('T')[0]
    }));
  };
  
  // Handle close generate modal
  const handleCloseGenerateModal = () => {
    setIsGenerateModalOpen(false);
  };
  
  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'driverId' || name === 'taxWithholdingPercent' ? parseInt(value) : value
    }));
  };
  
  // Handle generate pay statement
  const handleGeneratePayStatement = async () => {
    try {
      setLoading(true);
      
      // Validate form data
      if (!formData.driverId || !formData.periodStart || !formData.periodEnd) {
        alert('Please fill in all required fields');
        setLoading(false);
        return;
      }
      
      // Get selected driver
      const selectedDriver = drivers.find(d => d.id === formData.driverId);
      if (!selectedDriver) {
        alert('Please select a valid driver');
        setLoading(false);
        return;
      }
      
      // Fetch driver data for the period
      const [trips, expenses, cashAdvances, deductions] = await Promise.all([
        fetchDriverTrips(formData.companyId, formData.driverId, formData.periodStart, formData.periodEnd),
        fetchDriverExpenses(formData.companyId, formData.driverId, formData.periodStart, formData.periodEnd),
        fetchDriverCashAdvances(formData.companyId, formData.driverId, formData.periodStart, formData.periodEnd),
        fetchDriverDeductions(formData.companyId, formData.driverId, formData.periodStart, formData.periodEnd)
      ]);
      
      // Generate pay statement data
      const payStatementData = generatePayStatementData(
        formData.companyId,
        formData.driverId,
        selectedDriver.name,
        formData.periodStart,
        formData.periodEnd,
        trips,
        expenses,
        cashAdvances,
        deductions,
        formData.taxWithholdingPercent
      );
      
      // Save pay statement
      const { payStatementId, error } = await savePayStatement(payStatementData);
      
      if (error) {
        throw error;
      }
      
      // Close modal and reset form
      setIsGenerateModalOpen(false);
      setLoading(false);
      
      // Show success message
      alert(`Pay statement generated successfully with ID: ${payStatementId}`);
      
      // Refresh the page to show the new pay statement
      window.location.reload();
      
    } catch (error) {
      console.error('Error generating pay statement:', error);
      alert('Error generating pay statement. Please try again.');
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Pay Statements</h1>
        <button
          onClick={handleOpenGenerateModal}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Generate Pay Statement
        </button>
      </div>
      
      {/* Pay Statement List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {MOCK_PAY_STATEMENTS.map((statement) => (
            <li key={statement.id}>
              <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 cursor-pointer" onClick={() => handleViewStatement(statement)}>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-indigo-600 truncate">
                    {statement.driverName}
                  </p>
                  <div className="ml-2 flex-shrink-0 flex">
                    <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(statement.status)}`}>
                      {statement.status}
                    </p>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500">
                      <span>Period: {formatDate(statement.periodStart)} - {formatDate(statement.periodEnd)}</span>
                    </p>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                    <p>
                      <span className="font-medium text-gray-900">{formatCurrency(statement.netPay)}</span>
                    </p>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      
      {/* Pay Statement Modal */}
      {isModalOpen && selectedStatement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-green-800 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Pay Statement Preview
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-white hover:text-gray-200 focus:outline-none"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-4rem)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Pay Statement Details</h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Driver:</span>
                      <span className="font-medium text-gray-900">{selectedStatement.driverName}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Period:</span>
                      <span className="font-medium text-gray-900">
                        {formatDate(selectedStatement.periodStart)} - {formatDate(selectedStatement.periodEnd)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(selectedStatement.status)}`}>
                        {selectedStatement.status}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Generated:</span>
                      <span className="font-medium text-gray-900">{formatDate(selectedStatement.generatedDate)}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-medium text-gray-900 mt-6 mb-4">Earnings & Deductions</h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Trip Earnings:</span>
                      <span className="font-medium text-green-600">{formatCurrency(selectedStatement.tripTotal)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Expenses:</span>
                      <span className="font-medium text-red-600">-{formatCurrency(selectedStatement.expenseTotal)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cash Advances:</span>
                      <span className="font-medium text-red-600">-{formatCurrency(selectedStatement.cashAdvanceTotal)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax Withholding:</span>
                      <span className="font-medium text-red-600">-{formatCurrency(selectedStatement.taxWithholding)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Other Deductions:</span>
                      <span className="font-medium text-red-600">-{formatCurrency(selectedStatement.deductionsTotal)}</span>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-3 mt-3 flex justify-between">
                      <span className="font-medium text-gray-900">Net Pay:</span>
                      <span className="font-bold text-indigo-600">{formatCurrency(selectedStatement.netPay)}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="border border-gray-200 rounded-lg overflow-hidden h-[400px] flex items-center justify-center">
                    <div className="text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">PDF Preview</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        PDF preview would be shown here.
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex space-x-3">
                    <button
                      onClick={() => alert('Download PDF')}
                      className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download PDF
                    </button>
                    
                    <button
                      onClick={() => alert('Share via WhatsApp')}
                      className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      WhatsApp
                    </button>
                    
                    <button
                      onClick={() => alert('Share via Email')}
                      className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Email
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Generate Pay Statement Modal */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Generate Pay Statement
              </h2>
              <button
                onClick={handleCloseGenerateModal}
                className="text-white hover:text-gray-200 focus:outline-none"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-4rem)]">
              <form className="space-y-6">
                <div>
                  <label htmlFor="driverId" className="block text-sm font-medium text-gray-700">
                    Driver <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="driverId"
                    name="driverId"
                    value={formData.driverId}
                    onChange={handleInputChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    required
                  >
                    <option value="">Select a driver</option>
                    {drivers.map(driver => (
                      <option key={driver.id} value={driver.id}>
                        {driver.name} ({driver.type === 'company' ? 'Company Driver' : 'Owner Operator'})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="periodStart" className="block text-sm font-medium text-gray-700">
                      Period Start <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="periodStart"
                      name="periodStart"
                      value={formData.periodStart}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="periodEnd" className="block text-sm font-medium text-gray-700">
                      Period End <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="periodEnd"
                      name="periodEnd"
                      value={formData.periodEnd}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="taxWithholdingPercent" className="block text-sm font-medium text-gray-700">
                    Tax Withholding Percentage
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type="number"
                      id="taxWithholdingPercent"
                      name="taxWithholdingPercent"
                      value={formData.taxWithholdingPercent}
                      onChange={handleInputChange}
                      min="0"
                      max="100"
                      className="block w-full pr-12 border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">%</span>
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Default tax withholding percentage is based on driver's settings.
                  </p>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={handleCloseGenerateModal}
                      className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleGeneratePayStatement}
                      disabled={loading}
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        'Generate Pay Statement'
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
