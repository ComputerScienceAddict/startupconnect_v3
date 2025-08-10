import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Test authentication
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 400 })
    }

    if (data.user) {
      // Get user profile
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('account_type')
        .eq('id', data.user.id)
        .single()

      return NextResponse.json({
        success: true,
        user: data.user,
        profile: profileData,
        accountType: profileData?.account_type
      })
    }

    return NextResponse.json({
      success: false,
      error: 'No user data returned'
    }, { status: 400 })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to authenticate',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 