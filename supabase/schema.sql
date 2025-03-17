-- NeoPay Database Schema for Supabase

-- Enable Row Level Security (RLS)
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create tables

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  company_name TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

-- Companies table
CREATE TABLE IF NOT EXISTS public.companies (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  tax_id TEXT,
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Suspended')),
  subscription_tier TEXT DEFAULT 'basic' CHECK (subscription_tier IN ('basic', 'premium', 'enterprise')),
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'trial', 'expired', 'cancelled')),
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Company Users table (for managing users within a company)
CREATE TABLE IF NOT EXISTS public.company_users (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'accountant', 'dispatcher', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(company_id, user_id)
);

-- Drivers table
CREATE TABLE IF NOT EXISTS public.drivers (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  license TEXT NOT NULL,
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
  type TEXT DEFAULT 'company' CHECK (type IN ('company', 'owner')),
  employment_type TEXT DEFAULT 'W2' CHECK (employment_type IN ('W2', '1099')),
  join_date DATE DEFAULT CURRENT_DATE,
  pay_rate DECIMAL(10, 2),
  pay_rate_type TEXT DEFAULT 'per_mile' CHECK (pay_rate_type IN ('per_mile', 'percentage', 'hourly', 'fixed')),
  tax_withholding_percent DECIMAL(5, 2),
  has_benefits BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Driver Tax Information
CREATE TABLE IF NOT EXISTS public.driver_tax_info (
  id SERIAL PRIMARY KEY,
  driver_id INTEGER REFERENCES public.drivers(id) ON DELETE CASCADE,
  ssn_last_four TEXT,
  tax_id TEXT,
  w9_on_file BOOLEAN DEFAULT FALSE,
  w4_on_file BOOLEAN DEFAULT FALSE,
  filing_status TEXT,
  allowances INTEGER,
  additional_withholding DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Driver Payment Methods
CREATE TABLE IF NOT EXISTS public.driver_payment_methods (
  id SERIAL PRIMARY KEY,
  driver_id INTEGER REFERENCES public.drivers(id) ON DELETE CASCADE,
  payment_type TEXT CHECK (payment_type IN ('direct_deposit', 'check', 'cash', 'other')),
  is_default BOOLEAN DEFAULT FALSE,
  bank_name TEXT,
  account_type TEXT,
  account_last_four TEXT,
  routing_number_last_four TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Loads table
CREATE TABLE IF NOT EXISTS public.loads (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES public.companies(id) ON DELETE CASCADE,
  driver_id INTEGER REFERENCES public.drivers(id) ON DELETE SET NULL,
  load_number TEXT,
  customer TEXT,
  pickup_date TIMESTAMP WITH TIME ZONE,
  delivery_date TIMESTAMP WITH TIME ZONE,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  distance DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed', 'cancelled')),
  rate DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES public.companies(id) ON DELETE CASCADE,
  driver_id INTEGER REFERENCES public.drivers(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Processing', 'Paid', 'Failed', 'Cancelled')),
  payment_method TEXT DEFAULT 'direct_deposit' CHECK (payment_method IN ('direct_deposit', 'check', 'cash', 'other')),
  reference_number TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Expenses table
CREATE TABLE IF NOT EXISTS public.expenses (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES public.companies(id) ON DELETE CASCADE,
  driver_id INTEGER REFERENCES public.drivers(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  description TEXT,
  receipt_id INTEGER,
  reimbursable BOOLEAN DEFAULT FALSE,
  reimbursement_status TEXT DEFAULT 'pending' CHECK (reimbursement_status IN ('pending', 'approved', 'rejected', 'paid')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Receipts table
CREATE TABLE IF NOT EXISTS public.receipts (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES public.companies(id) ON DELETE CASCADE,
  driver_id INTEGER REFERENCES public.drivers(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  upload_date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'Processing' CHECK (status IN ('Processing', 'Completed', 'Failed')),
  vendor TEXT,
  date DATE,
  amount DECIMAL(10, 2),
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Receipt items table
CREATE TABLE IF NOT EXISTS public.receipt_items (
  id SERIAL PRIMARY KEY,
  receipt_id INTEGER REFERENCES public.receipts(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trips table
CREATE TABLE IF NOT EXISTS public.trips (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES public.companies(id) ON DELETE CASCADE,
  driver_id INTEGER REFERENCES public.drivers(id) ON DELETE CASCADE,
  load_id INTEGER REFERENCES public.loads(id) ON DELETE SET NULL,
  date DATE DEFAULT CURRENT_DATE,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  distance DECIMAL(10, 2) NOT NULL,
  rate DECIMAL(10, 2) DEFAULT 0.55,
  rate_type TEXT DEFAULT 'per_mile' CHECK (rate_type IN ('per_mile', 'percentage', 'hourly', 'fixed')),
  hours_worked DECIMAL(5, 2),
  amount DECIMAL(10, 2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create a function to calculate trip amount based on driver type and rate type
CREATE OR REPLACE FUNCTION calculate_trip_amount()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.rate_type = 'per_mile' THEN
    NEW.amount = NEW.distance * NEW.rate;
  ELSIF NEW.rate_type = 'percentage' THEN
    -- For percentage rate type, assume a base trip value of $2 per mile
    NEW.amount = (NEW.distance * 2) * (NEW.rate / 100);
  ELSIF NEW.rate_type = 'hourly' AND NEW.hours_worked IS NOT NULL THEN
    NEW.amount = NEW.hours_worked * NEW.rate;
  ELSIF NEW.rate_type = 'fixed' THEN
    NEW.amount = NEW.rate;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to calculate trip amount on insert or update
CREATE TRIGGER calculate_trip_amount_trigger
BEFORE INSERT OR UPDATE ON public.trips
FOR EACH ROW EXECUTE FUNCTION calculate_trip_amount();

-- Pay statements table
CREATE TABLE IF NOT EXISTS public.pay_statements (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES public.companies(id) ON DELETE CASCADE,
  driver_id INTEGER REFERENCES public.drivers(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  trip_total DECIMAL(10, 2) DEFAULT 0,
  expense_total DECIMAL(10, 2) DEFAULT 0,
  cash_advance_total DECIMAL(10, 2) DEFAULT 0,
  gross_pay DECIMAL(10, 2) DEFAULT 0,
  tax_withholding DECIMAL(10, 2) DEFAULT 0,
  deductions DECIMAL(10, 2) DEFAULT 0,
  net_pay DECIMAL(10, 2) DEFAULT 0,
  generated_date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'Draft' CHECK (status IN ('Draft', 'Finalized', 'Paid')),
  payment_id INTEGER REFERENCES public.payments(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Pay statement items table
CREATE TABLE IF NOT EXISTS public.pay_statement_items (
  id SERIAL PRIMARY KEY,
  pay_statement_id INTEGER REFERENCES public.pay_statements(id) ON DELETE CASCADE,
  item_type TEXT CHECK (item_type IN ('trip', 'expense', 'cash_advance', 'deduction', 'adjustment')),
  reference_id INTEGER,
  description TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Deductions table
CREATE TABLE IF NOT EXISTS public.deductions (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES public.companies(id) ON DELETE CASCADE,
  driver_id INTEGER REFERENCES public.drivers(id) ON DELETE CASCADE,
  pay_statement_id INTEGER REFERENCES public.pay_statements(id) ON DELETE SET NULL,
  type TEXT CHECK (type IN ('tax', 'insurance', 'retirement', 'other')),
  description TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Cash advances table
CREATE TABLE IF NOT EXISTS public.cash_advances (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES public.companies(id) ON DELETE CASCADE,
  driver_id INTEGER REFERENCES public.drivers(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updating timestamps
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_companies_updated_at
BEFORE UPDATE ON public.companies
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_company_users_updated_at
BEFORE UPDATE ON public.company_users
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_drivers_updated_at
BEFORE UPDATE ON public.drivers
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_driver_tax_info_updated_at
BEFORE UPDATE ON public.driver_tax_info
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_driver_payment_methods_updated_at
BEFORE UPDATE ON public.driver_payment_methods
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_loads_updated_at
BEFORE UPDATE ON public.loads
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_payments_updated_at
BEFORE UPDATE ON public.payments
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_expenses_updated_at
BEFORE UPDATE ON public.expenses
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_receipts_updated_at
BEFORE UPDATE ON public.receipts
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_receipt_items_updated_at
BEFORE UPDATE ON public.receipt_items
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_trips_updated_at
BEFORE UPDATE ON public.trips
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_pay_statements_updated_at
BEFORE UPDATE ON public.pay_statements
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_pay_statement_items_updated_at
BEFORE UPDATE ON public.pay_statement_items
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_deductions_updated_at
BEFORE UPDATE ON public.deductions
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_cash_advances_updated_at
BEFORE UPDATE ON public.cash_advances
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Set up Row Level Security (RLS) policies
-- This ensures users can only access their own data or data from their company

-- Profiles RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Companies RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company owners can view their own companies"
  ON public.companies FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Company users can view their companies"
  ON public.companies FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.company_users
      WHERE company_users.company_id = companies.id
      AND company_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Company owners can insert their own companies"
  ON public.companies FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Company owners can update their own companies"
  ON public.companies FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Company admins can update their companies"
  ON public.companies FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.company_users
      WHERE company_users.company_id = companies.id
      AND company_users.user_id = auth.uid()
      AND company_users.role = 'admin'
    )
  );

CREATE POLICY "Company owners can delete their own companies"
  ON public.companies FOR DELETE
  USING (auth.uid() = owner_id);

-- Company Users RLS
ALTER TABLE public.company_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company owners can view company users"
  ON public.company_users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.companies
      WHERE companies.id = company_users.company_id
      AND companies.owner_id = auth.uid()
    )
  );

CREATE POLICY "Company admins can view company users"
  ON public.company_users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.company_users cu
      WHERE cu.company_id = company_users.company_id
      AND cu.user_id = auth.uid()
      AND cu.role = 'admin'
    )
  );

CREATE POLICY "Users can view their own company user records"
  ON public.company_users FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Company owners can insert company users"
  ON public.company_users FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.companies
      WHERE companies.id = company_users.company_id
      AND companies.owner_id = auth.uid()
    )
  );

CREATE POLICY "Company admins can insert company users"
  ON public.company_users FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.company_users cu
      WHERE cu.company_id = company_users.company_id
      AND cu.user_id = auth.uid()
      AND cu.role = 'admin'
    )
  );

CREATE POLICY "Company owners can update company users"
  ON public.company_users FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.companies
      WHERE companies.id = company_users.company_id
      AND companies.owner_id = auth.uid()
    )
  );

CREATE POLICY "Company admins can update company users"
  ON public.company_users FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.company_users cu
      WHERE cu.company_id = company_users.company_id
      AND cu.user_id = auth.uid()
      AND cu.role = 'admin'
    )
  );

CREATE POLICY "Company owners can delete company users"
  ON public.company_users FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.companies
      WHERE companies.id = company_users.company_id
      AND companies.owner_id = auth.uid()
    )
  );

CREATE POLICY "Company admins can delete company users"
  ON public.company_users FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.company_users cu
      WHERE cu.company_id = company_users.company_id
      AND cu.user_id = auth.uid()
      AND cu.role = 'admin'
    )
  );

-- Drivers RLS
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company owners can view their company's drivers"
  ON public.drivers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.companies
      WHERE companies.id = drivers.company_id
      AND companies.owner_id = auth.uid()
    )
  );

CREATE POLICY "Company users can view their company's drivers"
  ON public.drivers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.company_users
      WHERE company_users.company_id = drivers.company_id
      AND company_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Drivers can view their own records"
  ON public.drivers FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Company owners can insert drivers"
  ON public.drivers FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.companies
      WHERE companies.id = drivers.company_id
      AND companies.owner_id = auth.uid()
    )
  );

