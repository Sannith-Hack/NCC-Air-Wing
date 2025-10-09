-- Add DELETE policy for students table to allow admins to manage data retention
CREATE POLICY "Admins can delete student records"
ON public.students
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_roles table
...
CREATE POLICY "Only admins can insert roles"
ON students FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));