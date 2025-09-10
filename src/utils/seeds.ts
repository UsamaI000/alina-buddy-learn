/**
 * Development seed data for testing RBAC
 * Run this in Supabase SQL editor to create test users
 */

export const SEED_SQL = `
-- Insert test users (run these commands in Supabase Auth dashboard)
-- 1. Create azubi@example.com with password: TestAzubi123!
-- 2. Create ausbilder@example.com with password: TestAusbilder123!

-- Update profiles for test users (run this after creating auth users)
UPDATE public.profiles 
SET 
  first_name = 'Max',
  last_name = 'Mustermann',
  role = 'AUSZUBILDENDE_R',
  apprenticeship = 'Kfz-Mechatroniker/in',
  company = 'Mustermann GmbH'
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'azubi@example.com'
);

UPDATE public.profiles 
SET 
  first_name = 'Maria',
  last_name = 'Schmidt',
  role = 'AUSBILDER_IN',
  apprenticeship = 'Kfz-Mechatroniker/in',
  company = 'Schmidt Ausbildung'
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'ausbilder@example.com'
);
`;

// Test user credentials for documentation
export const TEST_USERS = {
  azubi: {
    email: 'azubi@example.com',
    password: 'TestAzubi123!',
    role: 'AUSZUBILDENDE_R' as const
  },
  ausbilder: {
    email: 'ausbilder@example.com', 
    password: 'TestAusbilder123!',
    role: 'AUSBILDER_IN' as const
  }
} as const;