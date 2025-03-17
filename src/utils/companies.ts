import { supabase } from './supabase';
import { Company, CompanyUser, CompanyStats } from '@/types/company';

/**
 * Fetch all companies for the current user
 */
export async function fetchUserCompanies(): Promise<Company[]> {
  try {
    // Check if we're in a development or test environment
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      // Return mock data for development/testing
      return [
        {
          id: 1,
          name: 'NeoPay Logistics',
          address: '123 Main St',
          city: 'San Francisco',
          state: 'CA',
          zip: '94105',
          phone: '555-123-4567',
          email: 'info@neopay.com',
          website: 'https://neopay.com',
          taxId: '12-3456789',
          status: 'Active',
          subscriptionTier: 'premium',
          subscriptionStatus: 'active',
          trialEndsAt: '2023-12-31T00:00:00.000Z',
          ownerId: '1',
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-01T00:00:00.000Z'
        },
        {
          id: 2,
          name: 'Acme Trucking',
          address: '456 Oak St',
          city: 'Los Angeles',
          state: 'CA',
          zip: '90001',
          phone: '555-987-6543',
          email: 'info@acmetrucking.com',
          website: 'https://acmetrucking.com',
          taxId: '98-7654321',
          status: 'Active',
          subscriptionTier: 'basic',
          subscriptionStatus: 'active',
          trialEndsAt: '2023-12-31T00:00:00.000Z',
          ownerId: '2',
          createdAt: '2023-02-01T00:00:00.000Z',
          updatedAt: '2023-02-01T00:00:00.000Z'
        }
      ];
    }

    // First check if the user is an owner of any companies
    const { data: ownedCompanies, error: ownedError } = await supabase
      .from('companies')
      .select('*')
      .order('name');
    
    if (ownedError) throw ownedError;
    
    // Then check if the user is a member of any companies
    const { data: userCompanies, error: userError } = await supabase
      .from('company_users')
      .select('company:companies(*)')
      .order('company(name)');
    
    if (userError) throw userError;
    
    // Combine and deduplicate the results
    const allCompanies = [
      ...ownedCompanies,
      ...userCompanies.map(uc => uc.company)
    ];
    
    // Remove duplicates by company ID
    const uniqueCompanies = Array.from(
      new Map(allCompanies.map(company => [company.id, company])).values()
    );
    
    // Transform to match frontend interface
    return uniqueCompanies.map(company => ({
      id: company.id,
      name: company.name,
      address: company.address,
      city: company.city,
      state: company.state,
      zip: company.zip,
      phone: company.phone,
      email: company.email,
      website: company.website,
      taxId: company.tax_id,
      status: company.status,
      subscriptionTier: company.subscription_tier,
      subscriptionStatus: company.subscription_status,
      trialEndsAt: company.trial_ends_at,
      ownerId: company.owner_id,
      createdAt: company.created_at,
      updatedAt: company.updated_at
    }));
  } catch (error) {
    console.error('Error fetching user companies:', error);
    // Return empty array on error
    return [];
  }
}

/**
 * Fetch a specific company by ID
 */
export async function fetchCompany(id: number): Promise<Company | null> {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      address: data.address,
      city: data.city,
      state: data.state,
      zip: data.zip,
      phone: data.phone,
      email: data.email,
      website: data.website,
      taxId: data.tax_id,
      status: data.status,
      subscriptionTier: data.subscription_tier,
      subscriptionStatus: data.subscription_status,
      trialEndsAt: data.trial_ends_at,
      ownerId: data.owner_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error(`Error fetching company ${id}:`, error);
    return null;
  }
}

/**
 * Create a new company
 */
export async function createCompany(companyData: Omit<Company, 'id'>): Promise<{ data: Company | null, error: any }> {
  try {
    const { data, error } = await supabase
      .from('companies')
      .insert([
        {
          name: companyData.name,
          address: companyData.address,
          city: companyData.city,
          state: companyData.state,
          zip: companyData.zip,
          phone: companyData.phone,
          email: companyData.email,
          website: companyData.website,
          tax_id: companyData.taxId,
          status: companyData.status,
          subscription_tier: companyData.subscriptionTier,
          subscription_status: companyData.subscriptionStatus,
          trial_ends_at: companyData.trialEndsAt,
          owner_id: companyData.ownerId
        }
      ])
      .select();
    
    if (error) throw error;
    
    const company = data[0];
    return {
      data: {
        id: company.id,
        name: company.name,
        address: company.address,
        city: company.city,
        state: company.state,
        zip: company.zip,
        phone: company.phone,
        email: company.email,
        website: company.website,
        taxId: company.tax_id,
        status: company.status,
        subscriptionTier: company.subscription_tier,
        subscriptionStatus: company.subscription_status,
        trialEndsAt: company.trial_ends_at,
        ownerId: company.owner_id,
        createdAt: company.created_at,
        updatedAt: company.updated_at
      },
      error: null
    };
  } catch (error) {
    console.error('Error creating company:', error);
    return { data: null, error };
  }
}

/**
 * Update an existing company
 */
