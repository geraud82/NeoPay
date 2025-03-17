import { supabase } from './supabase';
import { Driver, DriverTaxInfo, DriverPaymentMethod } from '@/types/driver';

// Fetch all drivers (for admin users)
export async function fetchDrivers(): Promise<{ data: Driver[], error: any }> {
  try {
    const { data, error } = await supabase
      .from('drivers')
      .select('*')
      .order('name');
    
    if (error) throw error;
    
    // Transform to match frontend interface
    return { 
      data: data.map(driver => ({
        id: driver.id,
        companyId: driver.company_id,
        name: driver.name,
        email: driver.email,
        phone: driver.phone,
        license: driver.license,
        status: driver.status.toLowerCase(),
        type: driver.type,
        employmentType: driver.employment_type,
        joinDate: driver.join_date,
        payRate: driver.pay_rate,
        payRateType: driver.pay_rate_type,
        taxWithholdingPercent: driver.tax_withholding_percent,
        hasBenefits: driver.has_benefits,
        userId: driver.user_id
      })),
      error: null
    };
  } catch (error) {
    console.error('Error fetching drivers:', error);
    return { data: [], error };
  }
}

// Fetch all drivers for a company
export async function fetchCompanyDrivers(companyId: number): Promise<Driver[]> {
  try {
    const { data, error } = await supabase
      .from('drivers')
      .select('*')
      .eq('company_id', companyId)
      .order('name');
    
    if (error) throw error;
    
    // Transform to match frontend interface
    return data.map(driver => ({
      id: driver.id,
      companyId: driver.company_id,
      name: driver.name,
      email: driver.email,
      phone: driver.phone,
      license: driver.license,
      status: driver.status.toLowerCase(),
      type: driver.type,
      employmentType: driver.employment_type,
      joinDate: driver.join_date,
      payRate: driver.pay_rate,
      payRateType: driver.pay_rate_type,
      taxWithholdingPercent: driver.tax_withholding_percent,
      hasBenefits: driver.has_benefits,
      userId: driver.user_id
    }));
  } catch (error) {
    console.error('Error fetching company drivers:', error);
    return [];
  }
}

// Fetch a specific driver by ID
export async function fetchDriver(id: number): Promise<Driver | null> {
  try {
    const { data, error } = await supabase
      .from('drivers')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      companyId: data.company_id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      license: data.license,
      status: data.status.toLowerCase(),
      type: data.type,
      employmentType: data.employment_type,
      joinDate: data.join_date,
      payRate: data.pay_rate,
      payRateType: data.pay_rate_type,
      taxWithholdingPercent: data.tax_withholding_percent,
      hasBenefits: data.has_benefits,
      userId: data.user_id
    };
  } catch (error) {
    console.error(`Error fetching driver ${id}:`, error);
    return null;
  }
}

// Fetch driver tax information
export async function fetchDriverTaxInfo(driverId: number): Promise<DriverTaxInfo | null> {
  try {
    const { data, error } = await supabase
      .from('driver_tax_info')
      .select('*')
      .eq('driver_id', driverId)
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      driverId: data.driver_id,
      ssnLastFour: data.ssn_last_four,
      taxId: data.tax_id,
      w9OnFile: data.w9_on_file,
      w4OnFile: data.w4_on_file,
      filingStatus: data.filing_status,
      allowances: data.allowances,
      additionalWithholding: data.additional_withholding
    };
  } catch (error) {
    console.error(`Error fetching tax info for driver ${driverId}:`, error);
    return null;
  }
}

// Fetch driver payment methods
export async function fetchDriverPaymentMethods(driverId: number): Promise<DriverPaymentMethod[]> {
  try {
    const { data, error } = await supabase
      .from('driver_payment_methods')
      .select('*')
      .eq('driver_id', driverId)
      .order('is_default', { ascending: false });
    
    if (error) throw error;
    
    return data.map(method => ({
      id: method.id,
      driverId: method.driver_id,
      paymentType: method.payment_type,
      isDefault: method.is_default,
      bankName: method.bank_name,
      accountType: method.account_type,
      accountLastFour: method.account_last_four,
      routingNumberLastFour: method.routing_number_last_four
    }));
  } catch (error) {
    console.error(`Error fetching payment methods for driver ${driverId}:`, error);
    return [];
  }
}

