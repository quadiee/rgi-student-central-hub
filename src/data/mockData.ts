
// This file is deprecated and should not be used anymore
// All data should come from Supabase backend

import { User, FeeRecord } from '../types';

// DEPRECATED: Use Supabase backend instead
export const mockUsers: User[] = [];

// DEPRECATED: Use Supabase backend instead  
export const mockFeeRecords: FeeRecord[] = [];

// Helper to migrate away from mock data
export const MIGRATION_NOTICE = {
  message: "Mock data has been removed. All components should use Supabase backend data.",
  alternatives: {
    users: "Use profiles table via Supabase",
    feeRecords: "Use fee_records table via SupabaseFeeService",
    analytics: "Use RPC functions for analytics"
  }
};

console.warn("🚨 DEPRECATED: mockData.ts should not be imported. Use Supabase backend instead.");
