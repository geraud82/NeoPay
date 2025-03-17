const express = require('express');
const router = express.Router();
const { driverAccessControl, roleCheck } = require('../middleware/auth');

// Get all expenses - Admin and managers only
router.get('/', roleCheck(['admin', 'manager']), async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('expenses')
      .select('*, driver:drivers(name)')
      .order('date', { ascending: false });
    
    if (error) throw error;
    
    // Transform the data to match the frontend interface
    const transformedData = data.map(expense => ({
      id: expense.id,
      driverId: expense.driver_id,
      driverName: expense.driver?.name,
      category: expense.category,
      amount: expense.amount,
      date: expense.date,
      description: expense.description,
      receiptId: expense.receipt_id
    }));
    
    res.json(transformedData);
  } catch (err) {
    console.error('Error fetching expenses:', err);
    res.status(500).json({ message: 'Failed to fetch expenses', error: err.message });
  }
});

// Get expenses for a specific driver - Admin, managers, or the driver themselves
router.get('/driver/:driverId', driverAccessControl, async (req, res) => {
  try {
    const driverId = parseInt(req.params.driverId);
    
    const { data, error } = await req.supabase
      .from('expenses')
      .select('*, driver:drivers(name)')
      .eq('driver_id', driverId)
      .order('date', { ascending: false });
    
    if (error) throw error;
    
    // Transform the data to match the frontend interface
    const transformedData = data.map(expense => ({
      id: expense.id,
      driverId: expense.driver_id,
      driverName: expense.driver?.name,
      category: expense.category,
      amount: expense.amount,
      date: expense.date,
      description: expense.description,
      receiptId: expense.receipt_id
    }));
    
    res.json(transformedData);
  } catch (err) {
    console.error(`Error fetching expenses for driver ${req.params.driverId}:`, err);
    res.status(500).json({ message: 'Failed to fetch driver expenses', error: err.message });
  }
});

// Get expenses for a specific category - Admin and managers only
router.get('/category/:category', roleCheck(['admin', 'manager']), async (req, res) => {
  try {
    const category = req.params.category;
    
    const { data, error } = await req.supabase
      .from('expenses')
      .select('*, driver:drivers(name)')
      .ilike('category', category)
      .order('date', { ascending: false });
    
    if (error) throw error;
    
    // Transform the data to match the frontend interface
    const transformedData = data.map(expense => ({
      id: expense.id,
      driverId: expense.driver_id,
      driverName: expense.driver?.name,
      category: expense.category,
      amount: expense.amount,
      date: expense.date,
      description: expense.description,
      receiptId: expense.receipt_id
    }));
    
    res.json(transformedData);
  } catch (err) {
    console.error(`Error fetching expenses for category ${req.params.category}:`, err);
    res.status(500).json({ message: 'Failed to fetch category expenses', error: err.message });
  }
});

// Get a specific expense - Admin, managers, or the driver associated with the expense
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // First get the expense to check driver_id
    const { data: expense, error: expenseError } = await req.supabase
      .from('expenses')
      .select('driver_id')
      .eq('id', id)
      .single();
    
    if (expenseError) {
      if (expenseError.code === 'PGRST116') {
        return res.status(404).json({ message: 'Expense not found' });
      }
      throw expenseError;
    }
    
    // Check if user is authorized to access this expense
    const userRole = req.user?.user_metadata?.role || 'user';
    const isAdminOrManager = ['admin', 'manager'].includes(userRole);
    const isDriverOfExpense = req.userDriver && req.userDriver.id === expense.driver_id;
    
    if (!isAdminOrManager && !isDriverOfExpense) {
      return res.status(403).json({ message: 'Forbidden - You can only access your own expenses' });
    }
    
    // Now get the full expense data
    const { data, error } = await req.supabase
      .from('expenses')
      .select('*, driver:drivers(name)')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    // Transform the data to match the frontend interface
    const transformedData = {
      id: data.id,
      driverId: data.driver_id,
      driverName: data.driver?.name,
      category: data.category,
      amount: data.amount,
      date: data.date,
      description: data.description,
      receiptId: data.receipt_id
    };
    
    res.json(transformedData);
  } catch (err) {
    console.error('Error fetching expense:', err);
    res.status(500).json({ message: 'Failed to fetch expense', error: err.message });
  }
});

