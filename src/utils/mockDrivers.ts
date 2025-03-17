import { Driver } from '@/types/driver';

// Mock data for drivers
const mockDrivers: Driver[] = [
  {
    id: 1,
    companyId: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '555-123-4567',
    license: 'DL12345678',
    status: 'Active' as any, // Type cast to match the page component's expected type
    type: 'company',
    employmentType: 'W2',
    joinDate: '2024-01-15',
    payRate: 0.55,
    payRateType: 'per_mile',
    taxWithholdingPercent: 15,
    hasBenefits: true
  },
  {
    id: 2,
    companyId: 1,
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '555-987-6543',
    license: 'DL87654321',
    status: 'Active' as any, // Type cast to match the page component's expected type
    type: 'owner',
    employmentType: '1099',
    joinDate: '2024-02-01',
    payRate: 75,
    payRateType: 'percentage',
    taxWithholdingPercent: 25,
    hasBenefits: false
  },
  {
    id: 3,
    companyId: 1,
    name: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    phone: '555-555-5555',
    license: 'DL55555555',
    status: 'Inactive' as any, // Type cast to match the page component's expected type
    type: 'company',
    employmentType: 'W2',
    joinDate: '2023-11-10',
    payRate: 0.50,
    payRateType: 'per_mile',
    taxWithholdingPercent: 15,
    hasBenefits: true
  }
];

// Mock implementation of fetchDrivers
export async function fetchDrivers(): Promise<{ data: Driver[], error: any }> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    data: mockDrivers,
    error: null
  };
}

// Mock implementation of fetchCompanyDrivers
export async function fetchCompanyDrivers(companyId: number): Promise<Driver[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return mockDrivers.filter(driver => driver.companyId === companyId);
}

// Mock implementation of fetchDriver
export async function fetchDriver(id: number): Promise<Driver | null> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const driver = mockDrivers.find(d => d.id === id);
  return driver || null;
}

// Mock implementation of createDriver
export async function createDriver(driverData: any): Promise<{ data: Driver | null, error: any }> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  try {
    const newDriver: Driver = {
      id: mockDrivers.length + 1,
      companyId: driverData.companyId || 1,
      name: driverData.name,
      email: driverData.email,
      phone: driverData.phone,
      license: driverData.license,
      status: driverData.status || 'Active',
      type: driverData.type || 'company',
      employmentType: driverData.type === 'company' ? 'W2' : '1099',
      joinDate: driverData.joinDate || new Date().toISOString().split('T')[0],
      payRate: driverData.payRate || null,
      payRateType: driverData.type === 'company' ? 'per_mile' : 'percentage',
      taxWithholdingPercent: 15,
      hasBenefits: driverData.type === 'company'
    };
    
    // In a real implementation, we would add the driver to the database
    // For this mock, we'll just return the new driver
    return {
      data: newDriver,
      error: null
    };
  } catch (error) {
    return {
      data: null,
      error
    };
  }
}

// Mock implementation of updateDriver
export async function updateDriver(id: number, driverData: any): Promise<{ data: Driver | null, error: any }> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  try {
    const driverIndex = mockDrivers.findIndex(d => d.id === id);
    
    if (driverIndex === -1) {
      throw new Error('Driver not found');
    }
    
    const updatedDriver = { ...mockDrivers[driverIndex] };
    
    // Update driver properties
    if (driverData.name !== undefined) updatedDriver.name = driverData.name;
    if (driverData.email !== undefined) updatedDriver.email = driverData.email;
    if (driverData.phone !== undefined) updatedDriver.phone = driverData.phone;
    if (driverData.license !== undefined) updatedDriver.license = driverData.license;
    if (driverData.status !== undefined) updatedDriver.status = driverData.status;
    if (driverData.type !== undefined) {
      updatedDriver.type = driverData.type;
      updatedDriver.employmentType = driverData.type === 'company' ? 'W2' : '1099';
      updatedDriver.payRateType = driverData.type === 'company' ? 'per_mile' : 'percentage';
      updatedDriver.hasBenefits = driverData.type === 'company';
    }
    if (driverData.joinDate !== undefined) updatedDriver.joinDate = driverData.joinDate;
    if (driverData.companyId !== undefined) updatedDriver.companyId = driverData.companyId;
    if (driverData.employmentType !== undefined) updatedDriver.employmentType = driverData.employmentType;
    if (driverData.payRate !== undefined) updatedDriver.payRate = driverData.payRate;
    if (driverData.payRateType !== undefined) updatedDriver.payRateType = driverData.payRateType;
    if (driverData.taxWithholdingPercent !== undefined) updatedDriver.taxWithholdingPercent = driverData.taxWithholdingPercent;
    if (driverData.hasBenefits !== undefined) updatedDriver.hasBenefits = driverData.hasBenefits;
    
    // In a real implementation, we would update the driver in the database
    // For this mock, we'll just return the updated driver
    return {
      data: updatedDriver,
      error: null
    };
  } catch (error) {
    return {
      data: null,
      error
    };
  }
}

// Mock implementation of deleteDriver
export async function deleteDriver(id: number): Promise<{ success: boolean, error: any }> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  try {
    const driverIndex = mockDrivers.findIndex(d => d.id === id);
    
    if (driverIndex === -1) {
      throw new Error('Driver not found');
    }
    
    // In a real implementation, we would delete the driver from the database
    // For this mock, we'll just return success
    return {
      success: true,
      error: null
    };
  } catch (error) {
    return {
      success: false,
      error
    };
  }
}
