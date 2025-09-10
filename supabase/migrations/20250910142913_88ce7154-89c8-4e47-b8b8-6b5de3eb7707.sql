-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('AUSZUBILDENDE_R', 'AUSBILDER_IN');

-- Add a temporary column with the new enum type
ALTER TABLE public.profiles ADD COLUMN role_new public.user_role DEFAULT 'AUSZUBILDENDE_R';

-- Update existing data: map 'student' to 'AUSZUBILDENDE_R' and 'instructor' to 'AUSBILDER_IN'
UPDATE public.profiles 
SET role_new = CASE 
  WHEN role = 'instructor' THEN 'AUSBILDER_IN'::public.user_role
  ELSE 'AUSZUBILDENDE_R'::public.user_role
END;

-- Drop the old column and rename the new one
ALTER TABLE public.profiles DROP COLUMN role;
ALTER TABLE public.profiles RENAME COLUMN role_new TO role;

-- Make the role column required with default
ALTER TABLE public.profiles ALTER COLUMN role SET NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'AUSZUBILDENDE_R';

-- Update the handle_new_user function to use the new enum
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name, role, apprenticeship, company)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    COALESCE((NEW.raw_user_meta_data ->> 'role')::public.user_role, 'AUSZUBILDENDE_R'::public.user_role),
    NEW.raw_user_meta_data ->> 'apprenticeship',
    NEW.raw_user_meta_data ->> 'company'
  );
  RETURN NEW;
END;
$function$;