'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { fetchDriverTrips, fetchCompanyTrips } from '@/utils/trips'

export default function Dashboard() {
  const router = useRouter()
  const { user } = useAuth()
  const userRole = user?.user_metadata?.role || 'admin'
  
  // Get current date for welcome message
  const today = new Date()
  const formattedDate = today.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
  
  // Mock data for the dashboard
  const stats = [
    { 
      name: 'Total Drivers', 
      value: '24', 
      change: '+2 this month',
      trend: 'up',
      icon: (
        <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      path: '/drivers'
    },
    { 
      name: 'Active Trips', 
      value: '12', 
      change: '+3 this week',
      trend: 'up',
      icon: (
        <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      ),
      path: '/trips'
    },
    { 
      name: 'Total Payments', 
      value: '$12,456.78', 
      change: '+$2,345 this month',
      trend: 'up',
      icon: (
        <svg className="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      path: '/payments'
    },
    { 
      name: 'Pending Payments', 
      value: '$2,345.67', 
      change: '-$567 from last week',
      trend: 'down',
      icon: (
        <svg className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      path: '/payments'
    },
  ]
  
  const recentPayments = [
    { id: 1, driver: 'John Doe', amount: '$345.67', date: '2025-03-05', status: 'Paid' },
    { id: 2, driver: 'Jane Smith', amount: '$567.89', date: '2025-03-04', status: 'Paid' },
    { id: 3, driver: 'Mike Johnson', amount: '$234.56', date: '2025-03-03', status: 'Paid' },
    { id: 4, driver: 'Sarah Williams', amount: '$678.90', date: '2025-03-02', status: 'Pending' },
    { id: 5, driver: 'David Brown', amount: '$456.78', date: '2025-03-01', status: 'Pending' },
  ]
  
  const recentExpenses = [
    { id: 1, driver: 'John Doe', category: 'Fuel', amount: '$78.45', date: '2025-03-05' },
    { id: 2, driver: 'Jane Smith', category: 'Maintenance', amount: '$234.56', date: '2025-03-04' },
    { id: 3, driver: 'Mike Johnson', category: 'Fuel', amount: '$65.43', date: '2025-03-03' },
    { id: 4, driver: 'Sarah Williams', category: 'Tolls', amount: '$23.45', date: '2025-03-02' },
    { id: 5, driver: 'David Brown', category: 'Parking', amount: '$12.34', date: '2025-03-01' },
  ]
  
  const recentTrips = [
    { id: 1, driver: 'John Doe', origin: 'New York, NY', destination: 'Boston, MA', distance: '215 mi', date: '2025-03-05' },
    { id: 2, driver: 'Jane Smith', origin: 'Chicago, IL', destination: 'Detroit, MI', distance: '283 mi', date: '2025-03-04' },
    { id: 3, driver: 'Mike Johnson', origin: 'Los Angeles, CA', destination: 'San Diego, CA', distance: '120 mi', date: '2025-03-03' },
    { id: 4, driver: 'Sarah Williams', origin: 'Dallas, TX', destination: 'Houston, TX', distance: '239 mi', date: '2025-03-02' },
  ]
  
  // Quick actions based on user role
  const quickActions = [
    { 
      name: 'Add New Driver', 
      description: 'Register a new driver in the system',
      icon: (
        <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      ),
      path: '/drivers',
      color: 'from-blue-500 to-blue-700',
      roles: ['admin', 'manager']
    },
    { 
      name: 'Record Trip', 
      description: 'View current week trip record',
      icon: (
        <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      ),
      path: '/trips',
      color: 'from-green-500 to-green-700',
      roles: ['admin', 'manager', 'driver', 'owner', 'operator']
    },
    { 
      name: 'Process Payment', 
      description: 'Process a payment for a driver',
      icon: (
        <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      path: '/payments',
      color: 'from-indigo-500 to-indigo-700',
      roles: ['admin', 'manager']
    },
    { 
      name: 'Upload Receipt', 
      description: 'Upload a receipt for an expense',
      icon: (
        <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      ),
      path: '/receipts',
      color: 'from-yellow-500 to-yellow-700',
      roles: ['admin', 'manager', 'driver', 'owner', 'operator']
    },
  ].filter(action => {
    // For company drivers and owner operators, only show upload receipt and record trip
    if (['driver', 'owner', 'operator'].includes(userRole)) {
      return ['Upload Receipt', 'Record Trip'].includes(action.name);
    }
    return action.roles.includes(userRole);
  });
  
  // Handle row click for tables
  const handlePaymentRowClick = (paymentId: number) => {
    router.push(`/payments?id=${paymentId}`);
  };
  
  const handleExpenseRowClick = (expenseId: number) => {
    router.push(`/receipts?id=${expenseId}`);
  };
  
  const handleTripRowClick = (tripId: number) => {
    router.push(`/trips?id=${tripId}`);
  };
  
  // Function to fetch driver's own trips
  const [driverTrips, setDriverTrips] = React.useState<any[]>([]);
  const [isLoadingTrips, setIsLoadingTrips] = React.useState(true);

  React.useEffect(() => {
    const fetchDriverTripsData = async () => {
      if (user?.id) {
        setIsLoadingTrips(true);
        try {
          // Get the driver ID and company ID from user metadata
          const driverId = user.user_metadata?.driverId;
          const companyId = user.user_metadata?.companyId || 1; // Default to company ID 1 if not specified
          
          if (driverId && ['driver', 'owner', 'operator'].includes(userRole)) {
            const trips = await fetchDriverTrips(companyId, driverId);
            setDriverTrips(trips || []);
          } else if (['admin', 'manager'].includes(userRole)) {
            // For admin/manager, show company trips or mock data
            if (companyId) {
              const trips = await fetchCompanyTrips(companyId);
              setDriverTrips(trips.slice(0, 4) || []); // Only show first 4 trips
            } else {
              setDriverTrips(recentTrips);
            }
          } else {
            // Fallback to mock data
            setDriverTrips(recentTrips);
          }
        } catch (error) {
          console.error('Error fetching driver trips:', error);
          // Fallback to mock data
          setDriverTrips([]);
        } finally {
          setIsLoadingTrips(false);
        }
      }
    };

    fetchDriverTripsData();
  }, [user, userRole]);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border-l-4 border-primary">
        <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Welcome back!</h1>
        <p className="text-sm sm:text-base text-gray-600">{formattedDate}</p>
        <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
          {['driver', 'owner', 'operator'].includes(userRole) 
            ? "Here's your recent activity." 
            : "Here's what's happening with your fleet today."}
        </p>
      </div>
      
      {/* Quick Actions */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {quickActions.map((action, index) => (
            <div 
              key={index}
              className={`bg-gradient-to-r ${action.color} rounded-lg shadow-md p-3 sm:p-4 text-white cursor-pointer transform transition-transform hover:scale-105`}
              onClick={() => router.push(action.path)}
            >
              <div className="flex items-start">
                <div className="p-1.5 sm:p-2 bg-white bg-opacity-20 rounded-lg">
                  {action.icon}
                </div>
                <div className="ml-3 sm:ml-4">
                  <h3 className="text-sm sm:text-base font-bold">{action.name}</h3>
                  <p className="text-xs sm:text-sm text-white text-opacity-80">{action.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Stats Overview - Only show for admin and manager */}
      {!['driver', 'owner', 'operator'].includes(userRole) && (
        <div>
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-100 cursor-pointer transform transition-all hover:shadow-lg hover:border-primary"
                onClick={() => router.push(stat.path)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xs sm:text-sm font-medium text-gray-500">{stat.name}</h3>
                    <p className="text-xl sm:text-2xl font-bold mt-0.5 sm:mt-1">{stat.value}</p>
                    <p className={`text-xs mt-0.5 sm:mt-1 ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.trend === 'up' ? '↑' : '↓'} {stat.change}
                    </p>
                  </div>
                  <div className="p-2 sm:p-3 bg-gray-50 rounded-lg">
                    {stat.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Recent Activity - Only show relevant sections based on role */}
      {!['driver', 'owner', 'operator'].includes(userRole) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {/* Recent Payments */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-base sm:text-lg font-semibold">Recent Payments</h2>
              <Link href="/payments" className="text-primary text-sm font-medium hover:underline">
                View All
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentPayments.map((payment) => (
                    <tr 
                      key={payment.id} 
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handlePaymentRowClick(payment.id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{payment.driver}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.amount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${payment.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Recent Expenses */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-base sm:text-lg font-semibold">Recent Expenses</h2>
              <Link href="/receipts" className="text-primary text-sm font-medium hover:underline">
                View All
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentExpenses.map((expense) => (
                    <tr 
                      key={expense.id} 
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleExpenseRowClick(expense.id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{expense.driver}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${expense.category === 'Fuel' ? 'bg-blue-100 text-blue-800' : 
                            expense.category === 'Maintenance' ? 'bg-red-100 text-red-800' : 
                            expense.category === 'Tolls' ? 'bg-purple-100 text-purple-800' : 
                            'bg-gray-100 text-gray-800'}`}>
                          {expense.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{expense.amount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{expense.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      
      {/* Recent Trips */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 mb-6 sm:mb-8">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-base sm:text-lg font-semibold">Recent Trips</h2>
          <Link href="/trips" className="text-primary text-sm font-medium hover:underline">
            View All
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {!['driver', 'owner', 'operator'].includes(userRole) && (
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver</th>
                )}
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Origin</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destination</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distance</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoadingTrips ? (
                <tr>
                  <td colSpan={['driver', 'owner', 'operator'].includes(userRole) ? 4 : 5} className="px-6 py-4 text-center text-sm text-gray-500">
                    Loading trips...
                  </td>
                </tr>
              ) : (
                ((['driver', 'owner', 'operator'].includes(userRole) ? driverTrips : recentTrips) || []).map((trip) => (
                  <tr 
                    key={trip.id} 
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleTripRowClick(trip.id)}
                  >
                    {!['driver', 'owner', 'operator'].includes(userRole) && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{trip.driver}</td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{trip.origin}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{trip.destination}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{trip.distance}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{trip.date}</td>
                  </tr>
                ))
              )}
              {!isLoadingTrips && ((['driver', 'owner', 'operator'].includes(userRole) ? driverTrips : recentTrips) || []).length === 0 && (
                <tr>
                  <td colSpan={['driver', 'owner', 'operator'].includes(userRole) ? 4 : 5} className="px-6 py-4 text-center text-sm text-gray-500">
                    No trips found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Performance Metrics - Only show for admin and manager */}
      {!['driver', 'owner', 'operator'].includes(userRole) && (
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-100">
          <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Performance Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs sm:text-sm font-medium text-gray-600">Total Miles This Month</span>
                <span className="text-xs sm:text-sm font-medium">12,456 mi</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '85%' }}></div>
              </div>
              <p className="text-xs text-gray-500">85% of monthly target</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs sm:text-sm font-medium text-gray-600">Expense Ratio</span>
                <span className="text-xs sm:text-sm font-medium">23%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '23%' }}></div>
              </div>
              <p className="text-xs text-gray-500">7% below target</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs sm:text-sm font-medium text-gray-600">Driver Utilization</span>
                <span className="text-xs sm:text-sm font-medium">78%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-yellow-600 h-2.5 rounded-full" style={{ width: '78%' }}></div>
              </div>
              <p className="text-xs text-gray-500">2% below target</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
