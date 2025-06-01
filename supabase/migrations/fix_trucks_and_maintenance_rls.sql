/*
  # Fix RLS policies for trucks and maintenance_records tables
  
  1. Changes
     - Drop existing policies for the trucks and maintenance_records tables
     - Create new policies with proper configuration
     - Ensure proper company_id filtering
  
  2. Security
     - Maintains data isolation between companies
     - Ensures proper access control for all operations
*/

-- Enable RLS on trucks table
ALTER TABLE trucks ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies for trucks table
DROP POLICY IF EXISTS "Users can view their own trucks" ON trucks;
DROP POLICY IF EXISTS "Users can update their own trucks" ON trucks;
DROP POLICY IF EXISTS "Users can insert their own trucks" ON trucks;
DROP POLICY IF EXISTS "Users can delete their own trucks" ON trucks;

-- Create new policies for trucks table
CREATE POLICY "Users can view their own trucks"
  ON trucks
  FOR SELECT
  USING (
    company_id IN (
      SELECT id FROM companies WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own trucks"
  ON trucks
  FOR UPDATE
  USING (
    company_id IN (
      SELECT id FROM companies WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own trucks"
  ON trucks
  FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT id FROM companies WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own trucks"
  ON trucks
  FOR DELETE
  USING (
    company_id IN (
      SELECT id FROM companies WHERE user_id = auth.uid()
    )
  );

-- Enable RLS on maintenance_records table
ALTER TABLE maintenance_records ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies for maintenance_records table
DROP POLICY IF EXISTS "Users can view their own maintenance records" ON maintenance_records;
DROP POLICY IF EXISTS "Users can update their own maintenance records" ON maintenance_records;
DROP POLICY IF EXISTS "Users can insert their own maintenance records" ON maintenance_records;
DROP POLICY IF EXISTS "Users can delete their own maintenance records" ON maintenance_records;

-- Create new policies for maintenance_records table
CREATE POLICY "Users can view their own maintenance records"
  ON maintenance_records
  FOR SELECT
  USING (
    company_id IN (
      SELECT id FROM companies WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own maintenance records"
  ON maintenance_records
  FOR UPDATE
  USING (
    company_id IN (
      SELECT id FROM companies WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own maintenance records"
  ON maintenance_records
  FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT id FROM companies WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own maintenance records"
  ON maintenance_records
  FOR DELETE
  USING (
    company_id IN (
      SELECT id FROM companies WHERE user_id = auth.uid()
    )
  );