// Create a new driver
export async function createDriver(driverData: any): Promise<{ data: Driver | null, error: any }> {
  try {
    // Prepare the data for insertion
    const dbDriverData = {
      company_id: 1, // Default company ID
      name: driverData.name,
      email: driverData.email,
      phone: driverData.phone,
      license: driverData.license,
      status: driverData.status ? driverData.status.toLowerCase() : 'active',
      type: driverData.type || 'company',
      employment_type: driverData.employmentType || (driverData.type === 'company' ? 'W2' : '1099'),
      join_date: driverData.joinDate || new Date().toISOString().split('T')[0],
      pay_rate: null,
      pay_rate_type: driverData.type === 'company' ? 'per_mile' : 'percentage',
      tax_withholding_percent: 15,
      has_benefits: driverData.type === 'company',
      user_id: null
    };
    
    // Use the simpler implementation
    const { data, error } = await supabase
      .from('drivers')
      .insert([dbDriverData])
      .select();
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      throw new Error('No data returned after driver creation');
    }
    
    const driver = data[0];
    return {
      data: {
        id: driver.id,
        companyId: driver.company_id,
        name: driver.name,
        email: driver.email,
        phone: driver.phone,
        license: driver.license,
        status: driver.status.toLowerCase(),
        type: driver.type,
        employmentType: driver.employment_type,
        joinDate: driver.join_date,
        payRate: driver.pay_rate,
        payRateType: driver.pay_rate_type,
        taxWithholdingPercent: driver.tax_withholding_percent,
        hasBenefits: driver.has_benefits,
        userId: driver.user_id
      },
      error: null
    };
  } catch (error) {
    console.error('Error creating driver:', error);
    return { data: null, error };
  }
}

// Update an existing driver
export async function updateDriver(id: number, driverData: any): Promise<{ data: Driver | null, error: any }> {
  try {
    const updateData: any = {};
    
    // Convert status from 'Active'/'Inactive' to 'active'/'inactive' if provided
    const status = driverData.status ? driverData.status.toLowerCase() : undefined;
    
    // Map the simple driver data to database fields
    if (driverData.name !== undefined) updateData.name = driverData.name;
    if (driverData.email !== undefined) updateData.email = driverData.email;
    if (driverData.phone !== undefined) updateData.phone = driverData.phone;
    if (driverData.license !== undefined) updateData.license = driverData.license;
    if (status !== undefined) updateData.status = status;
    if (driverData.type !== undefined) {
      updateData.type = driverData.type;
      // Only update employment_type if not explicitly provided
      if (driverData.employmentType === undefined) {
        updateData.employment_type = driverData.type === 'company' ? 'W2' : '1099';
      }
      updateData.pay_rate_type = driverData.type === 'company' ? 'per_mile' : 'percentage';
      updateData.has_benefits = driverData.type === 'company';
    }
    if (driverData.joinDate !== undefined) updateData.join_date = driverData.joinDate;
    
    // Handle fields from the Driver interface if they're passed
    if (driverData.companyId !== undefined) updateData.company_id = driverData.companyId;
    if (driverData.employmentType !== undefined) updateData.employment_type = driverData.employmentType;
    if (driverData.payRate !== undefined) updateData.pay_rate = driverData.payRate;
    if (driverData.payRateType !== undefined) updateData.pay_rate_type = driverData.payRateType;
    if (driverData.taxWithholdingPercent !== undefined) updateData.tax_withholding_percent = driverData.taxWithholdingPercent;
    if (driverData.hasBenefits !== undefined) updateData.has_benefits = driverData.hasBenefits;
    if (driverData.userId !== undefined) updateData.user_id = driverData.userId;
    
    const { data, error } = await supabase
      .from('drivers')
      .update(updateData)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    
    const driver = data[0];
    return {
      data: {
        id: driver.id,
        companyId: driver.company_id,
        name: driver.name,
        email: driver.email,
        phone: driver.phone,
        license: driver.license,
        status: driver.status.toLowerCase(),
        type: driver.type,
        employmentType: driver.employment_type,
        joinDate: driver.join_date,
        payRate: driver.pay_rate,
        payRateType: driver.pay_rate_type,
        taxWithholdingPercent: driver.tax_withholding_percent,
        hasBenefits: driver.has_benefits,
        userId: driver.user_id
      },
      error: null
    };
  } catch (error) {
    console.error(`Error updating driver ${id}:`, error);
    return { data: null, error };
  }
}

