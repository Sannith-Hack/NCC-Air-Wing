-- Students can view and edit their own data
CREATE POLICY "Users can view own student record"
  ON public.students FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own student record"
  ON public.students FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own student record"
  ON public.students FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);


-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.students
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Users can view their own roles
CREATE POLICY "Users can view own roles"
  ON public.students FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can view all roles
CREATE POLICY "Admins can view all roles"
  ON public.students FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can insert roles
CREATE POLICY "Admins can insert roles"
  ON public.students FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admins can delete roles
CREATE POLICY "Admins can delete roles"
  ON public.students FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Users can view their own NCC details
CREATE POLICY "Users can view own NCC details"
  ON public.ncc_details FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.students
      WHERE students.student_id = ncc_details.student_id
      AND students.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own NCC details"
  ON public.ncc_details FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.students
      WHERE students.student_id = ncc_details.student_id
      AND students.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own NCC details"
  ON public.ncc_details FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.students
      WHERE students.student_id = ncc_details.student_id
      AND students.user_id = auth.uid()
    )
  );

-- Admins can view all NCC details
CREATE POLICY "Admins can view all NCC details"
  ON public.ncc_details FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Users can view their own experience records
CREATE POLICY "Users can view own experiences"
  ON public.placements_internships FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.students
      WHERE students.student_id = placements_internships.student_id
      AND students.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own experiences"
  ON public.placements_internships FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.students
      WHERE students.student_id = placements_internships.student_id
      AND students.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own experiences"
  ON public.placements_internships FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.students
      WHERE students.student_id = placements_internships.student_id
      AND students.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own experiences"
  ON public.placements_internships FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.students
      WHERE students.student_id = placements_internships.student_id
      AND students.user_id = auth.uid()
    )
  );

-- Admins can view all experiences
CREATE POLICY "Admins can view all experiences"
  ON public.placements_internships FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can view all students
CREATE POLICY "Admins can view all students"
  ON public.students FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));