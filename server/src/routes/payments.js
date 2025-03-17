const express = require('express');
const router = express.Router();
const { driverAccessControl, roleCheck } = require('../middleware/auth');

// Get all payments - Admin and managers only
router.get('/', roleCheck(['admin', 'manager']), async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('payments')
      .select('*, driver:drivers(name)')
      .order('date', { ascending: false });
    
    if (error) throw error;
    
    // Transform the data to match the frontend interface
    const transformedData = data.map(payment => ({
      id: payment.id,
      driverId: payment.driver_id,
      driverName: payment.driver?.name,
      amount: payment.amount,
      date: payment.date,
      status: payment.status,
      description: payment.description
    }));
    
    res.json(transformedData);
  } catch (err) {
    console.error('Error fetching payments:', err);
    res.status(500).json({ message: 'Failed to fetch payments', error: err.message });
  }
});

// Get payments for a specific driver - Admin, managers, or the driver themselves
router.get('/driver/:driverId', driverAccessControl, async (req, res) => {
  try {
    const driverId = parseInt(req.params.driverId);
    
    const { data, error } = await req.supabase
      .from('payments')
      .select('*, driver:drivers(name)')
      .eq('driver_id', driverId)
      .order('date', { ascending: false });
    
    if (error) throw error;
    
    // Transform the data to match the frontend interface
    const transformedData = data.map(payment => ({
      id: payment.id,
      driverId: payment.driver_id,
      driverName: payment.driver?.name,
      amount: payment.amount,
      date: payment.date,
      status: payment.status,
      description: payment.description
    }));
    
    res.json(transformedData);
  } catch (err) {
    console.error(`Error fetching payments for driver ${req.params.driverId}:`, err);
    res.status(500).json({ message: 'Failed to fetch driver payments', error: err.message });
  }
});

// Get a specific payment - Admin, managers, or the driver associated with the payment
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // First get the payment to check driver_id
    const { data: payment, error: paymentError } = await req.supabase
      .from('payments')
      .select('driver_id')
      .eq('id', id)
      .single();
    
    if (paymentError) {
      if (paymentError.code === 'PGRST116') {
        return res.status(404).json({ message: 'Payment not found' });
      }
      throw paymentError;
    }
    
    // Check if user is authorized to access this payment
    const userRole = req.user?.user_metadata?.role || 'user';
    const isAdminOrManager = ['admin', 'manager'].includes(userRole);
    const isDriverOfPayment = req.userDriver && req.userDriver.id === payment.driver_id;
    
    if (!isAdminOrManager && !isDriverOfPayment) {
      return res.status(403).json({ message: 'Forbidden - You can only access your own payments' });
    }
    
    // Now get the full payment data
    const { data, error } = await req.supabase
      .from('payments')
      .select('*, driver:drivers(name)')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    // Transform the data to match the frontend interface
    const transformedData = {
      id: data.id,
      driverId: data.driver_id,
      driverName: data.driver?.name,
      amount: data.amount,
      date: data.date,
      status: data.status,
      description: data.description
    };
    
    res.json(transformedData);
  } catch (err) {
    console.error('Error fetching payment:', err);
    res.status(500).json({ message: 'Failed to fetch payment', error: err.message });
  }
});

// Create a new payment - Admin and managers only
router.post('/', roleCheck(['admin', 'manager']), async (req, res) => {
  try {
    const { driverId, amount, date, status, description } = req.body;
    
    // Validate required fields
    if (!driverId || !amount) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const newPayment = {
      driver_id: driverId,
      amount,
      date: date || new Date().toISOString().split('T')[0],
      status: status || 'Pending',
      description,
      user_id: req.user.id
    };
    
    const { data, error } = await req.supabase
      .from('payments')
      .insert([newPayment])
      .select('*, driver:drivers(name)');
    
    if (error) throw error;
    
    // Transform the data to match the frontend interface
    const transformedData = {
      id: data[0].id,
      driverId: data[0].driver_id,
      driverName: data[0].driver?.name,
      amount: data[0].amount,
      date: data[0].date,
      status: data[0].status,
      description: data[0].description
    };
    
    res.status(201).json(transformedData);
  } catch (err) {
    console.error('Error creating payment:', err);
    res.status(500).json({ message: 'Failed to create payment', error: err.message });
  }
});

