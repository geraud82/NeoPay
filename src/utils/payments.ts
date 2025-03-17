import { supabase } from './supabase';

interface Payment {
  id: number;
  driverId: number;
  driverName?: string;
  amount: number;
  date: string;
  status: string;
  description?: string;
}

interface PaymentResponse {
  data: Payment | Payment[] | null;
  error: any;
}

// Fetch all payments
export async function fetchPayments(): Promise<PaymentResponse> {
  try {
    const response = await fetch('/api/payments');
    
    if (!response.ok) {
      throw new Error(`Error fetching payments: ${response.statusText}`);
    }
    
    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error('Error in fetchPayments:', error);
    return { data: null, error };
  }
}

// Fetch payments for a specific driver
export async function fetchDriverPayments(driverId: number): Promise<PaymentResponse> {
  try {
    const response = await fetch(`/api/payments/driver/${driverId}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching driver payments: ${response.statusText}`);
    }
    
    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error(`Error in fetchDriverPayments for driver ${driverId}:`, error);
    return { data: null, error };
  }
}

// Fetch a specific payment
export async function fetchPayment(id: number): Promise<PaymentResponse> {
  try {
    const response = await fetch(`/api/payments/${id}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching payment: ${response.statusText}`);
    }
    
    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error(`Error in fetchPayment for payment ${id}:`, error);
    return { data: null, error };
  }
}

// Create a new payment
export async function createPayment(paymentData: Omit<Payment, 'id'>): Promise<PaymentResponse> {
  try {
    const response = await fetch('/api/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });
    
    if (!response.ok) {
      throw new Error(`Error creating payment: ${response.statusText}`);
    }
    
    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error('Error in createPayment:', error);
    return { data: null, error };
  }
}

// Update a payment
export async function updatePayment(id: number, paymentData: Partial<Payment>): Promise<PaymentResponse> {
  try {
    const response = await fetch(`/api/payments/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });
    
    if (!response.ok) {
      throw new Error(`Error updating payment: ${response.statusText}`);
    }
    
    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error(`Error in updatePayment for payment ${id}:`, error);
    return { data: null, error };
  }
}

// Delete a payment
export async function deletePayment(id: number): Promise<{ success: boolean; error: any }> {
  try {
    const response = await fetch(`/api/payments/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Error deleting payment: ${response.statusText}`);
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error(`Error in deletePayment for payment ${id}:`, error);
    return { success: false, error };
  }
}

// Generate a payment statement
export async function generatePaymentStatement(
  driverId: number,
  periodStart: string,
  periodEnd: string
): Promise<PaymentResponse> {
  try {
    const response = await fetch('/api/payments/generate-statement', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        driverId,
        periodStart,
        periodEnd,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Error generating payment statement: ${response.statusText}`);
    }
    
    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error('Error in generatePaymentStatement:', error);
    return { data: null, error };
  }
}

// Update payment status
export async function updatePaymentStatus(
  id: number,
  status: string
): Promise<PaymentResponse> {
  try {
    const response = await fetch(`/api/payments/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    
    if (!response.ok) {
      throw new Error(`Error updating payment status: ${response.statusText}`);
    }
    
    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error(`Error in updatePaymentStatus for payment ${id}:`, error);
    return { data: null, error };
  }
}
