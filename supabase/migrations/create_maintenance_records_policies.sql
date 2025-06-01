/*
  # Create maintenance records policies

  1. Security
    - Create policies for maintenance_records table
    - Ensure users can only access their own company's maintenance records
*/

-- Enable Row Level Security (if not already enabled)
ALTER TABLE maintenance_records ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid errors
DO $$ 
BEGIN
  -- Drop select policy if exists
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'maintenance_records' AND policyname = 'Users can view their company''s maintenance records'
  ) THEN
    DROP POLICY "Users can view their company's maintenance records" ON maintenance_records;
  END IF;

  -- Drop insert policy if exists
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'maintenance_records' AND policyname = 'Users can insert their company''s maintenance records'
  ) THEN
    DROP POLICY "Users can insert their company's maintenance records" ON maintenance_records;
  END IF;

  -- Drop update policy if exists
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'maintenance_records' AND policyname = 'Users can update their company''s maintenance records'
  ) THEN
    DROP POLICY "Users can update their company's maintenance records" ON maintenance_records;
  END IF;

  -- Drop delete policy if exists
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'maintenance_records' AND policyname = 'Users can delete their company''s maintenance records'
  ) THEN
    DROP POLICY "Users can delete their company's maintenance records" ON maintenance_records;
  END IF;
END $$;

-- Create policy for users to select their own company's maintenance records
CREATE POLICY "Users can view their company's maintenance records"
  ON maintenance_records
  FOR SELECT
  USING (
    company_id IN (
      SELECT id FROM companies
      WHERE user_id = auth.uid()
    )
  );

-- Create policy for users to insert their own company's maintenance records
CREATE POLICY "Users can insert their company's maintenance records"
  ON maintenance_records
  FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT id FROM companies
      WHERE user_id = auth.uid()
    )
  );

-- Create policy for users to update their own company's maintenance records
CREATE POLICY "Users can update their company's maintenance records"
  ON maintenance_records
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

-- Create policy for users to delete their own company's maintenance records
CREATE POLICY "Users can delete their company's maintenance records"
  ON maintenance_records
  FOR DELETE
  USING (
    company_id IN (
      SELECT id FROM companies
      WHERE user_id = auth.uid()
    )
  );