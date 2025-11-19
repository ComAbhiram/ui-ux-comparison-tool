# Supabase Setup Instructions

## 1. Create Supabase Account & Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in with your GitHub account
3. Click "New Project"
4. Choose your organization
5. Set project details:
   - Name: `ui-ux-comparison-tool`
   - Database Password: Choose a strong password (save this!)
   - Region: Choose closest to your location
6. Click "Create new project"
7. Wait for the project to be provisioned (2-3 minutes)

## 2. Get Your Supabase Credentials

Once your project is ready:
1. Go to Settings > API
2. Copy these values:
   - Project URL
   - Project API Key (anon public)
3. Go to Settings > Database
4. Copy the Connection string (you'll need the password you set)

## 3. Set Up Database Schema

1. In Supabase dashboard, go to SQL Editor
2. Copy and paste the content from `supabase-schema.sql`
3. Run the SQL to create all tables and data

## 4. Configure Environment Variables

Create `.env` file in both root and backend directories with the values you copied.

## 5. Install Dependencies

The backend will be updated to use Supabase's PostgreSQL connection.

## 6. Test the Connection

Run `npm run test-db` to verify the connection works.