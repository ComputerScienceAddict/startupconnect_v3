import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing Supabase connection and table access...')
    
    // Test 1: Basic connection test
    const { data: connectionTest, error: connectionError } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1)
    
    console.log('Connection test result:', { connectionTest, connectionError })
    
    // Test 2: Try to get table structure
    const { data: tableInfo, error: tableError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1)
    
    console.log('Table structure test:', { tableInfo, tableError })
    
    // Test 3: Check if we can insert a test record (then delete it)
    let insertTest = null
    let insertError = null
    
    try {
      const testId = 'test-' + Date.now()
      const { data: insertData, error: insertErr } = await supabase
        .from('user_profiles')
        .insert({
          id: testId,
          full_name: 'Test User',
          email: 'test@example.com',
          posts: [],
          connections: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()
      
      insertTest = { data: insertData, error: insertErr }
      console.log('Insert test result:', insertTest)
      
      // If insert succeeded, delete the test record
      if (!insertErr) {
        const { error: deleteError } = await supabase
          .from('user_profiles')
          .delete()
          .eq('id', testId)
        
        console.log('Delete test record result:', { deleteError })
      }
    } catch (e) {
      insertError = e
      console.error('Insert test exception:', e)
    }
    
    return NextResponse.json({
      success: true,
      tests: {
        connection: { success: !connectionError, error: connectionError },
        tableStructure: { success: !tableError, error: tableError, data: tableInfo },
        insertTest: { success: !insertTest?.error, result: insertTest, exception: insertError }
      }
    })
    
  } catch (e: any) {
    console.error('Connection test API error:', e)
    return NextResponse.json({
      success: false,
      error: 'Connection test failed',
      details: e.message
    }, { status: 500 })
  }
} 