CREATE POLICY "Company admins and managers can insert drivers"
  ON public.drivers FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.company_users
      WHERE company_users.company_id = drivers.company_id
      AND company_users.user_id = auth.uid()
      AND company_users.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Company owners can update drivers"
  ON public.drivers FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.companies
      WHERE companies.id = drivers.company_id
      AND companies.owner_id = auth.uid()
    )
  );

CREATE POLICY "Company admins and managers can update drivers"
  ON public.drivers FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.company_users
      WHERE company_users.company_id = drivers.company_id
      AND company_users.user_id = auth.uid()
      AND company_users.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Drivers can update their own basic info"
  ON public.drivers FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Company owners can delete drivers"
  ON public.drivers FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.companies
      WHERE companies.id = drivers.company_id
      AND companies.owner_id = auth.uid()
    )
  );

CREATE POLICY "Company admins can delete drivers"
  ON public.drivers FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.company_users
      WHERE company_users.company_id = drivers.company_id
      AND company_users.user_id = auth.uid()
      AND company_users.role = 'admin'
    )
  );

-- Similar RLS policies for other tables
-- (loads, payments, expenses, receipts, trips, pay_statements, etc.)

-- Create a view for dashboard statistics
CREATE OR REPLACE VIEW public.company_dashboard_stats AS
SELECT
  c.id AS company_id,
  c.name AS company_name,
  COUNT(DISTINCT d.id) AS total_drivers,
  COUNT(DISTINCT CASE WHEN d.status = 'Active' THEN d.id END) AS active_drivers,
  COUNT(DISTINCT CASE WHEN d.type = 'company' THEN d.id END) AS company_drivers,
  COUNT(DISTINCT CASE WHEN d.type = 'owner' THEN d.id END) AS owner_operators,
  COUNT(DISTINCT CASE WHEN d.employment_type = 'W2' THEN d.id END) AS w2_drivers,
  COUNT(DISTINCT CASE WHEN d.employment_type = '1099' THEN d.id END) AS contractors,
  SUM(p.amount) AS total_payments,
  SUM(CASE WHEN p.status = 'Pending' THEN p.amount ELSE 0 END) AS pending_payments,
  SUM(t.amount) AS total_trip_earnings,
  COUNT(DISTINCT l.id) AS total_loads,
  COUNT(DISTINCT CASE WHEN l.status = 'assigned' THEN l.id END) AS assigned_loads,
  COUNT(DISTINCT CASE WHEN l.status = 'in_progress' THEN l.id END) AS in_progress_loads,
  COUNT(DISTINCT CASE WHEN l.status = 'completed' THEN l.id END) AS completed_loads
