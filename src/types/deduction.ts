export interface Deduction {
  id?: number
  companyId: number
  driverId: number
  payStatementId?: number
  type: 'tax' | 'insurance' | 'retirement' | 'other'
  description: string
  amount: number
  date: string
}