// Update a payment - Admin and managers only
router.put('/:id', roleCheck(['admin', 'manager']), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { amount, date, status, description } = req.body;
    
    // Check if payment exists
    const { data: existingPayment, error: fetchError } = await req.supabase
      .from('payments')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({ message: 'Payment not found' });
      }
      throw fetchError;
    }
    
    // Prepare update data
    const updateData = {};
    
    if (amount !== undefined) updateData.amount = amount;
    if (date !== undefined) updateData.date = date;
    if (status !== undefined) updateData.status = status;
    if (description !== undefined) updateData.description = description;
    
    const { data, error } = await req.supabase
      .from('payments')
      .update(updateData)
      .eq('id', id)
      .select('*, driver:drivers(name)');
    
    if (error) throw error;
    
    // Transform the data to match the frontend interface
    const transformedData = {
      id: data[0].id,
      driverId: data[0].driver_id,
      driverName: data[0].driver?.name,
      amount: data[0].amount,
      date: data[0].date,
      status: data[0].status,
      description: data[0].description
    };
    
    res.json(transformedData);
  } catch (err) {
    console.error('Error updating payment:', err);
    res.status(500).json({ message: 'Failed to update payment', error: err.message });
  }
});

// Delete a payment - Admin and managers only
router.delete('/:id', roleCheck(['admin', 'manager']), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // Check if payment exists
    const { data: existingPayment, error: fetchError } = await req.supabase
      .from('payments')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({ message: 'Payment not found' });
      }
      throw fetchError;
    }
    
    const { error } = await req.supabase
      .from('payments')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.json({ message: 'Payment deleted successfully', payment: existingPayment });
  } catch (err) {
    console.error('Error deleting payment:', err);
    res.status(500).json({ message: 'Failed to delete payment', error: err.message });
  }
});

// Generate a payment statement - Admin and managers only
router.post('/generate-statement', roleCheck(['admin', 'manager']), async (req, res) => {
  try {
    const { driverId, periodStart, periodEnd } = req.body;
    
    // Validate required fields
    if (!driverId || !periodStart || !periodEnd) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Get driver info
    const { data: driver, error: driverError } = await req.supabase
      .from('drivers')
      .select('name, type')
      .eq('id', driverId)
      .single();
    
    if (driverError) {
      if (driverError.code === 'PGRST116') {
        return res.status(404).json({ message: 'Driver not found' });
      }
      throw driverError;
    }
    
    // Get trips for the period
    const { data: trips, error: tripsError } = await req.supabase
      .from('trips')
      .select('*')
      .eq('driver_id', driverId)
      .gte('date', periodStart)
      .lte('date', periodEnd);
    
    if (tripsError) throw tripsError;
    
    // Get expenses for the period
    const { data: expenses, error: expensesError } = await req.supabase
      .from('expenses')
      .select('*')
      .eq('driver_id', driverId)
      .gte('date', periodStart)
      .lte('date', periodEnd);
    
    if (expensesError) throw expensesError;
    
    // Calculate totals
    const tripTotal = trips.reduce((sum, trip) => sum + (trip.amount || 0), 0);
    const expenseTotal = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
    const grandTotal = tripTotal - expenseTotal;
    
    // Create pay statement
    const payStatement = {
      driver_id: driverId,
      period_start: periodStart,
      period_end: periodEnd,
      trip_total: tripTotal,
      expense_total: expenseTotal,
      grand_total: grandTotal,
      generated_date: new Date().toISOString().split('T')[0],
      status: 'Draft',
      user_id: req.user.id
    };
    
    const { data: statementData, error: statementError } = await req.supabase
      .from('pay_statements')
      .insert([payStatement])
      .select();
    
    if (statementError) throw statementError;
    
    // Create a payment record
    const payment = {
      driver_id: driverId,
      amount: grandTotal,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending',
      description: `Payment for period ${periodStart} to ${periodEnd}`,
      user_id: req.user.id
    };
    
    const { data: paymentData, error: paymentError } = await req.supabase
      .from('payments')
      .insert([payment])
      .select();
    
    if (paymentError) throw paymentError;
    
    res.status(201).json({
      statement: {
        id: statementData[0].id,
        driverId,
        driverName: driver.name,
        driverType: driver.type,
        periodStart,
        periodEnd,
        tripTotal,
        expenseTotal,
        grandTotal,
        generatedDate: payStatement.generated_date,
        status: payStatement.status
      },
      payment: {
        id: paymentData[0].id,
        driverId,
        driverName: driver.name,
        amount: payment.amount,
        date: payment.date,
        status: payment.status,
        description: payment.description
      },
      trips,
      expenses
    });
  } catch (err) {
    console.error('Error generating payment statement:', err);
    res.status(500).json({ message: 'Failed to generate payment statement', error: err.message });
  }
});

module.exports = router;
