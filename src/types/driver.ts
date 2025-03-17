export interface Driver {
  id: number
  companyId: number
  name: string
  email: string
  phone: string
  license: string
  status: 'active' | 'inactive'
  type: 'company' | 'owner'
  employmentType: 'W2' | '1099'
  joinDate: string
  payRate?: number
  payRateType?: 'per_mile' | 'percentage' | 'hourly' | 'fixed'
  taxWithholdingPercent?: number
  hasBenefits?: boolean
  userId?: string
  taxInfo?: DriverTaxInfo
  paymentMethods?: DriverPaymentMethod[]
}

export interface DriverTaxInfo {
  id?: number
  driverId: number
  ssnLastFour?: string
  taxId?: string
  w9OnFile: boolean
  w4OnFile: boolean
  filingStatus?: string
  allowances?: number
  additionalWithholding?: number
}

export interface DriverPaymentMethod {
  id?: number
  driverId: number
  paymentType: 'direct_deposit' | 'check' | 'cash' | 'other'
  isDefault: boolean
  bankName?: string
  accountType?: string
  accountLastFour?: string
  routingNumberLastFour?: string
}
