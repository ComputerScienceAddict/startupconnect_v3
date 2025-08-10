import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { userId, updateData } = await request.json()
    
    console.log('🔍 Debugging profile update for user:', userId)
    console.log('📝 Update data:', updateData)
    
    // Test 1: Check database connection
    const { data: connectionTest, error: connectionError } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1)
    
    console.log('Connection test:', { connectionTest, connectionError })
    
         // Test 2: Check if user exists in auth (using regular client, not admin)
     let authUserExists = false
     let authError = null
     
     try {
       // Try to get user session to check if user exists
       const { data: { user: currentUser }, error: sessionError } = await supabase.auth.getUser()
       
       if (sessionError) {
         authError = sessionError
         console.log('Session check error:', sessionError)
       } else if (currentUser && currentUser.id === userId) {
         authUserExists = true
         console.log('Auth user confirmed:', currentUser.id)
       } else {
         console.log('User ID mismatch or no session:', { currentUserId: currentUser?.id, requestedUserId: userId })
       }
     } catch (e) {
       authError = e
       console.error('Auth check exception:', e)
     }
     
     console.log('Auth user check:', { authUserExists, authError })
    
    // Test 3: Check if user profile exists
    const { data: existingProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    console.log('Profile existence check:', { existingProfile, profileError })
    
    // Test 4: Try to update with detailed error handling
    let updateResult = null
    let updateError = null
    
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('id', userId)
        .select()
      
      updateResult = { data, error }
      console.log('Update attempt result:', updateResult)
    } catch (e) {
      updateError = e
      console.error('Update attempt exception:', e)
    }
    
    // Test 5: Try to insert if update fails
    let insertResult = null
    let insertError = null
    
    if (updateError || (updateResult?.error && updateResult.error.message?.includes('not found'))) {
      console.log('Attempting to create new profile...')
      
      try {
        const insertData = {
          id: userId,
          ...updateData,
          posts: [],
          connections: [],
          created_at: new Date().toISOString()
        }
        
        const { data, error } = await supabase
          .from('user_profiles')
          .insert(insertData)
          .select()
          .single()
        
        insertResult = { data, error }
        console.log('Insert attempt result:', insertResult)
      } catch (e) {
        insertError = e
        console.error('Insert attempt exception:', e)
      }
    }
    
    // Test 6: Check table structure
    const { data: allProfiles, error: allError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(3)
    
    console.log('Table structure check:', { 
      count: allProfiles?.length || 0, 
      error: allError,
      sampleData: allProfiles?.[0] 
    })
    
    return NextResponse.json({
      success: true,
             debug: {
         connectionTest: { success: !connectionError, error: connectionError },
         authUser: { exists: authUserExists, error: authError },
         existingProfile: { exists: !!existingProfile, error: profileError, data: existingProfile },
         updateAttempt: { success: !updateResult?.error, result: updateResult, exception: updateError },
         insertAttempt: { success: !insertResult?.error, result: insertResult, exception: insertError },
         tableStructure: { count: allProfiles?.length || 0, error: allError, sample: allProfiles?.[0] }
       }
    })
    
  } catch (e: any) {
    console.error('Debug API error:', e)
    return NextResponse.json({ 
      success: false, 
      error: 'Debug API failed', 
      details: e.message 
    }, { status: 500 })
  }
} 