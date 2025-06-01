/*
  # Create trucks table

  1. New Tables
    - `trucks`
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - `company_id` (uuid, foreign key to companies.id)
      - `vin` (text, unique)
      - `year` (integer)
      - `make` (text)
      - `model` (text)
      - `current_mileage` (integer)
      - `license_plate` (text)
      - `notes` (text)
  2. Security
    - Enable RLS on `trucks` table
    - Add policy for authenticated users to read/write their own company's trucks
*/

-- Create trucks table
CREATE TABLE IF NOT EXISTS trucks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  vin text NOT NULL,
  year integer NOT NULL,
  make text NOT NULL,
  model text NOT NULL,
  current_mileage integer NOT NULL DEFAULT 0,
  license_plate text NOT NULL,
  notes text,
  UNIQUE(vin)
);

-- Enable Row Level Security
ALTER TABLE trucks ENABLE ROW LEVEL SECURITY;

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