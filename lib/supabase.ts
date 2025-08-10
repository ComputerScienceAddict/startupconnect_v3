import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cxpgilasqkwhwnvsqbpj.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4cGdpbGFzcWt3aHdudnNxYnBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNTU1MDgsImV4cCI6MjA2OTczMTUwOH0.Xnr1yQRBcdKJcgS8uIXln1wKfvrvByjORZlE8BfTkQw'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper function to get user type name from integer
export const getUserTypeName = (type: number): string => {
  const typeMap: { [key: number]: string } = {
    1: 'Founder',
    2: 'Job Seeker',
    3: 'Intern Seeker',
    4: 'Research Seeker',
    5: 'Startup Employee',
    6: 'Investor',
    7: 'Mentor',
    8: 'Other'
  }
  return typeMap[type] || 'Unknown'
}

// Helper function to get account type name
export const getAccountTypeName = (accountType: string): string => {
  const accountTypeMap: { [key: string]: string } = {
    'student': 'Student',
    'graduate': 'Graduate Student',
    'founder': 'Founder',
    'company': 'Company'
  }
  return accountTypeMap[accountType] || 'Unknown'
} 