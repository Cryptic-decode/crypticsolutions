import { createClient } from '@supabase/supabase-js';

// These will be set via environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables are not set');
}

// Create a single supabase client for client-side usage
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database Types
export interface Purchase {
  id: string;
  user_id: string;
  product_id: string;
  transaction_id: string;
  email: string;
  name: string;
  status: 'pending' | 'completed' | 'failed';
  amount: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
  updated_at: string;
}

