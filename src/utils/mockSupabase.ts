// Mock Supabase functions for use with MockAuthContext

// Mock user data
let mockUsers: any[] = [];

let mockUser = {
  id: '1',
  email: 'admin@example.com',
  user_metadata: {
    role: 'admin',
    full_name: 'Admin User',
    avatar_url: '',
    driverId: 1,
    companyId: 1,
    phone: '555-123-4567',
    company_name: 'NeoPay Logistics',
    address: '123 Main St, San Francisco, CA 94105',
    bio: 'Fleet management professional with 10+ years of experience.',
    notifications: {
      email: true,
      sms: false,
      push: true
    }
  }
};

// Mock data for database tables
const mockCompanies = [
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
    tax_id: '12-3456789',
    status: 'active',
    subscription_tier: 'pro',
    subscription_status: 'active',
    trial_ends_at: null,
    owner_id: '1',
    created_at: '2023-01-01T00:00:00.000Z',
    updated_at: '2023-01-01T00:00:00.000Z'
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
    tax_id: '98-7654321',
    status: 'active',
    subscription_tier: 'basic',
    subscription_status: 'active',
    trial_ends_at: null,
    owner_id: '2',
    created_at: '2023-02-01T00:00:00.000Z',
    updated_at: '2023-02-01T00:00:00.000Z'
  }
];

const mockCompanyUsers = [
  {
    id: 1,
    company_id: 1,
    user_id: '1',
    role: 'admin',
    created_at: '2023-01-01T00:00:00.000Z',
    updated_at: '2023-01-01T00:00:00.000Z',
    company: mockCompanies[0] // Reference to the company
  }
];

// Sign up function
export const signUp = async (email: string, password: string, metadata: any = {}) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  try {
    // Create a new mock user
    const newUser = {
      id: `${mockUsers.length + 2}`, // Start from 2 since we already have user with id 1
      email,
      user_metadata: metadata
    };
    
    // Add to mock users array
    mockUsers.push(newUser);
    
    return { 
      data: { user: newUser },
      error: null 
    };
  } catch (error) {
    return { 
      data: null,
      error 
    };
  }
};

// Sign in function
export const signIn = async (email: string, password: string) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  try {
    // For mock purposes, we'll just return the admin user
    return { 
      data: { user: mockUser },
      error: null 
    };
  } catch (error) {
    return { 
      data: null,
      error 
    };
  }
};

// Sign in with Google function
export const signInWithGoogle = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  try {
    return { 
      data: { url: 'https://accounts.google.com/o/oauth2/auth' },
      error: null 
    };
  } catch (error) {
    return { 
      data: null,
      error 
    };
  }
};

// Sign out function
export const signOut = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  try {
    return { error: null };
  } catch (error) {
    return { error };
  }
};

// Get current user function
export const getCurrentUser = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  try {
    return { 
      user: mockUser,
      error: null 
    };
  } catch (error) {
    return { 
      user: null,
      error 
    };
  }
};

// Get session function
export const getSession = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  try {
    return { 
      session: { user: mockUser },
      error: null 
    };
  } catch (error) {
    return { 
      session: null,
      error 
    };
  }
};

// Update user metadata
export const updateUserMetadata = async (metadata: any) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  try {
    // Update the mock user metadata
    mockUser.user_metadata = {
      ...mockUser.user_metadata,
      ...metadata
    };
    
    return { 
      data: { user: mockUser },
      error: null 
    };
  } catch (error) {
    return { 
      data: null,
      error 
    };
  }
};

