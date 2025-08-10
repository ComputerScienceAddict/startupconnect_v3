import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { userId, testData } = await request.json()
    
    console.log('🧪 Simple profile test for user:', userId)
    console.log('📝 Test data:', testData)
    
    // Simple test: try to update with minimal data
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        full_name: testData.full_name || 'Test User',
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
    
    console.log('Simple update result:', { data, error })
    
    if (error) {
      console.log('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      
      // If update failed, try insert
      if (error.message?.includes('not found') || error.code === 'PGRST116') {
        console.log('Profile not found, trying insert...')
        
        const { data: insertData, error: insertError } = await supabase
          .from('user_profiles')
          .insert({
            id: userId,
            full_name: testData.full_name || 'Test User',
            email: testData.email,
            posts: [],
            connections: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single()
        
        console.log('Insert result:', { insertData, insertError })
        
        return NextResponse.json({
          success: !insertError,
          operation: 'insert',
          data: insertData,
          error: insertError ? {
            message: insertError.message,
            details: insertError.details,
            code: insertError.code
          } : null
        })
      }
      
      return NextResponse.json({
        success: false,
        operation: 'update',
        error: {
          message: error.message,
          details: error.details,
          code: error.code
        }
      })
    }
    
    return NextResponse.json({
      success: true,
      operation: 'update',
      data: data
    })
    
  } catch (e: any) {
    console.error('Simple test error:', e)
    return NextResponse.json({ 
      success: false, 
      error: 'Simple test failed', 
      details: e.message 
    }, { status: 500 })
  }
} 