FROM
  public.companies c
  LEFT JOIN public.drivers d ON c.id = d.company_id
  LEFT JOIN public.payments p ON d.id = p.driver_id AND c.id = p.company_id
  LEFT JOIN public.trips t ON d.id = t.driver_id AND c.id = t.company_id
  LEFT JOIN public.loads l ON c.id = l.company_id
GROUP BY
  c.id, c.name;

-- Create a view for driver dashboard statistics
CREATE OR REPLACE VIEW public.driver_dashboard_stats AS
SELECT
  d.id AS driver_id,
  d.name AS driver_name,
  d.company_id,
  c.name AS company_name,
  d.type AS driver_type,
  d.employment_type,
  COUNT(DISTINCT t.id) AS total_trips,
  SUM(t.distance) AS total_miles,
  SUM(t.amount) AS total_earnings,
  COUNT(DISTINCT l.id) AS total_loads,
  COUNT(DISTINCT CASE WHEN l.status = 'assigned' THEN l.id END) AS assigned_loads,
  COUNT(DISTINCT CASE WHEN l.status = 'in_progress' THEN l.id END) AS in_progress_loads,
  COUNT(DISTINCT CASE WHEN l.status = 'completed' THEN l.id END) AS completed_loads,
  SUM(e.amount) AS total_expenses,
  SUM(ca.amount) AS total_advances
FROM
  public.drivers d
  JOIN public.companies c ON d.company_id = c.id
  LEFT JOIN public.trips t ON d.id = t.driver_id
  LEFT JOIN public.loads l ON d.id = l.driver_id
  LEFT JOIN public.expenses e ON d.id = e.driver_id
  LEFT JOIN public.cash_advances ca ON d.id = ca.driver_id
GROUP BY
  d.id, d.name, d.company_id, c.name, d.type, d.employment_type;

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
