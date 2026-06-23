export type UserRole = 'super_admin' | 'admin' | 'employee';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Customer {
  id: string;
  name: string;
  gstin?: string;
  billing_address: string;
  billing_state: string;
  billing_state_code: string;
  shipping_address: string;
  shipping_state: string;
  shipping_state_code: string;
  same_as_billing: boolean;
  email?: string;
  contact_person?: string;
  mobile?: string;
  is_active: boolean;
}

export interface Product {
  id: string;
  name: string;
  product_type: 'physical_item' | 'service';
  hsn_sac_code: string;
  unit: string;
  rate: number;
  gst_percent: number;
  category?: string;
  stock_quantity: number;
  low_stock_threshold?: number;
  is_active: boolean;
}

export interface InvoiceLineItem {
  id?: string;
  product_id?: string;
  product_name: string;
  hsn_sac_code: string;
  unit: string;
  quantity: number;
  rate: number;
  discount: number;
  gst_percent: number;
  taxable_value?: number;
  line_total?: number;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  customer_id: string;
  status: string;
  tax_type: 'intra_state' | 'inter_state';
  invoice_date: string;
  due_date?: string;
  customer_name: string;
  final_amount: number;
  amount_paid: number;
  balance_due: number;
  line_items?: InvoiceLineItem[];
  payments?: unknown[];
}

export interface AmcContract {
  id: string;
  contract_number: string;
  customer_id: string;
  customer_name?: string;
  start_date: string;
  end_date: string;
  contract_value: number;
  visit_frequency: string;
  computed_status?: string;
  is_active: boolean;
}

export interface ServiceJob {
  id: string;
  job_number: string;
  customer_id: string;
  customer_name?: string;
  site_location: string;
  job_type: string;
  status: string;
  scheduled_date?: string;
  completed_date?: string;
  generated_invoice_id?: string;
  line_items?: { id?: string; product_id?: string; description: string; quantity: number; rate: number }[];
}

export interface OrgSettings {
  id: string;
  company_name: string;
  address_line: string;
  state: string;
  state_code: string;
  gstin: string;
  email: string;
  phone: string;
  logo_url?: string;
  signature_url?: string;
  bank_details: string;
  invoice_number_prefix: string;
  invoice_terms: string;
  amc_reminder_days: number[];
  default_low_stock_threshold: number;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}
