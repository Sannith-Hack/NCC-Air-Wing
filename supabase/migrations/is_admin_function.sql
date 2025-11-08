-- This function checks if the currently authenticated user has the 'admin' role.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.students
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$;