// Delete a driver
export async function deleteDriver(id: number): Promise<{ success: boolean, error: any }> {
  try {
    const { error } = await supabase
      .from('drivers')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error) {
    console.error(`Error deleting driver ${id}:`, error);
    return { success: false, error };
  }
}

// Create or update driver tax information
export async function saveDriverTaxInfo(taxInfo: Omit<DriverTaxInfo, 'id'>): Promise<{ data: DriverTaxInfo | null, error: any }> {
  try {
    // Check if tax info already exists
    const { data: existingData, error: checkError } = await supabase
      .from('driver_tax_info')
      .select('id')
      .eq('driver_id', taxInfo.driverId)
      .single();
    
    let result;
    
    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }
    
    if (existingData) {
      // Update existing record
      const { data, error } = await supabase
        .from('driver_tax_info')
        .update({
          ssn_last_four: taxInfo.ssnLastFour,
          tax_id: taxInfo.taxId,
          w9_on_file: taxInfo.w9OnFile,
          w4_on_file: taxInfo.w4OnFile,
          filing_status: taxInfo.filingStatus,
          allowances: taxInfo.allowances,
          additional_withholding: taxInfo.additionalWithholding
        })
        .eq('id', existingData.id)
        .select();
      
      if (error) throw error;
      result = data[0];
    } else {
      // Insert new record
      const { data, error } = await supabase
        .from('driver_tax_info')
        .insert([
          {
            driver_id: taxInfo.driverId,
            ssn_last_four: taxInfo.ssnLastFour,
            tax_id: taxInfo.taxId,
            w9_on_file: taxInfo.w9OnFile,
            w4_on_file: taxInfo.w4OnFile,
            filing_status: taxInfo.filingStatus,
            allowances: taxInfo.allowances,
            additional_withholding: taxInfo.additionalWithholding
          }
        ])
        .select();
      
      if (error) throw error;
      result = data[0];
    }
    
    return {
      data: {
        id: result.id,
        driverId: result.driver_id,
        ssnLastFour: result.ssn_last_four,
        taxId: result.tax_id,
        w9OnFile: result.w9_on_file,
        w4OnFile: result.w4_on_file,
        filingStatus: result.filing_status,
        allowances: result.allowances,
        additionalWithholding: result.additional_withholding
      },
      error: null
    };
  } catch (error) {
    console.error(`Error saving tax info for driver ${taxInfo.driverId}:`, error);
    return { data: null, error };
  }
}

// Create a new payment method for a driver
export async function createDriverPaymentMethod(methodData: Omit<DriverPaymentMethod, 'id'>): Promise<{ data: DriverPaymentMethod | null, error: any }> {
  try {
    // If this is set as default, unset any existing default
    if (methodData.isDefault) {
      await supabase
        .from('driver_payment_methods')
        .update({ is_default: false })
        .eq('driver_id', methodData.driverId);
    }
    
    const { data, error } = await supabase
      .from('driver_payment_methods')
      .insert([
        {
          driver_id: methodData.driverId,
          payment_type: methodData.paymentType,
          is_default: methodData.isDefault,
          bank_name: methodData.bankName,
          account_type: methodData.accountType,
          account_last_four: methodData.accountLastFour,
          routing_number_last_four: methodData.routingNumberLastFour
        }
      ])
      .select();
    
    if (error) throw error;
    
    const method = data[0];
    return {
      data: {
        id: method.id,
        driverId: method.driver_id,
        paymentType: method.payment_type,
        isDefault: method.is_default,
        bankName: method.bank_name,
        accountType: method.account_type,
        accountLastFour: method.account_last_four,
        routingNumberLastFour: method.routing_number_last_four
      },
      error: null
    };
  } catch (error) {
    console.error(`Error creating payment method for driver ${methodData.driverId}:`, error);
    return { data: null, error };
  }
}

