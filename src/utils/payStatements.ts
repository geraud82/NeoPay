import { Trip } from '@/types/trip'
import { Expense } from '@/types/expense'
import { CashAdvance } from '@/types/cashAdvance'
import { Deduction } from '@/types/payStatement'
import { supabase } from '@/utils/supabase'

// Fetch trips for a driver within a date range
export async function fetchDriverTrips(companyId: number, driverId: number, startDate: string, endDate: string): Promise<Trip[]> {
  try {
    const { data, error } = await supabase
      .from('trips')
      .select('*, driver:drivers(name, type)')
      .eq('company_id', companyId)
      .eq('driver_id', driverId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });
    
    if (error) throw error;
    
    // Transform the data to match the frontend interface
    return data.map(trip => ({
      id: trip.id,
      companyId: trip.company_id,
      driverId: trip.driver_id,
      loadId: trip.load_id,
      driverName: trip.driver?.name,
      driverType: trip.driver?.type,
      date: trip.date,
      origin: trip.origin,
      destination: trip.destination,
      distance: trip.distance,
      rate: trip.rate,
      rateType: trip.rate_type,
      hoursWorked: trip.hours_worked,
      amount: trip.amount,
      status: trip.status
    }));
  } catch (error) {
    console.error('Error fetching driver trips:', error)
    // Return mock data for now
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
    ]
  }
}

// Fetch expenses for a driver within a date range
export async function fetchDriverExpenses(companyId: number, driverId: number, startDate: string, endDate: string): Promise<Expense[]> {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .select('*, driver:drivers(name)')
      .eq('company_id', companyId)
      .eq('driver_id', driverId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });
    
    if (error) throw error;
    
    // Transform the data to match the frontend interface
    return data.map(expense => ({
      id: expense.id,
      companyId: expense.company_id,
      driverId: expense.driver_id,
      driverName: expense.driver?.name,
      date: expense.date,
      category: expense.category,
      amount: expense.amount,
      description: expense.description,
      receiptId: expense.receipt_id,
      reimbursable: expense.reimbursable,
      reimbursementStatus: expense.reimbursement_status
    }));
  } catch (error) {
    console.error('Error fetching driver expenses:', error)
    // Return mock data for now
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
    ]
  }
}

// Fetch cash advances for a driver within a date range
export async function fetchDriverCashAdvances(companyId: number, driverId: number, startDate: string, endDate: string): Promise<CashAdvance[]> {
  try {
    const { data, error } = await supabase
      .from('cash_advances')
      .select('*, driver:drivers(name)')
      .eq('company_id', companyId)
      .eq('driver_id', driverId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });
    
    if (error) throw error;
    
    // Transform the data to match the frontend interface
    return data.map(advance => ({
      id: advance.id,
      companyId: advance.company_id,
      driverId: advance.driver_id,
      driverName: advance.driver?.name,
      date: advance.date,
      amount: advance.amount,
      description: advance.description,
      status: advance.status
    }));
  } catch (error) {
    console.error('Error fetching driver cash advances:', error)
    // Return mock data for now
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
    ]
  }
}

// Fetch deductions for a driver within a date range
export async function fetchDriverDeductions(companyId: number, driverId: number, startDate: string, endDate: string): Promise<Deduction[]> {
  try {
    const { data, error } = await supabase
      .from('deductions')
      .select('*')
      .eq('company_id', companyId)
      .eq('driver_id', driverId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });
    
    if (error) throw error;
    
    // Transform the data to match the frontend interface
    return data.map(deduction => ({
      id: deduction.id,
      companyId: deduction.company_id,
      driverId: deduction.driver_id,
      payStatementId: deduction.pay_statement_id,
      type: deduction.type,
      description: deduction.description,
      amount: deduction.amount,
      date: deduction.date
    }));
  } catch (error) {
    console.error('Error fetching driver deductions:', error)
    // Return mock data for now
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
    ]
  }
}

// Fetch driver tax information
export async function fetchDriverTaxInfo(driverId: number): Promise<any> {
  try {
    const { data, error } = await supabase
      .from('driver_tax_info')
      .select('*')
      .eq('driver_id', driverId)
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching driver tax info:', error)
    return null;
  }
}

// Calculate trip total
export function calculateTripTotal(trips: Trip[]): number {
  return trips?.reduce((total, trip) => total + (trip.amount || 0), 0) || 0
}

