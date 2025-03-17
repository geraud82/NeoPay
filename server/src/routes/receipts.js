const express = require('express');
const router = express.Router();
const { driverAccessControl, roleCheck } = require('../middleware/auth');

// Get all receipts - Admin and managers only
router.get('/', roleCheck(['admin', 'manager']), async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('receipts')
      .select('*, driver:drivers(name)')
      .order('upload_date', { ascending: false });
    
    if (error) throw error;
    
    // Transform the data to match the frontend interface
    const transformedData = data.map(receipt => ({
      id: receipt.id,
      driverId: receipt.driver_id,
      driverName: receipt.driver?.name,
      fileName: receipt.file_name,
      filePath: receipt.file_path,
      uploadDate: receipt.upload_date,
      status: receipt.status,
      vendor: receipt.vendor,
      date: receipt.date,
      amount: receipt.amount,
      category: receipt.category
    }));
    
    res.json(transformedData);
  } catch (err) {
    console.error('Error fetching receipts:', err);
    res.status(500).json({ message: 'Failed to fetch receipts', error: err.message });
  }
});

// Get receipts for a specific driver - Admin, managers, or the driver themselves
router.get('/driver/:driverId', driverAccessControl, async (req, res) => {
  try {
    const driverId = parseInt(req.params.driverId);
    
    const { data, error } = await req.supabase
      .from('receipts')
      .select('*, driver:drivers(name)')
      .eq('driver_id', driverId)
      .order('upload_date', { ascending: false });
    
    if (error) throw error;
    
    // Transform the data to match the frontend interface
    const transformedData = data.map(receipt => ({
      id: receipt.id,
      driverId: receipt.driver_id,
      driverName: receipt.driver?.name,
      fileName: receipt.file_name,
      filePath: receipt.file_path,
      uploadDate: receipt.upload_date,
      status: receipt.status,
      vendor: receipt.vendor,
      date: receipt.date,
      amount: receipt.amount,
      category: receipt.category
    }));
    
    res.json(transformedData);
  } catch (err) {
    console.error(`Error fetching receipts for driver ${req.params.driverId}:`, err);
    res.status(500).json({ message: 'Failed to fetch driver receipts', error: err.message });
  }
});

// Get a specific receipt - Admin, managers, or the driver associated with the receipt
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // First get the receipt to check driver_id
    const { data: receipt, error: receiptError } = await req.supabase
      .from('receipts')
      .select('driver_id')
      .eq('id', id)
      .single();
    
    if (receiptError) {
      if (receiptError.code === 'PGRST116') {
        return res.status(404).json({ message: 'Receipt not found' });
      }
      throw receiptError;
    }
    
    // Check if user is authorized to access this receipt
    const userRole = req.user?.user_metadata?.role || 'user';
    const isAdminOrManager = ['admin', 'manager'].includes(userRole);
    const isDriverOfReceipt = req.userDriver && req.userDriver.id === receipt.driver_id;
    
    if (!isAdminOrManager && !isDriverOfReceipt) {
      return res.status(403).json({ message: 'Forbidden - You can only access your own receipts' });
    }
    
    // Now get the full receipt data
    const { data, error } = await req.supabase
      .from('receipts')
      .select('*, driver:drivers(name)')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    // Get receipt items if any
    const { data: items, error: itemsError } = await req.supabase
      .from('receipt_items')
      .select('*')
      .eq('receipt_id', id)
      .order('id');
    
    if (itemsError) throw itemsError;
    
    // Transform the data to match the frontend interface
    const transformedData = {
      id: data.id,
      driverId: data.driver_id,
      driverName: data.driver?.name,
      fileName: data.file_name,
      filePath: data.file_path,
      uploadDate: data.upload_date,
      status: data.status,
      vendor: data.vendor,
      date: data.date,
      amount: data.amount,
      category: data.category,
      items: items || []
    };
    
    res.json(transformedData);
  } catch (err) {
    console.error('Error fetching receipt:', err);
    res.status(500).json({ message: 'Failed to fetch receipt', error: err.message });
  }
});