// Update a payment method
export async function updateDriverPaymentMethod(id: number, methodData: Partial<DriverPaymentMethod>): Promise<{ data: DriverPaymentMethod | null, error: any }> {
  try {
    // If this is set as default, unset any existing default
    if (methodData.isDefault) {
      await supabase
        .from('driver_payment_methods')
        .update({ is_default: false })
        .eq('driver_id', methodData.driverId)
        .neq('id', id);
    }
    
    const updateData: any = {};
    
    if (methodData.paymentType !== undefined) updateData.payment_type = methodData.paymentType;
    if (methodData.isDefault !== undefined) updateData.is_default = methodData.isDefault;
    if (methodData.bankName !== undefined) updateData.bank_name = methodData.bankName;
    if (methodData.accountType !== undefined) updateData.account_type = methodData.accountType;
    if (methodData.accountLastFour !== undefined) updateData.account_last_four = methodData.accountLastFour;
    if (methodData.routingNumberLastFour !== undefined) updateData.routing_number_last_four = methodData.routingNumberLastFour;
    
    const { data, error } = await supabase
      .from('driver_payment_methods')
      .update(updateData)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    
    const method = data[0];
    return {
      data: {
        id: method.id,
        driverId: method.driver_id,
        paymentType: method.payment_type,
        isDefault: method.is_default,
        bankName: method.bank_name,
        accountType: method.account_type,
        accountLastFour: method.account_last_four,
        routingNumberLastFour: method.routing_number_last_four
      },
      error: null
    };
  } catch (error) {
    console.error(`Error updating payment method ${id}:`, error);
    return { data: null, error };
  }
}

// Delete a payment method
export async function deleteDriverPaymentMethod(id: number): Promise<{ success: boolean, error: any }> {
  try {
    const { error } = await supabase
      .from('driver_payment_methods')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error) {
    console.error(`Error deleting payment method ${id}:`, error);
    return { success: false, error };
  }
}

// Set a payment method as default
export async function setDefaultPaymentMethod(id: number, driverId: number): Promise<{ success: boolean, error: any }> {
  try {
    // First unset any existing default
    const { error: unsetError } = await supabase
      .from('driver_payment_methods')
      .update({ is_default: false })
      .eq('driver_id', driverId);
    
    if (unsetError) throw unsetError;
    
    // Then set the new default
    const { error } = await supabase
      .from('driver_payment_methods')
      .update({ is_default: true })
      .eq('id', id);
    
    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error) {
    console.error(`Error setting default payment method ${id}:`, error);
    return { success: false, error };
  }
}

// Create a user account for a driver
export async function createDriverUserAccount(driverId: number, email: string, password: string, role: string = 'driver'): Promise<{ success: boolean, error: any }> {
  try {
    // First create the user account
    const { data: userData, error: userError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role
        }
      }
    });
    
    if (userError) throw userError;
    
    if (!userData.user) {
      throw new Error('Failed to create user account');
    }
    
    // Then link the user to the driver
    const { error: linkError } = await supabase
      .from('drivers')
      .update({ user_id: userData.user.id })
      .eq('id', driverId);
    
    if (linkError) throw linkError;
    
    return { success: true, error: null };
  } catch (error) {
    console.error(`Error creating user account for driver ${driverId}:`, error);
    return { success: false, error };
  }
}
