-- Fix 1: Restrict knowledge_base access to authenticated users only
DROP POLICY IF EXISTS "Everyone can view knowledge base" ON public.knowledge_base;

CREATE POLICY "Authenticated users can view knowledge base" 
  ON public.knowledge_base FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- Fix 2: Remove insecure role column from profiles table
-- This prevents privilege escalation attacks where users could modify their own role
ALTER TABLE public.profiles DROP COLUMN IF EXISTS role;

-- Add explicit deny policies for user_roles table to ensure roles cannot be modified by users
DROP POLICY IF EXISTS "Deny user role modifications" ON public.user_roles;

CREATE POLICY "Deny user role modifications" 
  ON public.user_roles 
  FOR INSERT 
  WITH CHECK (false);

CREATE POLICY "Deny user role updates" 
  ON public.user_roles 
  FOR UPDATE 
  USING (false);

CREATE POLICY "Deny user role deletions" 
  ON public.user_roles 
  FOR DELETE 
  USING (false);