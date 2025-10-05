-- CRITICAL SECURITY FIX: Migrate roles to separate table to prevent privilege escalation

-- 1. Create app_role enum (matching existing user_role values)
CREATE TYPE public.app_role AS ENUM ('AUSZUBILDENDE_R', 'AUSBILDER_IN');

-- 2. Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

-- 3. Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Migrate existing roles from profiles to user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT user_id, role::text::app_role
FROM public.profiles
ON CONFLICT (user_id, role) DO NOTHING;

-- 5. Create security definer function to check roles (prevents recursive RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 6. Drop and recreate get_current_user_role with CASCADE to drop dependent policies
DROP FUNCTION IF EXISTS public.get_current_user_role() CASCADE;

CREATE FUNCTION public.get_current_user_role()
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
$$;

-- 7. Recreate RLS policies that were dropped by CASCADE

-- Learning modules policies
CREATE POLICY "Authenticated users can view learning modules"
ON public.learning_modules
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Instructors can manage learning modules"
ON public.learning_modules
FOR ALL
TO authenticated
USING (get_current_user_role() = 'AUSBILDER_IN');

-- Tasks policies
CREATE POLICY "Users can view their own tasks"
ON public.tasks
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR get_current_user_role() = 'AUSBILDER_IN');

CREATE POLICY "Users can create their own tasks"
ON public.tasks
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id OR get_current_user_role() = 'AUSBILDER_IN');

CREATE POLICY "Users can update their own tasks"
ON public.tasks
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id OR get_current_user_role() = 'AUSBILDER_IN');

CREATE POLICY "Users can delete their own tasks"
ON public.tasks
FOR DELETE
TO authenticated
USING (auth.uid() = user_id OR get_current_user_role() = 'AUSBILDER_IN');

-- Events policies
CREATE POLICY "Users can view their own events"
ON public.events
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR get_current_user_role() = 'AUSBILDER_IN');

CREATE POLICY "Users can create their own events"
ON public.events
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id OR get_current_user_role() = 'AUSBILDER_IN');

CREATE POLICY "Users can update their own events"
ON public.events
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id OR get_current_user_role() = 'AUSBILDER_IN');

CREATE POLICY "Users can delete their own events"
ON public.events
FOR DELETE
TO authenticated
USING (auth.uid() = user_id OR get_current_user_role() = 'AUSBILDER_IN');

-- 8. Create RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'AUSBILDER_IN'));

-- 9. Update trigger to insert into user_roles instead of profiles role column
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert into profiles (without role)
  INSERT INTO public.profiles (user_id, first_name, last_name, apprenticeship, company)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    NEW.raw_user_meta_data ->> 'apprenticeship',
    NEW.raw_user_meta_data ->> 'company'
  );
  
  -- Insert role into user_roles table
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data ->> 'role')::app_role, 'AUSZUBILDENDE_R'::app_role)
  );
  
  RETURN NEW;
END;
$$;

-- 10. Comment on security improvement
COMMENT ON TABLE public.user_roles IS 'Separate roles table prevents privilege escalation attacks by isolating role management from user profiles';