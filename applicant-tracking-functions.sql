-- ========================================
-- APPLICANT TRACKING SYSTEM
-- ========================================

-- Function to update applicant count for an opportunity
CREATE OR REPLACE FUNCTION update_opportunity_applicant_count(opportunity_uuid UUID)
RETURNS void AS $$
DECLARE
    app_count INTEGER;
BEGIN
    -- Count actual applications for this opportunity
    SELECT COUNT(*) INTO app_count
    FROM public.applications 
    WHERE created_for_which_opportunity = opportunity_uuid;
    
    -- Update the opportunities table with the correct count
    UPDATE public.opportunities 
    SET applicants_count = app_count
    WHERE id = opportunity_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function to automatically update applicant count when applications are inserted
CREATE OR REPLACE FUNCTION trigger_update_applicant_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Update count for the opportunity
    PERFORM update_opportunity_applicant_count(NEW.created_for_which_opportunity);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to automatically update applicant count when applications are deleted
CREATE OR REPLACE FUNCTION trigger_update_applicant_count_on_delete()
RETURNS TRIGGER AS $$
BEGIN
    -- Update count for the opportunity
    PERFORM update_opportunity_applicant_count(OLD.created_for_which_opportunity);
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update applicant counts
DROP TRIGGER IF EXISTS applications_insert_trigger ON public.applications;
CREATE TRIGGER applications_insert_trigger
    AFTER INSERT ON public.applications
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_applicant_count();

DROP TRIGGER IF EXISTS applications_delete_trigger ON public.applications;
CREATE TRIGGER applications_delete_trigger
    AFTER DELETE ON public.applications
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_applicant_count_on_delete();

-- Function to sync all existing applicant counts
CREATE OR REPLACE FUNCTION sync_all_applicant_counts()
RETURNS void AS $$
DECLARE
    opp_record RECORD;
BEGIN
    -- Loop through all opportunities and update their counts
    FOR opp_record IN 
        SELECT id FROM public.opportunities WHERE is_active = true
    LOOP
        PERFORM update_opportunity_applicant_count(opp_record.id);
    END LOOP;
    
    RAISE NOTICE 'All applicant counts have been synchronized.';
END;
$$ LANGUAGE plpgsql;

-- Function to get application statistics for an opportunity
CREATE OR REPLACE FUNCTION get_opportunity_application_stats(opportunity_uuid UUID)
RETURNS TABLE(
    total_applications INTEGER,
    recent_applications INTEGER,
    applications_this_week INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_applications,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END)::INTEGER as recent_applications,
        COUNT(CASE WHEN created_at >= DATE_TRUNC('week', NOW()) THEN 1 END)::INTEGER as applications_this_week
    FROM public.applications 
    WHERE created_for_which_opportunity = opportunity_uuid;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- EXAMPLE USAGE
-- ========================================

/*
-- Manually update applicant count for a specific opportunity
SELECT update_opportunity_applicant_count('your-opportunity-uuid-here');

-- Sync all applicant counts (run this once to fix any inconsistencies)
SELECT sync_all_applicant_counts();

-- Get detailed stats for an opportunity
SELECT * FROM get_opportunity_application_stats('your-opportunity-uuid-here');

-- Check current applicant counts
SELECT 
    o.id,
    o.title,
    o.applicants_count as stored_count,
    COUNT(a.id) as actual_count,
    CASE 
        WHEN o.applicants_count = COUNT(a.id) THEN 'MATCH' 
        ELSE 'MISMATCH' 
    END as status
FROM public.opportunities o
LEFT JOIN public.applications a ON o.id = a.created_for_which_opportunity
WHERE o.is_active = true
GROUP BY o.id, o.title, o.applicants_count
ORDER BY o.created_at DESC;
*/