// Upload a new receipt - Admin, managers, or the driver themselves
router.post('/upload', async (req, res) => {
  try {
    const { driverId, fileName, fileData } = req.body;
    
    // Validate required fields
    if (!driverId || !fileName || !fileData) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Check if user is authorized to upload for this driver
    const userRole = req.user?.user_metadata?.role || 'user';
    const isAdminOrManager = ['admin', 'manager'].includes(userRole);
    const isDriverUploadingOwnReceipt = req.userDriver && req.userDriver.id === parseInt(driverId);
    
    if (!isAdminOrManager && !isDriverUploadingOwnReceipt) {
      return res.status(403).json({ message: 'Forbidden - You can only upload receipts for yourself' });
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
    
    // Upload file to storage
    const filePath = `receipts/${driverId}/${Date.now()}_${fileName}`;
    
    // Convert base64 to buffer
    const buffer = Buffer.from(fileData.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    
    const { data: uploadData, error: uploadError } = await req.supabase.storage
      .from('receipts')
      .upload(filePath, buffer, {
        contentType: 'image/jpeg', // Adjust based on actual file type
        upsert: false
      });
    
    if (uploadError) throw uploadError;
    
    // Get public URL
    const { data: urlData } = req.supabase.storage
      .from('receipts')
      .getPublicUrl(filePath);
    
    // Create receipt record
    const newReceipt = {
      driver_id: driverId,
      file_name: fileName,
      file_path: urlData.publicUrl,
      upload_date: new Date().toISOString().split('T')[0],
      status: 'Processing',
      user_id: req.user.id
    };
    
    const { data, error } = await req.supabase
      .from('receipts')
      .insert([newReceipt])
      .select();
    
    if (error) throw error;
    
    // Transform the data to match the frontend interface
    const transformedData = {
      id: data[0].id,
      driverId: data[0].driver_id,
      driverName: driver.name,
      fileName: data[0].file_name,
      filePath: data[0].file_path,
      uploadDate: data[0].upload_date,
      status: data[0].status
    };
    
    // In a real app, you would trigger AI processing here
    // For now, we'll simulate it with a timeout
    setTimeout(async () => {
      try {
        // Simulate AI extraction results
        const extractedData = {
          vendor: getRandomVendor(),
          date: getRandomDate(),
          amount: parseFloat((Math.random() * 100).toFixed(2)),
          category: getRandomCategory(),
          items: Array(Math.floor(Math.random() * 3) + 1).fill(null).map(() => ({
            description: getRandomItemDescription(),
            quantity: Math.floor(Math.random() * 3) + 1,
            price: parseFloat((Math.random() * 50).toFixed(2)),
          })),
        };
        
        // Update receipt with extracted data
        await req.supabase
          .from('receipts')
          .update({
            vendor: extractedData.vendor,
            date: extractedData.date,
            amount: extractedData.amount,
            category: extractedData.category,
            status: 'Completed'
          })
          .eq('id', data[0].id);
        
        // Insert receipt items
        if (extractedData.items && extractedData.items.length > 0) {
          const receiptItems = extractedData.items.map(item => ({
            receipt_id: data[0].id,
            description: item.description,
            quantity: item.quantity,
            price: item.price
          }));
          
          await req.supabase
            .from('receipt_items')
            .insert(receiptItems);
        }
      } catch (err) {
        console.error('Error processing receipt:', err);
        
        // Update receipt status to failed
        await req.supabase
          .from('receipts')
          .update({ status: 'Failed' })
          .eq('id', data[0].id);
      }
    }, 3000);
    
    res.status(201).json(transformedData);
  } catch (err) {
    console.error('Error uploading receipt:', err);
    res.status(500).json({ message: 'Failed to upload receipt', error: err.message });
  }
});

// Update a receipt - Admin, managers, or the driver themselves
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { vendor, date, amount, category } = req.body;
    
    // First get the receipt to check driver_id
    const { data: receipt, error: receiptError } = await req.supabase
      .from('receipts')
      .select('driver_id')
      .eq('id', id)
      .single();
    
    if (receiptError) {
      if (receiptError.code === 'PGRST116') {
        return res.status(404).json({ message: 'Receipt not found' });
      }
      throw receiptError;
    }
    
    // Check if user is authorized to update this receipt
    const userRole = req.user?.user_metadata?.role || 'user';
    const isAdminOrManager = ['admin', 'manager'].includes(userRole);
    const isDriverOfReceipt = req.userDriver && req.userDriver.id === receipt.driver_id;
    
    if (!isAdminOrManager && !isDriverOfReceipt) {
      return res.status(403).json({ message: 'Forbidden - You can only update your own receipts' });
    }
    
    // Prepare update data
    const updateData = {};
    
    if (vendor !== undefined) updateData.vendor = vendor;
    if (date !== undefined) updateData.date = date;
    if (amount !== undefined) updateData.amount = amount;
    if (category !== undefined) updateData.category = category;
    
    const { data, error } = await req.supabase
      .from('receipts')
      .update(updateData)
      .eq('id', id)
      .select('*, driver:drivers(name)');
    
    if (error) throw error;
    
    // Transform the data to match the frontend interface
    const transformedData = {
      id: data[0].id,
      driverId: data[0].driver_id,
      driverName: data[0].driver?.name,
      fileName: data[0].file_name,
      filePath: data[0].file_path,
      uploadDate: data[0].upload_date,
      status: data[0].status,
      vendor: data[0].vendor,
      date: data[0].date,
      amount: data[0].amount,
      category: data[0].category
    };
    
    res.json(transformedData);
  } catch (err) {
    console.error('Error updating receipt:', err);
    res.status(500).json({ message: 'Failed to update receipt', error: err.message });
  }
});