// Mock Supabase object
export const supabase = {
  auth: {
    signUp: async ({ email, password, options }: any) => {
      return signUp(email, password, options?.data);
    },
    signInWithPassword: async ({ email, password }: any) => {
      return signIn(email, password);
    },
    signInWithOAuth: async ({ provider, options }: any) => {
      return signInWithGoogle();
    },
    signOut: async () => {
      return signOut();
    },
    getUser: async () => {
      const { user, error } = await getCurrentUser();
      return { data: { user }, error };
    },
    getSession: async () => {
      const { session, error } = await getSession();
      return { data: { session }, error };
    },
    updateUser: async ({ data }: any) => {
      return updateUserMetadata(data);
    },
    onAuthStateChange: (callback: any) => {
      // Mock auth state change listener
      return {
        data: {
          subscription: {
            unsubscribe: () => {}
          }
        }
      };
    }
  },
  // Mock database methods
  from: (table: string) => {
    // Special case for fetchUserCompanies function
    if (table === 'companies') {
      return {
        select: () => ({
          order: () => ({
            then: (callback: Function) => {
              // Simulate API delay
              setTimeout(() => {
                callback({ data: mockCompanies, error: null });
              }, 100);
            }
          })
        })
      };
    }
    
    if (table === 'company_users') {
      return {
        select: () => ({
          order: () => ({
            then: (callback: Function) => {
              // Simulate API delay
              setTimeout(() => {
                callback({ data: mockCompanyUsers, error: null });
              }, 100);
            }
          })
        })
      };
    }
    
    // Generic implementation for other tables
    return {
      select: (columns: string = '*') => {
        return {
          eq: (column: string, value: any) => {
            return {
              single: async () => {
                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 100));
                
                let data = null;
                let error = null;
                
                try {
                  if (table === 'companies') {
                    data = mockCompanies.find(company => company[column as keyof typeof company] === value);
                  }
                } catch (e) {
                  error = e;
                }
                
                return { data, error };
              }
            };
          }
        };
      },
      insert: (records: any[]) => {
        return {
          select: async () => {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 100));
            
            let data: any[] = [];
            let error = null;
            
            try {
              if (table === 'companies') {
                const newCompany = {
                  ...records[0],
                  id: mockCompanies.length + 1,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                };
                mockCompanies.push(newCompany);
                data = [newCompany];
              } else if (table === 'company_users') {
                const newUser = {
                  ...records[0],
                  id: mockCompanyUsers.length + 1,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                };
                mockCompanyUsers.push(newUser);
                data = [newUser];
              }
            } catch (e) {
              error = e;
            }
            
            return { data, error };
          }
        };
      },
      update: (updates: any) => {
        return {
          eq: (column: string, value: any) => {
            return {
              select: async () => {
                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 100));
                
                let data: any[] = [];
                let error = null;
                
                try {
                  if (table === 'companies') {
                    const index = mockCompanies.findIndex(company => company[column as keyof typeof company] === value);
                    if (index !== -1) {
                      mockCompanies[index] = {
                        ...mockCompanies[index],
                        ...updates,
                        updated_at: new Date().toISOString()
                      };
                      data = [mockCompanies[index]];
                    }
                  } else if (table === 'company_users') {
                    const index = mockCompanyUsers.findIndex(user => user[column as keyof typeof user] === value);
                    if (index !== -1) {
                      mockCompanyUsers[index] = {
                        ...mockCompanyUsers[index],
                        ...updates,
                        updated_at: new Date().toISOString()
                      };
                      data = [mockCompanyUsers[index]];
                    }
                  }
                } catch (e) {
                  error = e;
                }
                
                return { data, error };
              }
            };
          }
        };
      },
      delete: () => {
        return {
          eq: (column: string, value: any) => {
            return {
              async then(callback: (result: any) => void) {
                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 100));
                
                let error = null;
                
                try {
                  if (table === 'companies') {
                    const index = mockCompanies.findIndex(company => company[column as keyof typeof company] === value);
                    if (index !== -1) {
                      mockCompanies.splice(index, 1);
                    }
                  } else if (table === 'company_users') {
                    const index = mockCompanyUsers.findIndex(user => user[column as keyof typeof user] === value);
                    if (index !== -1) {
                      mockCompanyUsers.splice(index, 1);
                    }
                  }
                } catch (e) {
                  error = e;
                }
                
                return callback({ error });
              }
            };
          }
        };
      }
    };
  },
  storage: {
    from: (bucket: string) => {
      return {
        upload: async (path: string, file: File) => {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          return {
            data: { path },
            error: null
          };
        },
        getPublicUrl: (path: string) => {
          return {
            data: {
              publicUrl: `https://mock-storage.com/${bucket}/${path}`
            }
          };
        }
      };
    }
  }
};