export async function updateCompany(id: number, companyData: Partial<Company>): Promise<{ data: Company | null, error: any }> {
  try {
    const updateData: any = {};
    
    if (companyData.name !== undefined) updateData.name = companyData.name;
    if (companyData.address !== undefined) updateData.address = companyData.address;
    if (companyData.city !== undefined) updateData.city = companyData.city;
    if (companyData.state !== undefined) updateData.state = companyData.state;
    if (companyData.zip !== undefined) updateData.zip = companyData.zip;
    if (companyData.phone !== undefined) updateData.phone = companyData.phone;
    if (companyData.email !== undefined) updateData.email = companyData.email;
    if (companyData.website !== undefined) updateData.website = companyData.website;
    if (companyData.taxId !== undefined) updateData.tax_id = companyData.taxId;
    if (companyData.status !== undefined) updateData.status = companyData.status;
    if (companyData.subscriptionTier !== undefined) updateData.subscription_tier = companyData.subscriptionTier;
    if (companyData.subscriptionStatus !== undefined) updateData.subscription_status = companyData.subscriptionStatus;
    if (companyData.trialEndsAt !== undefined) updateData.trial_ends_at = companyData.trialEndsAt;
    if (companyData.ownerId !== undefined) updateData.owner_id = companyData.ownerId;
    
    const { data, error } = await supabase
      .from('companies')
      .update(updateData)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    
    const company = data[0];
    return {
      data: {
        id: company.id,
        name: company.name,
        address: company.address,
        city: company.city,
        state: company.state,
        zip: company.zip,
        phone: company.phone,
        email: company.email,
        website: company.website,
        taxId: company.tax_id,
        status: company.status,
        subscriptionTier: company.subscription_tier,
        subscriptionStatus: company.subscription_status,
        trialEndsAt: company.trial_ends_at,
        ownerId: company.owner_id,
        createdAt: company.created_at,
        updatedAt: company.updated_at
      },
      error: null
    };
  } catch (error) {
    console.error(`Error updating company ${id}:`, error);
    return { data: null, error };
  }
}

/**
 * Delete a company
 */
export async function deleteCompany(id: number): Promise<{ success: boolean, error: any }> {
  try {
    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error) {
    console.error(`Error deleting company ${id}:`, error);
    return { success: false, error };
  }
}

/**
 * Fetch users for a specific company
 */
export async function fetchCompanyUsers(companyId: number): Promise<CompanyUser[]> {
  try {
    const { data, error } = await supabase
      .from('company_users')
      .select('*')
      .eq('company_id', companyId)
      .order('role');
    
    if (error) throw error;
    
    return data.map(user => ({
      id: user.id,
      companyId: user.company_id,
      userId: user.user_id,
      role: user.role,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    }));
  } catch (error) {
    console.error(`Error fetching users for company ${companyId}:`, error);
    return [];
  }
}

/**
 * Add a user to a company
 */
export async function addCompanyUser(companyId: number, email: string, role: string): Promise<{ data: CompanyUser | null, error: any }> {
  try {
    // First, get the user ID from the email
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();
    
    if (userError) throw userError;
    
    if (!userData) {
      throw new Error(`User with email ${email} not found`);
    }
    
    // Then add the user to the company
    const { data, error } = await supabase
      .from('company_users')
      .insert([
        {
          company_id: companyId,
          user_id: userData.id,
          role
        }
      ])
      .select();
    
    if (error) throw error;
    
    const companyUser = data[0];
    return {
      data: {
        id: companyUser.id,
        companyId: companyUser.company_id,
        userId: companyUser.user_id,
        role: companyUser.role,
        createdAt: companyUser.created_at,
        updatedAt: companyUser.updated_at
      },
      error: null
    };
  } catch (error) {
    console.error(`Error adding user to company ${companyId}:`, error);
    return { data: null, error };
  }
}

/**
 * Update a user's role in a company
 */
export async function updateCompanyUserRole(companyId: number, userId: string, role: string): Promise<{ success: boolean, error: any }> {
  try {
    const { error } = await supabase
      .from('company_users')
      .update({ role })
      .eq('company_id', companyId)
      .eq('user_id', userId);
    
    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error) {
    console.error(`Error updating user role in company ${companyId}:`, error);
    return { success: false, error };
  }
}

/**
 * Remove a user from a company
 */
export async function removeCompanyUser(companyId: number, userId: string): Promise<{ success: boolean, error: any }> {
  try {
    const { error } = await supabase
      .from('company_users')
      .delete()
      .eq('company_id', companyId)
      .eq('user_id', userId);
    
    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error) {
    console.error(`Error removing user from company ${companyId}:`, error);
    return { success: false, error };
  }
}

/**
 * Fetch statistics for a company
 */
export async function fetchCompanyStats(companyId: number): Promise<CompanyStats | null> {
  try {
    const { data, error } = await supabase
      .from('company_dashboard_stats')
      .select('*')
      .eq('company_id', companyId)
      .single();
    
    if (error) throw error;
    
    return {
      totalDrivers: data.total_drivers || 0,
      activeDrivers: data.active_drivers || 0,
      companyDrivers: data.company_drivers || 0,
      ownerOperators: data.owner_operators || 0,
      w2Drivers: data.w2_drivers || 0,
      contractors: data.contractors || 0,
      totalPayments: data.total_payments || 0,
      pendingPayments: data.pending_payments || 0,
      totalTripEarnings: data.total_trip_earnings || 0,
      totalLoads: data.total_loads || 0,
      assignedLoads: data.assigned_loads || 0,
      inProgressLoads: data.in_progress_loads || 0,
      completedLoads: data.completed_loads || 0
    };
  } catch (error) {
    console.error(`Error fetching stats for company ${companyId}:`, error);
    
    // Return default stats if the view doesn't exist yet
    return {
      totalDrivers: 0,
      activeDrivers: 0,
      companyDrivers: 0,
      ownerOperators: 0,
      w2Drivers: 0,
      contractors: 0,
      totalPayments: 0,
      pendingPayments: 0,
      totalTripEarnings: 0,
      totalLoads: 0,
      assignedLoads: 0,
      inProgressLoads: 0,
      completedLoads: 0
    };
  }
}
