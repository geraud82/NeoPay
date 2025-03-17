import { Trip as TripType } from '@/types/trip';

// Export the Trip type
export type Trip = TripType;

// Mock data for trips
const mockTrips: Trip[] = [
  {
    id: 1,
    companyId: 1,
    driverId: 1,
    loadId: 1,
    driverName: 'John Doe',
    driverType: 'company',
    date: '2025-03-15',
    origin: 'New York, NY',
    destination: 'Boston, MA',
    distance: 215,
    rate: 0.55,
    rateType: 'per_mile',
    hoursWorked: undefined,
    amount: 118.25,
    status: 'completed'
  },
  {
    id: 2,
    companyId: 1,
    driverId: 2,
    loadId: 2,
    driverName: 'Jane Smith',
    driverType: 'owner',
    date: '2025-03-14',
    origin: 'Chicago, IL',
    destination: 'Detroit, MI',
    distance: 283,
    rate: 75,
    rateType: 'percentage',
    hoursWorked: undefined,
    amount: 424.50,
    status: 'completed'
  },
  {
    id: 3,
    companyId: 1,
    driverId: 1,
    loadId: 3,
    driverName: 'John Doe',
    driverType: 'company',
    date: '2025-03-13',
    origin: 'Boston, MA',
    destination: 'Philadelphia, PA',
    distance: 306,
    rate: 0.55,
    rateType: 'per_mile',
    hoursWorked: undefined,
    amount: 168.30,
    status: 'completed'
  },
  {
    id: 4,
    companyId: 1,
    driverId: 3,
    loadId: 4,
    driverName: 'Bob Johnson',
    driverType: 'company',
    date: '2025-03-12',
    origin: 'Dallas, TX',
    destination: 'Houston, TX',
    distance: 239,
    rate: 0.50,
    rateType: 'per_mile',
    hoursWorked: undefined,
    amount: 119.50,
    status: 'completed'
  }
];

// Fetch all trips for a company
export async function fetchCompanyTrips(companyId: number): Promise<Trip[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return mockTrips.filter(trip => trip.companyId === companyId);
}

// Fetch trips for a specific driver
export async function fetchDriverTrips(companyId: number, driverId: number): Promise<Trip[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return mockTrips.filter(trip => trip.companyId === companyId && trip.driverId === driverId);
}

// Fetch trips for a specific date range
export async function fetchTripsByDateRange(companyId: number, startDate: string, endDate: string): Promise<Trip[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return mockTrips.filter(trip => {
    return trip.companyId === companyId && 
           trip.date >= startDate && 
           trip.date <= endDate;
  });
}

// Fetch a specific trip by ID
export async function fetchTrip(id: number): Promise<Trip | null> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const trip = mockTrips.find(trip => trip.id === id);
  return trip || null;
}

// Create a new trip
export async function createTrip(tripData: Omit<Trip, 'id'>): Promise<{ data: Trip | null, error: any }> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  try {
    const newTrip: Trip = {
      id: mockTrips.length + 1,
      ...tripData,
      amount: calculateTripAmount(
        tripData.distance, 
        tripData.rate, 
        tripData.rateType, 
        tripData.hoursWorked
      )
    };
    
    // In a real implementation, we would add the trip to the database
    // For this mock, we'll just return the new trip
    return {
      data: newTrip,
      error: null
    };
  } catch (error) {
    return {
      data: null,
      error
    };
  }
}

// Update an existing trip
export async function updateTrip(id: number, tripData: Partial<Trip>): Promise<{ data: Trip | null, error: any }> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  try {
    const tripIndex = mockTrips.findIndex(trip => trip.id === id);
    
    if (tripIndex === -1) {
      throw new Error('Trip not found');
    }
    
    const updatedTrip = { ...mockTrips[tripIndex], ...tripData };
    
    // Recalculate amount if relevant fields were updated
    if (
      tripData.distance !== undefined || 
      tripData.rate !== undefined || 
      tripData.rateType !== undefined || 
      tripData.hoursWorked !== undefined
    ) {
      updatedTrip.amount = calculateTripAmount(
        updatedTrip.distance, 
        updatedTrip.rate, 
        updatedTrip.rateType, 
        updatedTrip.hoursWorked
      );
    }
    
    // In a real implementation, we would update the trip in the database
    // For this mock, we'll just return the updated trip
    return {
      data: updatedTrip,
      error: null
    };
  } catch (error) {
    return {
      data: null,
      error
    };
  }
}

// Delete a trip
export async function deleteTrip(id: number): Promise<{ success: boolean, error: any }> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  try {
    const tripIndex = mockTrips.findIndex(trip => trip.id === id);
    
    if (tripIndex === -1) {
      throw new Error('Trip not found');
    }
    
    // In a real implementation, we would delete the trip from the database
    // For this mock, we'll just return success
    return {
      success: true,
      error: null
    };
  } catch (error) {
    return {
      success: false,
      error
    };
  }
}

// Calculate trip amount based on rate type
export function calculateTripAmount(distance: number, rate: number, rateType: string, hoursWorked?: number | null): number {
  if (rateType === 'per_mile') {
    return parseFloat((distance * rate).toFixed(2));
  } else if (rateType === 'percentage') {
    // For percentage rate type, assume a base trip value of $2 per mile
    const tripValue = distance * 2;
    return parseFloat((tripValue * (rate / 100)).toFixed(2));
  } else if (rateType === 'hourly' && hoursWorked) {
    return parseFloat((hoursWorked * rate).toFixed(2));
  } else if (rateType === 'fixed') {
    return rate;
  }
  
  return 0;
}

// Get trip statistics for a driver
export async function getDriverTripStats(companyId: number, driverId: number): Promise<any> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const driverTrips = mockTrips.filter(trip => trip.companyId === companyId && trip.driverId === driverId);
  
  const totalTrips = driverTrips.length;
  const totalMiles = driverTrips.reduce((sum, trip) => sum + trip.distance, 0);
  const totalEarnings = driverTrips.reduce((sum, trip) => sum + trip.amount, 0);
  const averageRate = totalMiles > 0 ? totalEarnings / totalMiles : 0;
  
  return {
    totalTrips,
    totalMiles,
    totalEarnings,
    averageRate
  };
}

// Fetch all trips
export async function fetchTrips(): Promise<{ data: Trip[], error: any }> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  try {
    return {
      data: mockTrips,
      error: null
    };
  } catch (error) {
    return {
      data: [],
      error
    };
  }
}

// Get trip statistics for a company
export async function getCompanyTripStats(companyId: number): Promise<any> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const companyTrips = mockTrips.filter(trip => trip.companyId === companyId);
  
  const totalTrips = companyTrips.length;
  const totalMiles = companyTrips.reduce((sum, trip) => sum + trip.distance, 0);
  const totalEarnings = companyTrips.reduce((sum, trip) => sum + trip.amount, 0);
  
  // Get unique driver count
  const uniqueDrivers = new Set(companyTrips.map(trip => trip.driverId)).size;
  
  return {
    totalTrips,
    totalMiles,
    totalEarnings,
    uniqueDrivers
  };
}
