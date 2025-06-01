/*
  # Fix Auth Permissions

  1. Changes
     - Grant necessary permissions to anon and authenticated roles
     - Fix potential auth issues
  2. Security
     - Ensure proper access to auth schema
*/

-- Grant necessary permissions to anon and authenticated roles
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Ensure companies table exists and has correct permissions
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'companies') THEN
    -- Make sure authenticated users can access their own company data
    DROP POLICY IF EXISTS "Users can view their own company" ON companies;
    CREATE POLICY "Users can view their own company"
      ON companies
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
    
    DROP POLICY IF EXISTS "Users can update their own company" ON companies;
    CREATE POLICY "Users can update their own company"
      ON companies
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id);
    
    DROP POLICY IF EXISTS "Users can insert their own company" ON companies;
    CREATE POLICY "Users can insert their own company"
      ON companies
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;