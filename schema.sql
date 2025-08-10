-- ========================================
-- SIMPLIFIED SUPABASE SCHEMA FOR STARTUPCONNECT
-- ========================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- USER_PROFILES TABLE (SIMPLIFIED)
-- ========================================

CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    account_type TEXT NOT NULL CHECK (account_type IN ('student', 'graduate', 'founder', 'company')),
    
    -- Basic profile info
    bio TEXT,
    location TEXT,
    phone TEXT,
    university TEXT,
    company_name TEXT,
    industry TEXT,
    graduation_year INTEGER,
    gpa DECIMAL(3,2),
    majors TEXT,
    minors TEXT,
    skills TEXT,
    github TEXT,
    website TEXT,
    portfolio TEXT,
    
    -- Profile picture as Base64
    profile_picture_base64 TEXT,
    profile_picture_type TEXT CHECK (
        profile_picture_type IS NULL OR 
        profile_picture_type IN ('image/jpeg', 'image/png', 'image/webp')
    ),
    
    -- JSON columns for flexibility
    posts JSONB DEFAULT '[]'::jsonb, -- Array of post objects
    connections JSONB DEFAULT '[]'::jsonb, -- Array of connection objects
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Add constraint for base64 image size (limit to ~500KB when decoded)
    CONSTRAINT profile_picture_size_check CHECK (
        profile_picture_base64 IS NULL OR 
        length(decode(regexp_replace(profile_picture_base64, '^data:image/[a-z]+;base64,', ''), 'base64')) <= 500000
    )
);

-- Function to validate base64 image
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

-- Add trigger to validate base64 image before insert or update
CREATE OR REPLACE FUNCTION validate_profile_picture() 
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.profile_picture_base64 IS NOT NULL AND NOT is_valid_base64_image(NEW.profile_picture_base64, NEW.profile_picture_type) THEN
        RAISE EXCEPTION 'Invalid base64 image data or MIME type mismatch';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_profile_picture_trigger
    BEFORE INSERT OR UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION validate_profile_picture();

-- ========================================
-- POSTS TABLE (SIMPLIFIED)
-- ========================================

CREATE TABLE IF NOT EXISTS posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    opportunity_type TEXT CHECK (opportunity_type IN ('internship', 'research', 'lab_assistant', 'full_time', 'part_time')),
    location TEXT,
    remote_friendly BOOLEAN DEFAULT FALSE,
    compensation_type TEXT CHECK (compensation_type IN ('paid', 'unpaid', 'stipend', 'credit')),
    compensation_amount DECIMAL(10,2),
    required_skills TEXT,
    application_deadline DATE,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_account_type ON user_profiles(account_type);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at);
CREATE INDEX IF NOT EXISTS idx_posts_is_active ON posts(is_active);

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Posts policies
CREATE POLICY "Anyone can view active posts" ON posts
    FOR SELECT USING (is_active = true);

CREATE POLICY "Users can create posts" ON posts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" ON posts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" ON posts
    FOR DELETE USING (auth.uid() = user_id);

-- ========================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ========================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at 
    BEFORE UPDATE ON posts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- COMMENTS FOR DOCUMENTATION
-- ========================================

COMMENT ON TABLE user_profiles IS 'Simplified user profiles with JSON columns for posts and connections';
COMMENT ON TABLE posts IS 'Opportunity posts from users';
COMMENT ON COLUMN user_profiles.posts IS 'JSON array of post objects for user''s posts';
COMMENT ON COLUMN user_profiles.connections IS 'JSON array of connection objects for user''s network';
COMMENT ON COLUMN user_profiles.profile_picture_base64 IS 'Base64 encoded image data with data URL prefix. Max size ~500KB decoded.';
COMMENT ON COLUMN user_profiles.profile_picture_type IS 'MIME type of the profile picture (image/jpeg, image/png, or image/webp)';

-- ========================================
-- SAMPLE DATA (OPTIONAL)
-- ========================================

-- Insert sample posts (uncomment if you want sample data)
/*
INSERT INTO posts (user_id, title, content, opportunity_type, location, compensation_type, required_skills) VALUES
('your-user-id-here', 'Machine Learning Intern', 'Join our AI team to work on cutting-edge machine learning models.', 'internship', 'San Francisco, CA', 'paid', 'Python, Machine Learning'),
('your-user-id-here', 'Research Assistant - Biotech', 'Exciting opportunity to contribute to groundbreaking cancer research.', 'research', 'Boston, MA', 'stipend', 'Biology, Research'),
('your-user-id-here', 'Product Design Intern', 'Help design the future of financial technology.', 'internship', 'New York, NY', 'paid', 'UI/UX, Figma');
*/