// Calculate expense total
export function calculateExpenseTotal(expenses: Expense[]): number {
  return expenses?.reduce((total, expense) => total + expense.amount, 0) || 0
}

// Calculate cash advance total
export function calculateCashAdvanceTotal(cashAdvances: CashAdvance[]): number {
  return cashAdvances?.reduce((total, advance) => total + advance.amount, 0) || 0
}

// Calculate deductions total
export function calculateDeductionsTotal(deductions: Deduction[]): number {
  return deductions?.reduce((total, deduction) => total + deduction.amount, 0) || 0
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
  const tripTotal = calculateTripTotal(trips)
  const expenseTotal = calculateExpenseTotal(expenses)
  const cashAdvanceTotal = calculateCashAdvanceTotal(cashAdvances)
  const grossPay = tripTotal
  const taxWithholding = calculateTaxWithholding(grossPay, taxWithholdingPercent)
  const deductionsTotal = calculateDeductionsTotal(deductions)
  const netPay = grossPay - expenseTotal - cashAdvanceTotal - taxWithholding - deductionsTotal
  
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
  }
}

// Save pay statement to database
export async function savePayStatement(payStatementData: any) {
  try {
    // First save the pay statement
    const { data: payStatement, error: payStatementError } = await supabase
      .from('pay_statements')
      .insert([
        {
          company_id: payStatementData.companyId,
          driver_id: payStatementData.driverId,
          period_start: payStatementData.periodStart,
          period_end: payStatementData.periodEnd,
          trip_total: payStatementData.tripTotal,
          expense_total: payStatementData.expenseTotal,
          cash_advance_total: payStatementData.cashAdvanceTotal,
          gross_pay: payStatementData.grossPay,
          tax_withholding: payStatementData.taxWithholding,
          deductions: payStatementData.deductionsTotal,
          net_pay: payStatementData.netPay,
          generated_date: payStatementData.generatedDate,
          status: payStatementData.status
        }
      ])
      .select();
    
    if (payStatementError) throw payStatementError;
    
    const payStatementId = payStatement[0].id;
    
    // Then save the pay statement items
    const payStatementItems = [];
    
    // Add trips as items
    if (payStatementData.trips?.length) {
      payStatementData.trips.forEach((trip: Trip) => {
        payStatementItems.push({
          pay_statement_id: payStatementId,
          item_type: 'trip',
          reference_id: trip.id,
          description: `Trip: ${trip.origin} to ${trip.destination}`,
          amount: trip.amount
        });
      });
    }
    
    // Add expenses as items
    if (payStatementData.expenses?.length) {
      payStatementData.expenses.forEach((expense: Expense) => {
        payStatementItems.push({
          pay_statement_id: payStatementId,
          item_type: 'expense',
          reference_id: expense.id,
          description: `Expense: ${expense.description}`,
          amount: -expense.amount
        });
      });
    }
    
    // Add cash advances as items
    if (payStatementData.cashAdvances?.length) {
      payStatementData.cashAdvances.forEach((advance: CashAdvance) => {
        payStatementItems.push({
          pay_statement_id: payStatementId,
          item_type: 'cash_advance',
          reference_id: advance.id,
          description: `Cash Advance: ${advance.description}`,
          amount: -advance.amount
        });
      });
    }
    
    // Add deductions as items
    if (payStatementData.deductions?.length) {
      payStatementData.deductions.forEach((deduction: Deduction) => {
        payStatementItems.push({
          pay_statement_id: payStatementId,
          item_type: 'deduction',
          reference_id: deduction.id,
          description: `Deduction: ${deduction.description}`,
          amount: -deduction.amount
        });
      });
    }
    
    // Add tax withholding as an item
    payStatementItems.push({
      pay_statement_id: payStatementId,
      item_type: 'deduction',
      description: 'Tax Withholding',
      amount: -payStatementData.taxWithholding
    });
    
    // Save all items
    if (payStatementItems.length > 0) {
      const { error: itemsError } = await supabase
        .from('pay_statement_items')
        .insert(payStatementItems);
      
      if (itemsError) throw itemsError;
    }
    
    return { payStatementId, error: null };
  } catch (error) {
    console.error('Error saving pay statement:', error);
    return { payStatementId: null, error };
  }
}
