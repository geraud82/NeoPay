import { Trip } from './trip'
import { Expense } from './expense'
import { CashAdvance } from './cashAdvance'

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

export interface PayStatement {
  id?: number
  companyId: number
  driverId: number
  driverName: string
  periodStart: string
  periodEnd: string
  trips: Trip[]
  expenses: Expense[]
  cashAdvances: CashAdvance[]
  deductions: Deduction[]
  tripTotal: number
  expenseTotal: number
  cashAdvanceTotal: number
  grossPay: number
  taxWithholding: number
  deductionsTotal: number
  netPay: number
  generatedDate: string
  status: 'draft' | 'finalized' | 'paid'
  paymentId?: number
  tripDetails?: string  // Added for manual trip details entry
}

export interface PayStatementItem {
  id?: number
  payStatementId: number
  itemType: 'trip' | 'expense' | 'cash_advance' | 'deduction' | 'adjustment'
  referenceId?: number
  description: string
  amount: number
}
