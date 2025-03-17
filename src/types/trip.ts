export interface Trip {
  id: number
  companyId: number
  driverId: number
  loadId?: number
  driverName?: string
  driverType?: 'company' | 'owner'
  date: string
  origin: string
  destination: string
  distance: number
  rate: number
  rateType: 'per_mile' | 'percentage' | 'hourly' | 'fixed'
  hoursWorked?: number
  amount: number
  status: 'pending' | 'completed' | 'cancelled'
}

export interface Load {
  id: number
  companyId: number
  driverId?: number
  loadNumber?: string
  customer?: string
  pickupDate: string
  deliveryDate: string
  origin: string
  destination: string
  distance: number
  status: 'assigned' | 'in_progress' | 'completed' | 'cancelled'
  rate?: number
  createdAt?: string
  updatedAt?: string
}
