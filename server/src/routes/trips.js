const express = require('express');
const router = express.Router();
const { driverAccessControl, roleCheck } = require('../middleware/auth');

// Get all trips - Admin and managers only
router.get('/', roleCheck(['admin', 'manager']), async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('trips')
      .select('*, driver:drivers(name)')
      .order('date', { ascending: false });
    
    if (error) throw error;
    
    // Transform the data to match the frontend interface
    const transformedData = data.map(trip => ({
      id: trip.id,
      driverId: trip.driver_id,
      driverName: trip.driver?.name,
      driverType: 'company', // Default to company driver since type column is missing
      date: trip.date,
      origin: trip.origin,
      destination: trip.destination,
      distance: trip.distance,
      rate: trip.rate,
      rateType: trip.rate_type || 'per_mile',
      amount: trip.amount,
      status: trip.status || 'pending'
    }));
    
    res.json(transformedData);
  } catch (err) {
    console.error('Error fetching trips:', err);
    res.status(500).json({ message: 'Failed to fetch trips', error: err.message });
  }
});

// Get trips for a specific driver - Admin, managers, or the driver themselves
router.get('/driver/:driverId', driverAccessControl, async (req, res) => {
  try {
    const driverId = parseInt(req.params.driverId);
    
    const { data, error } = await req.supabase
      .from('trips')
      .select('*, driver:drivers(name)')
      .eq('driver_id', driverId)
      .order('date', { ascending: false });
    
    if (error) throw error;
    
    // Transform the data to match the frontend interface
    const transformedData = data.map(trip => ({
      id: trip.id,
      driverId: trip.driver_id,
      driverName: trip.driver?.name,
      driverType: 'company', // Default to company driver since type column is missing
      date: trip.date,
      origin: trip.origin,
      destination: trip.destination,
      distance: trip.distance,
      rate: trip.rate,
      rateType: trip.rate_type || 'per_mile',
      amount: trip.amount,
      status: trip.status || 'pending'
    }));
    
    res.json(transformedData);
  } catch (err) {
    console.error(`Error fetching trips for driver ${req.params.driverId}:`, err);
    res.status(500).json({ message: 'Failed to fetch driver trips', error: err.message });
  }
});

// Get a specific trip - Admin, managers, or the driver associated with the trip
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // First get the trip to check driver_id
    const { data: trip, error: tripError } = await req.supabase
      .from('trips')
      .select('driver_id')
      .eq('id', id)
      .single();
    
    if (tripError) {
      if (tripError.code === 'PGRST116') {
        return res.status(404).json({ message: 'Trip not found' });
      }
      throw tripError;
    }
    
    // Check if user is authorized to access this trip
    const userRole = req.user?.user_metadata?.role || 'user';
    const isAdminOrManager = ['admin', 'manager'].includes(userRole);
    const isDriverOfTrip = req.userDriver && req.userDriver.id === trip.driver_id;
    
    if (!isAdminOrManager && !isDriverOfTrip) {
      return res.status(403).json({ message: 'Forbidden - You can only access your own trips' });
    }
    
    // Now get the full trip data
    const { data, error } = await req.supabase
      .from('trips')
      .select('*, driver:drivers(name)')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    // Transform the data to match the frontend interface
    const transformedData = {
      id: data.id,
      driverId: data.driver_id,
      driverName: data.driver?.name,
      driverType: 'company', // Default to company driver since type column is missing
      date: data.date,
      origin: data.origin,
      destination: data.destination,
      distance: data.distance,
      rate: data.rate,
      rateType: data.rate_type || 'per_mile',
      amount: data.amount,
      status: data.status || 'pending'
    };
    
    res.json(transformedData);
  } catch (err) {
    console.error('Error fetching trip:', err);
    res.status(500).json({ message: 'Failed to fetch trip', error: err.message });
  }
});

// Create a new trip - Admin and managers only
router.post('/', roleCheck(['admin', 'manager']), async (req, res) => {
  try {
    const { 
      driverId, 
      driverType, 
      date, 
      origin, 
      destination, 
      distance, 
      rate, 
      rateType,
      amount,
      status 
    } = req.body;
    
    // Validate required fields
    if (!driverId || !date || !origin || !destination || !distance || !rate) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Get driver type if not provided
    let finalDriverType = driverType;
    if (!finalDriverType) {
      const { data: driverData, error: driverError } = await req.supabase
        .from('drivers')
        .select('type')
        .eq('id', driverId)
        .single();
      
      if (driverError) {
        console.warn('Error fetching driver type:', driverError);
      } else {
        finalDriverType = driverData.type || 'company';
      }
    }
    
    // Determine rate type based on driver type if not provided
    let finalRateType = rateType;
    if (!finalRateType) {
      finalRateType = finalDriverType === 'owner' ? 'percentage' : 'per_mile';
    }
    
    // Calculate amount if not provided
    let finalAmount = amount;
    if (finalAmount === undefined) {
      if (finalRateType === 'per_mile') {
        finalAmount = parseFloat((distance * rate).toFixed(2));
      } else {
        // For percentage rate type, assume a base trip value of $2 per mile
        const tripValue = distance * 2;
        finalAmount = parseFloat((tripValue * (rate / 100)).toFixed(2));
      }
    }
    
    const newTrip = {
      driver_id: driverId,
      date,
      origin,
      destination,
      distance,
      rate,
      rate_type: finalRateType,
      amount: finalAmount,
      status: status || 'pending'
    };
    
    const { data, error } = await req.supabase
      .from('trips')
      .insert([newTrip])
      .select('*, driver:drivers(name)');
    
    if (error) throw error;
    
    // Transform the data to match the frontend interface
    const transformedData = {
      id: data[0].id,
      driverId: data[0].driver_id,
      driverName: data[0].driver?.name,
      driverType: 'company', // Default to company driver since type column is missing
      date: data[0].date,
      origin: data[0].origin,
      destination: data[0].destination,
      distance: data[0].distance,
      rate: data[0].rate,
      rateType: data[0].rate_type || 'per_mile',
      amount: data[0].amount,
      status: data[0].status || 'pending'
    };
    
    res.status(201).json(transformedData);
  } catch (err) {
    console.error('Error creating trip:', err);
    res.status(500).json({ message: 'Failed to create trip', error: err.message });
  }
});