// Delete a receipt - Admin, managers, or the driver themselves
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // First get the receipt to check driver_id
    const { data: receipt, error: receiptError } = await req.supabase
      .from('receipts')
      .select('*, driver:drivers(name)')
      .eq('id', id)
      .single();
    
    if (receiptError) {
      if (receiptError.code === 'PGRST116') {
        return res.status(404).json({ message: 'Receipt not found' });
      }
      throw receiptError;
    }
    
    // Check if user is authorized to delete this receipt
    const userRole = req.user?.user_metadata?.role || 'user';
    const isAdminOrManager = ['admin', 'manager'].includes(userRole);
    const isDriverOfReceipt = req.userDriver && req.userDriver.id === receipt.driver_id;
    
    if (!isAdminOrManager && !isDriverOfReceipt) {
      return res.status(403).json({ message: 'Forbidden - You can only delete your own receipts' });
    }
    
    // Delete file from storage if it exists
    if (receipt.file_path) {
      const filePath = receipt.file_path.split('/').slice(-2).join('/');
      await req.supabase.storage
        .from('receipts')
        .remove([filePath]);
    }
    
    // Delete receipt items
    await req.supabase
      .from('receipt_items')
      .delete()
      .eq('receipt_id', id);
    
    // Delete receipt
    const { error } = await req.supabase
      .from('receipts')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    // Transform the data to match the frontend interface
    const transformedData = {
      id: receipt.id,
      driverId: receipt.driver_id,
      driverName: receipt.driver?.name,
      fileName: receipt.file_name,
      filePath: receipt.file_path,
      uploadDate: receipt.upload_date,
      status: receipt.status,
      vendor: receipt.vendor,
      date: receipt.date,
      amount: receipt.amount,
      category: receipt.category
    };
    
    res.json({ message: 'Receipt deleted successfully', receipt: transformedData });
  } catch (err) {
    console.error('Error deleting receipt:', err);
    res.status(500).json({ message: 'Failed to delete receipt', error: err.message });
  }
});

// Helper functions for generating mock data
function getRandomVendor() {
  const vendors = ['Gas Station', 'Restaurant', 'Office Supplies', 'Auto Parts', 'Hotel', 'Parking Garage'];
  return vendors[Math.floor(Math.random() * vendors.length)];
}

function getRandomDate() {
  const today = new Date();
  const daysAgo = Math.floor(Math.random() * 30);
  const date = new Date(today);
  date.setDate(today.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
}

function getRandomCategory() {
  const categories = ['Fuel', 'Meals', 'Office', 'Maintenance', 'Lodging', 'Parking'];
  return categories[Math.floor(Math.random() * categories.length)];
}

function getRandomItemDescription() {
  const items = [
    'Regular Unleaded', 'Diesel', 'Lunch', 'Dinner', 'Breakfast', 
    'Oil Change', 'Tire Rotation', 'Printer Paper', 'Pens', 'Notebook',
    'Room Charge', 'Parking Fee', 'Toll', 'Coffee', 'Snacks'
  ];
  return items[Math.floor(Math.random() * items.length)];
}

module.exports = router;
