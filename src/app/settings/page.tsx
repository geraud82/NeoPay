'use client'

import React, { useState, useEffect } from 'react'

interface PaymentSettings {
  defaultPaymentMethod: string
  paymentSchedule: string
  automaticPayments: boolean
  paymentNotifications: boolean
  minimumPaymentThreshold: number
}

interface AISettings {
  enableAIAssistance: boolean
  dataSharing: boolean
  receiptAnalysisAccuracy: 'standard' | 'high' | 'maximum'
  languageModel: 'standard' | 'advanced'
  autoGenerateReports: boolean
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState('payment')
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    defaultPaymentMethod: 'direct_deposit',
    paymentSchedule: 'bi_weekly',
    automaticPayments: true,
    paymentNotifications: true,
    minimumPaymentThreshold: 50,
  })
  
  const [aiSettings, setAISettings] = useState<AISettings>({
    enableAIAssistance: true,
    dataSharing: false,
    receiptAnalysisAccuracy: 'high',
    languageModel: 'standard',
    autoGenerateReports: true,
  })
  
  // Reset success message after 3 seconds
  useEffect(() => {
    if (saveSuccess) {
      const timer = setTimeout(() => {
        setSaveSuccess(false)
      }, 3000)
      
      return () => clearTimeout(timer)
    }
  }, [saveSuccess])
  
  const handlePaymentSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined
    
    setPaymentSettings({
      ...paymentSettings,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
    })
  }
  
  const handleAISettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined
    
    setAISettings({
      ...aiSettings,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
    })
  }
  
  const handleSaveSettings = () => {
    // In a real app, this would save to the database
    setIsSaving(true)
    
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false)
      setSaveSuccess(true)
    }, 1000)
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-gray-600">Configure your account and application preferences</p>
        </div>
        
        <div className="flex items-center">
          {saveSuccess && (
            <div className="mr-4 text-green-600 flex items-center">
              <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Settings saved!</span>
            </div>
          )}
          
          <button
            className="btn-primary flex items-center"
            onClick={handleSaveSettings}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto">
            <button
              className={`py-4 px-6 font-medium text-sm whitespace-nowrap ${
                activeTab === 'payment'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('payment')}
            >
              Payment Preferences
            </button>
            <button
              className={`py-4 px-6 font-medium text-sm whitespace-nowrap ${
                activeTab === 'ai'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('ai')}
            >
              AI Settings
            </button>
            <button
              className={`py-4 px-6 font-medium text-sm whitespace-nowrap ${
                activeTab === 'notifications'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('notifications')}
            >
              Notifications
            </button>
            <button
              className={`py-4 px-6 font-medium text-sm whitespace-nowrap ${
                activeTab === 'security'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('security')}
            >
              Security
            </button>
          </nav>
        </div>
        
        <div className="p-6">
          {/* Payment Settings */}
          {activeTab === 'payment' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Payment Methods</h2>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="defaultPaymentMethod" className="block text-sm font-medium text-gray-700 mb-1">
                        Default Payment Method
                      </label>
                      <select
                        id="defaultPaymentMethod"
                        name="defaultPaymentMethod"
                        className="input w-full"
                        value={paymentSettings.defaultPaymentMethod}
                        onChange={handlePaymentSettingsChange}
                      >
                        <option value="direct_deposit">Direct Deposit</option>
                        <option value="check">Check</option>
                        <option value="paypal">PayPal</option>
                        <option value="venmo">Venmo</option>
                        <option value="zelle">Zelle</option>
                        <option value="cash_app">Cash App</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="paymentSchedule" className="block text-sm font-medium text-gray-700 mb-1">
                        Payment Schedule
                      </label>
                      <select
                        id="paymentSchedule"
                        name="paymentSchedule"
                        className="input w-full"
                        value={paymentSettings.paymentSchedule}
                        onChange={handlePaymentSettingsChange}
                      >
                        <option value="weekly">Weekly</option>
                        <option value="bi_weekly">Bi-Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="custom">Custom</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold mb-4">Payment Rules</h2>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="minimumPaymentThreshold" className="block text-sm font-medium text-gray-700 mb-1">
                        Minimum Payment Threshold ($)
                      </label>
                      <input
                        type="number"
                        id="minimumPaymentThreshold"
                        name="minimumPaymentThreshold"
                        className="input w-full"
                        value={paymentSettings.minimumPaymentThreshold}
                        onChange={handlePaymentSettingsChange}
                        min="0"
                        step="10"
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        Payments will only be processed when they exceed this amount
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex items-center mb-4">
                        <input
                          type="checkbox"
                          id="automaticPayments"
                          name="automaticPayments"
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                          checked={paymentSettings.automaticPayments}
                          onChange={handlePaymentSettingsChange}
                        />
                        <label htmlFor="automaticPayments" className="ml-2 block text-sm text-gray-700">
                          Enable automatic payments
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="paymentNotifications"
                          name="paymentNotifications"
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                          checked={paymentSettings.paymentNotifications}
                          onChange={handlePaymentSettingsChange}
                        />
                        <label htmlFor="paymentNotifications" className="ml-2 block text-sm text-gray-700">
                          Receive payment notifications
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* AI Settings */}
          {activeTab === 'ai' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">AI Features</h2>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="mb-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="enableAIAssistance"
                        name="enableAIAssistance"
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                        checked={aiSettings.enableAIAssistance}
                        onChange={handleAISettingsChange}
                      />
                      <label htmlFor="enableAIAssistance" className="ml-2 block text-sm text-gray-700">
                        Enable AI assistance
                      </label>
                    </div>
                    <p className="mt-1 text-sm text-gray-500 ml-6">
                      AI will help with receipt analysis, expense categorization, and pay statement generation
                    </p>
                  </div>
                  
                  {aiSettings.enableAIAssistance && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                      <div>
                        <label htmlFor="receiptAnalysisAccuracy" className="block text-sm font-medium text-gray-700 mb-1">
                          Receipt Analysis Accuracy
                        </label>
                        <select
                          id="receiptAnalysisAccuracy"
                          name="receiptAnalysisAccuracy"
                          className="input w-full"
                          value={aiSettings.receiptAnalysisAccuracy}
                          onChange={handleAISettingsChange}
                        >
                          <option value="standard">Standard</option>
                          <option value="high">High</option>
                          <option value="maximum">Maximum</option>
                        </select>
                        <p className="mt-1 text-sm text-gray-500">
                          Higher accuracy may take longer to process
                        </p>
                      </div>
                      
                      <div>
                        <label htmlFor="languageModel" className="block text-sm font-medium text-gray-700 mb-1">
                          Language Model
                        </label>
                        <select
                          id="languageModel"
                          name="languageModel"
                          className="input w-full"
                          value={aiSettings.languageModel}
                          onChange={handleAISettingsChange}
                        >
                          <option value="standard">Standard</option>
                          <option value="advanced">Advanced</option>
                        </select>
                        <p className="mt-1 text-sm text-gray-500">
                          Advanced models provide more detailed analysis but may be slower
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold mb-4">AI Automation</h2>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      id="autoGenerateReports"
                      name="autoGenerateReports"
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      checked={aiSettings.autoGenerateReports}
                      onChange={handleAISettingsChange}
                    />
                    <label htmlFor="autoGenerateReports" className="ml-2 block text-sm text-gray-700">
                      Automatically generate reports
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="dataSharing"
                      name="dataSharing"
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      checked={aiSettings.dataSharing}
                      onChange={handleAISettingsChange}
                    />
                    <label htmlFor="dataSharing" className="ml-2 block text-sm text-gray-700">
                      Share anonymized data to improve AI models
                    </label>
                  </div>
                  <p className="mt-1 text-sm text-gray-500 ml-6">
                    Your data will be anonymized and used only for improving our AI models
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <div className="p-6 text-center">
              <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-1">Notification Settings</h3>
              <p className="text-gray-500 mb-4">Configure how and when you receive notifications</p>
              <p className="text-primary">Coming soon!</p>
            </div>
          )}
          
          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="p-6 text-center">
              <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-1">Security Settings</h3>
              <p className="text-gray-500 mb-4">Manage your account security and privacy</p>
              <p className="text-primary">Coming soon!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
