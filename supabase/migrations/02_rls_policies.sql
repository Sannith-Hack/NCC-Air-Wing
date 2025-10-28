-- FILE: 02_rls_policies.sql
-- Enables Row Level Security and defines all access policies.

-- Enable Row Level Security on all tables
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ncc_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.placements_internships ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Students Table --

-- 1. Students can view, insert, and update their own record.
CREATE POLICY "Students can manage their own record"
ON public.students FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 2. Admins have full access to all student records.
CREATE POLICY "Admins have full access to students"
ON public.students FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for NCC_Details Table --

-- 1. Students can view, insert, update, and delete their own NCC details.
CREATE POLICY "Students can manage their own NCC details"
ON public.ncc_details FOR ALL
TO authenticated
USING (student_id IN (SELECT student_id FROM public.students WHERE user_id = auth.uid()))
WITH CHECK (student_id IN (SELECT student_id FROM public.students WHERE user_id = auth.uid()));

-- 2. Admins have full access to all NCC details.
CREATE POLICY "Admins have full access to NCC details"
ON public.ncc_details FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for Placements_Internships Table --

-- 1. Students can view, insert, update, and delete their own experience records.
CREATE POLICY "Students can manage their own experiences"
ON public.placements_internships FOR ALL
TO authenticated
USING (student_id IN (SELECT student_id FROM public.students WHERE user_id = auth.uid()))
WITH CHECK (student_id IN (SELECT student_id FROM public.students WHERE user_id = auth.uid()));

-- 2. Admins have full access to all experience records.
CREATE POLICY "Admins have full access to experiences"
ON public.placements_internships FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));