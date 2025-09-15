-- Delete all profiles (this will not delete from auth.users automatically)
DELETE FROM public.profiles;

-- Note: auth.users cannot be deleted via SQL migration
-- Users must be deleted manually from Supabase Auth dashboard