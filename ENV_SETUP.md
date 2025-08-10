# Environment Variables Setup

## Fix the Supabase Configuration Error

The error indicates that your Supabase environment variables are not configured. Follow these steps to fix it:

### Step 1: Create .env.local file

Create a file called `.env.local` in the root of your project (same level as `package.json`):

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Step 2: Get Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API** in the left sidebar
3. Copy the following values:
   - **Project URL**: Copy the "Project URL" value
   - **Anon Key**: Copy the "anon public" key value

### Step 3: Update .env.local

Replace the placeholder values with your actual Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key-here
```

### Step 4: Restart Your Development Server

After creating/updating the `.env.local` file:

1. Stop your development server (Ctrl+C)
2. Run `npm run dev` again
3. The error should be resolved

### Example .env.local

```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzNjQ0NjQwMCwiZXhwIjoxOTUyMDIyNDAwfQ.example
```

### Troubleshooting

- **Make sure the file is named exactly `.env.local`** (not `.env` or `.env.local.txt`)
- **Restart your dev server** after making changes
- **Check that the URL and key are correct** from your Supabase dashboard
- **Ensure there are no spaces** around the `=` sign in the .env file

### Next Steps

Once the environment variables are set up:
1. The events page should work without errors
2. You can create and view events
3. All other pages should work normally

