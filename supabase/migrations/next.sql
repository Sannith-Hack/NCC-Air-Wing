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