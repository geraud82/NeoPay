import { supabase } from './supabase';
import { Trip } from '@/types/trip';

// Fetch all trips for a company
export async function fetchCompanyTrips(companyId: number): Promise<Trip[]> {
  try {
    const { data, error } = await supabase
      .from('trips')
      .select('*, driver:drivers(name, type)')
      .eq('company_id', companyId)
      .order('date', { ascending: false });
    
    if (error) throw error;
    
    // Transform to match frontend interface
    return data.map(trip => ({
      id: trip.id,
      companyId: trip.company_id,
      driverId: trip.driver_id,
      loadId: trip.load_id,
      driverName: trip.driver?.name,
      driverType: trip.driver?.type,
      date: trip.date,
      origin: trip.origin,
      destination: trip.destination,
      distance: trip.distance,
      rate: trip.rate,
      rateType: trip.rate_type,
      hoursWorked: trip.hours_worked,
      amount: trip.amount,
      status: trip.status
    }));
  } catch (error) {
    console.error('Error fetching company trips:', error);
    return [];
  }
}

// Fetch trips for a specific driver
export async function fetchDriverTrips(companyId: number, driverId: number): Promise<Trip[]> {
  try {
    const { data, error } = await supabase
      .from('trips')
      .select('*, driver:drivers(name, type)')
      .eq('company_id', companyId)
      .eq('driver_id', driverId)
      .order('date', { ascending: false });
    
    if (error) throw error;
    
    // Transform to match frontend interface
    return data.map(trip => ({
      id: trip.id,
      companyId: trip.company_id,
      driverId: trip.driver_id,
      loadId: trip.load_id,
      driverName: trip.driver?.name,
      driverType: trip.driver?.type,
      date: trip.date,
      origin: trip.origin,
      destination: trip.destination,
      distance: trip.distance,
      rate: trip.rate,
      rateType: trip.rate_type,
      hoursWorked: trip.hours_worked,
      amount: trip.amount,
      status: trip.status
    }));
  } catch (error) {
    console.error(`Error fetching trips for driver ${driverId}:`, error);
    return [];
  }
}

// Fetch trips for a specific date range
export async function fetchTripsByDateRange(companyId: number, startDate: string, endDate: string): Promise<Trip[]> {
  try {
    const { data, error } = await supabase
      .from('trips')
      .select('*, driver:drivers(name, type)')
      .eq('company_id', companyId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });
    
    if (error) throw error;
    
    // Transform to match frontend interface
    return data.map(trip => ({
      id: trip.id,
      companyId: trip.company_id,
      driverId: trip.driver_id,
      loadId: trip.load_id,
      driverName: trip.driver?.name,
      driverType: trip.driver?.type,
      date: trip.date,
      origin: trip.origin,
      destination: trip.destination,
      distance: trip.distance,
      rate: trip.rate,
      rateType: trip.rate_type,
      hoursWorked: trip.hours_worked,
      amount: trip.amount,
      status: trip.status
    }));
  } catch (error) {
    console.error(`Error fetching trips for date range ${startDate} to ${endDate}:`, error);
    return [];
  }
}

// Fetch a specific trip by ID
export async function fetchTrip(id: number): Promise<Trip | null> {
  try {
    const { data, error } = await supabase
      .from('trips')
      .select('*, driver:drivers(name, type)')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      companyId: data.company_id,
      driverId: data.driver_id,
      loadId: data.load_id,
      driverName: data.driver?.name,
      driverType: data.driver?.type,
      date: data.date,
      origin: data.origin,
      destination: data.destination,
      distance: data.distance,
      rate: data.rate,
      rateType: data.rate_type,
      hoursWorked: data.hours_worked,
      amount: data.amount,
      status: data.status
    };
  } catch (error) {
    console.error(`Error fetching trip ${id}:`, error);
    return null;
  }
}

// Create a new trip
export async function createTrip(tripData: Omit<Trip, 'id'>): Promise<{ data: Trip | null, error: any }> {
  try {
    const { data, error } = await supabase
      .from('trips')
      .insert([
        {
          company_id: tripData.companyId,
          driver_id: tripData.driverId,
          load_id: tripData.loadId,
          date: tripData.date,
          origin: tripData.origin,
          destination: tripData.destination,
          distance: tripData.distance,
          rate: tripData.rate,
          rate_type: tripData.rateType,
          hours_worked: tripData.hoursWorked,
          status: tripData.status || 'pending'
        }
      ])
      .select('*, driver:drivers(name, type)');
    
    if (error) throw error;
    
    const trip = data[0];
    return {
      data: {
        id: trip.id,
        companyId: trip.company_id,
        driverId: trip.driver_id,
        loadId: trip.load_id,
        driverName: trip.driver?.name,
        driverType: trip.driver?.type,
        date: trip.date,
        origin: trip.origin,
        destination: trip.destination,
        distance: trip.distance,
        rate: trip.rate,
        rateType: trip.rate_type,
        hoursWorked: trip.hours_worked,
        amount: trip.amount,
        status: trip.status
      },
      error: null
    };
  } catch (error) {
    console.error('Error creating trip:', error);
    return { data: null, error };
  }
}

