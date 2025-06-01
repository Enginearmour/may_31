/*
  # Fix truck policies

  1. Changes
    - Drop existing policies if they exist before creating them
    - Re-create policies with proper checks for company ownership
  
  2. Security
    - Maintain same RLS policies for trucks table
    - Ensure users can only access their own company's trucks
*/

-- Drop existing policies if they exist
DO $$ 
BEGIN
  -- Drop select policy if exists
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'trucks' AND policyname = 'Users can view their company''s trucks'
  ) THEN
    DROP POLICY "Users can view their company's trucks" ON trucks;
  END IF;

  -- Drop insert policy if exists
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'trucks' AND policyname = 'Users can insert their company''s trucks'
  ) THEN
    DROP POLICY "Users can insert their company's trucks" ON trucks;
  END IF;

  -- Drop update policy if exists
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'trucks' AND policyname = 'Users can update their company''s trucks'
  ) THEN
    DROP POLICY "Users can update their company's trucks" ON trucks;
  END IF;

  -- Drop delete policy if exists
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'trucks' AND policyname = 'Users can delete their company''s trucks'
  ) THEN
    DROP POLICY "Users can delete their company's trucks" ON trucks;
  END IF;
END $$;

-- Create policy for users to select their own company's trucks
CREATE POLICY "Users can view their company's trucks"
  ON trucks
  FOR SELECT
  USING (
    company_id IN (
      SELECT id FROM companies
      WHERE user_id = auth.uid()
    )
  );

-- Create policy for users to insert their own company's trucks
CREATE POLICY "Users can insert their company's trucks"
  ON trucks
  FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT id FROM companies
      WHERE user_id = auth.uid()
    )
  );

-- Create policy for users to update their own company's trucks
CREATE POLICY "Users can update their company's trucks"
  ON trucks
  FOR UPDATE
  USING (
    company_id IN (
      SELECT id FROM companies
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    company_id IN (
      SELECT id FROM companies
      WHERE user_id = auth.uid()
    )
  );

-- Create policy for users to delete their own company's trucks
CREATE POLICY "Users can delete their company's trucks"
  ON trucks
  FOR DELETE
  USING (
    company_id IN (
      SELECT id FROM companies
      WHERE user_id = auth.uid()
    )
  );