// Update a trip - Admin and managers only
router.put('/:id', roleCheck(['admin', 'manager']), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { 
      driverId, 
      driverType, 
      date, 
      origin, 
      destination, 
      distance, 
      rate, 
      rateType,
      amount,
      status 
    } = req.body;
    
    // Check if trip exists
    const { data: existingTrip, error: fetchError } = await req.supabase
      .from('trips')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({ message: 'Trip not found' });
      }
      throw fetchError;
    }
    
    // Prepare update data
    const updateData = {};
    
    if (driverId !== undefined) updateData.driver_id = driverId;
    if (date !== undefined) updateData.date = date;
    if (origin !== undefined) updateData.origin = origin;
    if (destination !== undefined) updateData.destination = destination;
    if (distance !== undefined) updateData.distance = distance;
    if (rate !== undefined) updateData.rate = rate;
    if (rateType !== undefined) updateData.rate_type = rateType;
    if (status !== undefined) updateData.status = status;
    
    // Get driver type if driver changed and driver type not provided
    let finalDriverType = driverType;
    if (driverId !== undefined && driverType === undefined) {
      const { data: driverData, error: driverError } = await req.supabase
        .from('drivers')
        .select('type')
        .eq('id', driverId)
        .single();
      
      if (driverError) {
        console.warn('Error fetching driver type:', driverError);
      } else {
        finalDriverType = driverData.type || 'company';
      }
    }
    
    // Determine rate type based on driver type if rate type not provided but driver type changed
    if (rateType === undefined && finalDriverType !== undefined) {
      updateData.rate_type = finalDriverType === 'owner' ? 'percentage' : 'per_mile';
    }
    
    // Recalculate amount if distance, rate, or rate type changed
    if (distance !== undefined || rate !== undefined || rateType !== undefined) {
      const newDistance = distance !== undefined ? distance : existingTrip.distance;
      const newRate = rate !== undefined ? rate : existingTrip.rate;
      const newRateType = rateType !== undefined ? rateType : existingTrip.rate_type || 'per_mile';
      
      if (newRateType === 'per_mile') {
        updateData.amount = parseFloat((newDistance * newRate).toFixed(2));
      } else {
        // For percentage rate type, assume a base trip value of $2 per mile
        const tripValue = newDistance * 2;
        updateData.amount = parseFloat((tripValue * (newRate / 100)).toFixed(2));
      }
    } else if (amount !== undefined) {
      updateData.amount = amount;
    }
    
    const { data, error } = await req.supabase
      .from('trips')
      .update(updateData)
      .eq('id', id)
      .select('*, driver:drivers(name)');
    
    if (error) throw error;
    
    // Transform the data to match the frontend interface
    const transformedData = {
      id: data[0].id,
      driverId: data[0].driver_id,
      driverName: data[0].driver?.name,
      driverType: 'company', // Default to company driver since type column is missing
      date: data[0].date,
      origin: data[0].origin,
      destination: data[0].destination,
      distance: data[0].distance,
      rate: data[0].rate,
      rateType: data[0].rate_type || 'per_mile',
      amount: data[0].amount,
      status: data[0].status || 'pending'
    };
    
    res.json(transformedData);
  } catch (err) {
    console.error('Error updating trip:', err);
    res.status(500).json({ message: 'Failed to update trip', error: err.message });
  }
});

// Delete a trip - Admin and managers only
router.delete('/:id', roleCheck(['admin', 'manager']), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // Check if trip exists
    const { data: existingTrip, error: fetchError } = await req.supabase
      .from('trips')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({ message: 'Trip not found' });
      }
      throw fetchError;
    }
    
    const { error } = await req.supabase
      .from('trips')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.json({ message: 'Trip deleted successfully', trip: existingTrip });
  } catch (err) {
    console.error('Error deleting trip:', err);
    res.status(500).json({ message: 'Failed to delete trip', error: err.message });
  }
});

module.exports = router;
