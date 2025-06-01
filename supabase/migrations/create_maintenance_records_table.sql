/*
  # Create maintenance records table

  1. New Tables
    - `maintenance_records`
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - `company_id` (uuid, foreign key to companies.id)
      - `truck_id` (uuid, foreign key to trucks.id)
      - `maintenance_type` (text)
      - `performed_at` (timestamp)
      - `mileage` (integer)
      - `next_due_mileage` (integer)
      - `part_make_model` (text)
      - `notes` (text)
  
  2. Security
    - Enable RLS on `maintenance_records` table
    - Add policy for authenticated users to read/write their own company's maintenance records
*/

-- Create maintenance_records table
CREATE TABLE IF NOT EXISTS maintenance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  truck_id uuid NOT NULL REFERENCES trucks(id) ON DELETE CASCADE,
  maintenance_type text NOT NULL,
  performed_at timestamptz NOT NULL,
  mileage integer NOT NULL,
  next_due_mileage integer,
  part_make_model text,
  notes text
);

-- Enable Row Level Security
ALTER TABLE maintenance_records ENABLE ROW LEVEL SECURITY;

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