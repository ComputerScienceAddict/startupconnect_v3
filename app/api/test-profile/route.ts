import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    const { data: testData, error: testError } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1)

    if (testError) {
      return NextResponse.json({ 
        success: false, 
        error: 'Database connection failed', 
        details: testError 
      }, { status: 500 })
    }

    // Test table structure
    const { data: columns, error: columnsError } = await supabase
      .rpc('get_table_columns', { table_name: 'user_profiles' })

    return NextResponse.json({ 
      success: true, 
      message: 'Database connection successful',
      testData,
      columns: columnsError ? 'Could not fetch columns' : columns
    })

  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: 'Server error', 
      details: error 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, testData } = body

    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'User ID is required' 
      }, { status: 400 })
    }

    // Test profile update with minimal data
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ 
        full_name: testData?.full_name || 'Test User',
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()

    if (error) {
      return NextResponse.json({ 
        success: false, 
        error: 'Profile update failed', 
        details: error 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Profile update test successful',
      data 
    })

  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: 'Server error', 
      details: error 
    }, { status: 500 })
  }
} 