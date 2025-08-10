# Supabase Storage Setup for Profile Pictures

## 1. Create Storage Bucket

In your Supabase Dashboard:

1. Go to **Storage** in the left sidebar
2. Click **Create a new bucket**
3. Set the following:
   - **Name**: `profile-pictures`
   - **Public bucket**: ✅ Check this (so images can be accessed publicly)
   - **File size limit**: 5MB
   - **Allowed MIME types**: `image/*`

## 2. Set Up Storage Policies

After creating the bucket, go to **Storage > Policies** and add these policies:

### Policy 1: Allow authenticated users to upload
```sql
-- Policy name: "Allow authenticated users to upload profile pictures"
-- Operation: INSERT
-- Target roles: authenticated

(bucket_id = 'profile-pictures'::text) AND (auth.role() = 'authenticated'::text)
```

### Policy 2: Allow public read access
```sql
-- Policy name: "Allow public read access to profile pictures"
-- Operation: SELECT
-- Target roles: public

(bucket_id = 'profile-pictures'::text)
```

### Policy 3: Allow users to update their own files
```sql
-- Policy name: "Allow users to update their own profile pictures"
-- Operation: UPDATE
-- Target roles: authenticated

(bucket_id = 'profile-pictures'::text) AND (auth.role() = 'authenticated'::text) AND (storage.foldername(name))[1] = auth.uid()::text
```

### Policy 4: Allow users to delete their own files
```sql
-- Policy name: "Allow users to delete their own profile pictures"
-- Operation: DELETE
-- Target roles: authenticated

(bucket_id = 'profile-pictures'::text) AND (auth.role() = 'authenticated'::text) AND (storage.foldername(name))[1] = auth.uid()::text
```

## 3. Database Migration

Run the migration file to create the user_profiles table with profile_picture support:

```sql
-- Run the migration.sql file in your Supabase SQL Editor
```

## 4. Environment Variables

Make sure your `.env.local` file has the correct Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 5. Testing the Setup

1. Start your development server: `npm run dev`
2. Go to your profile page
3. Try uploading a profile picture
4. The image should be stored in Supabase Storage and the URL saved in the database

## Features Included

✅ **Drag & Drop Upload**: Users can drag images directly onto the upload area
✅ **Image Preview**: Shows a preview before saving
✅ **File Validation**: Checks file type and size (5MB limit)
✅ **Automatic URL Storage**: Saves the public URL to the database
✅ **Error Handling**: Shows clear error messages
✅ **Loading States**: Shows upload progress
✅ **Responsive Design**: Works on mobile and desktop

## File Structure

```
startupconnect-main/
├── components/
│   └── profile-picture-upload.tsx    # Profile picture upload component
├── app/
│   └── profile/
│       └── page.tsx                   # Updated profile page
├── migration.sql                      # Database migration
└── SUPABASE_SETUP.md                 # This setup guide
```

## Troubleshooting

### Common Issues:

1. **"Bucket not found" error**
   - Make sure the bucket name is exactly `profile-pictures`
   - Check that the bucket is created in the correct project

2. **"Permission denied" error**
   - Verify the storage policies are set correctly
   - Make sure the user is authenticated

3. **"Invalid URL" database error**
   - The URL validation function ensures only valid URLs are stored
   - Check that the image upload completed successfully

4. **Images not displaying**
   - Verify the bucket is set to public
   - Check that the URL is being saved correctly in the database 