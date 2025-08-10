import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Get all posts that don't have is_active set
    const { data: posts, error: fetchError } = await supabase
      .from('posts')
      .select('id, is_active')
      .is('is_active', null)

    if (fetchError) {
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch posts', 
        details: fetchError 
      }, { status: 500 })
    }

    if (!posts || posts.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No posts found that need fixing',
        postsFixed: 0
      })
    }

    // Update all posts to set is_active to true
    const { error: updateError } = await supabase
      .from('posts')
      .update({ is_active: true })
      .is('is_active', null)

    if (updateError) {
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to update posts', 
        details: updateError 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: `Fixed ${posts.length} posts by setting is_active to true`,
      postsFixed: posts.length
    })

  } catch (e: any) {
    return NextResponse.json({ 
      success: false, 
      error: 'An unexpected error occurred', 
      details: e.message 
    }, { status: 500 })
  }
} 