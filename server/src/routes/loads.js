const express = require('express');
const router = express.Router();
const { supabase } = require('../utils/supabase');
const { authenticateToken } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * Get all loads for a company
 */
router.get('/company/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    
    // Verify user has access to this company
    const { user } = req;
    const userCompanyId = user.user_metadata?.companyId;
    
    if (userCompanyId && userCompanyId !== parseInt(companyId)) {
      return res.status(403).json({ error: 'Unauthorized access to company data' });
    }
    
    // Get loads for the company
    const { data, error } = await supabase
      .from('loads')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching company loads:', error);
    res.status(500).json({ error: 'Failed to fetch loads' });
  }
});

/**
 * Get loads for a specific driver
 */
router.get('/driver/:driverId', async (req, res) => {
  try {
    const { driverId } = req.params;
    
    // Verify user has access to this driver's data
    const { user } = req;
    const userCompanyId = user.user_metadata?.companyId;
    
    // Get driver's company
    const { data: driverData, error: driverError } = await supabase
      .from('drivers')
      .select('company_id')
      .eq('id', driverId)
      .single();
    
    if (driverError) throw driverError;
    
    // Check if user has access to this driver's company
    if (userCompanyId && userCompanyId !== driverData.company_id) {
      return res.status(403).json({ error: 'Unauthorized access to driver data' });
    }
    
    // Get loads for the driver
    const { data, error } = await supabase
      .from('loads')
      .select('*')
      .eq('driver_id', driverId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching driver loads:', error);
    res.status(500).json({ error: 'Failed to fetch loads' });
  }
});

/**
 * Get a specific load by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get load details
    const { data, error } = await supabase
      .from('loads')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    if (!data) {
      return res.status(404).json({ error: 'Load not found' });
    }
    
    // Verify user has access to this load's company
    const { user } = req;
    const userCompanyId = user.user_metadata?.companyId;
    
    if (userCompanyId && userCompanyId !== data.company_id) {
      return res.status(403).json({ error: 'Unauthorized access to load data' });
    }
    
    res.json(data);
  } catch (error) {
    console.error(`Error fetching load ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch load' });
  }
});

/**
 * Create a new load
 */
router.post('/', async (req, res) => {
  try {
    const { 
      companyId, 
      driverId, 
      loadNumber, 
      customer, 
      pickupDate, 
      deliveryDate, 
      origin, 
      destination, 
      distance, 
      rate, 
      status = 'assigned' 
    } = req.body;
    
    // Verify user has access to this company
    const { user } = req;
    const userCompanyId = user.user_metadata?.companyId;
    
    if (userCompanyId && userCompanyId !== companyId) {
      return res.status(403).json({ error: 'Unauthorized access to company data' });
    }
    
    // Create load
    const { data, error } = await supabase
      .from('loads')
      .insert([
        {
          company_id: companyId,
          driver_id: driverId || null,
          load_number: loadNumber,
          customer,
          pickup_date: pickupDate,
          delivery_date: deliveryDate,
          origin,
          destination,
          distance,
          rate,
          status,
          created_by: user.id
        }
      ])
      .select();
    
    if (error) throw error;
    
    res.status(201).json(data[0]);
  } catch (error) {
    console.error('Error creating load:', error);
    res.status(500).json({ error: 'Failed to create load' });
  }
});

/**
 * Update a load
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      loadNumber, 
      customer, 
      pickupDate, 
      deliveryDate, 
      origin, 
      destination, 
      distance, 
      rate, 
      driverId,
      status 
    } = req.body;
    
    // Get current load to verify company access
    const { data: currentLoad, error: fetchError } = await supabase
      .from('loads')
      .select('company_id')
      .eq('id', id)
      .single();
    
    if (fetchError) throw fetchError;
    
    if (!currentLoad) {
      return res.status(404).json({ error: 'Load not found' });
    }
    
    // Verify user has access to this load's company
    const { user } = req;
    const userCompanyId = user.user_metadata?.companyId;
    
    if (userCompanyId && userCompanyId !== currentLoad.company_id) {
      return res.status(403).json({ error: 'Unauthorized access to load data' });
    }
    
    // Update load
    const updateData = {};
    
    if (loadNumber !== undefined) updateData.load_number = loadNumber;
    if (customer !== undefined) updateData.customer = customer;
    if (pickupDate !== undefined) updateData.pickup_date = pickupDate;
    if (deliveryDate !== undefined) updateData.delivery_date = deliveryDate;
    if (origin !== undefined) updateData.origin = origin;
    if (destination !== undefined) updateData.destination = destination;
    if (distance !== undefined) updateData.distance = distance;
    if (rate !== undefined) updateData.rate = rate;
    if (driverId !== undefined) updateData.driver_id = driverId || null;
    if (status !== undefined) updateData.status = status;
    
    const { data, error } = await supabase
      .from('loads')
      .update(updateData)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    
    res.json(data[0]);
  } catch (error) {
    console.error(`Error updating load ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to update load' });
  }
});

/**
 * Delete a load
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get current load to verify company access
    const { data: currentLoad, error: fetchError } = await supabase
      .from('loads')
      .select('company_id')
      .eq('id', id)
      .single();
    
    if (fetchError) throw fetchError;
    
    if (!currentLoad) {
      return res.status(404).json({ error: 'Load not found' });
    }
    
    // Verify user has access to this load's company
    const { user } = req;
    const userCompanyId = user.user_metadata?.companyId;
    
    if (userCompanyId && userCompanyId !== currentLoad.company_id) {
      return res.status(403).json({ error: 'Unauthorized access to load data' });
    }
    
    // Delete load
    const { error } = await supabase
      .from('loads')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.json({ success: true });
  } catch (error) {
    console.error(`Error deleting load ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to delete load' });
  }
});

/**
 * Assign a driver to a load
 */
router.post('/:id/assign', async (req, res) => {
  try {
    const { id } = req.params;
    const { driverId } = req.body;
    
    // Get current load to verify company access
    const { data: currentLoad, error: fetchError } = await supabase
      .from('loads')
      .select('company_id')
      .eq('id', id)
      .single();
    
    if (fetchError) throw fetchError;
    
    if (!currentLoad) {
      return res.status(404).json({ error: 'Load not found' });
    }
    
    // Verify user has access to this load's company
    const { user } = req;
    const userCompanyId = user.user_metadata?.companyId;
    
    if (userCompanyId && userCompanyId !== currentLoad.company_id) {
      return res.status(403).json({ error: 'Unauthorized access to load data' });
    }
    
    // If driverId is provided, verify driver belongs to the same company
    if (driverId) {
      const { data: driverData, error: driverError } = await supabase
        .from('drivers')
        .select('company_id')
        .eq('id', driverId)
        .single();
      
      if (driverError) throw driverError;
      
      if (!driverData || driverData.company_id !== currentLoad.company_id) {
        return res.status(400).json({ error: 'Driver does not belong to the same company as the load' });
      }
    }
    
    // Update load with driver assignment
    const { error } = await supabase
      .from('loads')
      .update({ driver_id: driverId || null })
      .eq('id', id);
    
    if (error) throw error;
    
    res.json({ success: true });
  } catch (error) {
    console.error(`Error assigning driver to load ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to assign driver to load' });
  }
});

/**
 * Update load status
 */
router.post('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status || !['assigned', 'in_progress', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be one of: assigned, in_progress, completed, cancelled' });
    }
    
    // Get current load to verify company access
    const { data: currentLoad, error: fetchError } = await supabase
      .from('loads')
      .select('company_id, driver_id')
      .eq('id', id)
      .single();
    
    if (fetchError) throw fetchError;
    
    if (!currentLoad) {
      return res.status(404).json({ error: 'Load not found' });
    }
    
    // Verify user has access to this load's company
    const { user } = req;
    const userCompanyId = user.user_metadata?.companyId;
    const userId = user.id;
    
    // Check if user is from the same company or is the assigned driver
    const isCompanyUser = !userCompanyId || userCompanyId === currentLoad.company_id;
    
    // Get driver user_id if this is a driver-initiated status update
    let isAssignedDriver = false;
    
    if (currentLoad.driver_id) {
      const { data: driverData, error: driverError } = await supabase
        .from('drivers')
        .select('user_id')
        .eq('id', currentLoad.driver_id)
        .single();
      
      if (!driverError && driverData) {
        isAssignedDriver = driverData.user_id === userId;
      }
    }
    
    if (!isCompanyUser && !isAssignedDriver) {
      return res.status(403).json({ error: 'Unauthorized access to load data' });
    }
    
    // Update load status
    const { error } = await supabase
      .from('loads')
      .update({ status })
      .eq('id', id);
    
    if (error) throw error;
    
    res.json({ success: true });
  } catch (error) {
    console.error(`Error updating load status ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to update load status' });
  }
});

module.exports = router;
