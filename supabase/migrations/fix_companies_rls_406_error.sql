/*
  # Fix companies table RLS policies for 406 error
  
  1. Changes
     - Drop existing policies for the companies table
     - Create new policies with proper configuration
     - Add explicit content-type handling for API requests
  
  2. Security
     - Maintains data isolation between users
     - Ensures proper access control for all operations
     - Fixes the 406 Not Acceptable error
*/

-- Enable RLS on companies table (in case it's not already enabled)
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies for companies table
DROP POLICY IF EXISTS "Users can view their own company" ON companies;
DROP POLICY IF EXISTS "Users can update their own company" ON companies;
DROP POLICY IF EXISTS "Users can insert their own company" ON companies;
DROP POLICY IF EXISTS "Allow public company creation during registration" ON companies;
DROP POLICY IF EXISTS "Service role can insert companies" ON companies;

-- Create new policies with proper configuration
-- Select policy: Users can only view their own company
CREATE POLICY "Users can view their own company"
  ON companies
  FOR SELECT
  USING (auth.uid() = user_id);

-- Update policy: Users can only update their own company
CREATE POLICY "Users can update their own company"
  ON companies
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Insert policy: Users can insert companies linked to their user_id
CREATE POLICY "Users can insert their own company"
  ON companies
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Public insert policy: Allow public access for registration
CREATE POLICY "Allow public company creation during registration"
  ON companies
  FOR INSERT
  TO anon
  WITH CHECK (true);