// Update an existing trip
export async function updateTrip(id: number, tripData: Partial<Trip>): Promise<{ data: Trip | null, error: any }> {
  try {
    const updateData: any = {};
    
    if (tripData.companyId !== undefined) updateData.company_id = tripData.companyId;
    if (tripData.driverId !== undefined) updateData.driver_id = tripData.driverId;
    if (tripData.loadId !== undefined) updateData.load_id = tripData.loadId;
    if (tripData.date !== undefined) updateData.date = tripData.date;
    if (tripData.origin !== undefined) updateData.origin = tripData.origin;
    if (tripData.destination !== undefined) updateData.destination = tripData.destination;
    if (tripData.distance !== undefined) updateData.distance = tripData.distance;
    if (tripData.rate !== undefined) updateData.rate = tripData.rate;
    if (tripData.rateType !== undefined) updateData.rate_type = tripData.rateType;
    if (tripData.hoursWorked !== undefined) updateData.hours_worked = tripData.hoursWorked;
    if (tripData.status !== undefined) updateData.status = tripData.status;
    
    const { data, error } = await supabase
      .from('trips')
      .update(updateData)
      .eq('id', id)
      .select('*, driver:drivers(name, type)');
    
    if (error) throw error;
    
    const trip = data[0];
    return {
      data: {
        id: trip.id,
        companyId: trip.company_id,
        driverId: trip.driver_id,
        loadId: trip.load_id,
        driverName: trip.driver?.name,
        driverType: trip.driver?.type,
        date: trip.date,
        origin: trip.origin,
        destination: trip.destination,
        distance: trip.distance,
        rate: trip.rate,
        rateType: trip.rate_type,
        hoursWorked: trip.hours_worked,
        amount: trip.amount,
        status: trip.status
      },
      error: null
    };
  } catch (error) {
    console.error(`Error updating trip ${id}:`, error);
    return { data: null, error };
  }
}

// Delete a trip
export async function deleteTrip(id: number): Promise<{ success: boolean, error: any }> {
  try {
    const { error } = await supabase
      .from('trips')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error) {
    console.error(`Error deleting trip ${id}:`, error);
    return { success: false, error };
  }
}

// Calculate trip amount based on rate type
export function calculateTripAmount(distance: number, rate: number, rateType: string, hoursWorked?: number): number {
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
  try {
    const { data: trips, error } = await supabase
      .from('trips')
      .select('*')
      .eq('company_id', companyId)
      .eq('driver_id', driverId);
    
    if (error) throw error;
    
    const totalTrips = trips.length;
    const totalMiles = trips.reduce((sum, trip) => sum + trip.distance, 0);
    const totalEarnings = trips.reduce((sum, trip) => sum + trip.amount, 0);
    const averageRate = totalMiles > 0 ? totalEarnings / totalMiles : 0;
    
    return {
      totalTrips,
      totalMiles,
      totalEarnings,
      averageRate
    };
  } catch (error) {
    console.error(`Error getting trip stats for driver ${driverId}:`, error);
    return null;
  }
}

// Get trip statistics for a company
export async function getCompanyTripStats(companyId: number): Promise<any> {
  try {
    const { data: trips, error } = await supabase
      .from('trips')
      .select('*')
      .eq('company_id', companyId);
    
    if (error) throw error;
    
    const totalTrips = trips.length;
    const totalMiles = trips.reduce((sum, trip) => sum + trip.distance, 0);
    const totalEarnings = trips.reduce((sum, trip) => sum + trip.amount, 0);
    
    // Get unique driver count
    const uniqueDrivers = new Set(trips.map(trip => trip.driver_id)).size;
    
    return {
      totalTrips,
      totalMiles,
      totalEarnings,
      uniqueDrivers
    };
  } catch (error) {
    console.error(`Error getting trip stats for company ${companyId}:`, error);
    return null;
  }
}