// Create a new expense - Admin, managers, or the driver themselves
router.post('/', async (req, res) => {
  try {
    const { driverId, category, amount, date, description, receiptId } = req.body;
    
    // Validate required fields
    if (!driverId || !category || !amount || !date) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Check if user is authorized to create this expense
    const userRole = req.user?.user_metadata?.role || 'user';
    const isAdminOrManager = ['admin', 'manager'].includes(userRole);
    const isDriverOfExpense = req.userDriver && req.userDriver.id === parseInt(driverId);
    
    if (!isAdminOrManager && !isDriverOfExpense) {
      return res.status(403).json({ message: 'Forbidden - You can only create expenses for yourself' });
    }
    
    // Get driver name
    const { data: driver, error: driverError } = await req.supabase
      .from('drivers')
      .select('name')
      .eq('id', driverId)
      .single();
    
    if (driverError) {
      if (driverError.code === 'PGRST116') {
        return res.status(404).json({ message: 'Driver not found' });
      }
      throw driverError;
    }
    
    const newExpense = {
      driver_id: driverId,
      category,
      amount,
      date,
      description: description || '',
      receipt_id: receiptId || null,
      user_id: req.user.id
    };
    
    const { data, error } = await req.supabase
      .from('expenses')
      .insert([newExpense])
      .select();
    
    if (error) throw error;
    
    // Transform the data to match the frontend interface
    const transformedData = {
      id: data[0].id,
      driverId: data[0].driver_id,
      driverName: driver.name,
      category: data[0].category,
      amount: data[0].amount,
      date: data[0].date,
      description: data[0].description,
      receiptId: data[0].receipt_id
    };
    
    res.status(201).json(transformedData);
  } catch (err) {
    console.error('Error creating expense:', err);
    res.status(500).json({ message: 'Failed to create expense', error: err.message });
  }
});

// Update an expense - Admin, managers, or the driver themselves
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { category, amount, date, description } = req.body;
    
    // First get the expense to check driver_id
    const { data: expense, error: expenseError } = await req.supabase
      .from('expenses')
      .select('driver_id')
      .eq('id', id)
      .single();
    
    if (expenseError) {
      if (expenseError.code === 'PGRST116') {
        return res.status(404).json({ message: 'Expense not found' });
      }
      throw expenseError;
    }
    
    // Check if user is authorized to update this expense
    const userRole = req.user?.user_metadata?.role || 'user';
    const isAdminOrManager = ['admin', 'manager'].includes(userRole);
    const isDriverOfExpense = req.userDriver && req.userDriver.id === expense.driver_id;
    
    if (!isAdminOrManager && !isDriverOfExpense) {
      return res.status(403).json({ message: 'Forbidden - You can only update your own expenses' });
    }
    
    // Prepare update data
    const updateData = {};
    
    if (category !== undefined) updateData.category = category;
    if (amount !== undefined) updateData.amount = amount;
    if (date !== undefined) updateData.date = date;
    if (description !== undefined) updateData.description = description;
    
    const { data, error } = await req.supabase
      .from('expenses')
      .update(updateData)
      .eq('id', id)
      .select('*, driver:drivers(name)');
    
    if (error) throw error;
    
    // Transform the data to match the frontend interface
    const transformedData = {
      id: data[0].id,
      driverId: data[0].driver_id,
      driverName: data[0].driver?.name,
      category: data[0].category,
      amount: data[0].amount,
      date: data[0].date,
      description: data[0].description,
      receiptId: data[0].receipt_id
    };
    
    res.json(transformedData);
  } catch (err) {
    console.error('Error updating expense:', err);
    res.status(500).json({ message: 'Failed to update expense', error: err.message });
  }
});

// Delete an expense - Admin, managers, or the driver themselves
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // First get the expense to check driver_id
    const { data: expense, error: expenseError } = await req.supabase
      .from('expenses')
      .select('*, driver:drivers(name)')
      .eq('id', id)
      .single();
    
    if (expenseError) {
      if (expenseError.code === 'PGRST116') {
        return res.status(404).json({ message: 'Expense not found' });
      }
      throw expenseError;
    }
    
    // Check if user is authorized to delete this expense
    const userRole = req.user?.user_metadata?.role || 'user';
    const isAdminOrManager = ['admin', 'manager'].includes(userRole);
    const isDriverOfExpense = req.userDriver && req.userDriver.id === expense.driver_id;
    
    if (!isAdminOrManager && !isDriverOfExpense) {
      return res.status(403).json({ message: 'Forbidden - You can only delete your own expenses' });
    }
    
    const { error } = await req.supabase
      .from('expenses')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    // Transform the data to match the frontend interface
    const transformedData = {
      id: expense.id,
      driverId: expense.driver_id,
      driverName: expense.driver?.name,
      category: expense.category,
      amount: expense.amount,
      date: expense.date,
      description: expense.description,
      receiptId: expense.receipt_id
    };
    
    res.json({ message: 'Expense deleted successfully', expense: transformedData });
  } catch (err) {
    console.error('Error deleting expense:', err);
    res.status(500).json({ message: 'Failed to delete expense', error: err.message });
  }
});

