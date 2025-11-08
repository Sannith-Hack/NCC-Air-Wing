-- Drop the first set of conflicting policies
DROP POLICY IF EXISTS "Students can view their own data" ON public.students;
DROP POLICY IF EXISTS "Students can insert their own data" ON public.students;
DROP POLICY IF EXISTS "Students can update their own data" ON public.students;
DROP POLICY IF EXISTS "Admins can delete student data" ON public.students;

-- Drop the second set of conflicting policies (incorrectly named for user_roles)
DROP POLICY IF EXISTS "Users can view their own roles" ON public.students;
DROP POLICY IF EXISTS "Only admins can insert roles" ON public.students;
DROP POLICY IF EXISTS "Only admins can update roles" ON public.students;
DROP POLICY IF EXISTS "Only admins can delete roles" ON public.students;



-- NEXT
-- RLS Policies for the Students Table (Corrected)

-- 1. Students can view their own record.
CREATE POLICY "Students can view their own record"
ON public.students FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- 2. Students can insert their own record.
CREATE POLICY "Students can insert their own record"
ON public.students FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- 3. Students can update their own record.
CREATE POLICY "Students can update their own record"
ON public.students FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- 4. Admins can perform any action on any record.
CREATE POLICY "Admins have full access"
ON public.students FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));


-- This function counts a student's NCC records before a new one is inserted.
-- If the count is 10 or more, it stops the insertion and returns an error.
CREATE OR REPLACE FUNCTION public.check_ncc_details_limit()
RETURNS TRIGGER AS $$
DECLARE
  ncc_count INT;
BEGIN
  -- Count existing NCC records for the student_id of the new record
  SELECT COUNT(*)
  INTO ncc_count
  FROM public.ncc_details
  WHERE student_id = NEW.student_id;

  -- Check if the limit has been reached
  IF ncc_count >= 10 THEN
    -- If so, block the insert and raise a clear error message
    RAISE EXCEPTION 'Limit reached: A student cannot have more than 10 NCC detail records.';
  END IF;

  -- If the limit is not reached, allow the insert to proceed
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- This trigger automatically runs the check_ncc_details_limit() function
-- every time a new row is about to be inserted into the ncc_details table.
CREATE TRIGGER enforce_ncc_details_limit_before_insert
BEFORE INSERT ON public.ncc_details
FOR EACH ROW EXECUTE FUNCTION public.check_ncc_details_limit();



-- This function counts a student's experience records before a new one is inserted.
-- If the count is 10 or more, it stops the insertion and returns an error.
CREATE OR REPLACE FUNCTION public.check_experience_limit()
RETURNS TRIGGER AS $$
DECLARE
  experience_count INT;
BEGIN
  -- Count existing experience records for the student_id of the new record
  SELECT COUNT(*)
  INTO experience_count
  FROM public.placements_internships
  WHERE student_id = NEW.student_id;

  -- Check if the limit has been reached
  IF experience_count >= 10 THEN
    -- If so, block the insert and raise a clear error message
    RAISE EXCEPTION 'Limit reached: A student cannot have more than 10 experience records.';
  END IF;

  -- If the limit is not reached, allow the insert to proceed
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- This trigger automatically runs the check_experience_limit() function
-- every time a new row is about to be inserted into the placements_internships table.
CREATE TRIGGER enforce_experience_limit_before_insert
BEFORE INSERT ON public.placements_internships
FOR EACH ROW EXECUTE FUNCTION public.check_experience_limit();




-- Allow students to delete their own NCC detail records
CREATE POLICY "Students can delete their own NCC details"
ON public.ncc_details
FOR DELETE
TO authenticated
USING (
  student_id IN (
    SELECT student_id
    FROM public.students
    WHERE user_id = auth.uid()
  )
);