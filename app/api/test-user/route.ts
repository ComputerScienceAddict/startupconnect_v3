import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    console.log('Testing user authentication for:', email)
    
    // Test 1: Check if user exists in auth.users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to check auth users', 
        details: authError 
      }, { status: 500 })
    }
    
    const userExists = authUsers.users.some(user => user.email === email)
    
    // Test 2: Check if user profile exists
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, email, account_type')
      .eq('email', email)
      .single()
    
    // Test 3: Try to sign in (this will fail but give us error details)
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    return NextResponse.json({
      success: true,
      results: {
        userExistsInAuth: userExists,
        userExistsInProfile: !!profileData,
        profileData: profileData || null,
        signInError: signInError ? {
          message: signInError.message,
          status: signInError.status,
          name: signInError.name
        } : null,
        signInSuccess: !!signInData?.user
      }
    })
    
  } catch (e: any) {
    return NextResponse.json({ 
      success: false, 
      error: 'An unexpected error occurred', 
      details: e.message 
    }, { status: 500 })
  }
} 