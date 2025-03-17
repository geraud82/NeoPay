const express = require('express');
const router = express.Router();
const { driverAccessControl, roleCheck } = require('../middleware/auth');

// Get all drivers - Admin and managers only
router.get('/', roleCheck(['admin', 'manager']), async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('drivers')
      .select('*')
      .order('name');
    
    if (error) throw error;
    
    res.json(data);
  } catch (err) {
    console.error('Error fetching drivers:', err);
    res.status(500).json({ message: 'Failed to fetch drivers', error: err.message });
  }
});

// Get a specific driver - Admin, managers, or the driver themselves
router.get('/:id', driverAccessControl, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    const { data, error } = await req.supabase
      .from('drivers')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ message: 'Driver not found' });
      }
      throw error;
    }
    
    res.json(data);
  } catch (err) {
    console.error('Error fetching driver:', err);
    res.status(500).json({ message: 'Failed to fetch driver', error: err.message });
  }
});

// Create a new driver - Admin and managers only
router.post('/', roleCheck(['admin', 'manager']), async (req, res) => {
  try {
    const { name, email, phone, license, status, type, joinDate } = req.body;
    
    // Validate required fields
    if (!name || !email || !phone || !license) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const newDriver = {
      name,
      email,
      phone,
      license,
      status: status || 'Active',
      type: type || 'company', // Default to company driver if not specified
      joinDate: joinDate || new Date().toISOString().split('T')[0]
    };
    
    const { data, error } = await req.supabase
      .from('drivers')
      .insert([newDriver])
      .select();
    
    if (error) throw error;
    
    res.status(201).json(data[0]);
  } catch (err) {
    console.error('Error creating driver:', err);
    res.status(500).json({ message: 'Failed to create driver', error: err.message });
  }
});

// Update a driver - Admin, managers, or the driver themselves
router.put('/:id', driverAccessControl, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, email, phone, license, status, type, joinDate } = req.body;
    
    // Check if driver exists
    const { data: existingDriver, error: fetchError } = await req.supabase
      .from('drivers')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({ message: 'Driver not found' });
      }
      throw fetchError;
    }
    
    const updatedDriver = {
      name: name !== undefined ? name : existingDriver.name,
      email: email !== undefined ? email : existingDriver.email,
      phone: phone !== undefined ? phone : existingDriver.phone,
      license: license !== undefined ? license : existingDriver.license,
      status: status !== undefined ? status : existingDriver.status,
      type: type !== undefined ? type : existingDriver.type,
      joinDate: joinDate !== undefined ? joinDate : existingDriver.joinDate
    };
    
    const { data, error } = await req.supabase
      .from('drivers')
      .update(updatedDriver)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    
    res.json(data[0]);
  } catch (err) {
    console.error('Error updating driver:', err);
    res.status(500).json({ message: 'Failed to update driver', error: err.message });
  }
});

// Delete a driver - Admin and managers only
router.delete('/:id', roleCheck(['admin', 'manager']), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // Check if driver exists
    const { data: existingDriver, error: fetchError } = await req.supabase
      .from('drivers')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({ message: 'Driver not found' });
      }
      throw fetchError;
    }
    
    const { error } = await req.supabase
      .from('drivers')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.json({ message: 'Driver deleted successfully', driver: existingDriver });
  } catch (err) {
    console.error('Error deleting driver:', err);
    res.status(500).json({ message: 'Failed to delete driver', error: err.message });
  }
});

// Get trips for a specific driver - Admin, managers, or the driver themselves
router.get('/:id/trips', driverAccessControl, async (req, res) => {
  try {
    const driverId = parseInt(req.params.id);
    
    // First check if the driver exists
    const { data: driver, error: driverError } = await req.supabase
      .from('drivers')
      .select('*')
      .eq('id', driverId)
      .single();
    
    if (driverError) {
      if (driverError.code === 'PGRST116') {
        return res.status(404).json({ message: 'Driver not found' });
      }
      throw driverError;
    }
    
    // Then get the driver's trips
    const { data: trips, error: tripsError } = await req.supabase
      .from('trips')
      .select('*')
      .eq('driver_id', driverId)
      .order('date', { ascending: false });
    
    if (tripsError) throw tripsError;
    
    // Transform the data to match the frontend interface
    const transformedTrips = trips.map(trip => ({
      id: trip.id,
      driverId: trip.driver_id,
      driverName: driver.name,
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
    
    res.json(transformedTrips);
  } catch (err) {
    console.error(`Error fetching trips for driver ${req.params.id}:`, err);
    res.status(500).json({ message: 'Failed to fetch driver trips', error: err.message });
  }
});

module.exports = router;
