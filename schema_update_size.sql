-- Drop the existing constraint
ALTER TABLE user_profiles
DROP CONSTRAINT IF EXISTS profile_picture_size_check;

-- Add the new constraint with 5MB limit (5 * 1024 * 1024 = 5,242,880 bytes)
ALTER TABLE user_profiles
ADD CONSTRAINT profile_picture_size_check 
CHECK (
    profile_picture_base64 IS NULL OR 
    length(decode(regexp_replace(profile_picture_base64, '^data:image/[a-z]+;base64,', ''), 'base64')) <= 5242880
);