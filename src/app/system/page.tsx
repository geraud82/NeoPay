'use client'

import React, { useState } from 'react'

interface SystemSettings {
  maintenanceMode: boolean
  debugMode: boolean
  logLevel: 'error' | 'warning' | 'info' | 'debug'
  backupFrequency: 'daily' | 'weekly' | 'monthly'
  maxUploadSize: number
  allowedFileTypes: string
  apiRateLimit: number
}

export default function SystemSettings() {
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  
  const [settings, setSettings] = useState<SystemSettings>({
    maintenanceMode: false,
    debugMode: false,
    logLevel: 'info',
    backupFrequency: 'daily',
    maxUploadSize: 10,
    allowedFileTypes: '.jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx',
    apiRateLimit: 100
  })
  
  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined
    
    setSettings({
      ...settings,
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
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false)
      }, 3000)
    }, 1000)
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">System Settings</h1>
          <p className="text-gray-600">Configure system-wide settings and preferences</p>
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
      
      <div className="space-y-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">System Status</h2>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="maintenanceMode"
                    name="maintenanceMode"
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    checked={settings.maintenanceMode}
                    onChange={handleSettingsChange}
                  />
                  <label htmlFor="maintenanceMode" className="ml-2 block text-sm text-gray-700">
                    Maintenance Mode
                  </label>
                </div>
                <p className="text-sm text-gray-500 ml-6 mb-4">
                  When enabled, only administrators can access the system
                </p>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="debugMode"
                    name="debugMode"
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    checked={settings.debugMode}
                    onChange={handleSettingsChange}
                  />
                  <label htmlFor="debugMode" className="ml-2 block text-sm text-gray-700">
                    Debug Mode
                  </label>
                </div>
                <p className="text-sm text-gray-500 ml-6">
                  Enable detailed error messages and logging
                </p>
              </div>
              
              <div>
                <label htmlFor="logLevel" className="block text-sm font-medium text-gray-700 mb-1">
                  Log Level
                </label>
                <select
                  id="logLevel"
                  name="logLevel"
                  className="input w-full"
                  value={settings.logLevel}
                  onChange={handleSettingsChange}
                >
                  <option value="error">Error</option>
                  <option value="warning">Warning</option>
                  <option value="info">Info</option>
                  <option value="debug">Debug</option>
                </select>
                <p className="mt-1 text-sm text-gray-500">
                  Determines the verbosity of system logs
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Backup & Recovery</h2>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="mb-4">
              <label htmlFor="backupFrequency" className="block text-sm font-medium text-gray-700 mb-1">
                Automatic Backup Frequency
              </label>
              <select
                id="backupFrequency"
                name="backupFrequency"
                className="input w-full max-w-xs"
                value={settings.backupFrequency}
                onChange={handleSettingsChange}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
              <p className="mt-1 text-sm text-gray-500">
                How often the system will automatically create backups
              </p>
            </div>
            
            <div className="flex justify-start mt-4 space-x-4">
              <button className="btn-secondary text-sm">
                Create Manual Backup
              </button>
              <button className="text-primary hover:text-blue-700 text-sm">
                View Backup History
              </button>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">File Uploads</h2>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="maxUploadSize" className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Upload Size (MB)
                </label>
                <input
                  type="number"
                  id="maxUploadSize"
                  name="maxUploadSize"
                  className="input w-full"
                  value={settings.maxUploadSize}
                  onChange={handleSettingsChange}
                  min="1"
                  max="100"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Maximum file size allowed for uploads
                </p>
              </div>
              
              <div>
                <label htmlFor="allowedFileTypes" className="block text-sm font-medium text-gray-700 mb-1">
                  Allowed File Types
                </label>
                <input
                  type="text"
                  id="allowedFileTypes"
                  name="allowedFileTypes"
                  className="input w-full"
                  value={settings.allowedFileTypes}
                  onChange={handleSettingsChange}
                />
                <p className="mt-1 text-sm text-gray-500">
                  Comma-separated list of allowed file extensions
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">API Settings</h2>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div>
              <label htmlFor="apiRateLimit" className="block text-sm font-medium text-gray-700 mb-1">
                API Rate Limit (requests per minute)
              </label>
              <input
                type="number"
                id="apiRateLimit"
                name="apiRateLimit"
                className="input w-full max-w-xs"
                value={settings.apiRateLimit}
                onChange={handleSettingsChange}
                min="10"
                max="1000"
                step="10"
              />
              <p className="mt-1 text-sm text-gray-500">
                Maximum number of API requests allowed per minute per user
              </p>
            </div>
            
            <div className="mt-4">
              <button className="text-primary hover:text-blue-700 text-sm">
                Manage API Keys
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
