export interface Company {
  id: number;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  phone?: string;
  email?: string;
  website?: string;
  taxId?: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  subscriptionTier: 'basic' | 'premium' | 'enterprise';
  subscriptionStatus: 'active' | 'trial' | 'expired' | 'cancelled';
  trialEndsAt?: string;
  createdAt?: string;
  updatedAt?: string;
  ownerId: string;
}

export interface CompanyUser {
  id: number;
  companyId: number;
  userId: string;
  role: 'admin' | 'manager' | 'accountant' | 'dispatcher' | 'user';
  createdAt?: string;
  updatedAt?: string;
}

export interface CompanyStats {
  totalDrivers: number;
  activeDrivers: number;
  companyDrivers: number;
  ownerOperators: number;
  w2Drivers: number;
  contractors: number;
  totalPayments: number;
  pendingPayments: number;
  totalTripEarnings: number;
  totalLoads: number;
  assignedLoads: number;
  inProgressLoads: number;
  completedLoads: number;
}
