-- FILE: 03_functions_and_triggers.sql
-- Defines all custom PostgreSQL functions and triggers.

-- Function to check if a user has a specific role (e.g., 'admin').
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Function to automatically create a student profile when a new user signs up.
-- This function correctly creates a student profile AND a user role
-- This is the corrected version of your handle_new_user function

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create the student profile
  INSERT INTO public.students (user_id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    -- Use the full name if available, otherwise fall back to the email
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
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

-- This trigger calls the function above after a new user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- Trigger that calls handle_new_user() after a new user is created in auth.users.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function that checks if a student has reached the limit of 10 NCC records.
CREATE OR REPLACE FUNCTION public.check_ncc_details_limit()
RETURNS TRIGGER AS $$
DECLARE
  ncc_count INT;
BEGIN
  SELECT COUNT(*)
  INTO ncc_count
  FROM public.ncc_details
  WHERE student_id = NEW.student_id;

  IF ncc_count >= 10 THEN
    RAISE EXCEPTION 'Limit reached: A student cannot have more than 10 NCC detail records.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger that runs the NCC limit check before a new record is inserted.
CREATE TRIGGER enforce_ncc_details_limit_before_insert
BEFORE INSERT ON public.ncc_details
FOR EACH ROW EXECUTE FUNCTION public.check_ncc_details_limit();

-- Function that checks if a student has reached the limit of 10 experience records.
CREATE OR REPLACE FUNCTION public.check_experience_limit()
RETURNS TRIGGER AS $$
DECLARE
  experience_count INT;
BEGIN
  SELECT COUNT(*)
  INTO experience_count
  FROM public.placements_internships
  WHERE student_id = NEW.student_id;

  IF experience_count >= 10 THEN
    RAISE EXCEPTION 'Limit reached: A student cannot have more than 10 experience records.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger that runs the experience limit check before a new record is inserted.
CREATE TRIGGER enforce_experience_limit_before_insert
BEFORE INSERT ON public.placements_internships

FOR EACH ROW EXECUTE FUNCTION public.check_experience_limit();
