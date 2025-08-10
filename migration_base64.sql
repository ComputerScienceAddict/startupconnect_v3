-- Drop the URL validation check for profile_picture
ALTER TABLE public.user_profiles 
DROP CONSTRAINT IF EXISTS user_profiles_profile_picture_check;

-- Add new columns for Base64 image storage
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS profile_picture_base64 text,
ADD COLUMN IF NOT EXISTS profile_picture_type text;

-- Add check constraint for image type
ALTER TABLE public.user_profiles 
ADD CONSTRAINT profile_picture_type_check 
CHECK (
    profile_picture_type IS NULL OR 
    profile_picture_type IN ('image/jpeg', 'image/png', 'image/webp')
);

-- Add check constraint for base64 size (limit to ~500KB when decoded)
ALTER TABLE public.user_profiles 
ADD CONSTRAINT profile_picture_size_check 
CHECK (
    profile_picture_base64 IS NULL OR 
    length(decode(regexp_replace(profile_picture_base64, '^data:image/[a-z]+;base64,', ''), 'base64')) <= 500000
);

-- Add comment explaining the new columns
COMMENT ON COLUMN public.user_profiles.profile_picture_base64 IS 'Base64 encoded image data, including data URL prefix. Max size ~500KB decoded.';
COMMENT ON COLUMN public.user_profiles.profile_picture_type IS 'MIME type of the image (image/jpeg, image/png, or image/webp)';

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
    BEFORE INSERT OR UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION validate_profile_picture();