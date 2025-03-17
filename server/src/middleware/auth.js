const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Authentication middleware
 * Verifies the JWT token and adds user data to the request
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Get the token from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized - No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify the token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ message: 'Unauthorized - Invalid token' });
    }
    
    // Add user data to the request
    req.user = user;
    
    // Get the user's driver record if it exists
    const { data: driverData } = await supabase
      .from('drivers')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (driverData) {
      req.userDriver = driverData;
    }
    
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Role-based access control middleware
 * Checks if the user has the required role
 * @param {string[]} allowedRoles - Array of allowed roles
 */
const roleCheck = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized - Authentication required' });
    }
    
    const userRole = req.user.user_metadata?.role || 'user';
    
    if (allowedRoles.includes(userRole)) {
      next();
    } else {
      res.status(403).json({ message: 'Forbidden - Insufficient permissions' });
    }
  };
};

/**
 * Driver access control middleware
 * Ensures drivers can only access their own data
 */
const driverAccessControl = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized - Authentication required' });
  }
  
  const userRole = req.user.user_metadata?.role || 'user';
  
  // Admin and managers have full access
  if (['admin', 'manager'].includes(userRole)) {
    return next();
  }
  
  // Check if user is a driver or owner operator
  if (['driver', 'owner'].includes(userRole)) {
    // If the user doesn't have a driver record, they can't access driver data
    if (!req.userDriver) {
      return res.status(403).json({ message: 'Forbidden - No driver record found for this user' });
    }
    
    // Set the driver ID parameter to the user's driver ID
    req.driverIdParam = req.userDriver.id;
    
    // If a driver ID is specified in the request, ensure it matches the user's driver ID
    const requestedDriverId = parseInt(req.params.id || req.params.driverId || req.query.driverId);
    
    if (requestedDriverId && requestedDriverId !== req.userDriver.id) {
      return res.status(403).json({ message: 'Forbidden - You can only access your own data' });
    }
    
    next();
  } else {
    // Other roles don't have access to driver data
    res.status(403).json({ message: 'Forbidden - Insufficient permissions' });
  }
};

module.exports = {
  authMiddleware,
  roleCheck,
  driverAccessControl
};
