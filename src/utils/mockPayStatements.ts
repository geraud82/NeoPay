import { Trip } from '@/types/trip'
import { Expense } from '@/types/expense'
import { CashAdvance } from '@/types/cashAdvance'
import { Deduction } from '@/types/payStatement'

// Fetch trips for a driver within a date range
export async function fetchDriverTrips(companyId: number, driverId: number, startDate: string, endDate: string): Promise<Trip[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return mock data
  return [
    {
      id: 1,
      companyId,
      driverId,
      date: '2025-03-01',
      origin: 'Los Angeles, CA',
      destination: 'San Francisco, CA',
      distance: 380,
      rate: 0.65,
      rateType: 'per_mile',
      amount: 247,
      status: 'completed'
    },
    {
      id: 2,
      companyId,
      driverId,
      date: '2025-03-03',
      origin: 'San Francisco, CA',
      destination: 'Sacramento, CA',
      distance: 90,
      rate: 0.65,
      rateType: 'per_mile',
      amount: 58.5,
      status: 'completed'
    },
    {
      id: 3,
      companyId,
      driverId,
      date: '2025-03-05',
      origin: 'Sacramento, CA',
      destination: 'Los Angeles, CA',
      distance: 385,
      rate: 0.65,
      rateType: 'per_mile',
      amount: 250.25,
      status: 'completed'
    }
  ];
}

// Fetch expenses for a driver within a date range
export async function fetchDriverExpenses(companyId: number, driverId: number, startDate: string, endDate: string): Promise<Expense[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return mock data
  return [
    {
      id: 1,
      companyId,
      driverId,
      date: '2025-03-01',
      category: 'fuel',
      amount: 120.50,
      description: 'Fuel stop in Bakersfield',
      reimbursable: false
    },
    {
      id: 2,
      companyId,
      driverId,
      date: '2025-03-03',
      category: 'maintenance',
      amount: 75.00,
      description: 'Oil change',
      reimbursable: true,
      reimbursementStatus: 'approved'
    },
    {
      id: 3,
      companyId,
      driverId,
      date: '2025-03-04',
      category: 'tolls',
      amount: 18.50,
      description: 'Bay Bridge toll',
      reimbursable: true,
      reimbursementStatus: 'pending'
    }
  ];
}

// Fetch cash advances for a driver within a date range
export async function fetchDriverCashAdvances(companyId: number, driverId: number, startDate: string, endDate: string): Promise<CashAdvance[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return mock data
  return [
    {
      id: 1,
      companyId,
      driverId,
      date: '2025-02-28',
      amount: 200.00,
      description: 'Trip advance',
      status: 'approved'
    }
  ];
}

// Fetch deductions for a driver within a date range
export async function fetchDriverDeductions(companyId: number, driverId: number, startDate: string, endDate: string): Promise<Deduction[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return mock data
  return [
    {
      id: 1,
      companyId,
      driverId,
      type: 'tax',
      description: 'Federal Income Tax',
      amount: 85.75,
      date: '2025-03-15'
    },
    {
      id: 2,
      companyId,
      driverId,
      type: 'insurance',
      description: 'Health Insurance Premium',
      amount: 120.00,
      date: '2025-03-15'
    }
  ];
}

// Fetch driver tax information
export async function fetchDriverTaxInfo(driverId: number): Promise<any> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return mock data
  return {
    id: 1,
    driverId,
    taxWithholdingPercent: 15,
    w2Employee: true,
    federalTaxId: '123-45-6789',
    stateTaxId: 'CA-123456',
    filingStatus: 'single',
    dependents: 0
  };
}

// Calculate trip total
export function calculateTripTotal(trips: Trip[]): number {
  return trips?.reduce((total, trip) => total + (trip.amount || 0), 0) || 0;
}

// Calculate expense total
export function calculateExpenseTotal(expenses: Expense[]): number {
  return expenses?.reduce((total, expense) => total + expense.amount, 0) || 0;
}

// Calculate cash advance total
export function calculateCashAdvanceTotal(cashAdvances: CashAdvance[]): number {
  return cashAdvances?.reduce((total, advance) => total + advance.amount, 0) || 0;
}

// Calculate deductions total
export function calculateDeductionsTotal(deductions: Deduction[]): number {
  return deductions?.reduce((total, deduction) => total + deduction.amount, 0) || 0;
}

// Calculate tax withholding
export function calculateTaxWithholding(grossPay: number, taxWithholdingPercent: number = 15): number {
  return grossPay * (taxWithholdingPercent / 100);
}

// Generate pay statement data
export function generatePayStatementData(
  companyId: number,
  driverId: number,
  driverName: string,
  periodStart: string,
  periodEnd: string,
  trips: Trip[],
  expenses: Expense[],
  cashAdvances: CashAdvance[],
  deductions: Deduction[],
  taxWithholdingPercent: number = 15
) {
  const tripTotal = calculateTripTotal(trips);
  const expenseTotal = calculateExpenseTotal(expenses);
  const cashAdvanceTotal = calculateCashAdvanceTotal(cashAdvances);
  const grossPay = tripTotal;
  const taxWithholding = calculateTaxWithholding(grossPay, taxWithholdingPercent);
  const deductionsTotal = calculateDeductionsTotal(deductions);
  const netPay = grossPay - expenseTotal - cashAdvanceTotal - taxWithholding - deductionsTotal;
  
  return {
    companyId,
    driverId,
    driverName,
    periodStart,
    periodEnd,
    trips,
    expenses,
    cashAdvances,
    deductions,
    tripTotal,
    expenseTotal,
    cashAdvanceTotal,
    grossPay,
    taxWithholding,
    deductionsTotal,
    netPay,
    generatedDate: new Date().toISOString().split('T')[0],
    status: 'draft'
  };
}

// Save pay statement (mock implementation)
export async function savePayStatement(payStatementData: any) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Simulate successful save
  return { 
    payStatementId: Math.floor(Math.random() * 1000) + 1, 
    error: null 
  };
}
