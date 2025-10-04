-- Fix RLS Policy for UPDATE operations
-- Run this SQL in your Supabase SQL Editor
-- https://app.supabase.com/project/YOUR_PROJECT/editor

-- Add UPDATE policy for registrations table
CREATE POLICY "Allow public update registrations" ON registrations
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Alternative: If you want to be more restrictive, you can use this policy instead:
-- CREATE POLICY "Allow public update reregistered status" ON registrations
--   FOR UPDATE
--   USING (true)
--   WITH CHECK (reregistered = true AND datereregistered IS NOT NULL);

-- Verify the policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'registrations';
