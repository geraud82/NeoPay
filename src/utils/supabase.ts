import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing. Please check your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Authentication helpers
export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  return { data, error };
};

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: typeof window !== 'undefined' 
        ? `${window.location.origin}/auth/callback` 
        : 'http://localhost:3000/auth/callback',
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });
  
  return { data, error };
};

export const signUp = async (email: string, password: string, metadata: any = {}) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    },
  });
  
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  return { user: data.user, error };
};

export const getSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  return { session: data.session, error };
};

export const updateUserMetadata = async (metadata: any) => {
  const { data, error } = await supabase.auth.updateUser({
    data: metadata
  });
  
  return { data, error };
};

// Database helpers
export const fetchDrivers = async () => {
  const { data, error } = await supabase
    .from('drivers')
    .select('*')
    .order('name');
  
  return { data, error };
};

export const fetchDriver = async (id: number) => {
  const { data, error } = await supabase
    .from('drivers')
    .select('*')
    .eq('id', id)
    .single();
  
  return { data, error };
};

export const createDriver = async (driverData: any) => {
  const { data, error } = await supabase
    .from('drivers')
    .insert([driverData])
    .select();
  
  return { data, error };
};

export const updateDriver = async (id: number, driverData: any) => {
  const { data, error } = await supabase
    .from('drivers')
    .update(driverData)
    .eq('id', id)
    .select();
  
  return { data, error };
};

export const deleteDriver = async (id: number) => {
  const { error } = await supabase
    .from('drivers')
    .delete()
    .eq('id', id);
  
  return { error };
};

export const fetchPayments = async () => {
  const { data, error } = await supabase
    .from('payments')
    .select('*, driver:drivers(name)')
    .order('date', { ascending: false });
  
  return { data, error };
};

export const createPayment = async (paymentData: any) => {
  const { data, error } = await supabase
    .from('payments')
    .insert([paymentData])
    .select();
  
  return { data, error };
};

export const fetchReceipts = async () => {
  const { data, error } = await supabase
    .from('receipts')
    .select('*')
    .order('uploadDate', { ascending: false });
  
  return { data, error };
};

export const createReceipt = async (receiptData: any) => {
  const { data, error } = await supabase
    .from('receipts')
    .insert([receiptData])
    .select();
  
  return { data, error };
};

export const updateReceipt = async (id: number, receiptData: any) => {
  const { data, error } = await supabase
    .from('receipts')
    .update(receiptData)
    .eq('id', id)
    .select();
  
  return { data, error };
};

export const fetchExpenses = async () => {
  const { data, error } = await supabase
    .from('expenses')
    .select('*, driver:drivers(name)')
    .order('date', { ascending: false });
  
  return { data, error };
};

export const createExpense = async (expenseData: any) => {
  const { data, error } = await supabase
    .from('expenses')
    .insert([expenseData])
    .select();
  
  return { data, error };
};

// Storage helpers
export const uploadFile = async (bucket: string, path: string, file: File) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });
  
  return { data, error };
};

export const getFileUrl = (bucket: string, path: string) => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};
