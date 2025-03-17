export interface Expense {
  id: number
  companyId: number
  driverId: number
  driverName?: string
  date: string
  category: 'fuel' | 'maintenance' | 'tolls' | 'parking' | 'meals' | 'other'
  amount: number
  description: string
  receiptId?: number
  reimbursable: boolean
  reimbursementStatus?: 'pending' | 'approved' | 'rejected' | 'paid'
}
