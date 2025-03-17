export interface CashAdvance {
  id: number
  companyId: number
  driverId: number
  driverName?: string
  date: string
  amount: number
  description: string
  status: 'pending' | 'approved' | 'rejected' | 'paid'
}
