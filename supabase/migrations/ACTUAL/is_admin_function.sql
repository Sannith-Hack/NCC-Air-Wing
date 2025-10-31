-- This function checks if the currently authenticated user has the 'admin' role.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin');
$$;



-- FILE: 03_functions_and_triggers.sql

-- Function to automatically create a student profile and role when a new user signs up.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create the student profile
  INSERT INTO public.students (user_id, name, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email
  );
  -- Create the corresponding user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    'student'
  );
  RETURN NEW;
END;
$$;

