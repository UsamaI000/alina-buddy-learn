-- Drop the old public policy that allows unauthenticated access
DROP POLICY IF EXISTS "Everyone can view learning modules" ON public.learning_modules;