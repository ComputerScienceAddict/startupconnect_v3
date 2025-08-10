-- First, drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Anyone can view active posts" ON posts;
DROP POLICY IF EXISTS "Users can create posts" ON posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON posts;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS validate_profile_picture_trigger ON user_profiles;
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
DROP TRIGGER IF EXISTS update_posts_updated_at ON posts;

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS is_valid_base64_image(text, text);
DROP FUNCTION IF EXISTS validate_profile_picture();

-- Add the new columns to user_profiles if they don't exist
DO $$ 
BEGIN
    -- Add profile_picture_base64 column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'profile_picture_base64'
    ) THEN
        ALTER TABLE user_profiles ADD COLUMN profile_picture_base64 TEXT;
    END IF;

    -- Add profile_picture_type column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'profile_picture_type'
    ) THEN
        ALTER TABLE user_profiles ADD COLUMN profile_picture_type TEXT;
    END IF;
END $$;

-- Add constraints (will fail gracefully if they already exist)
DO $$ 
BEGIN
    ALTER TABLE user_profiles
    ADD CONSTRAINT profile_picture_type_check 
    CHECK (
        profile_picture_type IS NULL OR 
        profile_picture_type IN ('image/jpeg', 'image/png', 'image/webp')
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
    ALTER TABLE user_profiles
    ADD CONSTRAINT profile_picture_size_check 
    CHECK (
        profile_picture_base64 IS NULL OR 
        length(decode(regexp_replace(profile_picture_base64, '^data:image/[a-z]+;base64,', ''), 'base64')) <= 500000
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Create function to validate base64 image
CREATE OR REPLACE FUNCTION is_valid_base64_image(data text, mime_type text) 
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if data is NULL
    IF data IS NULL THEN
        RETURN TRUE;
    END IF;

    -- Check if data starts with correct data URL prefix
    IF NOT (data ~ '^data:image/(jpeg|png|webp);base64,') THEN
        RETURN FALSE;
    END IF;

    -- Check if MIME type matches the data URL
    IF NOT (data ~ ('^data:' || mime_type || ';base64,')) THEN
        RETURN FALSE;
    END IF;

    -- Check if the remaining content is valid base64
    RETURN decode(regexp_replace(data, '^data:image/[a-z]+;base64,', ''), 'base64') IS NOT NULL;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Create function to validate profile picture
CREATE OR REPLACE FUNCTION validate_profile_picture() 
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.profile_picture_base64 IS NOT NULL AND NOT is_valid_base64_image(NEW.profile_picture_base64, NEW.profile_picture_type) THEN
        RAISE EXCEPTION 'Invalid base64 image data or MIME type mismatch';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for profile picture validation
CREATE TRIGGER validate_profile_picture_trigger
    BEFORE INSERT OR UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION validate_profile_picture();

-- Recreate the update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Recreate triggers for timestamps
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at 
    BEFORE UPDATE ON posts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Recreate RLS policies
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Anyone can view active posts" ON posts
    FOR SELECT USING (is_active = true);

CREATE POLICY "Users can create posts" ON posts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" ON posts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" ON posts
    FOR DELETE USING (auth.uid() = user_id);

-- Add comments for documentation
COMMENT ON COLUMN user_profiles.profile_picture_base64 IS 'Base64 encoded image data with data URL prefix. Max size ~500KB decoded.';
COMMENT ON COLUMN user_profiles.profile_picture_type IS 'MIME type of the profile picture (image/jpeg, image/png, or image/webp)';