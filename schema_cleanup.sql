-- First, migrate any existing profile pictures to base64 if needed
-- (You can skip this if you don't need to preserve existing profile picture URLs)
/*
UPDATE user_profiles
SET profile_picture_base64 = COALESCE(profile_picture_base64, profile_picture),
    profile_picture_type = CASE 
        WHEN profile_picture LIKE '%.jpg' OR profile_picture LIKE '%.jpeg' THEN 'image/jpeg'
        WHEN profile_picture LIKE '%.png' THEN 'image/png'
        WHEN profile_picture LIKE '%.webp' THEN 'image/webp'
        ELSE NULL
    END
WHERE profile_picture IS NOT NULL 
AND profile_picture_base64 IS NULL;
*/

-- Remove the old profile_picture column
ALTER TABLE user_profiles 
DROP COLUMN IF EXISTS profile_picture;

-- Add comments for better documentation
COMMENT ON COLUMN user_profiles.profile_picture_base64 IS 'Base64 encoded image data with data URL prefix. Max size ~500KB decoded.';
COMMENT ON COLUMN user_profiles.profile_picture_type IS 'MIME type of the profile picture (image/jpeg, image/png, or image/webp)';

-- Verify constraints are in place
DO $$ 
BEGIN
    -- Ensure profile_picture_type_check exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.constraint_column_usage 
        WHERE constraint_name = 'profile_picture_type_check'
    ) THEN
        ALTER TABLE user_profiles
        ADD CONSTRAINT profile_picture_type_check 
        CHECK (
            profile_picture_type IS NULL OR 
            profile_picture_type IN ('image/jpeg', 'image/png', 'image/webp')
        );
    END IF;

    -- Ensure profile_picture_size_check exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.constraint_column_usage 
        WHERE constraint_name = 'profile_picture_size_check'
    ) THEN
        ALTER TABLE user_profiles
        ADD CONSTRAINT profile_picture_size_check 
        CHECK (
            profile_picture_base64 IS NULL OR 
            length(decode(regexp_replace(profile_picture_base64, '^data:image/[a-z]+;base64,', ''), 'base64')) <= 500000
        );
    END IF;
END $$;