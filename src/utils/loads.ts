import { supabase } from './supabase';
import { Load } from '@/types/trip';

/**
 * Fetch all loads for a specific company
 */
export async function fetchCompanyLoads(companyId: number): Promise<Load[]> {
  try {
    const { data, error } = await supabase
      .from('loads')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map(load => ({
      id: load.id,
      companyId: load.company_id,
      driverId: load.driver_id,
      loadNumber: load.load_number,
      customer: load.customer,
      pickupDate: load.pickup_date,
      deliveryDate: load.delivery_date,
      origin: load.origin,
      destination: load.destination,
      distance: load.distance,
      rate: load.rate,
      status: load.status,
      createdAt: load.created_at,
      updatedAt: load.updated_at
    }));
  } catch (error) {
    console.error('Error fetching company loads:', error);
    return [];
  }
}

/**
 * Fetch a specific load by ID
 */
export async function fetchLoad(id: number): Promise<Load | null> {
  try {
    const { data, error } = await supabase
      .from('loads')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      companyId: data.company_id,
      driverId: data.driver_id,
      loadNumber: data.load_number,
      customer: data.customer,
      pickupDate: data.pickup_date,
      deliveryDate: data.delivery_date,
      origin: data.origin,
      destination: data.destination,
      distance: data.distance,
      rate: data.rate,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error(`Error fetching load ${id}:`, error);
    return null;
  }
}

/**
 * Create a new load
 */
export async function createLoad(loadData: Omit<Load, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ data: Load | null, error: any }> {
  try {
    const { data, error } = await supabase
      .from('loads')
      .insert([
        {
          company_id: loadData.companyId,
          driver_id: loadData.driverId,
          load_number: loadData.loadNumber,
          customer: loadData.customer,
          pickup_date: loadData.pickupDate,
          delivery_date: loadData.deliveryDate,
          origin: loadData.origin,
          destination: loadData.destination,
          distance: loadData.distance,
          rate: loadData.rate,
          status: loadData.status
        }
      ])
      .select();
    
    if (error) throw error;
    
    const load = data[0];
    return {
      data: {
        id: load.id,
        companyId: load.company_id,
        driverId: load.driver_id,
        loadNumber: load.load_number,
        customer: load.customer,
        pickupDate: load.pickup_date,
        deliveryDate: load.delivery_date,
        origin: load.origin,
        destination: load.destination,
        distance: load.distance,
        rate: load.rate,
        status: load.status,
        createdAt: load.created_at,
        updatedAt: load.updated_at
      },
      error: null
    };
  } catch (error) {
    console.error('Error creating load:', error);
    return { data: null, error };
  }
}

/**
 * Update an existing load
 */
export async function updateLoad(id: number, loadData: Partial<Load>): Promise<{ data: Load | null, error: any }> {
  try {
    const updateData: any = {};
    
    if (loadData.companyId !== undefined) updateData.company_id = loadData.companyId;
    if (loadData.driverId !== undefined) updateData.driver_id = loadData.driverId;
    if (loadData.loadNumber !== undefined) updateData.load_number = loadData.loadNumber;
    if (loadData.customer !== undefined) updateData.customer = loadData.customer;
    if (loadData.pickupDate !== undefined) updateData.pickup_date = loadData.pickupDate;
    if (loadData.deliveryDate !== undefined) updateData.delivery_date = loadData.deliveryDate;
    if (loadData.origin !== undefined) updateData.origin = loadData.origin;
    if (loadData.destination !== undefined) updateData.destination = loadData.destination;
    if (loadData.distance !== undefined) updateData.distance = loadData.distance;
    if (loadData.rate !== undefined) updateData.rate = loadData.rate;
    if (loadData.status !== undefined) updateData.status = loadData.status;
    
    const { data, error } = await supabase
      .from('loads')
      .update(updateData)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    
    const load = data[0];
    return {
      data: {
        id: load.id,
        companyId: load.company_id,
        driverId: load.driver_id,
        loadNumber: load.load_number,
        customer: load.customer,
        pickupDate: load.pickup_date,
        deliveryDate: load.delivery_date,
        origin: load.origin,
        destination: load.destination,
        distance: load.distance,
        rate: load.rate,
        status: load.status,
        createdAt: load.created_at,
        updatedAt: load.updated_at
      },
      error: null
    };
  } catch (error) {
    console.error(`Error updating load ${id}:`, error);
    return { data: null, error };
  }
}

/**
 * Delete a load
 */
export async function deleteLoad(id: number): Promise<{ success: boolean, error: any }> {
  try {
    const { error } = await supabase
      .from('loads')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error) {
    console.error(`Error deleting load ${id}:`, error);
    return { success: false, error };
  }
}

/**
 * Assign a driver to a load
 */
export async function assignLoadToDriver(loadId: number, driverId: number): Promise<{ success: boolean, error: any }> {
  try {
    const { error } = await supabase
      .from('loads')
      .update({ driver_id: driverId || null })
      .eq('id', loadId);
    
    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error) {
    console.error(`Error assigning driver to load ${loadId}:`, error);
    return { success: false, error };
  }
}

/**
 * Update load status
 */
export async function updateLoadStatus(loadId: number, status: 'assigned' | 'in_progress' | 'completed' | 'cancelled'): Promise<{ success: boolean, error: any }> {
  try {
    const { error } = await supabase
      .from('loads')
      .update({ status })
      .eq('id', loadId);
    
    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error) {
    console.error(`Error updating load status ${loadId}:`, error);
    return { success: false, error };
  }
}
