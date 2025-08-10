import { supabase } from './supabase'

/**
 * Utility functions for tracking and managing applicant counts
 */

/**
 * Manually update applicant count for a specific opportunity
 * This is useful for data migration or fixing inconsistencies
 */
export async function updateOpportunityApplicantCount(opportunityId: string) {
  try {
    // Call the database function to update the count
    const { error } = await supabase.rpc('update_opportunity_applicant_count', {
      opportunity_uuid: opportunityId
    })

    if (error) {
      console.error('Error updating applicant count:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Unexpected error updating applicant count:', error)
    return false
  }
}

/**
 * Sync all applicant counts across all opportunities
 * This is useful for initial setup or data cleanup
 */
export async function syncAllApplicantCounts() {
  try {
    const { error } = await supabase.rpc('sync_all_applicant_counts')

    if (error) {
      console.error('Error syncing all applicant counts:', error)
      return false
    }

    console.log('All applicant counts have been synchronized')
    return true
  } catch (error) {
    console.error('Unexpected error syncing applicant counts:', error)
    return false
  }
}

/**
 * Get detailed application statistics for an opportunity
 */
export async function getOpportunityApplicationStats(opportunityId: string) {
  try {
    const { data, error } = await supabase.rpc('get_opportunity_application_stats', {
      opportunity_uuid: opportunityId
    })

    if (error) {
      console.error('Error getting application stats:', error)
      return null
    }

    return data?.[0] || null
  } catch (error) {
    console.error('Unexpected error getting application stats:', error)
    return null
  }
}

/**
 * Verify applicant count accuracy for all opportunities
 * Returns opportunities with mismatched counts
 */
export async function verifyApplicantCounts() {
  try {
    const { data: opportunities, error: oppError } = await supabase
      .from('opportunities')
      .select('id, title, applicants_count')
      .eq('is_active', true)

    if (oppError) {
      console.error('Error fetching opportunities:', oppError)
      return []
    }

    const mismatches = []

    for (const opp of opportunities || []) {
      const { count, error: countError } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('created_for_which_opportunity', opp.id)

      if (countError) {
        console.error('Error counting applications:', countError)
        continue
      }

      const actualCount = count || 0
      const storedCount = opp.applicants_count || 0

      if (actualCount !== storedCount) {
        mismatches.push({
          id: opp.id,
          title: opp.title,
          storedCount,
          actualCount,
          difference: actualCount - storedCount
        })
      }
    }

    return mismatches
  } catch (error) {
    console.error('Unexpected error verifying applicant counts:', error)
    return []
  }
}

/**
 * Get real-time applicant count for an opportunity
 * This bypasses the stored count and queries directly
 */
export async function getRealTimeApplicantCount(opportunityId: string) {
  try {
    const { count, error } = await supabase
      .from('applications')
      .select('*', { count: 'exact', head: true })
      .eq('created_for_which_opportunity', opportunityId)

    if (error) {
      console.error('Error getting real-time applicant count:', error)
      return 0
    }

    return count || 0
  } catch (error) {
    console.error('Unexpected error getting real-time applicant count:', error)
    return 0
  }
}