// Create expense from receipt - Admin, managers, or the driver themselves
router.post('/from-receipt/:receiptId', async (req, res) => {
  try {
    const receiptId = parseInt(req.params.receiptId);
    
    // Get the receipt
    const { data: receipt, error: receiptError } = await req.supabase
      .from('receipts')
      .select('*, driver:drivers(name)')
      .eq('id', receiptId)
      .single();
    
    if (receiptError) {
      if (receiptError.code === 'PGRST116') {
        return res.status(404).json({ message: 'Receipt not found' });
      }
      throw receiptError;
    }
    
    // Check if user is authorized to create this expense
    const userRole = req.user?.user_metadata?.role || 'user';
    const isAdminOrManager = ['admin', 'manager'].includes(userRole);
    const isDriverOfReceipt = req.userDriver && req.userDriver.id === receipt.driver_id;
    
    if (!isAdminOrManager && !isDriverOfReceipt) {
      return res.status(403).json({ message: 'Forbidden - You can only create expenses from your own receipts' });
    }
    
    // Create the expense
    const newExpense = {
      driver_id: receipt.driver_id,
      category: receipt.category || 'Uncategorized',
      amount: receipt.amount || 0,
      date: receipt.date || new Date().toISOString().split('T')[0],
      description: receipt.vendor || '',
      receipt_id: receipt.id,
      user_id: req.user.id
    };
    
    const { data, error } = await req.supabase
      .from('expenses')
      .insert([newExpense])
      .select();
    
    if (error) throw error;
    
    // Transform the data to match the frontend interface
    const transformedData = {
      id: data[0].id,
      driverId: data[0].driver_id,
      driverName: receipt.driver?.name,
      category: data[0].category,
      amount: data[0].amount,
      date: data[0].date,
      description: data[0].description,
      receiptId: data[0].receipt_id
    };
    
    res.status(201).json(transformedData);
  } catch (err) {
    console.error('Error creating expense from receipt:', err);
    res.status(500).json({ message: 'Failed to create expense from receipt', error: err.message });
  }
});

// Get expense summary by category - Admin and managers only
router.get('/summary/by-category', roleCheck(['admin', 'manager']), async (req, res) => {
  try {
    // This would be better done with a database query, but we'll do it in code for now
    const { data, error } = await req.supabase
      .from('expenses')
      .select('category, amount');
    
    if (error) throw error;
    
    const summary = {};
    
    data.forEach(expense => {
      if (!summary[expense.category]) {
        summary[expense.category] = 0;
      }
      summary[expense.category] += expense.amount;
    });
    
    const result = Object.entries(summary).map(([category, total]) => ({
      category,
      total,
      count: data.filter(e => e.category === category).length
    }));
    
    res.json(result);
  } catch (err) {
    console.error('Error fetching expense summary by category:', err);
    res.status(500).json({ message: 'Failed to fetch expense summary', error: err.message });
  }
});

// Get expense summary by driver - Admin and managers only
router.get('/summary/by-driver', roleCheck(['admin', 'manager']), async (req, res) => {
  try {
    // This would be better done with a database query, but we'll do it in code for now
    const { data, error } = await req.supabase
      .from('expenses')
      .select('driver_id, amount, driver:drivers(name)');
    
    if (error) throw error;
    
    const summary = {};
    
    data.forEach(expense => {
      const key = `${expense.driver_id}`;
      if (!summary[key]) {
        summary[key] = {
          driverId: expense.driver_id,
          driverName: expense.driver?.name,
          total: 0,
          count: 0
        };
      }
      summary[key].total += expense.amount;
      summary[key].count += 1;
    });
    
    res.json(Object.values(summary));
  } catch (err) {
    console.error('Error fetching expense summary by driver:', err);
    res.status(500).json({ message: 'Failed to fetch expense summary', error: err.message });
  }
});

module.exports = router;
